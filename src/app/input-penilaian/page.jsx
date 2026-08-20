"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
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
  Assessment,
  CalendarMonth,
  CheckCircle,
  Save,
} from "@mui/icons-material";

import Swal from "sweetalert2";

export default function InputPenilaianPage() {
  const [operators, setOperators] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    IdOperator: "",
    IdSupervisor: "",
    TanggalPenilaian: new Date().toISOString().split("T")[0],
    Periode: getCurrentPeriod(),
  });

  const [nilai, setNilai] = useState({});

  const [errors, setErrors] = useState({});

  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [operatorRes, criteriaRes, users] = await Promise.all([
        fetch("/api/operators"),
        fetch("/api/kriteria"),
        fetch("/api/users"),
      ]);

      const operatorJson = await operatorRes.json();
      const criteriaJson = await criteriaRes.json();
      const usersJson = await users.json();

      if (!operatorRes.ok || !operatorJson.success) {
        throw new Error(
          operatorJson.message || "Gagal mengambil data operator.",
        );
      }

      if (!criteriaRes.ok || !criteriaJson.success) {
        throw new Error(
          criteriaJson.message || "Gagal mengambil data kriteria.",
        );
      }

      setOperators(operatorJson.data || []);

      /*
       * Sesuaikan jika API kriteria menggunakan:
       * data: [...]
       */
      setCriteria(criteriaJson.data || []);

      // Filter users dengan IdRole 2 (Supervisor)
      const supervisors = (usersJson.data || []).filter(
        (user) => user.IdRole === 2,
      );
      console.log("Supervisors:", supervisors);
      setUsers(supervisors);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengambil data.",
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function handleNilaiChange(idKriteria, value) {
    setNilai((prev) => ({
      ...prev,
      [idKriteria]: Number(value),
    }));

    setErrors((prev) => ({
      ...prev,
      [`kriteria_${idKriteria}`]: "",
    }));
  }

  /*
   * =========================================================
   * PROGRESS
   * =========================================================
   */

  const totalKriteria = criteria.length;

  const jumlahDinilai = Object.keys(nilai).filter(
    (key) => nilai[key] !== undefined && nilai[key] !== "",
  ).length;

  const progress =
    totalKriteria > 0 ? Math.round((jumlahDinilai / totalKriteria) * 100) : 0;

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  function validate() {
    const newErrors = {};

    if (!form.IdOperator) {
      newErrors.IdOperator = "Operator wajib dipilih.";
    }

    if (!form.IdSupervisor) {
      newErrors.IdSupervisor = "Supervisor wajib dipilih.";
    }

    if (!form.TanggalPenilaian) {
      newErrors.TanggalPenilaian = "Tanggal penilaian wajib diisi.";
    }

    if (!form.Periode) {
      newErrors.Periode = "Periode wajib diisi.";
    }

    criteria.forEach((item) => {
      if (
        nilai[item.IdKriteria] === undefined ||
        nilai[item.IdKriteria] === ""
      ) {
        newErrors[`kriteria_${item.IdKriteria}`] =
          "Nilai kriteria wajib dipilih.";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Silakan lengkapi seluruh data penilaian.",
      });

      return;
    }

    try {
      setSaving(true);

      const detailPenilaian = criteria.map((item) => ({
        IdKriteria: item.IdKriteria,
        Nilai: Number(nilai[item.IdKriteria]),
      }));

      const payload = {
        IdOperator: Number(form.IdOperator),
        IdSupervisor: Number(form.IdSupervisor),
        TanggalPenilaian: form.TanggalPenilaian,
        Periode: form.Periode,
        Detail: detailPenilaian,
      };

      const response = await fetch("/api/penilaian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Response :", payload);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan penilaian.");
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Penilaian berhasil disimpan.",
        timer: 1800,
        showConfirmButton: false,
      });

      setNilai({});
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <AppShell>
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">
              Memuat data penilaian...
            </Typography>
          </Stack>
        </Box>
      </AppShell>
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <AppShell>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          overflow: "hidden",
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Card
          sx={{
            mb: 2.5,
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
            color: "#fff",
            background: "linear-gradient(135deg, #123d8d 0%, #2f6fed 100%)",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              "&:last-child": {
                pb: { xs: 2, sm: 2.5, md: 3 },
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
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Assessment />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      fontSize: {
                        xs: "1.15rem",
                        sm: "1.35rem",
                        md: "1.5rem",
                      },
                    }}
                  >
                    Input Penilaian Operator
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.4,
                      opacity: 0.9,
                      fontSize: {
                        xs: "0.78rem",
                        sm: "0.875rem",
                      },
                    }}
                  >
                    Berikan nilai berdasarkan kriteria penilaian yang telah
                    ditentukan.
                  </Typography>
                </Box>
              </Stack>

              <Chip
                icon={<CheckCircle />}
                label={`${progress}% selesai`}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  flexShrink: 0,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* =====================================================
            INFORMASI PENILAIAN
        ====================================================== */}

        <Card
          sx={{
            mb: 2.5,
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              "&:last-child": {
                pb: { xs: 2, sm: 2.5, md: 3 },
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.15rem",
                },
              }}
            >
              Informasi Penilaian
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, mb: 2.5 }}
            >
              Tentukan operator, supervisor dan periode penilaian.
            </Typography>

            <Grid container spacing={2}>
              {/* OPERATOR */}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth error={Boolean(errors.IdOperator)}>
                  <InputLabel>Operator *</InputLabel>

                  <Select
                    name="IdOperator"
                    value={form.IdOperator}
                    label="Operator *"
                    onChange={handleChange}
                  >
                    {operators.map((operator) => (
                      <MenuItem
                        key={operator.IdOperator}
                        value={operator.IdOperator}
                      >
                        {operator.NamaOperator}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.IdOperator && (
                    <FormHelperText>{errors.IdOperator}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* SUPERVISOR */}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth error={Boolean(errors.IdSupervisor)}>
                  <InputLabel>Supervisor *</InputLabel>

                  <Select
                    name="IdSupervisor"
                    value={form.IdSupervisor}
                    label="Supervisor *"
                    onChange={handleChange}
                  >
                    {users.map((supervisor) => (
                      <MenuItem
                        key={supervisor.IdUser}
                        value={supervisor.IdUser}
                      >
                        {supervisor.NamaLengkap}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.IdSupervisor && (
                    <FormHelperText>{errors.IdSupervisor}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* TANGGAL */}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Penilaian *"
                  name="TanggalPenilaian"
                  value={form.TanggalPenilaian}
                  onChange={handleChange}
                  error={Boolean(errors.TanggalPenilaian)}
                  helperText={errors.TanggalPenilaian}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>

              {/* PERIODE */}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Periode *"
                  name="Periode"
                  value={form.Periode}
                  onChange={handleChange}
                  error={Boolean(errors.Periode)}
                  helperText={errors.Periode}
                  placeholder="Contoh: Agustus 2026"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* =====================================================
            KRITERIA
        ====================================================== */}

        <Card
          sx={{
            mb: 2.5,
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              "&:last-child": {
                pb: { xs: 2, sm: 2.5, md: 3 },
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              mb={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    fontSize: {
                      xs: "1rem",
                      sm: "1.15rem",
                    },
                  }}
                >
                  Penilaian Berdasarkan Kriteria
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Pilih nilai 1–5 sesuai kondisi operator.
                </Typography>
              </Box>

              <Chip
                label={`${jumlahDinilai}/${totalKriteria} dinilai`}
                color="primary"
                size="small"
              />
            </Stack>

            <Stack spacing={1.5}>
              {criteria.map((item) => {
                const selectedValue = nilai[item.IdKriteria];

                return (
                  <Paper
                    key={item.IdKriteria}
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      alignItems={{
                        xs: "stretch",
                        md: "center",
                      }}
                      justifyContent="space-between"
                    >
                      {/* INFO KRITERIA */}

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Chip
                            label={item.KodeKriteria || `C${item.IdKriteria}`}
                            size="small"
                            color="primary"
                            sx={{
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              fontWeight={700}
                              sx={{
                                wordBreak: "break-word",
                              }}
                            >
                              {item.NamaKriteria}
                            </Typography>

                            {item.Deskripsi && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mt: 0.5,
                                  wordBreak: "break-word",
                                }}
                              >
                                {item.Deskripsi}
                              </Typography>
                            )}

                            {item.Jenis && (
                              <Chip
                                label={item.Jenis}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </Box>

                      <Divider
                        sx={{
                          display: {
                            xs: "block",
                            md: "none",
                          },
                        }}
                      />

                      {/* NILAI */}

                      <Box
                        sx={{
                          width: {
                            xs: "100%",
                            md: 260,
                          },
                          flexShrink: 0,
                        }}
                      >
                        <FormControl
                          fullWidth
                          error={Boolean(errors[`kriteria_${item.IdKriteria}`])}
                        >
                          <InputLabel>Pilih Nilai</InputLabel>

                          <Select
                            value={selectedValue ?? ""}
                            label="Pilih Nilai"
                            onChange={(event) =>
                              handleNilaiChange(
                                item.IdKriteria,
                                event.target.value,
                              )
                            }
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <MenuItem key={value} value={value}>
                                Nilai {value}
                              </MenuItem>
                            ))}
                          </Select>

                          {errors[`kriteria_${item.IdKriteria}`] && (
                            <FormHelperText>
                              {errors[`kriteria_${item.IdKriteria}`]}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}

              {criteria.length === 0 && (
                <Alert severity="info">
                  Belum terdapat kriteria penilaian.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* =====================================================
            FOOTER / ACTION
        ====================================================== */}

        <Card
          sx={{
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5, md: 2 },
              "&:last-child": {
                pb: { xs: 2, sm: 2.5, md: 2 },
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
                xs: "stretch",
                sm: "center",
              }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Progress penilaian
                </Typography>

                <Typography fontWeight={700}>
                  {jumlahDinilai} dari {totalKriteria} kriteria
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving || totalKriteria === 0}
                sx={{
                  minHeight: 48,
                  px: 3,
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {saving ? "Menyimpan..." : "Simpan Penilaian"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </AppShell>
  );
}

/*
 * =========================================================
 * HELPER
 * =========================================================
 */

function getCurrentPeriod() {
  const date = new Date();

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
