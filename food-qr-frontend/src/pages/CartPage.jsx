import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [note, setNote] = React.useState('');
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const { updateNote } = useCart();

  const handleOrder = async () => {
    const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';

    const payload = {
      table_id: parseInt(table),
      items: items.map(item => ({
        menu_id: item.MenuID,
        quantity: item.quantity,
        note: item.note || ''
      }))
    };

    try {
      const res = await axios.post(
        'http://localhost/project_END/restaurant-backend/api/orders/create.php',
        payload
      );

      if (res.data.success) {
        alert(`สั่งอาหารเรียบร้อย! หมายเลขออร์เดอร์: ${res.data.order_id}`);
        clearCart();
        navigate(`/?table=${table}`);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (res.data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('เกิดข้อผิดพลาดในการสั่งอาหาร');
    }
  };

  const handleEditNote = (item) => {
    setSelectedItem(item);
    setNote(item.note || '');
    setOpenNoteDialog(true);
  };

  const handleSaveNote = () => {
    if (selectedItem) {
      updateNote(selectedItem.MenuID, note);
    }
    setOpenNoteDialog(false);
  };
  

  return (
    <Box
      sx={{
        maxWidth: 480,
        margin: 'auto',
        p: 2,
        minHeight: '100vh',
        bgcolor: '#fafafa',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" mb={2}>
        <IconButton
          onClick={() => {
            const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
            navigate(`/?table=${table}`);
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          ตะกร้าของคุณ
        </Typography>
      </Stack>

      {/* Empty Cart */}
      {items.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          ตะกร้าว่างเปล่า
        </Typography>
      ) : (
        <Stack spacing={2} mb={2}>
          {items.map(item => (
            <Paper
              key={item.MenuID}
              variant="outlined"
              sx={{ p: 1.5, display: 'flex', borderRadius: 2 }}
            >
              {/* รูปภาพเมนู */}
              <Box
                component="img"
                src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
                alt={item.Name}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  objectFit: 'cover',
                  mr: 2,
                }}
              />

              {/* รายละเอียดเมนู */}
              <Box flex="1">
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.Name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ฿{item.Price}
                </Typography>

                {item.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                    หมายเหตุ: {item.note}
                  </Typography>
                )}

                {/* จำนวน + ปุ่มแก้ไข */}
                <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                  <TextField
                    type="number"
                    inputProps={{ min: 1 }}
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10);
                      if (!isNaN(qty)) updateQuantity(item.MenuID, qty);
                    }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditNote(item)}
                    startIcon={<EditIcon />}
                  >
                    แก้ไขหมายเหตุ
                  </Button>
                  <IconButton
                    aria-label="delete"
                    onClick={() => removeFromCart(item.MenuID)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* สรุปยอด */}
      <Stack direction="row" justifyContent="space-between" mb={3} px={1}>
        <Typography variant="h6" fontWeight="bold">
          รวมทั้งหมด:
        </Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          ฿{totalAmount.toFixed(2)}
        </Typography>
      </Stack>

      {/* ปุ่มยืนยัน */}
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
