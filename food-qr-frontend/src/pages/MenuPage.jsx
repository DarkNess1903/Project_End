import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Grid,
  Fab,
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost/project_END/restaurant-backend/api/menus/index.php')
      .then(res => setMenus(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Grid container spacing={2} padding={2}>
        {menus.map(menu => (
          <Grid item xs={12} key={menu.MenuID}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                // ตรวจสอบ path รูปให้ถูกต้อง
                image={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
                alt={menu.Name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>{menu.Name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {menu.Description}
                </Typography>
                <Typography variant="subtitle1" color="primary" mt={1}>
                  ฿{menu.Price}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => addToCart(menu)}
                >
                  เพิ่มลงตะกร้า
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ปุ่มลอยไปหน้า Cart */}
      <Fab
        color="primary"
        aria-label="cart"
        onClick={() => navigate('/cart')}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <ShoppingCartIcon />
      </Fab>
    </>
  );
};

export default MenuPage;
