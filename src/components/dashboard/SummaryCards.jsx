"use client";

import Grid from "@mui/material/Grid";
import { People, Assessment, ThumbUp, Schedule } from "@mui/icons-material";

import SummaryCard from "./SummaryCard";

const cardConfig = [
  {
    title: "Total Operator",
    subtitle: "Operator Kontrak",
    icon: People,
    color: "#1565C0",
    bgColor: "#E3F2FD",
  },
  {
    title: "Sudah Dinilai",
    subtitle: "Data Penilaian",
    icon: Assessment,
    color: "#00897B",
    bgColor: "#E0F2F1",
  },
  {
    title: "Rekomendasi Tetap",
    subtitle: "Hasil PSI",
    icon: ThumbUp,
    color: "#2E7D32",
    bgColor: "#E8F5E9",
  },
  {
    title: "Perpanjang Kontrak",
    subtitle: "Perlu Evaluasi",
    icon: Schedule,
    color: "#EF6C00",
    bgColor: "#FFF3E0",
  },
];

export default function SummaryCards({ summary }) {
  const cards = cardConfig.map((card) => ({
    ...card,
    value: {
      "Total Operator": summary?.totalOperators || 0,
      "Sudah Dinilai": summary?.totalEvaluated || 0,
      "Rekomendasi Tetap": summary?.recommendedPermanent || 0,
      "Perpanjang Kontrak": summary?.contractExtension || 0,
    }[card.title],
  }));

  return (
    <Grid container spacing={2}>
      {cards.map((item) => (
        <Grid
          key={item.title}
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SummaryCard {...item} />
        </Grid>
      ))}
    </Grid>
  );
}
