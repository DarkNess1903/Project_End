import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, TextField, Button, Card, CardContent, Divider, Avatar,
} from '@mui/material';
import axios from 'axios';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [customerCash, setCustomerCash] = useState('');
  const [change, setChange] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลคำสั่งซื้อ
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost/project_END/restaurant-backend/api/orders/read_single_order.php?order_id=${orderId}`);
        if (!res.data || !res.data.items) {
          console.error('ข้อมูลไม่ครบ:', res.data);
          return;
        }
        setOrderItems(res.data.items);
        setTotalPrice(parseFloat(res.data.total));
        setDiscount(parseFloat(res.data.discount || 0));
        setFinalTotal(parseFloat(res.data.final_total));
      } catch (err) {
        console.error('โหลดข้อมูลผิดพลาด:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  // คำนวณเงินทอนเมื่อเงินที่รับมาเปลี่ยน
  const handleCashChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCustomerCash(value);
    setChange(value - finalTotal);
  };

  // ฟังก์ชันจ่ายเงินจริง
  const handlePayment = async (type) => {
    if (finalTotal <= 0) {
      alert('ยอดชำระต้องมากกว่า 0');
      return;
    }
    if (type === 'cash' && (customerCash === '' || customerCash < finalTotal)) {
      alert('กรุณาใส่จำนวนเงินที่รับมามากกว่าหรือเท่ากับยอดชำระ');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        order_id: orderId,
        payment_type: type,  // 'cash' หรือ 'transfer'
        amount_paid: finalTotal,
        promo_code: promoCode || null,
      };
      console.log("จ่ายเงินด้วย:", payload);
      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/payments/pay_order.php', payload);

      if (res.data.success) {
        alert('ชำระเงินสำเร็จ');
        navigate('/cashier/orders');  // กลับไปหน้าออเดอร์
      } else {
        alert('ชำระเงินไม่สำเร็จ: ' + (res.data.message || ''));
      }
    } catch (error) {
      console.error('ชำระเงินล้มเหลว:', error);
      alert('เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันใช้โปรโมชั่น/ลดราคา
  const applyPromotion = async () => {
    if (!promoCode) {
      alert('กรุณาใส่โค้ดโปรโมชั่น');
      return;
    }
    try {
      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/promotion/apply_promo.php', {
        order_id: orderId,
        promo_code: promoCode,
      });
      if (res.data.success) {
        setDiscount(parseFloat(res.data.discount));
        setFinalTotal(parseFloat(res.data.final_total));
        alert('ใช้โปรโมชั่นสำเร็จ');
      } else {
        alert('โปรโมชั่นไม่ถูกต้องหรือหมดอายุ');
      }
    } catch (error) {
      console.error('ใช้โปรโมชั่นล้มเหลว:', error);
      alert('เกิดข้อผิดพลาดในการใช้โปรโมชั่น');
    }
  };

  // ฟังก์ชันลดราคาแบบ manual (เช่นลดเพิ่มเอง)
  const applyManualDiscount = () => {
    const manualDiscount = prompt('กรุณาใส่จำนวนเงินส่วนลด (บาท):', '0');
    const discVal = parseFloat(manualDiscount);
    if (isNaN(discVal) || discVal < 0) {
      alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
      return;
    }
    const newFinal = totalPrice - discVal;
    if (newFinal < 0) {
      alert('ส่วนลดมากกว่ายอดรวมไม่ได้');
      return;
    }
    setDiscount(discVal);
    setFinalTotal(newFinal);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>ชำระเงิน Order #{orderId}</Typography>

      <Grid container spacing={2}>
        {/* ซ้าย: รายการอาหาร */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">รายการอาหาร</Typography>
              <Divider sx={{ my: 1 }} />
              {orderItems.map((item, i) => (
                <Box
                  key={i}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Avatar
                    variant="rounded"
                    src={item.ImageURL ? `http://localhost/project_END/restaurant-backend/${item.ImageURL}` : undefined}
                    alt={item.name}
                    sx={{ width: 56, height: 56, mr: 1 }}
                  />
                  <Typography sx={{ flex: 1 }}>{item.name} x {item.quantity}</Typography>
                  <Typography>{item.sub_total.toFixed(2)} บาท</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography>ราคารวม: {totalPrice.toFixed(2)} บาท</Typography>
              <Typography>ส่วนลด: {discount.toFixed(2)} บาท</Typography>
              <Typography variant="h6">ยอดชำระสุทธิ: {finalTotal.toFixed(2)} บาท</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ขวา: เครื่องคิดเลขและปุ่มจ่ายเงิน */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ลูกค้าชำระ</Typography>
              <TextField
                label="จำนวนเงินที่รับมา (บาท)"
                type="number"
                fullWidth
                value={customerCash}
                onChange={handleCashChange}
                sx={{ mb: 2 }}
              />

              <Typography variant="body1">
                เงินทอน: {change >= 0 ? change.toFixed(2) : 0} บาท
              </Typography>

              <Box mt={3} display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={loading}
                  onClick={() => handlePayment('cash')}
                >
                  จ่ายเงินสด
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={() => handlePayment('transfer')}
                >
                  โอนเงิน
                </Button>
                <Box mt={2} display="flex" gap={1}>
                  <TextField
                    label="ใส่โค้ดโปรโมชั่น"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button variant="outlined" color="warning" onClick={applyPromotion} disabled={loading}>
                    โปรโมชั่น
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={applyManualDiscount} disabled={loading}>
                    ลดราคา
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage;
