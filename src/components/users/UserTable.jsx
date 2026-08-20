"use client";

import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";

import { Edit, Delete } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";

export default function UserTable({ users, loading, onEdit, onDelete }) {
  const columns = [
    {
      field: "no",
      headerName: "No",
      width: 70,
      sortable: false,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
    },

    {
      field: "NamaLengkap",
      headerName: "Nama Lengkap",
      flex: 1.3,
      minWidth: 180,
    },

    {
      field: "Username",
      headerName: "Username",
      flex: 1,
      minWidth: 140,
    },

    {
      field: "NamaRole",
      headerName: "Role",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip label={params.value || "-"} size="small" variant="outlined" />
      ),
    },

    {
      field: "StatusAktif",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Aktif" : "Tidak Aktif"}
          size="small"
          color={params.value ? "success" : "default"}
        />
      ),
    },

    {
      field: "aksi",
      headerName: "Aksi",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hapus">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = users.map((user) => ({
    ...user,
    id: user.IdUser,
    NamaRole: user.Role?.NamaRole || "-",
  }));

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
        sx={{
          border: 0,

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
            fontWeight: 700,
          },

          "& .MuiDataGrid-cell": {
            borderColor: "#eef2f7",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f8fbff",
          },
        }}
        localeText={{
          noRowsLabel: "Belum ada data user",
          footerRowSelected: (count) => `${count} baris dipilih`,
        }}
      />
    </Box>
  );
}
