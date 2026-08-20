"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";

import { Add, Delete, Edit, Refresh, People } from "@mui/icons-material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import Swal from "sweetalert2";

const initialForm = {
  NIK: "",
  NamaOperator: "",
  JenisKelamin: "",
  Bagian: "",
  TanggalMasuk: "",
  TanggalKontrakMulai: "",
  TanggalKontrakSelesai: "",
  StatusOperator: "Kontrak",
};
const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLamaBekerja = (totalBulan) => {
  const bulan = Number(totalBulan);

  if (!bulan || bulan <= 0) {
    return "0 bulan";
  }

  const tahun = Math.floor(bulan / 12);
  const sisaBulan = bulan % 12;

  if (tahun > 0 && sisaBulan > 0) {
    return `${tahun} tahun ${sisaBulan} bulan`;
  }

  if (tahun > 0) {
    return `${tahun} tahun`;
  }

  return `${sisaBulan} bulan`;
};
export default function DataOperatorPage() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // GET DATA
  // =====================================================

  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/operators", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data operator.");
      }

      setOperators(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error(error);

      setOperators([]);

      setError(error.message || "Gagal mengambil data operator.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedId(null);

    setForm(initialForm);

    setDialogOpen(true);
  };

  const handleOpenEdit = (operator) => {
    setEditMode(true);
    setSelectedId(operator.IdOperator);

    setForm({
      NIK: operator.NIK || "",
      NamaOperator: operator.NamaOperator || "",
      JenisKelamin: operator.JenisKelamin || "",
      Bagian: operator.Bagian || "",

      TanggalMasuk: operator.TanggalMasuk
        ? String(operator.TanggalMasuk).substring(0, 10)
        : "",

      TanggalKontrakMulai: operator.TanggalKontrakMulai
        ? String(operator.TanggalKontrakMulai).substring(0, 10)
        : "",

      TanggalKontrakSelesai: operator.TanggalKontrakSelesai
        ? String(operator.TanggalKontrakSelesai).substring(0, 10)
        : "",

      StatusOperator: operator.StatusOperator || "Kontrak",
    });

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setForm(initialForm);
    setSelectedId(null);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.NIK.trim() || !form.NamaOperator.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "NIK dan nama operator wajib diisi.",
      });

      return;
    }

    try {
      setSaving(true);

      const url = editMode ? `/api/operators/${selectedId}` : "/api/operators";

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data operator.");
      }

      setDialogOpen(false);

      await fetchOperators();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Data operator berhasil disimpan.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (operator) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus operator?",
      html: `
        Data operator <b>${operator.NamaOperator}</b>
        akan dihapus.
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d32f2f",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/operators/${operator.IdOperator}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus operator.");
      }

      await fetchOperators();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: data.message,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Tidak dapat dihapus",
        text: error.message || "Terjadi kesalahan saat menghapus data.",
      });
    }
  };

  // =====================================================
  // COLUMNS
  // =====================================================

  const columns = [
    {
      field: "IdOperator",
      headerName: "ID",
      width: 70,
    },

    {
      field: "NIK",
      headerName: "NIK",
      minWidth: 140,
      flex: 0.8,
    },

    {
      field: "NamaOperator",
      headerName: "Nama Operator",
      minWidth: 200,
      flex: 1.4,
    },

    {
      field: "JenisKelamin",
      headerName: "Jenis Kelamin",
      minWidth: 130,
      flex: 0.8,
    },

    {
      field: "Bagian",
      headerName: "Bagian",
      minWidth: 150,
      flex: 1,
    },

    {
      field: "TanggalMasuk",
      headerName: "Tanggal Masuk",
      minWidth: 135,
      flex: 0.9,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.value)}</Typography>
      ),
    },

    {
      field: "TanggalKontrakMulai",
      headerName: "Kontrak Mulai",
      minWidth: 135,
      flex: 0.9,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.value)}</Typography>
      ),
    },

    {
      field: "TanggalKontrakSelesai",
      headerName: "Kontrak Selesai",
      minWidth: 135,
      flex: 0.9,
      renderCell: (params) => {
        const tanggal = params.value;

        if (!tanggal) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }

        const today = new Date();
        const selesai = new Date(tanggal);

        const sudahBerakhir = selesai < today;

        return (
          <Stack spacing={0.3}>
            <Typography
              variant="body2"
              color={sudahBerakhir ? "error.main" : "text.primary"}
              fontWeight={sudahBerakhir ? 600 : 400}
            >
              {formatDate(tanggal)}
            </Typography>

            {sudahBerakhir && (
              <Typography variant="caption" color="error.main" fontWeight={600}>
                Kontrak berakhir
              </Typography>
            )}
          </Stack>
        );
      },
    },

    {
      field: "LamaBekerja",
      headerName: "Masa Kerja",
      minWidth: 145,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={formatLamaBekerja(params.value)}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderRadius: 1.5,
          }}
        />
      ),
    },

    {
      field: "StatusOperator",
      headerName: "Status",
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => {
        const status = params.value;

        return (
          <Chip
            label={status || "-"}
            size="small"
            color={
              status === "Kontrak"
                ? "warning"
                : status === "Aktif"
                  ? "success"
                  : "default"
            }
            sx={{
              fontWeight: 600,
            }}
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "Aksi",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEdit(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hapus">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <AppShell role="HC/HRD">
      <Box>
        <Typography variant="h4" fontWeight={700} color="#10233f">
          Kelola Operator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola data operator yang menjadi objek penilaian SPK.
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          px: {
            xs: 0,
            sm: 1,
            md: 2,
          },
          py: {
            xs: 1,
            sm: 2,
            md: 3,
          },
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
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
            {/* HEADER */}

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
              spacing={2}
              mb={3}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(47,111,237,0.1)",
                    color: "#2f6fed",
                  }}
                >
                  <People />
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={700} color="#14213d">
                    Daftar Operator
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                width={{
                  xs: "100%",
                  sm: "auto",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchOperators}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                  }}
                >
                  Refresh
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAdd}
                  sx={{
                    textTransform: "none",
                  }}
                >
                  Tambah Operator
                </Button>
              </Stack>
            </Stack>

            {/* ERROR */}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* DATA GRID */}

            <Box
              sx={{
                width: "100%",
                overflow: "hidden",
              }}
            >
              <DataGrid
                rows={operators}
                columns={columns}
                getRowId={(row) => row.IdOperator}
                loading={loading}
                disableRowSelectionOnClick
                slots={{
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: {
                      debounceMs: 300,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                      page: 0,
                    },
                  },
                }}
                localeText={{
                  toolbarQuickFilterPlaceholder: "Cari operator...",
                  noRowsLabel: loading
                    ? "Memuat data..."
                    : "Belum ada data operator",
                }}
                sx={{
                  border: "none",
                  minHeight: 500,

                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 700,
                  },

                  "& .MuiDataGrid-cell": {
                    borderColor: "#eef2f7",
                  },

                  "& .MuiDataGrid-row:hover": {
                    bgcolor: "#f8fbff",
                  },

                  "& .MuiDataGrid-toolbarContainer": {
                    px: 0,
                    py: 1.5,
                    gap: 1,
                  },

                  "& .MuiDataGrid-main": {
                    minWidth: 0,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* =================================================
          DIALOG FORM
      ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editMode ? "Edit Data Operator" : "Tambah Operator"}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.2} sx={{ pt: 1 }}>
              {/* NIK */}
              <TextField
                label="NIK"
                name="NIK"
                value={form.NIK}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Masukkan NIK operator"
              />

              {/* Nama */}
              <TextField
                label="Nama Operator"
                name="NamaOperator"
                value={form.NamaOperator}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Masukkan nama operator"
              />

              {/* Jenis Kelamin */}
              <TextField
                select
                label="Jenis Kelamin"
                name="JenisKelamin"
                value={form.JenisKelamin}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Pilih jenis kelamin</MenuItem>

                <MenuItem value="Laki-laki">Laki-laki</MenuItem>

                <MenuItem value="Perempuan">Perempuan</MenuItem>
              </TextField>

              {/* Bagian */}
              <TextField
                label="Bagian"
                name="Bagian"
                value={form.Bagian}
                onChange={handleChange}
                fullWidth
                placeholder="Contoh: Produksi"
              />

              {/* Tanggal Masuk */}
              <TextField
                label="Tanggal Masuk"
                name="TanggalMasuk"
                type="date"
                value={form.TanggalMasuk}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* KONTRAK */}
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                sx={{ pt: 1 }}
              >
                Informasi Kontrak
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Kontrak Mulai"
                  name="TanggalKontrakMulai"
                  type="date"
                  value={form.TanggalKontrakMulai}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  label="Kontrak Selesai"
                  name="TanggalKontrakSelesai"
                  type="date"
                  value={form.TanggalKontrakSelesai}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Stack>

              {/* STATUS */}
              <TextField
                select
                label="Status Operator"
                name="StatusOperator"
                value={form.StatusOperator}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Kontrak">Kontrak</MenuItem>

                <MenuItem value="Aktif">Aktif</MenuItem>

                <MenuItem value="Tidak Aktif">Tidak Aktif</MenuItem>
              </TextField>

              <Alert severity="info">
                Masa kerja disimpan dalam satuan bulan dan ditampilkan dalam
                format tahun dan bulan.
              </Alert>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={saving}
              sx={{
                textTransform: "none",
              }}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                textTransform: "none",
              }}
            >
              {saving
                ? "Menyimpan..."
                : editMode
                  ? "Simpan Perubahan"
                  : "Simpan"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppShell>
  );
}
