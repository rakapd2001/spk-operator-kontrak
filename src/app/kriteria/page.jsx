"use client";

import AppShell from "@/components/AppShell";
import {
  Box,
  Button,
  Card,
  Chip,
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
import { Add, Edit, Delete } from "@mui/icons-material";
import { criteria } from "@/lib/dummyData";

export default function KriteriaPage() {
  return (
    <AppShell role="HC/HRD">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#10233f">
            Kriteria Penilaian
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Daftar kriteria evaluasi berdasarkan metode PSI.
          </Typography>
        </Box>
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Daftar Kriteria
            </Typography>
            <Button startIcon={<Add />} variant="contained">
              Tambah Kriteria
            </Button>
          </Stack>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kode</TableCell>
                  <TableCell>Kriteria</TableCell>
                  <TableCell>Jenis</TableCell>
                  <TableCell>Indikator</TableCell>
                  <TableCell>Deskripsi</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteria.map((item) => (
                  <TableRow key={item.code} hover>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip label={item.type} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{item.indicator}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">
                          <Edit fontSize="small" />
                        </Button>
                        <Button size="small" color="error" variant="outlined">
                          <Delete fontSize="small" />
                        </Button>
                      </Stack>
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
