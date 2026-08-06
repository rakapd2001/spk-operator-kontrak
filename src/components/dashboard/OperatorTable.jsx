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

const rows = [
  {
    nik: "OP001",
    nama: "Budi",
    bagian: "Sewing",
    psi: 0.96,
    ranking: 1,
    status: "Tetap",
  },
  {
    nik: "OP002",
    nama: "Andi",
    bagian: "Cutting",
    psi: 0.91,
    ranking: 2,
    status: "Tetap",
  },
  {
    nik: "OP003",
    nama: "Rina",
    bagian: "Finishing",
    psi: 0.78,
    ranking: 3,
    status: "Perpanjang",
  },
];

export default function OperatorTable() {
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
                      color={row.status === "Tetap" ? "success" : "warning"}
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
