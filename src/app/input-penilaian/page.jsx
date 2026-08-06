"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Divider,
} from "@mui/material";
import AppShell from "@/components/AppShell";
import { initialOperators, criteria } from "@/lib/dummyData";

const nilaiOptions = [1, 2, 3, 4, 5];

export default function InputPenilaianPage() {
  const [operator, setOperator] = useState("");
  const [period, setPeriod] = useState("");
  const [scoreValues, setScoreValues] = useState(
    criteria.reduce((acc, item) => {
      acc[item.code] = "";
      return acc;
    }, {}),
  );
  const [notes, setNotes] = useState("");

  const handleScoreChange = (code, value) => {
    setScoreValues((prev) => ({ ...prev, [code]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      operator,
      period,
      scores: scoreValues,
      notes,
    };
    console.log("Submit Penilaian", payload);
    alert("Penilaian berhasil disimpan (demo)");
  };

  return (
    <AppShell role="Supervisor">
      <Card
        sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" fontWeight={700} mb={1}>
            Input Penilaian Operator
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Lengkapi data operator, periode, dan nilai setiap kriteria untuk
            menyimpan hasil evaluasi.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="operator-label">Operator</InputLabel>
                  <Select
                    labelId="operator-label"
                    value={operator}
                    label="Operator"
                    onChange={(event) => setOperator(event.target.value)}
                  >
                    {initialOperators.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name} - {item.section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Periode"
                  type="month"
                  value={period}
                  fullWidth
                  onChange={(event) => setPeriod(event.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Nilai Kriteria
                </Typography>
                <Grid container spacing={2}>
                  {criteria.map((item) => (
                    <Grid item xs={12} sm={6} key={item.code}>
                      <Card sx={{ bgcolor: "#f8fafc", borderRadius: 3, p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.code} - {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={1}
                        >
                          {item.indicator}
                        </Typography>
                        <FormControl fullWidth>
                          <InputLabel id={`nilai-${item.code}`}>
                            Nilai
                          </InputLabel>
                          <Select
                            labelId={`nilai-${item.code}`}
                            value={scoreValues[item.code]}
                            label="Nilai"
                            onChange={(event) =>
                              handleScoreChange(item.code, event.target.value)
                            }
                          >
                            {nilaiOptions.map((nilai) => (
                              <MenuItem key={nilai} value={nilai}>
                                {nilai}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Catatan Tambahan"
                  fullWidth
                  multiline
                  minRows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ textTransform: "none" }}
                  >
                    Simpan Penilaian
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ textTransform: "none" }}
                    onClick={() => {
                      setOperator("");
                      setPeriod("");
                      setScoreValues(
                        criteria.reduce((acc, item) => {
                          acc[item.code] = "";
                          return acc;
                        }, {}),
                      );
                      setNotes("");
                    }}
                  >
                    Reset Form
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </AppShell>
  );
}
