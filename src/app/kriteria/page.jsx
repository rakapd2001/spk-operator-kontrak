"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
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
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Tooltip,
} from "@mui/material";

import {
  Add,
  Close,
  Delete,
  Edit,
  Refresh,
  Rule,
  KeyboardArrowRight,
  InfoOutlined,
} from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";

const initialKriteriaForm = {
  KodeKriteria: "",
  NamaKriteria: "",
  Jenis: "",
  Deskripsi: "",
};

const initialDetailForm = {
  IdKriteria: "",
  Nilai: "",
  KodeDetail: "",
  NamaDetail: "",
  Keterangan: "",
};

export default function KriteriaPage() {
  // =====================================================
  // STATE KRITERIA
  // =====================================================

  const [kriteria, setKriteria] = useState([]);
  const [loadingKriteria, setLoadingKriteria] = useState(true);
  const [searchKriteria, setSearchKriteria] = useState("");

  const [selectedKriteria, setSelectedKriteria] = useState(null);

  // =====================================================
  // STATE DETAIL
  // =====================================================

  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [searchDetail, setSearchDetail] = useState("");

  // =====================================================
  // DIALOG KRITERIA
  // =====================================================

  const [kriteriaDialog, setKriteriaDialog] = useState(false);
  const [editingKriteria, setEditingKriteria] = useState(null);
  const [kriteriaForm, setKriteriaForm] = useState(initialKriteriaForm);
  const [savingKriteria, setSavingKriteria] = useState(false);

  // =====================================================
  // DIALOG DETAIL
  // =====================================================

  const [detailDialog, setDetailDialog] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [detailForm, setDetailForm] = useState(initialDetailForm);
  const [savingDetail, setSavingDetail] = useState(false);

  // =====================================================
  // FETCH KRITERIA
  // =====================================================

  const fetchKriteria = useCallback(async () => {
    try {
      setLoadingKriteria(true);

      const response = await fetch("/api/kriteria", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data kriteria.");
      }

      setKriteria(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("FETCH KRITERIA:", error);

      setKriteria([]);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengambil data kriteria.",
      });
    } finally {
      setLoadingKriteria(false);
    }
  }, []);

  useEffect(() => {
    fetchKriteria();
  }, [fetchKriteria]);

  // =====================================================
  // FETCH DETAIL BERDASARKAN ROW KRITERIA
  // =====================================================

  const fetchDetails = useCallback(async (IdKriteria) => {
    if (!IdKriteria) {
      setDetails([]);
      return;
    }

    try {
      setLoadingDetails(true);

      const response = await fetch(
        `/api/kriteria/detail?IdKriteria=${IdKriteria}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil detail kriteria.");
      }

      setDetails(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("FETCH DETAIL KRITERIA:", error);

      setDetails([]);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil detail",
        text: error.message || "Gagal mengambil data detail kriteria.",
      });
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // =====================================================
  // KLIK ROW KRITERIA
  // =====================================================

  const handleKriteriaRowClick = async (params) => {
    const row = params.row;

    setSelectedKriteria(row);

    await fetchDetails(row.IdKriteria);
  };

  // =====================================================
  // FILTER KRITERIA
  // =====================================================

  const filteredKriteria = useMemo(() => {
    const keyword = searchKriteria.trim().toLowerCase();

    if (!keyword) {
      return kriteria;
    }

    return kriteria.filter((item) =>
      [item.KodeKriteria, item.NamaKriteria, item.Jenis, item.Deskripsi]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [kriteria, searchKriteria]);

  // =====================================================
  // FILTER DETAIL
  // =====================================================

  const filteredDetails = useMemo(() => {
    const keyword = searchDetail.trim().toLowerCase();

    if (!keyword) {
      return details;
    }

    return details.filter((item) =>
      [item.Nilai, item.KodeDetail, item.NamaDetail, item.Keterangan]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [details, searchDetail]);

  // =====================================================
  // FORM KRITERIA
  // =====================================================

  const openAddKriteria = () => {
    setEditingKriteria(null);
    setKriteriaForm(initialKriteriaForm);
    setKriteriaDialog(true);
  };

  const openEditKriteria = (row) => {
    setEditingKriteria(row);

    setKriteriaForm({
      KodeKriteria: row.KodeKriteria || "",
      NamaKriteria: row.NamaKriteria || "",
      Jenis: row.Jenis || "",
      Deskripsi: row.Deskripsi || "",
    });

    setKriteriaDialog(true);
  };

  const closeKriteriaDialog = () => {
    if (savingKriteria) return;

    setKriteriaDialog(false);
    setEditingKriteria(null);
    setKriteriaForm(initialKriteriaForm);
  };

  const handleKriteriaChange = (event) => {
    const { name, value } = event.target;

    setKriteriaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE KRITERIA
  // =====================================================

  const handleSaveKriteria = async () => {
    if (
      !kriteriaForm.KodeKriteria.trim() ||
      !kriteriaForm.NamaKriteria.trim() ||
      !kriteriaForm.Jenis.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Kode, nama, dan jenis kriteria wajib diisi.",
      });

      return;
    }

    try {
      setSavingKriteria(true);

      const isEdit = Boolean(editingKriteria);

      const url = isEdit
        ? `/api/kriteria?id=${editingKriteria.IdKriteria}`
        : "/api/kriteria";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kriteriaForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data kriteria.");
      }

      closeKriteriaDialog();

      await fetchKriteria();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Data kriteria berhasil disimpan.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("SAVE KRITERIA:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menyimpan data kriteria.",
      });
    } finally {
      setSavingKriteria(false);
    }
  };

  // =====================================================
  // DELETE KRITERIA
  // =====================================================

  const handleDeleteKriteria = async (row) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus kriteria?",
      html: `
        Data kriteria
        <b>${row.NamaKriteria}</b>
        akan dihapus.
        <br/><br/>
        Pastikan kriteria tidak sedang digunakan.
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/kriteria?id=${row.IdKriteria}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus kriteria.");
      }

      if (selectedKriteria?.IdKriteria === row.IdKriteria) {
        setSelectedKriteria(null);
        setDetails([]);
      }

      await fetchKriteria();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Kriteria berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("DELETE KRITERIA:", error);

      Swal.fire({
        icon: "error",
        title: "Tidak dapat menghapus",
        text: error.message || "Gagal menghapus kriteria.",
      });
    }
  };

  // =====================================================
  // FORM DETAIL
  // =====================================================

  const openAddDetail = () => {
    if (!selectedKriteria) {
      Swal.fire({
        icon: "info",
        title: "Pilih kriteria terlebih dahulu",
        text: "Klik salah satu baris kriteria untuk menambahkan detail.",
      });

      return;
    }

    setEditingDetail(null);

    setDetailForm({
      IdKriteria: selectedKriteria.IdKriteria,
      Nilai: "",
      KodeDetail: "",
      NamaDetail: "",
      Keterangan: "",
    });

    setDetailDialog(true);
  };

  const openEditDetail = (row) => {
    setEditingDetail(row);

    setDetailForm({
      IdKriteria: row.IdKriteria,
      Nilai: row.Nilai,
      KodeDetail: row.KodeDetail || "",
      NamaDetail: row.NamaDetail || "",
      Keterangan: row.Keterangan || "",
    });

    setDetailDialog(true);
  };

  const closeDetailDialog = () => {
    if (savingDetail) return;

    setDetailDialog(false);
    setEditingDetail(null);
    setDetailForm(initialDetailForm);
  };

  const handleDetailChange = (event) => {
    const { name, value } = event.target;

    setDetailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE DETAIL
  // =====================================================

  const handleSaveDetail = async () => {
    if (!detailForm.IdKriteria) {
      Swal.fire({
        icon: "warning",
        title: "Kriteria belum dipilih",
        text: "Pilih kriteria terlebih dahulu.",
      });

      return;
    }

    if (!detailForm.Nilai) {
      Swal.fire({
        icon: "warning",
        title: "Nilai belum diisi",
        text: "Nilai harus berada antara 1 sampai 5.",
      });

      return;
    }

    if (Number(detailForm.Nilai) < 1 || Number(detailForm.Nilai) > 5) {
      Swal.fire({
        icon: "warning",
        title: "Nilai tidak valid",
        text: "Nilai harus berada antara 1 sampai 5.",
      });

      return;
    }

    if (!detailForm.KodeDetail.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Kode detail belum diisi",
        text: "Kode detail wajib diisi.",
      });

      return;
    }

    if (!detailForm.NamaDetail.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama detail belum diisi",
        text: "Nama detail wajib diisi.",
      });

      return;
    }

    try {
      setSavingDetail(true);

      const isEdit = Boolean(editingDetail);

      const url = isEdit
        ? `/api/kriteria/detail?id=${editingDetail.IdKriteriaDetail}`
        : "/api/kriteria/detail";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdKriteria: Number(detailForm.IdKriteria),
          Nilai: Number(detailForm.Nilai),
          KodeDetail: detailForm.KodeDetail.trim(),
          NamaDetail: detailForm.NamaDetail.trim(),
          Keterangan: detailForm.Keterangan.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan detail kriteria.");
      }

      closeDetailDialog();

      await fetchDetails(selectedKriteria.IdKriteria);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Detail kriteria berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("SAVE DETAIL:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menyimpan detail kriteria.",
      });
    } finally {
      setSavingDetail(false);
    }
  };

  // =====================================================
  // DELETE DETAIL
  // =====================================================

  const handleDeleteDetail = async (row) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus detail?",
      html: `
        Nilai <b>${row.Nilai}</b>
        -
        <b>${row.NamaDetail}</b>
        akan dihapus.
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/kriteria/detail?id=${row.IdKriteriaDetail}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus detail.");
      }

      await fetchDetails(selectedKriteria.IdKriteria);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Detail berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("DELETE DETAIL:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menghapus detail kriteria.",
      });
    }
  };

  // =====================================================
  // COLUMNS KRITERIA
  // =====================================================

  const kriteriaColumns = [
    {
      field: "KodeKriteria",
      headerName: "Kode",
      minWidth: 110,
      flex: 0.7,
      headerClassName: "table-header",
    },
    {
      field: "NamaKriteria",
      headerName: "Nama Kriteria",
      minWidth: 200,
      flex: 1.5,
      headerClassName: "table-header",
    },
    {
      field: "Jenis",
      headerName: "Jenis",
      minWidth: 130,
      flex: 0.8,
      headerClassName: "table-header",
      renderCell: (params) => (
        <Chip label={params.value || "-"} size="small" variant="outlined" />
      ),
    },
    {
      field: "Deskripsi",
      headerName: "Deskripsi",
      minWidth: 240,
      flex: 2,
      headerClassName: "table-header",
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value || "-"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Aksi",
      minWidth: 120,
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                openEditKriteria(params.row);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hapus">
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteKriteria(params.row);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // =====================================================
  // COLUMNS DETAIL
  // =====================================================

  const detailColumns = [
    {
      field: "Nilai",
      headerName: "Nilai",
      width: 90,
      headerClassName: "table-header",
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            Number(params.value) >= 4
              ? "success"
              : Number(params.value) >= 3
                ? "warning"
                : "error"
          }
          sx={{
            minWidth: 42,
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: "KodeDetail",
      headerName: "Kode Detail",
      minWidth: 130,
      width: 140,
      headerClassName: "table-header",
    },
    {
      field: "NamaDetail",
      headerName: "Nama Detail",
      minWidth: 200,
      flex: 1,
      headerClassName: "table-header",
    },
    {
      field: "Keterangan",
      headerName: "Keterangan",
      minWidth: 280,
      flex: 1.5,
      headerClassName: "table-header",
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value || "-"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Aksi",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openEditDetail(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hapus">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteDetail(params.row)}
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
      <Box
        sx={{
          width: "100%",
          maxWidth: 1600,
          mx: "auto",
        }}
      >
        <Stack spacing={3}>
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <Box>
            <Typography variant="h5" fontWeight={700} color="#10233f">
              Kriteria Penilaian
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Kelola kriteria dan detail nilai yang digunakan dalam proses
              penilaian operator.
            </Typography>
          </Box>

          {/* ================================================= */}
          {/* KRITERIA */}
          {/* ================================================= */}

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 25px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, md: 3 },
                "&:last-child": {
                  pb: { xs: 2, md: 3 },
                },
              }}
            >
              <Stack spacing={2}>
                {/* HEADER CARD */}

                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "stretch",
                    md: "center",
                  }}
                  spacing={2}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rule color="primary" />

                      <Typography variant="h6" fontWeight={700} color="#10233f">
                        Daftar Kriteria
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Klik baris kriteria untuk melihat detail penilaiannya.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                  >
                    <TextField
                      size="small"
                      placeholder="Cari kriteria..."
                      value={searchKriteria}
                      onChange={(e) => setSearchKriteria(e.target.value)}
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 230,
                        },
                      }}
                    />

                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchKriteria}
                      disabled={loadingKriteria}
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      Refresh
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={openAddKriteria}
                      sx={{
                        textTransform: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Tambah Kriteria
                    </Button>
                  </Stack>
                </Stack>

                {/* DATA GRID KRITERIA */}

                <Box
                  sx={{
                    width: "100%",
                    height: {
                      xs: 430,
                      md: 500,
                    },
                  }}
                >
                  <DataGrid
                    rows={filteredKriteria}
                    columns={kriteriaColumns}
                    getRowId={(row) => row.IdKriteria}
                    loading={loadingKriteria}
                    pagination
                    pageSizeOptions={[5, 10, 20, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 10,
                          page: 0,
                        },
                      },
                    }}
                    onRowClick={handleKriteriaRowClick}
                    disableRowSelectionOnClick
                    // rowSelectionModel={
                    //   selectedKriteria ? [selectedKriteria.IdKriteria] : []
                    // }
                    sx={{
                      border: "1px solid #e5eaf2",
                      borderRadius: 2,

                      "& .table-header": {
                        backgroundColor: "#f8fafc",
                        fontWeight: 700,
                      },

                      "& .MuiDataGrid-row": {
                        cursor: "pointer",
                      },

                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#f4f8ff",
                      },

                      "& .MuiDataGrid-row.Mui-selected": {
                        backgroundColor: "rgba(47,111,237,0.10)",
                      },

                      "& .MuiDataGrid-row.Mui-selected:hover": {
                        backgroundColor: "rgba(47,111,237,0.14)",
                      },

                      "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid #eef1f6",
                      },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* DETAIL KRITERIA */}
          {/* ================================================= */}

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 25px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, md: 3 },
                "&:last-child": {
                  pb: { xs: 2, md: 3 },
                },
              }}
            >
              {!selectedKriteria ? (
                <Box
                  sx={{
                    minHeight: 230,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Stack alignItems="center" spacing={1.5}>
                    <InfoOutlined
                      sx={{
                        fontSize: 42,
                        color: "#9aa7bb",
                      }}
                    />

                    <Typography variant="h6" fontWeight={600} color="#475569">
                      Belum ada kriteria dipilih
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 480,
                      }}
                    >
                      Klik salah satu baris pada tabel kriteria di atas untuk
                      menampilkan detail penilaiannya.
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {/* DETAIL HEADER */}

                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "stretch",
                      md: "center",
                    }}
                    spacing={2}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <KeyboardArrowRight color="primary" />

                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="#10233f"
                        >
                          Detail Kriteria
                        </Typography>
                      </Stack>

                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={{
                          xs: 0.5,
                          sm: 1,
                        }}
                        alignItems={{
                          xs: "flex-start",
                          sm: "center",
                        }}
                        sx={{ mt: 0.7 }}
                      >
                        <Chip
                          label={selectedKriteria.KodeKriteria}
                          size="small"
                          color="primary"
                        />

                        <Typography variant="body2" fontWeight={600}>
                          {selectedKriteria.NamaKriteria}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          • {details.length} detail
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                    >
                      <TextField
                        size="small"
                        placeholder="Cari detail..."
                        value={searchDetail}
                        onChange={(e) => setSearchDetail(e.target.value)}
                      />

                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() =>
                          fetchDetails(selectedKriteria.IdKriteria)
                        }
                        disabled={loadingDetails}
                        sx={{
                          textTransform: "none",
                        }}
                      >
                        Refresh
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openAddDetail}
                        sx={{
                          textTransform: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Tambah Detail
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* DATA GRID DETAIL */}

                  <Box
                    sx={{
                      width: "100%",
                      height: {
                        xs: 400,
                        md: 460,
                      },
                    }}
                  >
                    <DataGrid
                      rows={filteredDetails}
                      columns={detailColumns}
                      getRowId={(row) => row.IdKriteriaDetail}
                      loading={loadingDetails}
                      pagination
                      pageSizeOptions={[5, 10, 20]}
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 10,
                            page: 0,
                          },
                        },
                      }}
                      disableRowSelectionOnClick
                      sx={{
                        border: "1px solid #e5eaf2",
                        borderRadius: 2,

                        "& .table-header": {
                          backgroundColor: "#f8fafc",
                          fontWeight: 700,
                        },

                        "& .MuiDataGrid-cell": {
                          borderBottom: "1px solid #eef1f6",
                        },
                      }}
                    />
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* =================================================== */}
      {/* DIALOG KRITERIA */}
      {/* =================================================== */}

      <Dialog
        open={kriteriaDialog}
        onClose={closeKriteriaDialog}
        fullWidth
        maxWidth="sm"
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
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={700}>
              {editingKriteria ? "Edit Kriteria" : "Tambah Kriteria"}
            </Typography>

            <IconButton onClick={closeKriteriaDialog} disabled={savingKriteria}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Kode Kriteria"
              name="KodeKriteria"
              value={kriteriaForm.KodeKriteria}
              onChange={handleKriteriaChange}
              fullWidth
              required
              placeholder="Contoh: C1"
              inputProps={{
                maxLength: 5,
              }}
            />

            <TextField
              label="Nama Kriteria"
              name="NamaKriteria"
              value={kriteriaForm.NamaKriteria}
              onChange={handleKriteriaChange}
              fullWidth
              required
              placeholder="Contoh: Kedisiplinan"
            />

            <TextField
              select
              label="Jenis Kriteria"
              name="Jenis"
              value={kriteriaForm.Jenis}
              onChange={handleKriteriaChange}
              fullWidth
              required
            >
              <MenuItem value="Benefit">Benefit</MenuItem>

              <MenuItem value="Cost">Cost</MenuItem>
            </TextField>

            <TextField
              label="Deskripsi"
              name="Deskripsi"
              value={kriteriaForm.Deskripsi}
              onChange={handleKriteriaChange}
              fullWidth
              multiline
              minRows={3}
              placeholder="Deskripsi kriteria..."
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            "& > button": {
              width: {
                xs: "100%",
                sm: "auto",
              },
            },
          }}
        >
          <Button
            onClick={closeKriteriaDialog}
            disabled={savingKriteria}
            sx={{
              textTransform: "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveKriteria}
            disabled={savingKriteria}
            sx={{
              textTransform: "none",
            }}
          >
            {savingKriteria ? (
              <CircularProgress size={22} color="inherit" />
            ) : editingKriteria ? (
              "Simpan Perubahan"
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================== */}
      {/* DIALOG DETAIL */}
      {/* =================================================== */}

      <Dialog
        open={detailDialog}
        onClose={closeDetailDialog}
        fullWidth
        maxWidth="sm"
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
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingDetail
                  ? "Edit Detail Kriteria"
                  : "Tambah Detail Kriteria"}
              </Typography>

              {selectedKriteria && (
                <Typography variant="caption" color="text.secondary">
                  {selectedKriteria.KodeKriteria} -{" "}
                  {selectedKriteria.NamaKriteria}
                </Typography>
              )}
            </Box>

            <IconButton onClick={closeDetailDialog} disabled={savingDetail}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Kriteria */}

            <TextField
              label="Kriteria"
              value={
                selectedKriteria
                  ? `${selectedKriteria.KodeKriteria} - ${selectedKriteria.NamaKriteria}`
                  : ""
              }
              fullWidth
              disabled
            />

            {/* Nilai */}

            <TextField
              select
              label="Nilai"
              name="Nilai"
              value={detailForm.Nilai}
              onChange={handleDetailChange}
              fullWidth
              required
              helperText="Nilai harus berada antara 1 sampai 5."
            >
              <MenuItem value={1}>1 - Sangat Rendah</MenuItem>

              <MenuItem value={2}>2 - Rendah</MenuItem>

              <MenuItem value={3}>3 - Cukup</MenuItem>

              <MenuItem value={4}>4 - Baik</MenuItem>

              <MenuItem value={5}>5 - Sangat Baik</MenuItem>
            </TextField>

            {/* Kode Detail */}

            <TextField
              label="Kode Detail"
              name="KodeDetail"
              value={detailForm.KodeDetail}
              onChange={handleDetailChange}
              fullWidth
              required
              placeholder="Contoh: C1-1"
              inputProps={{
                maxLength: 10,
              }}
            />

            {/* Nama Detail */}

            <TextField
              label="Nama Detail"
              name="NamaDetail"
              value={detailForm.NamaDetail}
              onChange={handleDetailChange}
              fullWidth
              required
              placeholder="Contoh: Sangat Baik"
            />

            {/* Keterangan */}

            <TextField
              label="Keterangan"
              name="Keterangan"
              value={detailForm.Keterangan}
              onChange={handleDetailChange}
              fullWidth
              multiline
              minRows={3}
              placeholder="Penjelasan detail nilai..."
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            "& > button": {
              width: {
                xs: "100%",
                sm: "auto",
              },
            },
          }}
        >
          <Button
            onClick={closeDetailDialog}
            disabled={savingDetail}
            sx={{
              textTransform: "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveDetail}
            disabled={savingDetail}
            sx={{
              textTransform: "none",
            }}
          >
            {savingDetail ? (
              <CircularProgress size={22} color="inherit" />
            ) : editingDetail ? (
              "Simpan Perubahan"
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
