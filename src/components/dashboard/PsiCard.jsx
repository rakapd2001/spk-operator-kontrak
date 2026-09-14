"use client";

import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

export default function PsiCard({ psi }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          Ringkasan Nilai PSI
        </Typography>

        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 6 }}>
            <Box>
              <Typography color="text.secondary">Rata-rata</Typography>

              <Typography variant="h4" fontWeight={700} color="primary">
                {psi?.average?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box>
              <Typography color="text.secondary">Nilai Tertinggi</Typography>

              <Typography variant="h4" color="success.main" fontWeight={700}>
                {psi?.highest?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box>
              <Typography color="text.secondary">Nilai Terendah</Typography>

              <Typography variant="h4" color="error.main" fontWeight={700}>
                {psi?.lowest?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Box>
              <Typography color="text.secondary">Ranking Terbaik</Typography>

              <Typography variant="h4" color="secondary.main" fontWeight={700}>
                {psi?.bestRanking ? `#${psi.bestRanking}` : "-"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="body2" gutterBottom>
            Progress Penilaian
          </Typography>

          <LinearProgress
            variant="determinate"
            value={psi?.progress || 0}
            sx={{
              height: 10,
              borderRadius: 10,
            }}
          />

          <Typography variant="caption" color="text.secondary">
            {psi?.progress || 0}% Operator telah dinilai
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
