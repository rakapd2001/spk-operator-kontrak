import {
  Dashboard,
  People,
  Assessment,
  FactCheck,
  Recommend,
  Settings,
} from "@mui/icons-material";

export const MENU_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Dashboard,
    roles: ["HC/HRD", "ADMIN"],
  },

  {
    label: "Data Operator",
    path: "/data-operator",
    icon: People,
    roles: ["HC/HRD", "ADMIN"],
  },
  {
    label: "Data User",
    path: "/data-user",
    icon: People,
    roles: ["HC/HRD", "ADMIN"],
  },

  {
    label: "Kriteria Penilaian",
    path: "/kriteria",
    icon: Settings,
    roles: ["HC/HRD", "ADMIN"],
  },

  {
    label: "Input Penilaian",
    path: "/input-penilaian",
    icon: FactCheck,
    roles: ["HC/HRD", "Supervisor", "ADMIN"],
  },

  {
    label: "Hasil Penilaian",
    path: "/hasil-penilaian",
    icon: Assessment,
    roles: ["HC/HRD", "Supervisor", "ADMIN"],
  },

  {
    label: "Rekomendasi Keputusan",
    path: "/rekomendasi",
    icon: Recommend,
    roles: ["HC/HRD", "Supervisor", "Manager", "ADMIN"],
  },
];

export function getMenuByRole(role) {
  if (!role) {
    return [];
  }

  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}
