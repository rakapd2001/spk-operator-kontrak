"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  DeleteOutline,
  EditOutlined,
  Person,
  PersonAdd,
  Refresh,
} from "@mui/icons-material";

import Swal from "sweetalert2";

export default function DataUserPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");

  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    NamaLengkap: "",
    Username: "",
    Password: "",
    IdRole: "",
    StatusAktif: true,
  });

  // =========================================================
  // SWEET ALERT HELPER
  // =========================================================

  const showSuccess = (message) => {
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: "#2f6fed",
    });
  };

  const showError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: "#d32f2f",
    });
  };

  // =========================================================
  // GET USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      // //console.log("GET USERS:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data user.");
      }

      const userData = Array.isArray(result.data) ? result.data : [];

      setUsers(userData);
    } catch (error) {
      // //console.error("LOAD USERS ERROR:", error);

      setUsers([]);

      showError(error.message || "Gagal mengambil data user.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET ROLES
  // =========================================================

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await fetch("/api/roles", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      //console.log("GET ROLES:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data role.");
      }

      const roleData = Array.isArray(result.data) ? result.data : [];

      setRoles(roleData);

      if (roleData.length === 0) {
        //console.warn("Belum terdapat data role.");
      }
    } catch (error) {
      //console.error("LOAD ROLES ERROR:", error);

      setRoles([]);

      showError(error.message || "Gagal mengambil data role.");
    } finally {
      setLoadingRoles(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // =========================================================
  // TAMBAH USER
  // =========================================================

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedUser(null);

    setFormData({
      NamaLengkap: "",
      Username: "",
      Password: "",
      IdRole: roles.length > 0 ? roles[0].IdRole : "",
      StatusAktif: true,
    });

    setOpenDialog(true);
  };

  // =========================================================
  // EDIT USER
  // =========================================================

  const handleEdit = (user) => {
    setDialogMode("edit");

    setSelectedUser(user);

    setFormData({
      NamaLengkap: user.NamaLengkap || "",
      Username: user.Username || "",
      Password: "",
      IdRole: user.IdRole || "",
      StatusAktif:
        user.StatusAktif !== undefined ? Boolean(user.StatusAktif) : true,
    });

    setOpenDialog(true);
  };

  // =========================================================
  // HANDLE FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // VALIDASI FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.NamaLengkap.trim()) {
      showError("Nama lengkap wajib diisi.");
      return false;
    }

    if (!formData.Username.trim()) {
      showError("Username wajib diisi.");
      return false;
    }

    if (!formData.IdRole) {
      showError("Role wajib dipilih.");
      return false;
    }

    if (dialogMode === "add" && !formData.Password.trim()) {
      showError("Password wajib diisi.");
      return false;
    }

    if (dialogMode === "add" && formData.Password.trim().length < 6) {
      showError("Password minimal 6 karakter.");
      return false;
    }

    if (
      dialogMode === "edit" &&
      formData.Password.trim() &&
      formData.Password.trim().length < 6
    ) {
      showError("Password baru minimal 6 karakter.");
      return false;
    }

    return true;
  };

  // =========================================================
  // SIMPAN USER
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    // ==============================
    // VALIDASI
    // ==============================

    if (!formData.NamaLengkap.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama lengkap wajib diisi.",
      });
      return;
    }

    if (!formData.Username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Username wajib diisi.",
      });
      return;
    }

    if (!formData.IdRole) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Role wajib dipilih.",
      });
      return;
    }

    if (dialogMode === "add" && !formData.Password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Password wajib diisi.",
      });
      return;
    }

    if (formData.Password.trim() && formData.Password.trim().length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password tidak valid",
        text: "Password minimal 6 karakter.",
      });
      return;
    }

    try {
      setSaving(true);

      const isEdit = dialogMode === "edit";

      const url = isEdit ? `/api/users/${selectedUser.IdUser}` : "/api/users";

      const method = isEdit ? "PUT" : "POST";

      // ==============================
      // PAYLOAD
      // ==============================

      const payload = {
        IdRole: Number(formData.IdRole),
        NamaLengkap: formData.NamaLengkap.trim(),
        Username: formData.Username.trim(),
        StatusAktif: Boolean(formData.StatusAktif),
      };

      // Password hanya dikirim jika ada
      if (formData.Password.trim()) {
        payload.Password = formData.Password.trim();
      }

      // //console.log("SUBMIT USER:", {
      //   url,
      //   method,
      //   payload: {
      //     ...payload,
      //     Password: payload.Password ? "********" : undefined,
      //   },
      // });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // //console.log("SUBMIT RESPONSE:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data user.");
      }

      // ==============================
      // TUTUP DIALOG
      // ==============================

      setOpenDialog(false);

      setSelectedUser(null);

      setFormData({
        NamaLengkap: "",
        Username: "",
        Password: "",
        IdRole: "",
        StatusAktif: true,
      });

      // ==============================
      // REFRESH DATA
      // ==============================

      await fetchUsers();

      // ==============================
      // SUCCESS
      // ==============================

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: isEdit
          ? "Data user berhasil diperbarui."
          : "Data user berhasil ditambahkan.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      // //console.error("SAVE USER ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menyimpan data user.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HAPUS USER
  // =========================================================

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      html: `
      <div style="text-align:center">
        Data user berikut akan dihapus:
        <br/>
        <strong>${user.NamaLengkap}</strong>
        <br/>
        <small>${user.Username}</small>
      </div>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#d32f2f",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Menghapus...",
        text: "Silakan tunggu",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(`/api/users/${user.IdUser}`, {
        method: "DELETE",
      });

      const result = await response.json();

      Swal.close();
      // //console.log("DELETE RESPONSE:", result);
      if (!response.ok || !result.success) {
        // Jika user sudah digunakan pada penilaian
        if (response.status === 409 && result.canDeactivate) {
          const confirmDeactivate = await Swal.fire({
            title: "User Tidak Dapat Dihapus",
            text: result.message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Nonaktifkan User",
            cancelButtonText: "Batal",
            reverseButtons: true,
            confirmButtonColor: "#ed6c02",
          });

          if (confirmDeactivate.isConfirmed) {
            await handleDeactivate(user);
          }

          return;
        }

        throw new Error(result.message || "Gagal menghapus user.");
      }

      await Swal.fire({
        title: "Berhasil",
        text: result.message,
        icon: "success",
        confirmButtonText: "OK",
        timer: 1800,
        showConfirmButton: false,
      });

      // Refresh data
      fetchUsers();
    } catch (error) {
      // //console.error("DELETE USER ERROR:", error);

      Swal.fire({
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menghapus user.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // =========================================================
  // CLOSE DIALOG
  // =========================================================

  const handleCloseDialog = () => {
    if (saving) return;

    setOpenDialog(false);
  };

  // =========================================================
  // DATA GRID ROWS
  // =========================================================

  const rows = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    return users.map((user) => ({
      id: user.IdUser,
      IdUser: user.IdUser,
      IdRole: user.IdRole,
      NamaLengkap: user.NamaLengkap || "-",
      Username: user.Username || "-",
      Role: user.Role?.NamaRole || "-",
      StatusAktif: Boolean(user.StatusAktif),
    }));
  }, [users]);

  // =========================================================
  // DATA GRID COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 70,
      },
      {
        field: "NamaLengkap",
        headerName: "Nama Lengkap",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "Username",
        headerName: "Username",
        width: 170,
      },
      {
        field: "Role",
        headerName: "Role",
        width: 170,
        renderCell: (params) => (
          <Chip
            label={params.value || "-"}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        field: "StatusAktif",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Aktif" : "Nonaktif"}
            size="small"
            color={params.value ? "success" : "default"}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Aksi",
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(params.row)}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Hapus User">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(params.row)}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deleting],
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AppShell role="HRD">
      <Box>
        <Typography variant="h4" fontWeight={700} color="#10233f">
          Kelola User
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola data user sistem, role, dan status akses pengguna.
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
            borderRadius: {
              xs: 2,
              md: 3,
            },
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
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",
                sm: "center",
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
                  <Person />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#10233f">
                    Daftar User
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
              >
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  {loading ? "Memuat..." : "Refresh"}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleAdd}
                  disabled={loadingRoles || roles.length === 0}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Tambah User
                </Button>
              </Stack>
            </Stack>

            {/* ================================================= */}
            {/* INFO ROLE */}
            {/* ================================================= */}

            {!loadingRoles && roles.length === 0 && (
              <Box mb={2}>
                <Typography
                  variant="body2"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#fff7ed",
                    color: "#9a3412",
                  }}
                >
                  Belum terdapat data role. Tambahkan role terlebih dahulu
                  sebelum membuat user.
                </Typography>
              </Box>
            )}

            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Box
                sx={{
                  minWidth: {
                    xs: 850,
                    md: "100%",
                  },
                  height: {
                    xs: 500,
                    sm: 560,
                  },
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  disableRowSelectionOnClick
                  pageSizeOptions={[8, 12, 16]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        page: 0,
                        pageSize: 8,
                      },
                    },
                  }}
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
                  localeText={{
                    noRowsLabel: "Belum terdapat data user.",
                    noResultsOverlayLabel: "Data tidak ditemukan.",
                  }}
                  sx={{
                    border: "none",

                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: "#f8fafc",
                    },

                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: 700,
                    },

                    "& .MuiDataGrid-toolbarContainer": {
                      px: 0,
                      py: 1,
                      flexWrap: "wrap",
                      gap: 1,
                    },

                    "& .MuiDataGrid-cell": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.875rem",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ===================================================== */}
      {/* DIALOG ADD / EDIT */}
      {/* ===================================================== */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={false}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          {dialogMode === "add" ? "Tambah User" : "Edit User"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Nama */}

            <TextField
              label="Nama Lengkap"
              name="NamaLengkap"
              value={formData.NamaLengkap}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="off"
              placeholder="Masukkan nama lengkap"
              disabled={saving}
            />

            {/* Username */}

            <TextField
              label="Username"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="off"
              placeholder="Masukkan username"
              disabled={saving}
            />

            {/* Role */}

            <FormControl fullWidth required disabled={saving || loadingRoles}>
              <InputLabel>Role</InputLabel>

              <Select
                name="IdRole"
                value={formData.IdRole}
                label="Role"
                onChange={handleChange}
              >
                {roles.map((role) => (
                  <MenuItem key={role.IdRole} value={role.IdRole}>
                    {role.NamaRole}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}

            <FormControl fullWidth disabled={saving}>
              <InputLabel>Status</InputLabel>

              <Select
                name="StatusAktif"
                value={formData.StatusAktif}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value={true}>Aktif</MenuItem>

                <MenuItem value={false}>Nonaktif</MenuItem>
              </Select>
            </FormControl>

            {/* Password */}

            <TextField
              label={dialogMode === "add" ? "Password" : "Password Baru"}
              name="Password"
              type="password"
              value={formData.Password}
              onChange={handleChange}
              fullWidth
              required={dialogMode === "add"}
              autoComplete="new-password"
              placeholder={
                dialogMode === "add"
                  ? "Masukkan password"
                  : "Kosongkan jika tidak ingin mengubah password"
              }
              helperText={
                dialogMode === "edit"
                  ? "Kosongkan jika password tidak ingin diubah."
                  : "Minimal 6 karakter."
              }
              disabled={saving}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
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
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              textTransform: "none",
              minWidth: 120,
            }}
          >
            {saving
              ? "Menyimpan..."
              : dialogMode === "add"
                ? "Simpan"
                : "Simpan Perubahan"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
