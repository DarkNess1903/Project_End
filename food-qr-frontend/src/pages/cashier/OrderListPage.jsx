// src/pages/cashier/OrderListPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/orders/index_paid.php');
      console.log('API response:', res.data); // 🔍 ตรวจสอบค่าที่ได้
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ประวัติคำสั่งซื้อ
      </Typography>

      {orders.length === 0 ? (
        <Typography>ไม่มีคำสั่งซื้อในขณะนี้</Typography>
      ) : (
        <List>
          {orders.map(order => (
            <React.Fragment key={order.OrderID}>
              <ListItem
                secondaryAction={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => alert(`ดูคำสั่งซื้อ ID: ${order.OrderID} (ต่อยอดได้ตามต้องการ)`)}
                  >
                    รายละเอียด
                  </Button>
                }
              >
                <ListItemText
                  primary={`โต๊ะ: ${order.TableID} — ยอดรวม: ฿${Number(order.TotalAmount).toFixed(2)}`}
                  secondary={`สถานะ: ${order.Status} — เวลา: ${new Date(order.OrderTime).toLocaleString()}`}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrderListPage;
