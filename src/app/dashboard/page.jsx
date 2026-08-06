"use client";

import { Grid, Stack } from "@mui/material";

import AppShell from "@/components/AppShell";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import DistributionCard from "@/components/dashboard/DistributionCard";
import PsiCard from "@/components/dashboard/PsiCard";
import OperatorTable from "@/components/dashboard/OperatorTable";
import ActivityCard from "@/components/dashboard/ActivityCard";

export default function DashboardPage() {
  return (
    <AppShell>
      <Stack spacing={3}>
        <DashboardHeader />

        <SummaryCards />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DistributionCard />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PsiCard />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <OperatorTable />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ActivityCard />
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
