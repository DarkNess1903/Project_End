import React from 'react';
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

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();

  const handleOrder = () => {
    alert('ยังไม่ได้เชื่อม API สั่งอาหาร');
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
      <Stack direction="row" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight="bold">
          ตะกร้าของคุณ
        </Typography>
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          ตะกร้าว่างเปล่า
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <List>
            {items.map(item => (
              <div key={item.MenuID}>
                <ListItem alignItems="flex-start">
                  {item.ImageURL && (
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
                        alt={item.Name}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                    </ListItemAvatar>
                  )}

                  <ListItemText
                    primary={`${item.Name} × `}
                    secondary={
                      <>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          ฿{item.Price} × {item.quantity} = ฿{(item.Price * item.quantity).toFixed(2)}
                        </Typography>
                        <br />
                        {item.Description && (
                          <Typography variant="caption" color="text.secondary">
                            {item.Description}
                          </Typography>
                        )}
                        {item.note && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            หมายเหตุ: {item.note}
                          </Typography>
                        )}
                      </>
                    }
                  />

                  <TextField
                    type="number"
                    inputProps={{ min: 1 }}
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10);
                      if (!isNaN(qty)) updateQuantity(item.MenuID, qty);
                    }}
                    size="small"
                    sx={{ width: 60, mr: 1 }}
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
          ฿{totalAmount.toFixed(2)}
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
