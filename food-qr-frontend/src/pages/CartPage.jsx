import React from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage = () => {
  const { items, removeFromCart, clearCart } = useCart();

  const total = items.reduce((sum, item) => sum + item.Price * item.quantity, 0);

    const handleOrder = async () => {
    const tableId = localStorage.getItem("table_id");

    if (!tableId) {
        alert("ไม่พบรหัสโต๊ะ กรุณาสแกน QR อีกครั้ง");
        return;
    }

    const orderData = {
        table_id: tableId,
        items: items.map(item => ({
        menu_id: item.MenuID,
        quantity: item.quantity
        }))
    };

    try {
        const res = await axios.post('http://localhost/project_END/restaurant-backend/api/orders/create.php',
        orderData
        );
        if (res.data.success) {
        alert("ส่งคำสั่งซื้อเรียบร้อยแล้ว");
        clearCart();
        } else {
        alert("เกิดข้อผิดพลาด: " + (res.data.message || "ไม่สามารถสั่งอาหารได้"));
        }
    } catch (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
    };

  return (
    <Box
      sx={{
        maxWidth: 480, // ขนาดมือถือทั่วไป
        margin: 'auto',
        p: 2,
        minHeight: '100vh',
        bgcolor: '#fafafa',
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        ตะกร้าของคุณ
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          ตะกร้าว่างเปล่า
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <List>
            {items.map(item => (
              <div key={item.MenuID}>
                <ListItem>
                  <ListItemText
                    primary={`${item.Name} × ${item.quantity}`}
                    secondary={`฿${(item.Price * item.quantity).toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFromCart(item.MenuID)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </div>
            ))}
          </List>
        </Paper>
      )}

      <Stack direction="row" justifyContent="space-between" mb={3} px={1}>
        <Typography variant="h6" fontWeight="bold">
          รวมทั้งหมด:
        </Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          ฿{total.toFixed(2)}
        </Typography>
      </Stack>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={items.length === 0}
        onClick={handleOrder}
        size="large"
      >
        ยืนยันคำสั่ง
      </Button>
    </Box>
  );
};

export default CartPage;
