import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, CardMedia, CardContent, Typography, Grid, CardActionArea,
  Fab, Box, Paper
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [servicePolicy, setServicePolicy] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // โหลดเมนู
    axios.get('http://localhost/project_END/restaurant-backend/api/menus/get_active_menus.php')
      .then(res => {
        if (Array.isArray(res.data)) {
          setMenus(res.data);
          setFilteredMenus(res.data);
        }
      })
      .catch(err => {
        console.error('โหลดเมนูล้มเหลว:', err);
      });

    // โหลด settings
    axios.get('http://localhost/project_END/restaurant-backend/api/settings/get_settings.php')
      .then(res => {
        if (res.data.success) {
          const s = res.data.settings;
          setStoreName(s.store_name || '');
          setServicePolicy(s.service_policy || '');
          if (s.logo_url) {
            setLogoUrl(`${s.logo_url}`);
          }
          if (s.cover_image_url) {
            setCoverImage(`${s.cover_image_url}`);
          }
        }
      })
      .catch(err => {
        console.error('โหลด settings ล้มเหลว:', err);
      });
  }, []);

  return (
    <>
      {/* ภาพปกด้านบน */}
      {coverImage && (
        <Box sx={{ width: '100%', height: 200, overflow: 'hidden', mb: 2 }}>
          <img
            src={coverImage}
            alt="cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}

      {/* ชื่อร้าน + โลโก้ */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        {logoUrl && (
          <Box
            component="img"
            src={logoUrl}
            alt="logo"
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              objectFit: 'cover',
              mr: 2,
              border: '2px solid #ccc',
            }}
          />
        )}
        <Typography variant="h5" fontWeight="bold">
          {storeName}
        </Typography>
      </Box>

      {/* เงื่อนไขการให้บริการ */}
      {servicePolicy && (
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', mb: 3 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            {servicePolicy}
          </Typography>
        </Paper>
      )}

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

      {/* ปุ่มตะกร้า */}
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
