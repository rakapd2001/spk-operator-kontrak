"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  IconButton,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { initialUsers } from "@/lib/dummyData";

const columns = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "fullName", headerName: "Nama Lengkap", flex: 1, minWidth: 180 },
  { field: "username", headerName: "Username", width: 160 },
  { field: "role", headerName: "Role", width: 140 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={params.value === "Aktif" ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Aksi",
    width: 140,
    sortable: false,
    filterable: false,
    renderCell: () => (
      <Stack direction="row" spacing={1}>
        <IconButton size="small" color="primary">
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error">
          <Delete fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];

export default function DataUserPage() {
  const [pageSize, setPageSize] = useState(8);

  return (
    <AppShell role="HC/HRD">
      <Card
        sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Data User
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Kelola akun pengguna sistem dengan role dan status
                aktif/nonaktif.
              </Typography>
            </Box>
            <Button
              startIcon={<Add />}
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              Tambah User
            </Button>
          </Stack>

          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={initialUsers}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[8, 12, 16]}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 },
                },
              }}
              disableSelectionOnClick
              sx={{
                border: "none",
                ".MuiDataGrid-toolbarContainer": { px: 0 },
                ".MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </AppShell>
  );
}
