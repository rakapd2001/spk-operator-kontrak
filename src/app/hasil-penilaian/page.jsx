"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Assessment,
  Close,
  EmojiEvents,
  Refresh,
  Visibility,
  WorkspacePremium,
} from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import AppShell from "@/components/AppShell";

// ============================================================
// HELPER
// ============================================================

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTanggalJam(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPSI(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.000000";
  }

  return number.toFixed(6);
}

// ============================================================
// PAGE
// ============================================================

export default function HasilPenilaianPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState("");
  const [selected, setSelected] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [pageSize, setPageSize] = useState(5);
  const [gridHeight, setGridHeight] = useState(100);
  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 200;
      const rowHeight = 52;
      const calculatedPageSize = Math.floor(availableHeight / rowHeight);
      setPageSize(calculatedPageSize);
      setGridHeight(availableHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/penilaian", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil hasil penilaian.");
      }

      const rows = Array.isArray(result.data) ? result.data : [];

      /*
       * Hanya tampilkan penilaian yang sudah memiliki hasil PSI.
       *
       * Keputusan/rekomendasi TIDAK digunakan di halaman ini.
       */
      const hasil = rows
        .filter((item) => item?.HasilPSI)
        .map((item) => ({
          ...item,

          NilaiPSI: Number(item.HasilPSI?.NilaiPSI ?? 0),

          Ranking: Number(item.HasilPSI?.Ranking ?? 0),

          TanggalPerhitungan: item.HasilPSI?.TanggalPerhitungan ?? null,
        }));

      setData(rows);
    } catch (error) {
      console.error("LOAD HASIL PENILAIAN ERROR:", error);

      setData([]);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error?.message || "Gagal mengambil data hasil penilaian.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // DAFTAR PERIODE
  // ============================================================

  const daftarPeriode = useMemo(() => {
    const values = data.map((item) => item?.Periode).filter(Boolean);

    return [...new Set(values)].sort((a, b) =>
      String(b).localeCompare(String(a)),
    );
  }, [data]);

  // ============================================================
  // FILTER PERIODE
  // ============================================================

  const filteredData = useMemo(() => {
    if (!periode) {
      return data;
    }

    return data.filter((item) => String(item?.Periode) === String(periode));
  }, [data, periode]);

  // ============================================================
  // SORT RANKING
  // ============================================================

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const rankA = Number(a?.Ranking || 999999);
      const rankB = Number(b?.Ranking || 999999);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return Number(b?.NilaiPSI || 0) - Number(a?.NilaiPSI || 0);
    });
  }, [filteredData]);

  // ============================================================
  // STATISTIK
  // HANYA INFORMASI UMUM
  // ============================================================

  const statistik = useMemo(() => {
    return {
      total: sortedData.length,

      periode: periode || (sortedData.length > 0 ? "Semua Periode" : "-"),
    };
  }, [sortedData, periode]);

  // ============================================================
  // DETAIL
  // ============================================================

  const handleDetail = (row) => {
    setSelected(row);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelected(null);
  };

  // ============================================================
  // COLUMNS
  // ============================================================

  const columns = useMemo(
    () => [
      // --------------------------------------------------------
      // RANKING
      // --------------------------------------------------------

      {
        field: "Ranking",
        headerName: "Ranking",
        width: 105,
        sortable: true,
        align: "center",
        headerAlign: "center",

        renderCell: (params) => {
          const ranking = Number(params.value);

          if (ranking === 1) {
            return (
              <Tooltip title="Ranking 1">
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "#f59e0b",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <EmojiEvents fontSize="small" />
                </Avatar>
              </Tooltip>
            );
          }

          return (
            <Chip
              label={`#${ranking || "-"}`}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
              }}
            />
          );
        },
      },

      // --------------------------------------------------------
      // OPERATOR
      // --------------------------------------------------------

      {
        field: "NamaOperator",
        headerName: "Operator",
        minWidth: 260,
        flex: 1,
        sortable: true,

        valueGetter: (_, row) => row?.Operator?.NamaOperator || "-",

        renderCell: (params) => {
          const operator = params.row?.Operator;

          return (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                width: "100%",
                height: "100%",
                minWidth: 0,
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {operator?.NamaOperator?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={700}
                  noWrap
                  title={operator?.NamaOperator || "-"}
                >
                  {operator?.NamaOperator || "-"}
                </Typography>

                <Typography variant="caption" color="text.secondary" noWrap>
                  NIK: {operator?.NIK || "-"}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },

      // --------------------------------------------------------
      // BAGIAN
      // --------------------------------------------------------

      {
        field: "Bagian",
        headerName: "Bagian",
        minWidth: 140,

        valueGetter: (_, row) => row?.Operator?.Bagian || "-",

        renderCell: (params) => (
          <Typography
            variant="body2"
            noWrap
            title={params.row?.Operator?.Bagian || "-"}
          >
            {params.row?.Operator?.Bagian || "-"}
          </Typography>
        ),
      },

      // --------------------------------------------------------
      // PERIODE
      // --------------------------------------------------------

      {
        field: "Periode",
        headerName: "Periode",
        minWidth: 140,
      },

      // --------------------------------------------------------
      // SUPERVISOR
      // --------------------------------------------------------

      {
        field: "Supervisor",
        headerName: "Supervisor",
        minWidth: 180,

        valueGetter: (_, row) => row?.Supervisor?.NamaLengkap || "-",

        renderCell: (params) => (
          <Typography
            variant="body2"
            noWrap
            title={params.row?.Supervisor?.NamaLengkap || "-"}
          >
            {params.row?.Supervisor?.NamaLengkap || "-"}
          </Typography>
        ),
      },

      // --------------------------------------------------------
      // TANGGAL PERHITUNGAN
      // --------------------------------------------------------

      {
        field: "TanggalPenilaian",
        headerName: "Tanggal Nilai",
        minWidth: 175,

        renderCell: (params) => (
          <Typography variant="body2">
            {formatTanggalJam(params.value)}
          </Typography>
        ),
      },

      // --------------------------------------------------------
      // AKSI
      // --------------------------------------------------------

      {
        field: "aksi",
        headerName: "Aksi",
        width: 90,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",

        renderCell: (params) => (
          <Tooltip title="Lihat detail penilaian">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleDetail(params.row)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AppShell role="HC/HRD">
      <Box
        sx={{
          width: "100%",
          maxWidth: 1600,
          mx: "auto",
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Card
          sx={{
            mb: 2.5,
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #0d47a1 0%, #2874e8 100%)",
            color: "#fff",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
                md: 3,
              },

              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: {
                      xs: 44,
                      sm: 52,
                    },
                    height: {
                      xs: 44,
                      sm: 52,
                    },
                    bgcolor: "rgba(255,255,255,0.16)",
                    borderRadius: 2,
                  }}
                >
                  <Assessment />
                </Avatar>

                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      fontSize: {
                        xs: "1.15rem",
                        sm: "1.35rem",
                        md: "1.5rem",
                      },
                    }}
                  >
                    Hasil Penilaian Operator
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      mt: 0.3,
                    }}
                  >
                    Hasil penilaian dan perhitungan Preference Selection Index
                    (PSI).
                  </Typography>
                </Box>
              </Stack>

              <Chip
                icon={<WorkspacePremium />}
                label={`${statistik.total} Operator`}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.14)",
                  fontWeight: 700,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            FILTER
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            mb: 2.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 250,
                },
              }}
            >
              <InputLabel>Periode Penilaian</InputLabel>

              <Select
                value={periode}
                label="Periode Penilaian"
                onChange={(event) => setPeriode(event.target.value)}
              >
                <MenuItem value="">Semua Periode</MenuItem>

                {daftarPeriode.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={18} /> : <Refresh />}
              onClick={loadData}
              disabled={loading}
              sx={{
                minHeight: 40,
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        {/* ====================================================
            STATISTIK
            Tidak menampilkan PSI
        ==================================================== */}

        <Grid
          container
          spacing={2}
          sx={{
            mb: 2.5,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <StatCard
              title="Operator Dinilai"
              value={statistik.total}
              subtitle="Sudah memiliki hasil penilaian"
              icon={<Assessment />}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <StatCard
              title="Periode"
              value={statistik.periode}
              subtitle="Periode penilaian aktif"
              icon={<WorkspacePremium />}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 4,
            }}
          >
            <StatCard
              title="Status"
              value="Selesai"
              subtitle="Data telah memiliki hasil PSI"
              icon={<EmojiEvents />}
            />
          </Grid>
        </Grid>

        {/* ====================================================
            INFO
        ==================================================== */}

        {!loading && data.length === 0 && (
          <Alert
            severity="info"
            sx={{
              mb: 2.5,
              borderRadius: 2,
            }}
          >
            Belum ada hasil penilaian yang memiliki nilai PSI. Pastikan seluruh
            kriteria sudah dinilai.
          </Alert>
        )}

        {/* ====================================================
            DATA GRID
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
              },
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Daftar Hasil Penilaian
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.3,
              }}
            >
              Menampilkan nilai PSI dan ranking operator. Keputusan atau
              rekomendasi tersedia pada menu Rekomendasi Keputusan.
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              height: `${gridHeight}px`,
              display: "grid",
            }}
          >
            <DataGrid
              rows={sortedData}
              columns={columns}
              getRowId={(row) => row.IdPenilaian}
              autoHeight
              loading={loading}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
              localeText={{
                noRowsLabel: "Belum ada hasil penilaian.",
              }}
              sx={{
                border: 0,

                "& .MuiDataGrid-columnHeaders": {
                  minHeight: 56,
                  maxHeight: 56,
                },

                "& .MuiDataGrid-columnHeader": {
                  display: "flex",
                  alignItems: "center",
                },

                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 700,
                },

                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  lineHeight: "normal",
                },

                "& .MuiDataGrid-row": {
                  minHeight: "72px !important",
                  maxHeight: "72px !important",
                },

                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },

                "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                  {
                    outline: "none",
                  },
              }}
            />
          </Box>
        </Paper>

        {/* ====================================================
            DETAIL DIALOG
        ==================================================== */}

        <Dialog
          open={openDetail}
          onClose={handleCloseDetail}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: {
                xs: 0,
                sm: 3,
              },

              maxHeight: {
                xs: "100%",
                sm: "90vh",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              pr: 6,
              fontWeight: 800,
            }}
          >
            Detail Penilaian Operator
            <IconButton
              onClick={handleCloseDetail}
              sx={{
                position: "absolute",
                right: 10,
                top: 10,
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {selected && (
              <Stack spacing={2.5}>
                {/* ==========================================
                    OPERATOR
                ========================================== */}

                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={2}
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "primary.main",
                            fontWeight: 800,
                          }}
                        >
                          {selected.Operator?.NamaOperator?.charAt(
                            0,
                          )?.toUpperCase() || "?"}
                        </Avatar>

                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            {selected.Operator?.NamaOperator || "-"}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            NIK: {selected.Operator?.NIK || "-"}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Bagian: {selected.Operator?.Bagian || "-"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        icon={<EmojiEvents />}
                        label={`Ranking #${selected.Ranking || "-"}`}
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: 800,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* ==========================================
                    INFORMASI PENILAIAN
                ========================================== */}

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoCard label="Periode" value={selected.Periode || "-"} />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoCard
                      label="Supervisor"
                      value={selected.Supervisor?.NamaLengkap || "-"}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoCard
                      label="Tanggal Penilaian"
                      value={formatTanggal(selected.TanggalPenilaian)}
                    />
                  </Grid>
                </Grid>

                {/* ==========================================
                    DETAIL KRITERIA
                ========================================== */}

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      mb: 1.5,
                    }}
                  >
                    Detail Nilai Kriteria
                  </Typography>

                  {Array.isArray(selected.PenilaianDetail) &&
                  selected.PenilaianDetail.length > 0 ? (
                    <Stack spacing={1}>
                      {selected.PenilaianDetail.map((detail) => (
                        <Paper
                          key={detail.IdPenilaianDetail}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            spacing={1.5}
                            alignItems={{
                              xs: "flex-start",
                              sm: "center",
                            }}
                            justifyContent="space-between"
                          >
                            <Box
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Chip
                                  size="small"
                                  label={detail.Kriteria?.KodeKriteria || "-"}
                                />

                                <Typography fontWeight={700}>
                                  {detail.Kriteria?.NamaKriteria || "-"}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: 0.5,
                                }}
                              >
                                Jenis: {detail.Kriteria?.Jenis || "-"}
                              </Typography>
                            </Box>

                            <Chip
                              label={`Nilai ${detail.Nilai ?? "-"}`}
                              color="primary"
                              sx={{
                                fontWeight: 800,
                                minWidth: 85,
                              }}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      Detail nilai kriteria belum tersedia.
                    </Alert>
                  )}
                </Box>

                {/* ==========================================
                    TANGGAL PERHITUNGAN
                ========================================== */}

                <Divider />

                <DetailItem
                  label="Tanggal Penilaian"
                  value={formatTanggalJam(selected.TanggalPenilaian)}
                />

                {/* ==========================================
                    CATATAN
                ========================================== */}

                <Alert severity="info" variant="outlined">
                  Dialog ini hanya menampilkan detail penilaian dan hasil
                  penilaian. Keputusan/rekomendasi operator tidak ditampilkan di
                  halaman ini.
                </Alert>
              </Stack>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
            }}
          >
            <Button variant="contained" onClick={handleCloseDetail}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppShell>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          alignItems="center"
          sx={{
            minHeight: 72,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {title}
            </Typography>

            <Typography
              fontWeight={900}
              sx={{
                mt: 0.8,
                fontSize: {
                  xs: "1.15rem",
                  sm: "1.3rem",
                },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.5,
              }}
              noWrap
            >
              {subtitle}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: "rgba(25,118,210,0.1)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({ label, value }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography
          variant="body1"
          fontWeight={800}
          sx={{
            mt: 0.7,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ label, value }) {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={{
        xs: 0.3,
        sm: 2,
      }}
      justifyContent="space-between"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={700}
        textAlign={{
          xs: "left",
          sm: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
