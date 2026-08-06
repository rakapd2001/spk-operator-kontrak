"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Stack,
  Chip,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Menu,
  ChevronLeft,
  People,
  Engineering,
  Checklist,
  Assessment,
  ThumbUp,
  Person,
  EditNote,
  Notifications,
  Home,
} from "@mui/icons-material";
import { menuByRole } from "@/lib/dummyData";

const iconMap = {
  Dashboard,
  People,
  Engineering,
  Checklist,
  Assessment,
  ThumbUp,
  Person,
  EditNote,
};

function AppShell({ children, role = "HC/HRD" }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = menuByRole[role] || menuByRole["HC/HRD"];

  const drawerContent = (
    <Box sx={{ height: "100%", bgcolor: "#071a35", color: "#f7f9fc" }}>
      <Toolbar
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "#2f6fed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            SPK
          </Box>
          {!collapsed && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                SPK Kontrak
              </Typography>
              <Typography variant="caption" color="grey.400">
                PT. Trimas Sarana
              </Typography>
            </Box>
          )}
        </Stack>
      </Toolbar>
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || Dashboard;
          const active = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                sx={{
                  borderRadius: 2,
                  color: active ? "#fff" : "#c5d1e8",
                  bgcolor: active ? "rgba(47,111,237,0.22)" : "transparent",
                  "&.Mui-selected": { bgcolor: "rgba(47,111,237,0.22)" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: active ? "#fff" : "#8fa7c9" }}
                >
                  <Icon />
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <CssBaseline />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: collapsed ? 88 : 260,
          flexShrink: 0,
          transition: "width 0.2s ease",
          "& .MuiDrawer-paper": {
            width: collapsed ? 88 : 260,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "#14213d",
            borderBottom: "1px solid #e8edf6",
          }}
        >
          <Toolbar sx={{ minHeight: 72 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { lg: "none" } }}
            >
              <Menu />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setCollapsed((prev) => !prev)}
              sx={{ display: { xs: "none", lg: "flex" }, mr: 1 }}
            >
              {collapsed ? <ChevronLeft /> : <Menu />}
            </IconButton>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{ flexGrow: 1, color: "#5f6f8f" }}
            >
              <Link
                href="/dashboard"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Home fontSize="small" />
                  <Typography variant="body2">Beranda</Typography>
                </Stack>
              </Link>
              <Typography variant="body2" color="#14213d" fontWeight={600}>
                {pathname === "/dashboard"
                  ? "Dashboard"
                  : pathname.replace("/", "").replace(/-/g, " ")}
              </Typography>
            </Breadcrumbs>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ color: "#2f6fed" }} />
              </Badge>
              <Chip label={role} color="primary" variant="outlined" />
              <Avatar sx={{ bgcolor: "#2f6fed", width: 36, height: 36 }}>
                HR
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default AppShell;
