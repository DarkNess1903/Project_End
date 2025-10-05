import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  AppBar,
  Toolbar,
  Container,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Payment,
  ArrowBack,
  CreditCard,
  Calculate,
  Receipt,
  MonetizationOn,
  Discount,
  CheckCircle,
  Print,
} from '@mui/icons-material';
import axios from 'axios';

// Custom theme colors for iPad cashier (consistent with other pages)
const theme = {
  colors: {
    primary: '#1565c0', // น้ำเงินเข้ม
    secondary: '#37474f', // เทาเข้ม
    success: '#2e7d32', // เขียวเข้ม
    warning: '#f57c00', // ส้มเข้ม
    error: '#d32f2f', // แดงเข้ม
    background: '#f8f9fa', // เทาอ่อน
    surface: '#ffffff',
    text: {
      primary: '#212121',
      secondary: '#757575',
    }
  }
};

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [customerCash, setCustomerCash] = useState('');
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, type: '' });
  const [discountDialog, setDiscountDialog] = useState(false);
  const [manualDiscount, setManualDiscount] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Preset cash amounts for quick selection
  const quickCashAmounts = [100, 200, 500, 1000];

  // โหลดข้อมูลคำสั่งซื้อ
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost/project_END/restaurant-backend/api/orders/read_single_order.php?order_id=${orderId}`
        );
        if (!res.data || !res.data.items) {
          console.error('ข้อมูลไม่ครบ:', res.data);
          showNotification('ไม่พบข้อมูลออเดอร์', 'error');
          return;
        }
        setOrderItems(res.data.items);
        setTotalPrice(parseFloat(res.data.total));
        setDiscount(parseFloat(res.data.discount || 0));
        setFinalTotal(parseFloat(res.data.final_total));
      } catch (err) {
        console.error('โหลดข้อมูลผิดพลาด:', err);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // คำนวณเงินทอนเมื่อเงินที่รับมาเปลี่ยน
  const handleCashChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setCustomerCash(numValue);
    setChange(numValue - finalTotal);
  };

  // เลือกจำนวนเงินแบบด่วน
  const handleQuickCash = (amount) => {
    const total = Math.ceil(finalTotal / amount) * amount; // ปัดขึ้นให้เป็นหลัก amount
    handleCashChange(total);
  };

  const handlePayment = async (type) => {
    if (finalTotal <= 0) {
      showNotification('ยอดชำระต้องมากกว่า 0', 'warning');
      return;
    }
    if (type === 'cash' && (customerCash === '' || customerCash < finalTotal)) {
      showNotification('กรุณาใส่จำนวนเงินที่รับมามากกว่าหรือเท่ากับยอดชำระ', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        order_id: orderId,
        payment_type: type,
        amount_paid: finalTotal,
      };

      const res = await axios.post(
        'http://localhost/project_END/restaurant-backend/api/payments/pay_order.php',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        setPaymentDialog({ open: true, type: 'success' });
        showNotification('ชำระเงินสำเร็จ', 'success');
        setTimeout(() => navigate('/cashier/orders'), 3000);
      } else {
        showNotification('ชำระเงินไม่สำเร็จ: ' + (res.data.message || ''), 'error');
      }
    } catch (error) {
      console.error('ชำระเงินล้มเหลว:', error);
      showNotification('เกิดข้อผิดพลาดในการชำระเงิน', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyManualDiscount = (percent) => {
    const discPercent = percent !== undefined ? percent : parseFloat(manualDiscount);
    if (isNaN(discPercent) || discPercent < 0 || discPercent > 100) {
      showNotification('กรุณาใส่เปอร์เซ็นต์ส่วนลด 0-100', 'warning');
      return;
    }

    const discountAmount = (totalPrice * discPercent) / 100;
    const newFinal = totalPrice - discountAmount;

    setDiscount(discountAmount);
    setFinalTotal(newFinal);
    setDiscountDialog(false);
    setManualDiscount('');
    showNotification(`ใช้ส่วนลด ${discPercent}% สำเร็จ`, 'success');

    if (customerCash) {
      setChange(customerCash - newFinal);
    }
  };

  const formatCurrency = (value) =>
    `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

  // แสดงตอนกำลังโหลด
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} sx={{ color: theme.colors.primary }} />
      </Box>
    );
  }

  // ถ้าโหลดเสร็จแต่ไม่มีออเดอร์
  if (!loading && orderItems.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="textSecondary">
          ไม่พบข้อมูลออเดอร์
        </Typography>
      </Box>
    );
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePrintReceipt = (orderId) => {
    if (!orderId) return;

    try {
      // เปิด PDF ใบเสร็จในแท็บใหม่
      const url = `http://localhost/project_END/restaurant-backend/generate_receipt.php?order_id=${orderId}`;
      window.open(url, "_blank");

      // แจ้งเตือนบนหน้าจอ
      setSnackbar({
        open: true,
        message: `📄 พิมพ์ใบเสร็จสำหรับ Order #${orderId} แล้ว`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "❌ เกิดข้อผิดพลาดในการพิมพ์ใบเสร็จ",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      fontFamily: 'Prompt, Roboto, sans-serif'
    }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ backgroundColor: theme.colors.success, mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => navigate('/cashier/orders')}
            >
              <ArrowBack sx={{ fontSize: 28 }} />
            </IconButton>
            <Payment sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              ชำระเงิน Order #{orderId}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: 3 }}>
        <Grid container spacing={4}>
          {/* ซ้าย: รายการอาหาร */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ boxShadow: 3, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Receipt sx={{ color: theme.colors.primary, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                    รายการอาหาร ({orderItems.length} รายการ)
                  </Typography>
                </Box>

                <List sx={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
                  {orderItems.map((item, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.ImageURL ? `http://localhost/project_END/restaurant-backend/${item.ImageURL}` : undefined}
                          alt={item.name}
                          sx={{ width: 64, height: 64, border: `2px solid ${theme.colors.primary}` }}
                        >
                          <Receipt />
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '16px', mb: 0.5 }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
                            {formatCurrency(item.price)} x {item.quantity} | รวม: {formatCurrency(item.sub_total)}
                          </Typography>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              {/* Summary */}
              <Box sx={{ p: 3, backgroundColor: theme.colors.background, borderTop: '1px solid #e0e0e0' }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: '16px' }}>ราคารวม:</Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                      {formatCurrency(totalPrice)}
                    </Typography>
                  </Box>
                  {discount > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ fontSize: '16px', color: theme.colors.success }}>ส่วนลด:</Typography>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: theme.colors.success }}>
                        -{formatCurrency(discount)}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: theme.colors.error }}>
                      ยอดชำระสุทธิ:
                    </Typography>
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.colors.error }}>
                      {formatCurrency(finalTotal)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* ขวา: การชำระเงิน */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              {/* Payment Calculator */}
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Calculate sx={{ color: theme.colors.warning, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                      คำนวณเงินทอน
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="จำนวนเงินที่ลูกค้าจ่าย (บาท)"
                        type="number"
                        fullWidth
                        value={customerCash}
                        onChange={(e) => handleCashChange(e.target.value)}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 64,
                            fontSize: '18px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, color: theme.colors.text.secondary }}
                        >
                          จำนวนเงินแบบด่วน:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {quickCashAmounts.map(amount => (
                            <Button
                              key={amount}
                              variant="outlined"
                              size="small"
                              onClick={() => handleQuickCash(amount)}
                              sx={{
                                minWidth: 70,
                                height: 40,
                                fontSize: '14px',
                                borderColor: theme.colors.primary,
                                color: theme.colors.primary
                              }}
                            >
                              {amount}฿
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  {customerCash && (
                    <Box mt={3} p={2} sx={{
                      backgroundColor: theme.colors.background,
                      borderRadius: 2
                    }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: change >= 0 ? theme.colors.success : theme.colors.error,
                          textAlign: 'center'
                        }}
                      >
                        เงินทอน: {change >= 0 ? formatCurrency(change) : 'ไม่เพียงพอ'}
                      </Typography>
                    </Box>
                  )}

                  {/* ปุ่มส่วนลด + ปุ่มพิมพ์ใบเสร็จ */}
                  <Box mt={3}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setDiscountDialog(true)}
                      >
                        ใส่ส่วนลด
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Receipt />}
                        onClick={() => handlePrintReceipt(orderId)}
                        disabled={!orderId}
                      >
                        พิมพ์ใบเสร็จ
                      </Button>

                      <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                      >
                        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                          {snackbar.message}
                        </Alert>
                      </Snackbar>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <MonetizationOn sx={{ color: theme.colors.success, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                      วิธีการชำระเงิน
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<MonetizationOn />}
                        disabled={loading}
                        onClick={() => handlePayment('cash')}
                        sx={{
                          height: 72,
                          fontSize: '18px',
                          fontWeight: 600,
                          backgroundColor: theme.colors.success,
                          '&:hover': { backgroundColor: theme.colors.success }
                        }}
                      >
                        ชำระเงินสด
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<CreditCard />}
                        disabled={loading}
                        onClick={() => handlePayment('qr')}
                        sx={{
                          height: 72,
                          fontSize: '18px',
                          fontWeight: 600,
                          backgroundColor: theme.colors.primary,
                          '&:hover': { backgroundColor: theme.colors.primary }
                        }}
                      >
                        สแกนจ่ายผ่าน Qrcode
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container >

      {/* Manual Discount Dialog */}
      <Dialog
        open={discountDialog}
        onClose={() => setDiscountDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.colors.error,
            color: 'white',
            fontSize: '20px',
            fontWeight: 600
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Discount />
            ลดราคาเพิ่มเติม
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* ปุ่มลัดส่วนลด */}
          <Box display="flex" gap={1} mb={2}>
            {[5, 7, 10].map((p) => (
              <Button
                key={p}
                variant="outlined"
                onClick={() => applyManualDiscount(p)}
              >
                {p}%
              </Button>
            ))}
          </Box>

          <TextField
            label="ส่วนลด (%)"
            type="number"
            fullWidth
            value={manualDiscount}
            onChange={(e) => setManualDiscount(e.target.value)}
            sx={{
              mt: 1,
              '& .MuiInputBase-root': {
                height: 56,
                fontSize: '16px',
              }
            }}
            InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
          />

          <Typography variant="body2" sx={{ mt: 2, color: theme.colors.text.secondary }}>
            ยอดรวมปัจจุบัน: {formatCurrency(totalPrice)} <br />
            ส่วนลดปัจจุบัน: {formatCurrency(discount)} <br />
            ยอดชำระปัจจุบัน: {formatCurrency(finalTotal)}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDiscountDialog(false)}
            sx={{ height: 48, fontSize: '16px', minWidth: 100 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={() => applyManualDiscount()}
            sx={{ height: 48, fontSize: '16px', minWidth: 120, backgroundColor: theme.colors.error }}
          >
            ใช้ส่วนลด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog Dialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog({ open: false, type: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: theme.colors.success, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.colors.success }}>
            ชำระเงินสำเร็จ!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.colors.text.secondary }}>
            ระบบกำลังพาคุณกลับไปหน้าออเดอร์...
          </Typography>
          <CircularProgress sx={{ color: theme.colors.success }} />
        </DialogContent>
      </Dialog >

      {/* Notification Snackbar */}
      <Snackbar Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar >
    </Box >
  );
};

export default PaymentPage;