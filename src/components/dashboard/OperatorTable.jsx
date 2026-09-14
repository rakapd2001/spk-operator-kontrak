"use client";

import {
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";

export default function OperatorTable({ rows = [] }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Hasil Penilaian Operator
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ranking</TableCell>

                <TableCell>NIK</TableCell>

                <TableCell>Nama</TableCell>

                <TableCell>Bagian</TableCell>

                <TableCell>Nilai PSI</TableCell>

                <TableCell>Rekomendasi</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.nik}>
                  <TableCell>{row.ranking}</TableCell>

                  <TableCell>{row.nik}</TableCell>

                  <TableCell>{row.nama}</TableCell>

                  <TableCell>{row.bagian}</TableCell>

                  <TableCell>{row.psi}</TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      color={
                        row.status === "Karyawan Tetap"
                          ? "success"
                          : row.status === "Tidak Dilanjutkan"
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
      </CardContent>
    </Card>
  );
}
