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

const logoUrl = "/uploads/logo.png";
const storeName = "ชื่อร้าน xxxxxx";

const drawerWidth = 200;

const menuItems = [
  { label: 'จัดการโต๊ะ', path: '/cashier/tables' },
  { label: 'เมนูและโปรโมชั่น', path: '/cashier/menu' },
  { label: 'ประวัติคำสั่งซื้อ ', path: '/cashier/orders' },
  { label: 'รายงานยอดขาย', path: '/cashier/reports' },
  { label: 'รายจ่าย', path: '/cashier/expensePage' },
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
        {/* Toolbar ด้านบนกันความสูง */}
        <Toolbar />
        
        {/* โลโก้ + ชื่อร้าน */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #ddd',
          }}
        >
          <Box
            component="img"
            src={logoUrl || '/uploads/default-logo.png'} // fallback
            alt="store logo"
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              mb: 1,
            }}
          />
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {storeName || 'My Store'}
          </Typography>
        </Box>

        {/* เมนู */}
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

      {/* Main content */}
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
        <Outlet />
      </Box>
    </Box>
  );
};

export default CashierLayout;
