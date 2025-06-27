import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import {
  Card, CardMedia, CardContent, Typography, Grid, CardActionArea,
  Fab, Box, TextField, InputAdornment, IconButton, Button 
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';

const logoUrl = '/uploads/logo.png'; // URL โลโก้ร้าน

const categories = [
  { label: 'อาหาร', path: '/category/food' },
  { label: 'เครื่องดื่ม', path: '/category/drinks' },
  ];

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const handleCategoryClick = (path) => {
    navigate(path);
  };
  const handleSearchClick = () => {
    navigate('/search');
  };

  useEffect(() => {
    axios.get('http://localhost/project_END/restaurant-backend/api/menus/index.php')
      .then(res => {
        if (Array.isArray(res.data)) {
          setMenus(res.data);
          setFilteredMenus(res.data);
        } else {
          setMenus([]);
          setFilteredMenus([]);
        }
      })
      .catch(err => {
        console.error(err);
        setMenus([]);
        setFilteredMenus([]);
      });
  }, []);

  // ฟิลเตอร์เมนูตาม searchTerm (ชื่อเมนู หรือ หมวดหมู่ถ้ามี)
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = menus.filter(menu =>
      menu.Name.toLowerCase().includes(lowerSearch)
      // || menu.Category?.toLowerCase().includes(lowerSearch) // ถ้ามีหมวดหมู่ให้เพิ่มตรงนี้
    );
    setFilteredMenus(filtered);
  }, [searchTerm, menus]);

  return (
    <>
      {/* ส่วนหัว - โลโก้และชื่อร้าน */}
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
          borderBottom: '1px solid #ddd',
          bgcolor: '#fff',
        }}
      >
      <Box
        component="img"
        src={logoUrl}
        alt="Logo ร้านอาหาร"
        sx={{
          width: 100,
          height: 100,
          mb: 1,
          mx: 'auto',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
        <Typography variant="h4" fontWeight="bold" color="black">
          ร้าน xxxx
        </Typography>
      </Box>

      {/* ช่องค้นหา */}
    <Box
      sx={{
        p: 2,
        bgcolor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2, // ช่องว่างระหว่างไอคอนกับปุ่มหมวดหมู่
        flexWrap: 'wrap', // ถ้าพื้นที่ไม่พอ ให้ขึ้นบรรทัดใหม่
      }}
    >
      {/* ไอคอนแว่นขยาย */}
      <IconButton aria-label="ค้นหา" onClick={handleSearchClick} size="large" color="primary" sx={{ bgcolor: '#e0e0e0', borderRadius: '50%' }}>
        <SearchIcon fontSize="inherit" />
      </IconButton>

      {/* ปุ่มหมวดหมู่ */}
      {categories.map(cat => (
        <Button
          key={cat.label}
          variant="outlined"
          onClick={() => handleCategoryClick(cat.path)}
          size="medium"
          color="primary"
        >
          {cat.label}
        </Button>
      ))}
    </Box>

      {/* รายการเมนู */}
      <Grid container spacing={2} columns={12} padding={2}>
        {filteredMenus.length > 0 ? (
          filteredMenus.map(menu => (
            <Grid key={menu.MenuID} item xs={12} sm={6} md={4}>
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
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" mt={4} color="text.secondary">
              ไม่พบเมนูที่ตรงกับคำค้นหา
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* ปุ่มตะกร้าลอย */}
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
