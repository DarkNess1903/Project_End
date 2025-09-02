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
  Chip,
  useTheme,
} from '@mui/material';
import {
  TableRestaurant,
  Restaurant,
  History,
  Assessment,
  Receipt,
  QrCode,
  Settings,
} from '@mui/icons-material';

const logoUrl = "/uploads/logo.png";
const storeName = "เนื้อหอมมาลองเซ่บีฟ";

// เพิ่มขนาด drawer สำหรับ iPad
const drawerWidth = 280;

// เพิ่มไอคอนให้กับเมนู
const menuItems = [
  { label: 'จัดการโต๊ะ', path: '/cashier/tables', icon: <TableRestaurant /> },
  { label: 'ประวัติคำสั่งซื้อ', path: '/cashier/orders', icon: <History /> },
  { label: 'จัดการเมนูอาหาร', path: '/cashier/menu', icon: <Restaurant /> },
  { label: 'รายจ่าย', path: '/cashier/expensePage', icon: <Receipt /> },
  { label: 'รายงานยอดขาย', path: '/cashier/reports', icon: <Assessment /> },
  { label: 'สร้าง QR Code', path: '/cashier/qrcode', icon: <QrCode /> },
  { label: 'ตั้งค่า', path: '/cashier/settings', icon: <Settings /> },
];

const CashierLayout = () => {
  const location = useLocation();
  const theme = useTheme();

  // สีธีม Business/Dashboard Style
  const themeColors = {
    primary: '#1565c0', // น้ำเงินเข้ม
    primaryLight: '#1976d2', // น้ำเงินสด
    secondary: '#37474f', // เทาเข้ม
    background: '#f8fafc', // ขาวอมเทาอ่อน
    surface: '#ffffff',
    textPrimary: '#263238',
    textSecondary: '#546e7a',
    success: '#2e7d32', // เขียว - เสิร์ฟแล้ว
    warning: '#f57c00', // เหลือง - ทำอยู่
    error: '#d32f2f', // แดง - ยกเลิก
    divider: '#e1e5e9',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: themeColors.surface,
            borderRight: `2px solid ${themeColors.divider}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Header Space */}
        <Box sx={{ height: 24 }} />
        
        {/* โลโก้ + ชื่อร้าน - ปรับขนาดให้เหมาะกับ iPad */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            borderBottom: `2px solid ${themeColors.divider}`,
            backgroundColor: themeColors.background,
          }}
        >
          <Box
            component="img"
            src={logoUrl || '/uploads/default-logo.png'}
            alt="store logo"
            sx={{
              width: 120, // ขนาดใหญ่ขึ้นสำหรับ iPad
              height: 120,
              borderRadius: '50%',
              objectFit: 'cover',
              mb: 2,
              border: `3px solid ${themeColors.primary}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Typography 
            variant="h6" 
            fontWeight="700"
            color={themeColors.textPrimary}
            textAlign="center"
            sx={{ 
              fontSize: '18px', // ฟอนต์ใหญ่ขึ้น
              lineHeight: 1.3,
              fontFamily: '"Prompt", "Roboto", sans-serif',
            }}
          >
            {storeName || 'My Store'}
          </Typography>
          
          {/* Status Badge */}
          <Chip
            label="ระบบแคชเชียร์"
            size="small"
            sx={{
              mt: 1,
              backgroundColor: themeColors.primary,
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
            }}
          />
        </Box>

        {/* เมนู - ปรับสไตล์ให้เหมาะกับ iPad */}
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List sx={{ gap: 1 }}>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      borderRadius: '12px',
                      mx: 1,
                      minHeight: '56px', // ปุ่มสูงขึ้นสำหรับ iPad
                      px: 2,
                      py: 1.5,
                      backgroundColor: isActive 
                        ? themeColors.primary 
                        : 'transparent',
                      color: isActive 
                        ? 'white' 
                        : themeColors.textPrimary,
                      '&:hover': {
                        backgroundColor: isActive 
                          ? themeColors.primaryLight 
                          : themeColors.background,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: themeColors.primary,
                        '&:hover': {
                          backgroundColor: themeColors.primaryLight,
                        },
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {/* ไอคอน */}
                    <Box
                      sx={{
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'inherit',
                        '& svg': {
                          fontSize: '24px', // ไอคอนใหญ่ขึ้น
                        },
                      }}
                    >
                      {item.icon}
                    </Box>
                    
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '16px', // ฟอนต์ใหญ่ขึ้น
                        fontWeight: isActive ? '600' : '500',
                        fontFamily: '"Prompt", "Roboto", sans-serif',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Footer Info */}
        <Box
          sx={{
            mt: 'auto',
            p: 2,
            borderTop: `1px solid ${themeColors.divider}`,
            backgroundColor: themeColors.background,
          }}
        >
          <Typography
            variant="caption"
            color={themeColors.textSecondary}
            textAlign="center"
            display="block"
            sx={{ fontSize: '12px' }}
          >
            เวอร์ชั่นวันที่ 08/08/2568
          </Typography>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: themeColors.background,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header Bar */}
        <Box
          sx={{
            backgroundColor: themeColors.surface,
            borderBottom: `2px solid ${themeColors.divider}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '72px', // สูงขึ้นสำหรับ iPad
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={themeColors.textPrimary}
            sx={{
              fontSize: '20px',
              fontFamily: '"Prompt", "Roboto", sans-serif',
            }}
          >
            ระบบจัดการร้านอาหาร
          </Typography>
          
          {/* Status Indicators */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="ออนไลน์"
              size="small"
              sx={{
                backgroundColor: themeColors.success,
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
              }}
            />
          </Box>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            maxWidth: '100%',
            '& > *': {
              fontFamily: '"Prompt", "Roboto", sans-serif',
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default CashierLayout;