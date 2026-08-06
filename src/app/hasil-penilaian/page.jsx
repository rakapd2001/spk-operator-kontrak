"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { initialEvaluations } from "@/lib/dummyData";

export default function HasilPenilaianPage() {
  const summary = useMemo(() => {
    const counts = {
      total: initialEvaluations.length,
      averagePsi: 0,
      karyawanTetap: 0,
      perpanjangKontrak: 0,
      tidakDilanjutkan: 0,
    };

    let psiTotal = 0;
    initialEvaluations.forEach((item) => {
      psiTotal += Number(item.psi) || 0;
      if (item.recommendation === "Karyawan Tetap") counts.karyawanTetap += 1;
      if (item.recommendation === "Perpanjang Kontrak")
        counts.perpanjangKontrak += 1;
      if (item.recommendation === "Tidak Dilanjutkan")
        counts.tidakDilanjutkan += 1;
    });

    counts.averagePsi = counts.total
      ? +(psiTotal / counts.total).toFixed(2)
      : 0;
    return counts;
  }, []);

  return (
    <AppShell role="HC/HRD">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#10233f">
            Hasil Penilaian
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tampilkan hasil evaluasi operator berdasarkan nilai PSI dan
            rekomendasi keputusan.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 120 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Total Evaluasi
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {summary.total}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 120 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Rata-rata PSI
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {summary.averagePsi}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 120 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Tetap
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.karyawanTetap}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 120 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Perpanjang
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.perpanjangKontrak}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 120 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Tidak Dilanjutkan
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.tidakDilanjutkan}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#10233f" mb={2}>
            Daftar Hasil Penilaian
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>NIK</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>Bagian</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>Nilai PSI</TableCell>
                  <TableCell>Rekomendasi</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ranking</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialEvaluations
                  .slice()
                  .sort((a, b) => a.ranking - b.ranking)
                  .map((item, index) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.nik}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.psi}</TableCell>
                      <TableCell>{item.recommendation}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={
                            item.status === "Karyawan Tetap"
                              ? "success"
                              : item.status === "Tidak Dilanjutkan"
                                ? "error"
                                : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.ranking}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>
    </AppShell>
  );
}
