"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import {
  Box,
  Button,
  Card,
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
import { GetApp, PictureAsPdf } from "@mui/icons-material";
import { initialEvaluations } from "@/lib/dummyData";

const formatCsv = (rows) => {
  const header = [
    "No",
    "NIK",
    "Nama",
    "Bagian",
    "Periode",
    "Nilai PSI",
    "Rekomendasi",
    "Status",
    "Ranking",
  ];

  const csvRows = [header.join(";")];
  rows.forEach((row, index) => {
    csvRows.push(
      [
        index + 1,
        row.nik,
        row.name,
        row.section,
        row.period,
        row.psi,
        row.recommendation,
        row.status,
        row.ranking,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    );
  });

  return csvRows.join("\n");
};

const downloadCsv = (fileName, content) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const openPrintablePdf = (rows) => {
  const html = `
    <html>
      <head>
        <title>Rekomendasi Keputusan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #10233f; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cccccc; padding: 10px; text-align: left; }
          th { background: #f4f6fb; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Rekomendasi Keputusan Evaluasi Operator</h1>
        <div class="summary">
          <p>Jumlah data: ${rows.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>NIK</th>
              <th>Nama</th>
              <th>Bagian</th>
              <th>PSI</th>
              <th>Rekomendasi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${row.nik}</td>
                  <td>${row.name}</td>
                  <td>${row.section}</td>
                  <td>${row.psi}</td>
                  <td>${row.recommendation}</td>
                  <td>${row.status}</td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=650");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

export default function RekomendasiPage() {
  const recommendedCounts = useMemo(() => {
    const counts = {
      "Karyawan Tetap": 0,
      "Perpanjang Kontrak": 0,
      "Tidak Dilanjutkan": 0,
    };
    initialEvaluations.forEach((item) => {
      counts[item.recommendation] = (counts[item.recommendation] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <AppShell role="HC/HRD">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#10233f">
            Rekomendasi Keputusan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Daftar hasil rekomendasi penilaian operator dan akses export
            Excel/PDF.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Karyawan Tetap
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {recommendedCounts["Karyawan Tetap"]}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Perpanjang Kontrak
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {recommendedCounts["Perpanjang Kontrak"]}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Tidak Dilanjutkan
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {recommendedCounts["Tidak Dilanjutkan"]}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Hasil Rekomendasi Operator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ekspor hasil rekomendasi dalam format Excel atau PDF.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetApp />}
                onClick={() =>
                  downloadCsv(
                    "rekomendasi-keputusan.csv",
                    formatCsv(initialEvaluations),
                  )
                }
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={() => openPrintablePdf(initialEvaluations)}
              >
                Export PDF
              </Button>
            </Stack>
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ mt: 3, borderRadius: 2 }}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {initialEvaluations.map((item, index) => (
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
