"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

export default function KriteriaDetailDialog({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  kriteriaList = [],
  loading = false,
  editMode = false,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          width: "100%",
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editMode ? "Edit Detail Kriteria" : "Tambah Detail Kriteria"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          {/* KRITERIA */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel id="kriteria-label">Kriteria</InputLabel>

              <Select
                labelId="kriteria-label"
                name="IdKriteria"
                value={form.IdKriteria || ""}
                label="Kriteria"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Pilih Kriteria</em>
                </MenuItem>

                {kriteriaList.map((item) => (
                  <MenuItem key={item.IdKriteria} value={item.IdKriteria}>
                    {item.KodeKriteria} - {item.NamaKriteria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* NILAI + KODE */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              required
              select
              label="Nilai"
              name="Nilai"
              value={form.Nilai ?? ""}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map((nilai) => (
                <MenuItem key={nilai} value={nilai}>
                  {nilai}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              fullWidth
              required
              label="Kode Detail"
              name="KodeDetail"
              value={form.KodeDetail || ""}
              onChange={handleChange}
              placeholder="Contoh: K1-1"
              inputProps={{
                maxLength: 10,
              }}
            />
          </Grid>

          {/* NAMA DETAIL */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Nama Detail"
              name="NamaDetail"
              value={form.NamaDetail || ""}
              onChange={handleChange}
              placeholder="Contoh: Sangat Baik"
              inputProps={{
                maxLength: 100,
              }}
            />
          </Grid>

          {/* KETERANGAN */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Keterangan"
              name="Keterangan"
              value={form.Keterangan || ""}
              onChange={handleChange}
              placeholder="Masukkan penjelasan detail kriteria..."
              inputProps={{
                maxLength: 255,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          fullWidth
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Batal
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          fullWidth
          sx={{
            width: { xs: "100%", sm: "auto" },
            textTransform: "none",
          }}
        >
          {loading
            ? "Menyimpan..."
            : editMode
              ? "Simpan Perubahan"
              : "Tambah Detail"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
