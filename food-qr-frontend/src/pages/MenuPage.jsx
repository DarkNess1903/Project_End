import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import {
  Card, CardMedia, CardContent, Typography, Grid, CardActionArea, Fab
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost/project_END/restaurant-backend/api/menus/index.php')
      .then(res => {
        console.log('API response:', res.data); // เพิ่มเพื่อ debug
        if (Array.isArray(res.data)) {
          setMenus(res.data);
        } else {
          console.error("Expected array but got:", res.data);
          setMenus([]); // fallback
        }
      })
      .catch(err => {
        console.error(err);
        setMenus([]); // fallback
      });
  }, []);

  return (
    <>
      <Grid container spacing={2} columns={12} padding={2}>
        {menus.map(menu => (
          <Grid key={menu.MenuID} span={12}>
            <Card>
              <CardActionArea component={Link} to={`/menu/${menu.MenuID}`}>
                <CardMedia
                  component="img"
                  height="140"
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
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Fab
        color="primary"
        aria-label="cart"
        onClick={() => navigate('/cart')}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
      >
        <ShoppingCartIcon />
      </Fab>
    </>
  );
};

export default MenuPage;
