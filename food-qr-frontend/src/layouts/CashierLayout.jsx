// src/layouts/CashierLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';

const drawerWidth = 200;

const menuItems = [
  { label: 'จัดการโต๊ะ', path: '/cashier/tables' },
  { label: 'เมนูและโปรโมชั่น', path: '/cashier/menu' },
  { label: 'ประวัติคำสั่งซื้อ ', path: '/cashier/orders' },
  { label: 'รายงานยอดขาย', path: '/cashier/reports' },
  { label: 'สร้าง QR Code', path: '/cashier/qrcode' },
  { label: 'ตั้งค่า', path: '/cashier/settings' },
];

const CashierLayout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map(item => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet /> {/* เนื้อหาหลักจะอยู่ตรงนี้ */}
      </Box>
    </Box>
  );
};

export default CashierLayout;
