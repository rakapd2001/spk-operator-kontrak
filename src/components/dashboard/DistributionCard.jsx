"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export default function DistributionCard({ distribution = [] }) {
  return (
    <Card sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Distribusi Rekomendasi
        </Typography>

        {distribution.length === 0 ? (
          <Typography color="text.secondary">
            Belum ada data rekomendasi.
          </Typography>
        ) : (
          <BarChart
            layout="horizontal"
            height={280}
            margin={{ left: 160, right: 24, top: 12, bottom: 40 }}
            colors={["#2f6fed"]}
            series={[{ data: distribution.map((item) => item.value) }]}
            yAxis={[
              {
                data: distribution.map((item) => item.label),
                scaleType: "band",
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            xAxis={[{ label: "Jumlah Operator" }]}
          />
        )}
      </CardContent>
    </Card>
  );
}
