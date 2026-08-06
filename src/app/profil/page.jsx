"use client";

import AppShell from "@/components/AppShell";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { initialUsers } from "@/lib/dummyData";

const currentUser = initialUsers[0];

export default function ProfilPage() {
  return (
    <AppShell role="HC/HRD">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#10233f">
            Profil Saya
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola informasi akun dan detail profil pribadi Anda.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Stack spacing={2} alignItems="center">
                <Avatar sx={{ width: 96, height: 96, bgcolor: "#2f6fed" }}>
                  {currentUser.fullName.charAt(0)}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {currentUser.fullName}
                  </Typography>
                  <Chip
                    label={currentUser.role}
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Button variant="contained" size="large">
                  Edit Profil
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Informasi Akun
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nama Lengkap
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {currentUser.fullName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {currentUser.username}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {currentUser.role}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status Akun
                    </Typography>
                    <Chip
                      label={currentUser.status}
                      color={
                        currentUser.status === "Aktif" ? "success" : "default"
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Detail Profil
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Berikut adalah informasi profil yang dapat Anda tinjau dan
                  perbarui sesuai kebutuhan.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Untuk melakukan perubahan data profil yang sebenarnya, gunakan
                  fitur edit profil di dalam aplikasi.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
