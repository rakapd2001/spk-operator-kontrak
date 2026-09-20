"use client";

import { useEffect, useState } from "react";
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

import { Assessment, CheckCircle, Save } from "@mui/icons-material";
import Swal from "sweetalert2";

export default function InputPenilaianPage() {
  const [operators, setOperators] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingOperator, setCheckingOperator] = useState(false);

  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false);
  const [canEvaluate, setCanEvaluate] = useState(true);

  const [selectedOperatorInfo, setSelectedOperatorInfo] = useState(null);

  const [form, setForm] = useState({
    IdOperator: "",
    IdSupervisor: "",
    TanggalPenilaian: new Date().toISOString().split("T")[0],
    Periode: getCurrentPeriod(),
  });

  const [nilai, setNilai] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [operatorRes, criteriaRes, usersRes, authRes] = await Promise.all([
        fetch("/api/operators"),
        fetch("/api/kriteria"),
        fetch("/api/users"),
        fetch("/api/auth/me", { cache: "no-store" }),
      ]);

      const operatorJson = await operatorRes.json();
      const criteriaJson = await criteriaRes.json();
      const usersJson = await usersRes.json();
      const authJson = await authRes.json();

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

      const loggedUser = authJson.success ? authJson.data : null;
      setCurrentUser(loggedUser);

      const allOperators = operatorJson.data || [];
      const allSupervisors = (usersJson.data || []).filter(
        (user) => Number(user.IdRole) === 2,
      );

      const filteredOperators = loggedUser?.Bagian
        ? allOperators.filter(
            (operator) =>
              String(operator.Bagian || "")
                .trim()
                .toLowerCase() ===
              String(loggedUser.Bagian || "")
                .trim()
                .toLowerCase(),
          )
        : allOperators;

      const filteredSupervisors = loggedUser?.Bagian
        ? allSupervisors.filter(
            (user) =>
              String(user.Bagian || "")
                .trim()
                .toLowerCase() ===
              String(loggedUser.Bagian || "")
                .trim()
                .toLowerCase(),
          )
        : allSupervisors;

      setOperators(filteredOperators);
      setCriteria(criteriaJson.data || []);
      setUsers(filteredSupervisors);

      if (loggedUser?.IdUser) {
        setForm((prev) => ({
          ...prev,
          IdSupervisor: String(loggedUser.IdUser),
        }));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengambil data.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkOperatorEvaluation(operatorId) {
    if (!operatorId) {
      setAlreadyEvaluated(false);
      setCanEvaluate(true);
      setSelectedOperatorInfo(null);
      return;
    }

    const selectedOperator = operators.find(
      (operator) => Number(operator.IdOperator) === Number(operatorId),
    );

    if (selectedOperator) {
      setSelectedOperatorInfo({
        NIK: selectedOperator.NIK || "-",
        NamaOperator: selectedOperator.NamaOperator || "-",
        Bagian: selectedOperator.Bagian || "-",
        TanggalKontrakSelesai: formatDate(
          selectedOperator.TanggalKontrakSelesai,
        ),
      });
    } else {
      setSelectedOperatorInfo(null);
    }

    setCheckingOperator(true);

    try {
      const response = await fetch(
        `/api/penilaian?check=true&IdOperator=${operatorId}`,
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        setAlreadyEvaluated(false);
        setCanEvaluate(true);
        return;
      }

      if (result.exists === true) {
        setAlreadyEvaluated(true);
        setCanEvaluate(true);

        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Operator ini sudah memiliki data penilaian",
          confirmButtonText: "OK",
        });

        return;
      }

      if (result.canEvaluate === false) {
        setAlreadyEvaluated(false);
        setCanEvaluate(false);

        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Operator hanya dapat dinilai 14 hari sebelum kontrak berakhir",
          confirmButtonText: "OK",
        });

        return;
      }

      setAlreadyEvaluated(false);
      setCanEvaluate(true);
    } catch (error) {
      setAlreadyEvaluated(false);
      setCanEvaluate(true);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengecek status operator.",
      });
    } finally {
      setCheckingOperator(false);
    }
  }

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

  const totalKriteria = criteria.length;

  const jumlahDinilai = Object.keys(nilai).filter(
    (key) => nilai[key] !== undefined && nilai[key] !== "",
  ).length;

  const progress =
    totalKriteria > 0 ? Math.round((jumlahDinilai / totalKriteria) * 100) : 0;

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (alreadyEvaluated || !canEvaluate) {
      Swal.fire({
        icon: "warning",
        title: "Penilaian tidak dapat diproses",
        text: alreadyEvaluated
          ? "Operator ini sudah memiliki data penilaian"
          : "Operator hanya dapat dinilai 14 hari sebelum kontrak berakhir",
      });
      return;
    }

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

      setForm({
        IdOperator: "",
        IdSupervisor: "",
        TanggalPenilaian: new Date().toISOString().split("T")[0],
        Periode: getCurrentPeriod(),
      });

      setNilai({});
      setErrors({});
      setAlreadyEvaluated(false);
      setCanEvaluate(true);
      setSelectedOperatorInfo(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setSaving(false);
    }
  }

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
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ minWidth: 0, width: "100%" }}
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
              sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth error={Boolean(errors.IdOperator)}>
                  <InputLabel>Operator *</InputLabel>

                  <Select
                    name="IdOperator"
                    value={form.IdOperator}
                    label="Operator *"
                    disabled={checkingOperator}
                    onChange={async (event) => {
                      const selectedOperatorId = event.target.value;

                      setForm((prev) => ({
                        ...prev,
                        IdOperator: selectedOperatorId,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        IdOperator: "",
                      }));

                      if (!selectedOperatorId) {
                        setAlreadyEvaluated(false);
                        setCanEvaluate(true);
                        setSelectedOperatorInfo(null);
                        return;
                      }

                      await checkOperatorEvaluation(selectedOperatorId);
                    }}
                  >
                    {operators.map((operator) => (
                      <MenuItem
                        key={operator.IdOperator}
                        value={operator.IdOperator}
                      >
                        {operator.NIK || "-"} - {operator.NamaOperator}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.IdOperator && (
                    <FormHelperText>{errors.IdOperator}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

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
                        {supervisor.Username || supervisor.NamaLengkap} -{" "}
                        {supervisor.NamaLengkap}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.IdSupervisor && (
                    <FormHelperText>{errors.IdSupervisor}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1}>
                  <FormControl fullWidth error={Boolean(errors.Periode)}>
                    <InputLabel>Bulan *</InputLabel>
                    <Select
                      value={getPeriodMonth(form.Periode)}
                      label="Bulan *"
                      onChange={(event) => {
                        const selectedMonth = event.target.value;
                        const selectedYear = getPeriodYear(form.Periode);

                        setForm((prev) => ({
                          ...prev,
                          Periode: `${selectedMonth} ${selectedYear}`,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          Periode: "",
                        }));
                      }}
                    >
                      {MONTH_OPTIONS.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth error={Boolean(errors.Periode)}>
                    <InputLabel>Tahun *</InputLabel>
                    <Select
                      value={String(getPeriodYear(form.Periode))}
                      label="Tahun *"
                      onChange={(event) => {
                        const selectedYear = event.target.value;
                        const selectedMonth = getPeriodMonth(form.Periode);

                        setForm((prev) => ({
                          ...prev,
                          Periode: `${selectedMonth} ${selectedYear}`,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          Periode: "",
                        }));
                      }}
                    >
                      {getYearOptions().map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {errors.Periode && (
                  <FormHelperText sx={{ mt: 1 }}>
                    {errors.Periode}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>

            {selectedOperatorInfo && (
              <Alert severity="info" sx={{ mt: 2.5 }}>
                NIK Operator: {selectedOperatorInfo.NIK}
                <br />
                Nama Operator: {selectedOperatorInfo.NamaOperator}
                <br />
                Bagian: {selectedOperatorInfo.Bagian}
                <br />
                Kontrak Berakhir: {selectedOperatorInfo.TanggalKontrakSelesai}
              </Alert>
            )}
          </CardContent>
        </Card>

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
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              mb={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}
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
                const isKriteriaDisabled =
                  alreadyEvaluated || !canEvaluate || checkingOperator;

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
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", md: "center" }}
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Chip
                            label={item.KodeKriteria || `C${item.IdKriteria}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700, flexShrink: 0 }}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              fontWeight={700}
                              sx={{ wordBreak: "break-word" }}
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

                      <Box
                        sx={{
                          width: {
                            xs: "100%",
                            md: 420,
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
                            disabled={isKriteriaDisabled}
                            onChange={(event) =>
                              handleNilaiChange(
                                item.IdKriteria,
                                event.target.value,
                              )
                            }
                            sx={{
                              "& .MuiSelect-select": {
                                whiteSpace: "normal",
                                lineHeight: 1.5,
                                py: 1.25,
                              },
                            }}
                          >
                            {(item.KriteriaDetail?.length
                              ? item.KriteriaDetail
                              : [
                                  { Nilai: 1, NamaDetail: "Sangat Kurang" },
                                  { Nilai: 2, NamaDetail: "Kurang" },
                                  { Nilai: 3, NamaDetail: "Cukup" },
                                  { Nilai: 4, NamaDetail: "Baik" },
                                  { Nilai: 5, NamaDetail: "Sangat Baik" },
                                ]
                            )
                              .slice()
                              .sort((a, b) => Number(a.Nilai) - Number(b.Nilai))
                              .map((detail) => {
                                const nilaiValue = Number(detail.Nilai);
                                const detailLabel = detail.Keterangan
                                  ? `${nilaiValue} - ${detail.NamaDetail || "Nilai " + nilaiValue}: ${detail.Keterangan}`
                                  : `${nilaiValue} - ${detail.NamaDetail || "Nilai " + nilaiValue}`;

                                return (
                                  <MenuItem
                                    key={detail.IdKriteriaDetail ?? nilaiValue}
                                    value={nilaiValue}
                                    sx={{
                                      whiteSpace: "normal",
                                      wordBreak: "break-word",
                                      py: 1.25,
                                    }}
                                  >
                                    {detailLabel}
                                  </MenuItem>
                                );
                              })}
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

        <Card sx={{ borderRadius: { xs: 2, md: 3 } }}>
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.5, md: 2 },
              "&:last-child": {
                pb: { xs: 2, sm: 2.5, md: 2 },
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
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
                disabled={
                  saving ||
                  totalKriteria === 0 ||
                  alreadyEvaluated ||
                  !canEvaluate ||
                  checkingOperator
                }
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

const MONTH_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - 2 + index);
}

function getPeriodParts(periodValue) {
  const currentDate = new Date();
  const fallbackMonth = currentDate.toLocaleDateString("id-ID", {
    month: "long",
  });
  const fallbackYear = String(currentDate.getFullYear());

  if (!periodValue) {
    return {
      month: fallbackMonth,
      year: fallbackYear,
    };
  }

  const parts = String(periodValue).trim().split(/\s+/);
  const month = parts[0] || fallbackMonth;
  const year = parts[1] || fallbackYear;

  return {
    month,
    year: String(year),
  };
}

function getPeriodMonth(periodValue) {
  return getPeriodParts(periodValue).month;
}

function getPeriodYear(periodValue) {
  return getPeriodParts(periodValue).year;
}

function getCurrentPeriod() {
  const date = new Date();

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
