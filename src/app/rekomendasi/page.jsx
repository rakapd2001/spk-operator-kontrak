"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssessmentIcon from "@mui/icons-material/Assessment";

import Swal from "sweetalert2";

import AppShell from "@/components/AppShell";

// ======================================================
// FORMAT TANGGAL
// ======================================================

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ======================================================
// FORMAT NILAI PSI
// ======================================================

function formatPSI(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.000000";
  }

  return number.toFixed(6);
}

// ======================================================
// AMBIL DATA RELASI
// ======================================================

function getOperator(row) {
  return row?.Penilaian?.Operator || row?.Operator || null;
}

function getSupervisor(row) {
  return row?.Penilaian?.Supervisor || row?.Supervisor || null;
}

function getPenilaian(row) {
  return row?.Penilaian || null;
}

// ======================================================
// REKOMENDASI
// ======================================================

function isRecommended(value) {
  if (!value) return false;

  const text = String(value).toLowerCase();

  return text.includes("direkomendasikan") && !text.includes("tidak");
}

function getRecommendationColor(value) {
  return isRecommended(value) ? "success" : "error";
}

// ======================================================
// TOOLBAR
// ======================================================

function CustomToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        px: 1,
        py: 1,
        justifyContent: "flex-end",
      }}
    >
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function RekomendasiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("SEMUA");
  const [status, setStatus] = useState("SEMUA");

  const [selected, setSelected] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = async (showAlert = false) => {
    try {
      setLoading(true);

      const response = await fetch("/api/rekomendasi", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data rekomendasi.");
      }

      setData(Array.isArray(result.data) ? result.data : []);

      if (showAlert) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data rekomendasi berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("LOAD REKOMENDASI ERROR:", error);

      setData([]);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengambil data rekomendasi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================================
  // PERIODE
  // ====================================================

  const daftarPeriode = useMemo(() => {
    const values = data
      .map((item) => {
        const penilaian = getPenilaian(item);
        return penilaian?.Periode || item?.Periode;
      })
      .filter(Boolean);

    return [...new Set(values)];
  }, [data]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const operator = getOperator(item);
      const penilaian = getPenilaian(item);

      const namaOperator = operator?.NamaOperator || item?.NamaOperator || "";

      const nik = operator?.NIK || item?.NIK || "";

      const bagian = operator?.Bagian || item?.Bagian || "";

      const itemPeriode = penilaian?.Periode || item?.Periode || "";

      const rekomendasi = item?.Rekomendasi || "";

      const cocokSearch =
        !keyword ||
        namaOperator.toLowerCase().includes(keyword) ||
        nik.toLowerCase().includes(keyword) ||
        bagian.toLowerCase().includes(keyword) ||
        String(rekomendasi).toLowerCase().includes(keyword);

      const cocokPeriode = periode === "SEMUA" || itemPeriode === periode;

      const cocokStatus =
        status === "SEMUA" ||
        (status === "REKOMENDASI" && isRecommended(rekomendasi)) ||
        (status === "TIDAK" && !isRecommended(rekomendasi));

      return cocokSearch && cocokPeriode && cocokStatus;
    });
  }, [data, search, periode, status]);

  // ====================================================
  // STATISTIK
  // ====================================================

  const statistik = useMemo(() => {
    const total = filteredData.length;

    const direkomendasikan = filteredData.filter((item) =>
      isRecommended(item?.Rekomendasi),
    ).length;

    const tidakDirekomendasikan = total - direkomendasikan;

    const nilai = filteredData
      .map((item) => Number(item?.NilaiPSI))
      .filter(Number.isFinite);

    const rataRata =
      nilai.length > 0 ? nilai.reduce((a, b) => a + b, 0) / nilai.length : 0;

    return {
      total,
      direkomendasikan,
      tidakDirekomendasikan,
      rataRata,
    };
  }, [filteredData]);

  // ====================================================
  // ROWS
  // ====================================================

  const rows = useMemo(() => {
    return filteredData.map((item, index) => {
      const operator = getOperator(item);
      const supervisor = getSupervisor(item);
      const penilaian = getPenilaian(item);

      return {
        id:
          item?.IdHasilPSI ||
          item?.IdPenilaian ||
          `${index}-${operator?.IdOperator || ""}`,

        IdHasilPSI: item?.IdHasilPSI,

        Ranking: item?.Ranking ?? index + 1,

        NamaOperator: operator?.NamaOperator || item?.NamaOperator || "-",

        NIK: operator?.NIK || item?.NIK || "-",

        Bagian: operator?.Bagian || item?.Bagian || "-",

        Periode: penilaian?.Periode || item?.Periode || "-",

        NilaiPSI: Number(item?.NilaiPSI) || 0,

        Rekomendasi: item?.Rekomendasi || "Tidak Ditentukan",

        Supervisor: supervisor?.NamaLengkap || item?.NamaSupervisor || "-",

        TanggalPerhitungan: item?.TanggalPerhitungan,

        raw: item,
      };
    });
  }, [filteredData]);

  // ====================================================
  // SORT RANKING
  // ====================================================

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const rankA = Number(a.Ranking);
      const rankB = Number(b.Ranking);

      return rankA - rankB;
    });
  }, [rows]);

  // ====================================================
  // COLUMNS
  // ====================================================

  const columns = useMemo(
    () => [
      {
        field: "Ranking",
        headerName: "Ranking",
        width: 100,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => {
          const rank = Number(params.value);

          if (rank === 1) {
            return (
              <WorkspacePremiumIcon
                sx={{
                  color: "#f59e0b",
                  fontSize: 30,
                }}
              />
            );
          }

          if (rank === 2) {
            return (
              <WorkspacePremiumIcon
                sx={{
                  color: "#94a3b8",
                  fontSize: 28,
                }}
              />
            );
          }

          if (rank === 3) {
            return (
              <WorkspacePremiumIcon
                sx={{
                  color: "#b45309",
                  fontSize: 28,
                }}
              />
            );
          }

          return (
            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {rank}
            </Typography>
          );
        },
      },

      {
        field: "NamaOperator",
        headerName: "Operator",
        minWidth: 220,
        flex: 1,

        renderCell: (params) => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "100%",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {params.value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {params.row.NIK}
            </Typography>
          </Box>
        ),
      },

      {
        field: "Bagian",
        headerName: "Bagian",
        width: 150,
      },

      {
        field: "Periode",
        headerName: "Periode",
        width: 160,
      },

      {
        field: "NilaiPSI",
        headerName: "Nilai PSI",
        width: 140,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => (
          <Typography
            sx={{
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatPSI(params.value)}
          </Typography>
        ),
      },

      {
        field: "Rekomendasi",
        headerName: "Rekomendasi",
        minWidth: 220,
        flex: 0.8,

        renderCell: (params) => (
          <Chip
            icon={
              isRecommended(params.value) ? <CheckCircleIcon /> : <CancelIcon />
            }
            label={params.value}
            color={getRecommendationColor(params.value)}
            size="small"
            sx={{
              fontWeight: 700,
              maxWidth: "100%",
            }}
          />
        ),
      },

      {
        field: "Supervisor",
        headerName: "Supervisor",
        minWidth: 180,
        flex: 0.7,
      },

      {
        field: "TanggalPerhitungan",
        headerName: "Dihitung",
        width: 190,

        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: "100%",
            }}
          >
            <Typography variant="body2">
              {formatTanggal(params.value)}
            </Typography>
          </Box>
        ),
      },

      {
        field: "aksi",
        headerName: "Aksi",
        width: 90,
        sortable: false,
        filterable: false,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelected(params.row.raw);
              setOpenDetail(true);
            }}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: 2,
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
        ),
      },
    ],
    [],
  );

  // ====================================================
  // CLOSE DETAIL
  // ====================================================

  const closeDetail = () => {
    setOpenDetail(false);
    setSelected(null);
  };

  const selectedOperator = getOperator(selected);
  const selectedSupervisor = getSupervisor(selected);
  const selectedPenilaian = getPenilaian(selected);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <AppShell role="HC/HRD">
      <Box
        sx={{
          width: "100%",
          maxWidth: 1800,
          mx: "auto",
          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          py: {
            xs: 1.5,
            md: 3,
          },
        }}
      >
        {/* ==================================================
          HEADER
      ================================================== */}

        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            color: "white",
            background: "linear-gradient(135deg, #123b7a 0%, #2563eb 100%)",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
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
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <EmojiEventsIcon
                    sx={{
                      fontSize: 30,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: {
                        xs: "1.2rem",
                        sm: "1.5rem",
                      },
                    }}
                  >
                    Rekomendasi Keputusan
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      mt: 0.5,
                    }}
                  >
                    Hasil perangkingan operator berdasarkan metode Preference
                    Selection Index (PSI).
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => loadData(true)}
                disabled={loading}
                sx={{
                  backgroundColor: "white",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ==================================================
          STATISTIK
      ================================================== */}

        <Grid
          container
          spacing={2}
          sx={{
            mb: 2,
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AssessmentIcon
                    sx={{
                      fontSize: 34,
                      color: "primary.main",
                    }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Hasil
                    </Typography>

                    <Typography variant="h5" fontWeight={800}>
                      {statistik.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircleIcon
                    sx={{
                      fontSize: 34,
                      color: "success.main",
                    }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Direkomendasikan
                    </Typography>

                    <Typography variant="h5" fontWeight={800}>
                      {statistik.direkomendasikan}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CancelIcon
                    sx={{
                      fontSize: 34,
                      color: "error.main",
                    }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tidak Direkomendasikan
                    </Typography>

                    <Typography variant="h5" fontWeight={800}>
                      {statistik.tidakDirekomendasikan}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmojiEventsIcon
                    sx={{
                      fontSize: 34,
                      color: "warning.main",
                    }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rata-rata PSI
                    </Typography>

                    <Typography variant="h5" fontWeight={800}>
                      {formatPSI(statistik.rataRata)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ==================================================
          FILTER
      ================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                label="Cari operator"
                placeholder="Nama operator, NIK, bagian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Periode</InputLabel>

                <Select
                  value={periode}
                  label="Periode"
                  onChange={(e) => setPeriode(e.target.value)}
                >
                  <MenuItem value="SEMUA">Semua Periode</MenuItem>

                  {daftarPeriode.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>

                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="SEMUA">Semua Status</MenuItem>

                  <MenuItem value="REKOMENDASI">Direkomendasikan</MenuItem>

                  <MenuItem value="TIDAK">Tidak Direkomendasikan</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setPeriode("SEMUA");
                  setStatus("SEMUA");
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ==================================================
          DATA GRID
      ================================================== */}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: {
                xs: 1.5,
                sm: 2.5,
              },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Ranking Hasil PSI
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Operator dengan nilai PSI tertinggi berada pada ranking terbaik.
            </Typography>
          </Box>

          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                minWidth: {
                  xs: 1150,
                  md: "100%",
                },
              }}
            >
              <DataGrid
                rows={sortedRows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                slots={{
                  toolbar: CustomToolbar,
                }}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                      page: 0,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                autoHeight
                sx={{
                  border: 0,

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8fafc",
                    fontWeight: 800,
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 800,
                  },

                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },

                  "& .MuiDataGrid-row": {
                    minHeight: "64px !important",
                  },

                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* ==================================================
          DETAIL DIALOG
      ================================================== */}

        <Dialog
          open={openDetail}
          onClose={closeDetail}
          fullWidth
          maxWidth="md"
          fullScreen={false}
          PaperProps={{
            sx: {
              borderRadius: {
                xs: 0,
                sm: 3,
              },
              m: {
                xs: 0,
                sm: 2,
              },
              width: {
                xs: "100%",
                sm: "calc(100% - 32px)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
            }}
          >
            Detail Hasil Rekomendasi
          </DialogTitle>

          <DialogContent dividers>
            {selected && (
              <Stack spacing={2}>
                {/* HASIL UTAMA */}

                <Box
                  sx={{
                    p: {
                      xs: 2,
                      sm: 3,
                    },
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Hasil PSI
                  </Typography>

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
                    <Typography variant="h3" fontWeight={900}>
                      {formatPSI(selected?.NilaiPSI)}
                    </Typography>

                    <Chip
                      icon={
                        isRecommended(selected?.Rekomendasi) ? (
                          <CheckCircleIcon />
                        ) : (
                          <CancelIcon />
                        )
                      }
                      label={selected?.Rekomendasi || "Tidak Ditentukan"}
                      color={getRecommendationColor(selected?.Rekomendasi)}
                      sx={{
                        fontWeight: 800,
                      }}
                    />
                  </Stack>
                </Box>

                {/* INFORMASI OPERATOR */}

                <Typography variant="subtitle1" fontWeight={800}>
                  Informasi Operator
                </Typography>

                <Divider />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama Operator"
                      value={selectedOperator?.NamaOperator || "-"}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="NIK"
                      value={selectedOperator?.NIK || "-"}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bagian"
                      value={selectedOperator?.Bagian || "-"}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Periode"
                      value={
                        selectedPenilaian?.Periode || selected?.Periode || "-"
                      }
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* INFORMASI PENILAIAN */}

                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  sx={{
                    mt: 1,
                  }}
                >
                  Informasi Penilaian
                </Typography>

                <Divider />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Ranking"
                      value={selected?.Ranking || "-"}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Supervisor"
                      value={selectedSupervisor?.NamaLengkap || "-"}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Tanggal Perhitungan"
                      value={formatTanggal(selected?.TanggalPerhitungan)}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* REKOMENDASI */}

                <Alert
                  severity={
                    isRecommended(selected?.Rekomendasi) ? "success" : "error"
                  }
                  icon={
                    isRecommended(selected?.Rekomendasi) ? (
                      <CheckCircleIcon />
                    ) : (
                      <CancelIcon />
                    )
                  }
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight={800}>
                    {selected?.Rekomendasi || "Tidak ada rekomendasi"}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Keputusan diperoleh berdasarkan nilai PSI dan ranking
                    operator pada periode penilaian tersebut.
                  </Typography>
                </Alert>
              </Stack>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 2,
              py: 1.5,
            }}
          >
            <Button onClick={closeDetail} variant="contained">
              Tutup
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================================================
          LOADING OVERLAY
      ================================================== */}

        {loading && data.length === 0 && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1200,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </AppShell>
  );
}
