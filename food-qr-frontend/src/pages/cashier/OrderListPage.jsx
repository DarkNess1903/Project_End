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
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Divider,
  DialogActions
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  TableRestaurant as TableIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

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
  const [customDate, setCustomDate] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [filter, customDate, orders]);

  useEffect(() => {
    filterOrders();
  }, [orders, filter]);

  const handleViewDetails = async (order) => {
    try {
      const res = await axios.get(`http://localhost/project_END/restaurant-backend/api/orders/order_detail.php?order_id=${order.OrderID}`);
      console.log('API response:', res.data);

      setSelectedOrder(order);

      const items = res.data;

      if (Array.isArray(items)) {
        console.log('First item structure:', items[0]);
        console.log('All available keys:', Object.keys(items[0] || {}));
        setOrderItems(items);
      } else if (typeof items === 'object') {
        const values = Object.values(items);
        console.log('Converted to array:', values);
        console.log('First converted item:', values[0]);
        setOrderItems(values);
      } else {
        setOrderItems([]);
      }

      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

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

      if (filter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      } else if (filter === 'week') {
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
      } else if (filter === 'custom' && customDate) {
        const selectedDate = new Date(customDate);
        return (
          orderDate.getDate() === selectedDate.getDate() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getFullYear() === selectedDate.getFullYear()
        );
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
              <ToggleButton value="today">วันนี้</ToggleButton>
              <ToggleButton value="week">สัปดาห์นี้</ToggleButton>
              <ToggleButton value="month">เดือนนี้</ToggleButton>
              <ToggleButton value="year">ปีนี้</ToggleButton>
              <ToggleButton value="custom">กำหนดเอง</ToggleButton>
            </ToggleButtonGroup>
            {filter === 'custom' && (
              <TextField
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                sx={{ mt: 2 }}
                fullWidth
              />
            )}

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

      {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              ไม่พบคำสั่งซื้อในช่วงเวลาที่เลือก
            </Typography>
          </Paper>
        ) : (
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  รายการออเดอร์ ({filteredOrders.length} รายการ)
                </Typography>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: 1, maxHeight: 600 }}>
                <Table stickyHeader sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        โต๊ะ
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        วันที่
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        เวลา
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        การจ่ายเงิน
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        ยอดรวม
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: '#f5f5f5' }}>
                        จัดการ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const { date, time } = formatDateTime(order.OrderTime);
                      
                      return (
                        <TableRow key={order.OrderID} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell sx={{ fontSize: '14px' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar sx={{ bgcolor: 'secondary.main', width: 28, height: 28 }}>
                                <TableIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body1" fontWeight="600">
                                โต๊ะ {order.TableID}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>
                            {date}
                          </TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>
                            {time}
                          </TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>
                            <Chip
                              label={order.PaymentMethod || 'ไม่ระบุ'}
                              color={getPaymentMethodColor(order.PaymentMethod)}
                              size="small"
                              icon={<PaymentIcon />}
                              sx={{ minWidth: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '14px', fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(order.TotalAmount)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '14px' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewDetails(order)}
                              sx={{ 
                                minWidth: 100,
                                height: 32,
                                fontSize: '12px'
                              }}
                            >
                              รายละเอียด
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Order Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
          <DialogTitle 
            variant="h4" 
            color="#ffffff" 
            sx={{ background: '#1976d2', textAlign: 'center' }}
          >
            รายละเอียดออเดอร์
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrder && (
              <Box mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        หมายเลขโต๊ะ
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {selectedOrder.TableID}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        เวลาสั่ง
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateTime(selectedOrder.OrderTime).date}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateTime(selectedOrder.OrderTime).time}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ราคารวม
                      </Typography>
                      <Typography variant="h6" color="success.main" fontWeight="600">
                        {formatCurrency(selectedOrder.TotalAmount)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              รายการอาหาร
            </Typography>
            
            {orderItems.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
                <Typography color="text.secondary">ไม่มีรายการ</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>ชื่อเมนู</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>จำนวน</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>ราคา</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>หมายเหตุ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          {item.MenuName || item.menu_name || item.Name || item.name || item.MenuID || 'ไม่ระบุชื่อเมนู'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.Quantity || item.quantity || 0} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.SubTotal || item.sub_total || item.Price || 0)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={item.Note || item.note ? 'text.primary' : 'text.secondary'}>
                            {item.Note || item.note || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 100 }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        </Container>
        </Box>
        </ThemeProvider>
  );
};

export default OrderListPage;