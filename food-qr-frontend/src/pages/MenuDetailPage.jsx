import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Stack,
  Fab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../contexts/CartContext';

const MenuDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get(`http://localhost/project_END/restaurant-backend/api/menus/show.php?id=${id}`)
      .then(res => setMenu(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!menu) {
    return <Typography align="center" mt={4}>Loading...</Typography>;
  }

  const handleAddToCart = () => {
    if (quantity < 1) {
      alert('จำนวนต้องมากกว่า 0');
      return;
    }
    addToCart({ ...menu, quantity, note });
  };

  return (
    <Box p={2} position="relative" minHeight="100vh">
      {/* ปุ่มกลับ */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        กลับ
      </Button>

      <Card>
        <CardMedia
          component="img"
          height="200"
          image={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
          alt={menu.Name}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>{menu.Name}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {menu.Description}
          </Typography>
          <Typography variant="h6" color="primary" mb={2}>
            ฿{menu.Price}
          </Typography>

          <Stack spacing={2} mb={2}>
            <TextField
              label="จำนวน"
              type="number"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              fullWidth
            />
            <TextField
              label="หมายเหตุ (ถ้ามี)"
              multiline
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="ใส่รายละเอียดเพิ่มเติม เช่น ไม่ใส่ผัก"
              fullWidth
            />
          </Stack>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddToCart}
          >
            เพิ่มลงตะกร้า
          </Button>
        </CardContent>
      </Card>

      {/* ปุ่มตะกร้าลอย */}
      <Fab
        color="primary"
        aria-label="cart"
        onClick={() => navigate('/cart')}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
      >
        <ShoppingCartIcon />
      </Fab>
    </Box>
  );
};

export default MenuDetailPage;
