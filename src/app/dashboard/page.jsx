"use client";

import { useEffect, useState } from "react";
import { Alert, CircularProgress, Grid, Stack } from "@mui/material";

import AppShell from "@/components/AppShell";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import DistributionCard from "@/components/dashboard/DistributionCard";
import PsiCard from "@/components/dashboard/PsiCard";
import OperatorTable from "@/components/dashboard/OperatorTable";
import ActivityCard from "@/components/dashboard/ActivityCard";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data dashboard.");
        }

        setDashboard(result.data);
      } catch (loadError) {
        console.error("LOAD DASHBOARD ERROR:", loadError);
        setError(loadError.message);
      }
    };

    loadDashboard();
  }, []);

  if (error) {
    return (
      <AppShell>
        <Alert severity="error">{error}</Alert>
      </AppShell>
    );
  }

  if (!dashboard) {
    return (
      <AppShell>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: 320 }}
        >
          <CircularProgress />
        </Stack>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Stack spacing={3}>
        <DashboardHeader period={dashboard.psi.period} />

        <SummaryCards summary={dashboard.summary} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DistributionCard distribution={dashboard.distribution} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PsiCard psi={dashboard.psi} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <OperatorTable rows={dashboard.operators} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ActivityCard activities={dashboard.activities} />
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
