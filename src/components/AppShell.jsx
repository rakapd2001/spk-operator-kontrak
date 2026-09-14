"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  AccountCircleOutlined,
  Home,
  LogoutOutlined as Logout,
  NotificationsActive as Notifications,
  SettingsOutlined as Settings,
  ChevronLeft,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { getMenuByRole } from "@/config/menu";

const expandedDrawerWidth = 270;
const collapsedDrawerWidth = 88;

function SidebarContent({ collapsed, menuItems, pathname, onNavigate }) {
  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#071a35",
        color: "#f7f9fc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        sx={{
          px: collapsed ? 1.5 : 2,
          py: 1.5,
          minHeight: 72,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: 2,
            bgcolor: "#2f6fed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          SPK
        </Box>

        {!collapsed && (
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{ color: "#fff" }}
            >
              SPK Kontrak
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "#8fa7c9", display: "block" }}
            >
              PT. Trimas Sarana
            </Typography>
          </Box>
        )}
      </Toolbar>

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 2 }}>
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={active}
                  onClick={onNavigate}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2,
                    color: "#c5d1e8",
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 1 : 1.5,
                    "&.Mui-selected": {
                      color: "#fff",
                      bgcolor: "rgba(47,111,237,0.22)",
                    },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      justifyContent: "center",
                      color: "inherit",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {!collapsed && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: "#6f86a8", display: "block" }}
            >
              Sistem Pendukung Keputusan
            </Typography>
            <Typography variant="caption" sx={{ color: "#8fa7c9" }}>
              Metode Preference Selection Index
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) {
          router.replace("/login");
          return;
        }
        setUser(result.data);
      } catch (error) {
        console.error("LOAD USER ERROR:", error);
        router.replace("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  const menuItems = useMemo(() => getMenuByRole(user?.Role), [user?.Role]);
  const profileMenuOpen = Boolean(profileAnchorEl);
  const userInitials =
    user?.NamaLengkap?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "U";

  const handleLogout = async () => {
    try {
      setProfileAnchorEl(null);
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const getPageTitle = () => {
    if (!pathname || pathname === "/dashboard") return "Dashboard";
    return pathname
      .replace(/^\//, "")
      .split("/")[0]
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const sidebar = (isCollapsed, onNavigate) => (
    <SidebarContent
      collapsed={isCollapsed}
      menuItems={menuItems}
      pathname={pathname || ""}
      onNavigate={onNavigate}
    />
  );

  if (loadingUser) return null;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: expandedDrawerWidth, border: "none" },
        }}
      >
        {sidebar(false, () => setMobileOpen(false))}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: collapsed ? collapsedDrawerWidth : expandedDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedDrawerWidth : expandedDrawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
            overflowX: "hidden",
            transition: "width 0.2s ease",
          },
        }}
      >
        {sidebar(collapsed)}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            color: "#14213d",
            borderBottom: "1px solid #e8edf6",
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 64, md: 72 },
              px: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, display: { xs: "flex", lg: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setCollapsed((previous) => !previous)}
              sx={{ mr: 1, display: { xs: "none", lg: "flex" } }}
            >
              {collapsed ? <MenuIcon /> : <ChevronLeft />}
            </IconButton>

            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{ flexGrow: 1, minWidth: 0, color: "#5f6f8f" }}
            >
              <Link
                href="/dashboard"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Home fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Beranda
                  </Typography>
                </Stack>
              </Link>
              <Typography
                variant="body2"
                color="#14213d"
                fontWeight={600}
                noWrap
                sx={{ maxWidth: { xs: 140, sm: 250, md: 400 } }}
              >
                {getPageTitle()}
              </Typography>
            </Breadcrumbs>

            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 1.5 }}
              alignItems="center"
            >
              <IconButton size="small" aria-label="Notifikasi">
                <Badge badgeContent={3} color="error">
                  <Notifications sx={{ color: "#2f6fed" }} />
                </Badge>
              </IconButton>
              <Chip
                label={user?.Role || "-"}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              />
              <IconButton
                onClick={(event) => setProfileAnchorEl(event.currentTarget)}
                sx={{ p: 0, borderRadius: "50%" }}
                aria-label="Menu profil"
              >
                <Avatar
                  sx={{
                    bgcolor: "#2f6fed",
                    width: 38,
                    height: 38,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {userInitials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={profileMenuOpen}
                onClose={() => setProfileAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: { mt: 1, minWidth: 240, borderRadius: 2 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "#2f6fed",
                        width: 42,
                        height: 42,
                        fontWeight: 700,
                      }}
                    >
                      {userInitials}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {user?.NamaLengkap || "-"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {user?.Username || user?.Role || "-"}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Divider />
                <MenuItem component={Link} href="/profil">
                  <ListItemIcon>
                    <AccountCircleOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Profil Saya" />
                </MenuItem>
                <MenuItem component={Link} href="/pengaturan">
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Pengaturan" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, width: "100%", p: { xs: 1.5, sm: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
