"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    if (username.toLowerCase() === "admin" && password === "123456") {
      router.push("/dashboard");
      return;
    }
    setError("Kredensial tidak valid. Coba admin / 123456.");
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
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: "linear-gradient(145deg, #10233f 0%, #2f6fed 100%)",
              p: { xs: 4, md: 6 },
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              SPK Operator Kontrak
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
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
          <CardContent
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
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
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Ingat saya"
                sx={{ mt: 1 }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.3,
                  borderRadius: 2,
                  bgcolor: "#10233f",
                  "&:hover": { bgcolor: "#2f6fed" },
                }}
              >
                Login
              </Button>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}
