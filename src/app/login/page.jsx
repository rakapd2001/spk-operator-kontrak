"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login gagal.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f7fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 980,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(10,24,51,0.16)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          {/* =================================================
              LEFT
          ================================================= */}

          <Box
            sx={{
              flex: 1,
              background: "linear-gradient(145deg, #10233f 0%, #2f6fed 100%)",
              p: {
                xs: 4,
                md: 6,
              },
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              SPK Operator Kontrak
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1,
                opacity: 0.9,
                lineHeight: 1.7,
              }}
            >
              Sistem pendukung keputusan penentuan operator kontrak menjadi
              karyawan tetap.
            </Typography>

            <Box
              sx={{
                mt: 4,
                width: 120,
                height: 120,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
                fontWeight: 700,
              }}
            >
              PT
            </Box>
          </Box>

          {/* =================================================
              RIGHT
          ================================================= */}

          <CardContent
            sx={{
              flex: 1,
              p: {
                xs: 3,
                md: 5,
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" fontWeight={700} color="#10233f">
              Login Aplikasi
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Masuk untuk mengakses dashboard penilaian.
            </Typography>

            {/* ERROR */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* USERNAME */}

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                margin="normal"
                autoComplete="username"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* PASSWORD */}

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                margin="normal"
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* INGAT SAYA */}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    disabled={loading}
                  />
                }
                label="Ingat saya"
                sx={{
                  mt: 1,
                }}
              />

              {/* LOGIN */}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.3,
                  borderRadius: 2,
                  bgcolor: "#10233f",
                  "&:hover": {
                    bgcolor: "#2f6fed",
                  },
                }}
              >
                {loading ? "Memproses..." : "Login"}
              </Button>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}
