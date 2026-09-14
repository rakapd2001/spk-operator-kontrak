"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";

export default function DashboardHeader({ period }) {
  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg,#0F3B83 0%,#1A5CB0 60%,#2F6FED 100%)",
        color: "#fff",
        borderRadius: 4,
        p: { xs: 3, md: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            fontWeight={700}
            sx={{
              fontSize: {
                xs: 24,
                md: 34,
              },
            }}
          >
            Dashboard
          </Typography>

          <Typography mt={1} sx={{ opacity: 0.9 }}>
            Sistem Pendukung Keputusan Penentuan Operator Kontrak Menjadi
            Karyawan Tetap menggunakan metode PSI.
          </Typography>
        </Box>

        <Chip
          label={period ? `Periode ${period}` : "Belum ada periode"}
          sx={{
            bgcolor: "rgba(255,255,255,.18)",
            color: "#fff",
            alignSelf: "flex-start",
          }}
        />
      </Stack>
    </Box>
  );
}
