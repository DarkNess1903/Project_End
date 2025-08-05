// src/pages/cashier/OrderListPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Stack,
  Chip,
  Grid,
  Container,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  TableRestaurant as TableIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// ธีม Business/Dashboard สำหรับ iPad
const cashierTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // น้ำเงินสด
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#37474f', // เทาเข้ม
      light: '#62727b',
      dark: '#263238',
    },
    success: {
      main: '#4caf50', // เขียว - เสิร์ฟแล้ว
      light: '#81c784',
    },
    warning: {
      main: '#ff9800', // เหลือง - ทำอยู่
      light: '#ffb74d',
    },
    error: {
      main: '#f44336', // แดง - ยกเลิก
      light: '#ef5350',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Prompt", "Roboto", "Arial", sans-serif',
    fontSize: 16,
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#263238',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.9rem',
      color: '#546e7a',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          padding: '12px 24px',
          minHeight: 48,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          height: 32,
        },
      },
    },
  },
});

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('week');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filter]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        'http://localhost/project_END/restaurant-backend/api/orders/index_paid.php'
      );
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        console.error('Expected array but got:', res.data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setOrders([]);
    }
  };

  const filterOrders = () => {
    const now = new Date();
    let filtered = [];

    filtered = orders.filter(order => {
      const orderDate = new Date(order.OrderTime);
      if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return orderDate >= oneWeekAgo;
      } else if (filter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      } else if (filter === 'year') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'เงินสด':
        return 'success';
      case 'โอนเงิน':
        return 'primary';
      case 'บัตรเครดิต':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <ThemeProvider theme={cashierTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        py: 3
      }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Paper sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <ReceiptIcon fontSize="medium" />
              </Avatar>
              <Typography variant="h4" component="h1">
                ประวัติคำสั่งซื้อ
              </Typography>
            </Stack>

            {/* Filter Buttons */}
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              sx={{ 
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  minWidth: 120,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                },
              }}
            >
              <ToggleButton value="week">สัปดาห์นี้</ToggleButton>
              <ToggleButton value="month">เดือนนี้</ToggleButton>
              <ToggleButton value="year">ปีนี้</ToggleButton>
            </ToggleButtonGroup>

            {/* Summary Stats */}
            <Stack direction="row" spacing={3} mt={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  จำนวนออเดอร์
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {filteredOrders.length} รายการ
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ยอดรวม
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(
                    filteredOrders.reduce((sum, order) => sum + Number(order.TotalAmount), 0)
                  )}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                ไม่พบคำสั่งซื้อในช่วงเวลาที่เลือก
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredOrders.map((order) => {
                const { date, time } = formatDateTime(order.OrderTime);
                
                return (
                  <Grid item xs={12} sm={6} lg={4} key={order.OrderID}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Order Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                              <TableIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              โต๊ะ {order.TableID}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {formatCurrency(order.TotalAmount)}
                          </Typography>
                        </Stack>

                        {/* Order Details */}
                        <Stack spacing={2} mb={3}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              วันที่:
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {date}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              เวลา:
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {time}
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              การจ่ายเงิน:
                            </Typography>
                            <Chip
                              label={order.PaymentMethod || 'ไม่ระบุ'}
                              color={getPaymentMethodColor(order.PaymentMethod)}
                              size="medium"
                              icon={<PaymentIcon />}
                            />
                          </Stack>
                        </Stack>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<ViewIcon />}
                            onClick={() => alert(`ดูรายละเอียด OrderID: ${order.OrderID}`)}
                            sx={{ flex: 2 }}
                          >
                            รายละเอียด
                          </Button>
                          <Tooltip title="พิมพ์บิล">
                            <IconButton
                              color="secondary"
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'secondary.main',
                                '&:hover': {
                                  backgroundColor: 'secondary.light',
                                  color: 'white',
                                },
                              }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OrderListPage;