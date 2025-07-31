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
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Stack,
} from '@mui/material';

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

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        ประวัติคำสั่งซื้อ
      </Typography>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        sx={{ mb: 2 }}
        size="small"
      >
        <ToggleButton value="week">สัปดาห์นี้</ToggleButton>
        <ToggleButton value="month">เดือนนี้</ToggleButton>
        <ToggleButton value="year">ปีนี้</ToggleButton>
      </ToggleButtonGroup>

      {filteredOrders.length === 0 ? (
        <Typography>ไม่พบคำสั่งซื้อ</Typography>
      ) : (
        <Paper elevation={1}>
          <List>
            {filteredOrders.map(order => (
              <React.Fragment key={order.OrderID}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        alert(`ดูรายละเอียด OrderID: ${order.OrderID}`)
                      }
                    >
                      รายละเอียด
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Typography>
                          โต๊ะ: {order.TableID} — ฿{Number(order.TotalAmount).toFixed(2)}
                        </Typography>
                        <Typography color="text.secondary">
                          ประเภท: {order.PaymentMethod || 'ไม่ระบุ'}
                        </Typography>
                      </Stack>
                    }
                    secondary={`เวลา: ${new Date(order.OrderTime).toLocaleString()}`}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default OrderListPage;
