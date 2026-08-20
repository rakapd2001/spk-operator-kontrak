"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
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
  Divider,
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
  Settings,
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
  Settings,
};

function SidebarContent({ collapsed, menuItems, onNavigate }) {
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
      {/* Logo */}
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
              sx={{
                color: "#8fa7c9",
                display: "block",
              }}
            >
              PT. Trimas Sarana
            </Typography>
          </Box>
        )}
      </Toolbar>

      {/* Menu */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          py: 2,
        }}
      >
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || Dashboard;

            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
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

                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
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
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Sidebar */}
      {!collapsed && (
        <>
          <Divider
            sx={{
              borderColor: "rgba(255,255,255,0.1)",
            }}
          />

          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#6f86a8",
                display: "block",
              }}
            >
              Sistem Pendukung Keputusan
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#8fa7c9",
              }}
            >
              Metode Preference Selection Index
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default function AppShell({ children, role = "HC/HRD" }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = menuByRole?.[role] || menuByRole?.["HC/HRD"] || [];

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const getPageTitle = () => {
    if (!pathname || pathname === "/dashboard") {
      return "Dashboard";
    }

    const title = pathname.replace("/", "").replace(/-/g, " ");

    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
      }}
    >
      {/* =========================
          MOBILE DRAWER
      ========================== */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            lg: "none",
          },

          "& .MuiDrawer-paper": {
            width: 270,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent
          collapsed={false}
          menuItems={menuItems}
          onNavigate={handleMobileClose}
        />
      </Drawer>

      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },

          width: collapsed ? 88 : 270,

          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: collapsed ? 88 : 270,
            boxSizing: "border-box",
            borderRight: "none",
            transition: "width 0.2s ease",
            overflowX: "hidden",
          },
        }}
      >
        <SidebarContent collapsed={collapsed} menuItems={menuItems} />
      </Drawer>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* =========================
            TOPBAR
        ========================== */}
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
              minHeight: {
                xs: 64,
                md: 72,
              },

              px: {
                xs: 1.5,
                sm: 2,
                md: 3,
              },
            }}
          >
            {/* Mobile Menu */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                mr: 1,
                display: {
                  xs: "flex",
                  lg: "none",
                },
              }}
            >
              <Menu />
            </IconButton>

            {/* Desktop Collapse */}
            <IconButton
              color="inherit"
              onClick={() => setCollapsed((prev) => !prev)}
              sx={{
                mr: 1,
                display: {
                  xs: "none",
                  lg: "flex",
                },
              }}
            >
              {collapsed ? <Menu /> : <ChevronLeft />}
            </IconButton>

            {/* Breadcrumb */}
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                color: "#5f6f8f",
              }}
            >
              <Link
                href="/dashboard"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Home fontSize="small" />

                  <Typography
                    variant="body2"
                    sx={{
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    }}
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
                sx={{
                  textTransform: "capitalize",
                  maxWidth: {
                    xs: 140,
                    sm: 250,
                    md: 400,
                  },
                }}
              >
                {getPageTitle()}
              </Typography>
            </Breadcrumbs>

            {/* Right Header */}
            <Stack
              direction="row"
              spacing={{
                xs: 1,
                sm: 1.5,
              }}
              alignItems="center"
            >
              {/* Notification */}
              <IconButton size="small">
                <Badge badgeContent={3} color="error">
                  <Notifications
                    sx={{
                      color: "#2f6fed",
                    }}
                  />
                </Badge>
              </IconButton>

              {/* Role */}
              <Chip
                label={role}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                }}
              />

              {/* Avatar */}
              <Avatar
                sx={{
                  bgcolor: "#2f6fed",
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                HR
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* =========================
            PAGE CONTENT
        ========================== */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            p: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
