import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BillPage = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table') || '0';

  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`http://localhost/project_END/restaurant-backend/api/orders/get_current.php?table_id=${tableId}`);
        if (res.data.success) {
          setOrderItems(res.data.items);
          setTotalAmount(res.data.total_amount);
        }
      } catch (err) {
        console.error('Error fetching bill:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [tableId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (orderItems.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography variant="h6" color="text.secondary">
          ไม่พบรายการอาหารในโต๊ะนี้
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
              <IconButton
          onClick={() => {
            const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
            navigate(`/?table=${table}`);
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ใบเสร็จของโต๊ะ {tableId}
      </Typography>

      {orderItems.map((item, index) => (
        <Stack key={index} direction="row" spacing={2} alignItems="center" py={1}>
          <Avatar
            src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
            variant="rounded"
            sx={{ width: 64, height: 64 }}
          />
          <Box flexGrow={1}>
            <Typography fontWeight="bold">{item.Name}</Typography>
            <Typography variant="body2" color="text.secondary">
              จำนวน: {item.Quantity} × ฿{item.Price.toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography fontWeight="bold">
              ฿{(item.Price * item.Quantity).toFixed(2)}
            </Typography>
            <Typography
              variant="caption"
              color={item.Status === 'served' ? 'green' : 'orange'}
            >
              {item.Status === 'served' ? 'เสิร์ฟแล้ว' : 'กำลังทำ'}
            </Typography>
          </Box>
        </Stack>
      ))}

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold">รวมทั้งหมด</Typography>
        <Typography variant="h6" fontWeight="bold" color="primary">฿{totalAmount.toFixed(2)}</Typography>
      </Stack>

      <Button
        fullWidth
        variant="contained"
        color="success"
        sx={{ mt: 3 }}
        onClick={() => navigate(`/payment?table=${tableId}`)}
      >
        ดำเนินการชำระเงิน
      </Button>
    </Box>
  );
};

export default BillPage;
