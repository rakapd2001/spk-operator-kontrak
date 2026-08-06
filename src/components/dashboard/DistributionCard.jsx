"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export default function DistributionCard() {
  return (
    <Card sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Distribusi Rekomendasi
        </Typography>

        <BarChart
          layout="horizontal"
          height={280}
          series={[
            {
              data: [25, 12, 5],
            },
          ]}
          yAxis={[
            {
              data: ["Karyawan Tetap", "Perpanjang", "Tidak Direkomendasikan"],
              scaleType: "band",
            },
          ]}
          xAxis={[
            {
              label: "Jumlah Operator",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
