"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function UserDialog({
  open,
  onClose,
  onSubmit,
  editingUser,
  roles = [],
  loading = false,
}) {
  const [form, setForm] = useState({
    IdRole: "",
    NamaLengkap: "",
    Username: "",
    Password: "",
    StatusAktif: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({
        IdRole: editingUser.IdRole ?? "",
        NamaLengkap: editingUser.NamaLengkap ?? "",
        Username: editingUser.Username ?? "",
        Password: "",
        StatusAktif: editingUser.StatusAktif ?? true,
      });
    } else {
      setForm({
        IdRole: "",
        NamaLengkap: "",
        Username: "",
        Password: "",
        StatusAktif: true,
      });
    }

    setShowPassword(false);
  }, [editingUser, open]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(form);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingUser ? "Edit User" : "Tambah User"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Nama Lengkap"
              name="NamaLengkap"
              value={form.NamaLengkap}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Masukkan nama lengkap"
            />

            <TextField
              label="Username"
              name="Username"
              value={form.Username}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Masukkan username"
            />

            <TextField
              select
              label="Role"
              name="IdRole"
              value={form.IdRole}
              onChange={handleChange}
              fullWidth
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.IdRole} value={role.IdRole}>
                  {role.NamaRole}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={editingUser ? "Password Baru (opsional)" : "Password"}
              name="Password"
              type={showPassword ? "text" : "password"}
              value={form.Password}
              onChange={handleChange}
              fullWidth
              required={!editingUser}
              placeholder={
                editingUser
                  ? "Kosongkan jika tidak ingin mengubah"
                  : "Masukkan password"
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  name="StatusAktif"
                  checked={form.StatusAktif}
                  onChange={handleChange}
                />
              }
              label={form.StatusAktif ? "User Aktif" : "User Tidak Aktif"}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Batal
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? "Menyimpan..."
              : editingUser
                ? "Simpan Perubahan"
                : "Simpan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
