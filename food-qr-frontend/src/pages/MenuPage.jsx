import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InfoIcon from '@mui/icons-material/Info';
import {
  Card, CardMedia, CardContent, Typography, Grid, CardActionArea,
  Fab, Box, TextField, InputAdornment, IconButton, Button
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [servicePolicy, setServicePolicy] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState(''); 

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
        <Box sx={{ width: '100%', height: 300, overflow: 'hidden', mb: 2 }}>
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

    {/* หมวดหมู่ + ค้นหา */}
    <Box mt={4} p={2} sx={{ bgcolor: '#fff', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
        <IconButton onClick={() => setSearchOpen(true)}>
          <SearchIcon />
        </IconButton>
        {[
          { label: 'เมนูแนะนำ', category: 'recommended' },
          { label: 'อาหารจานหลัก', category: 'main' },
          { label: 'อาหารว่าง', category: 'appetizer' },
          { label: 'ของหวาน', category: 'dessert' },
          { label: 'เครื่องดื่ม', category: 'drink' },
        ].map((item) => (
          <Button
            key={item.category}
            variant="outlined"
            onClick={() =>
              setFilteredMenus(menus.filter((menu) => menu.Category === item.category))
            }
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>

    {/* Dialog ค้นหา */}
    <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth>
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        ค้นหาเมนู
        <IconButton onClick={() => setSearchOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="พิมพ์ชื่อเมนู"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            const results = menus.filter(menu =>
              menu.Name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredMenus(results);
            setSearchOpen(false);
          }}
          variant="contained"
        >
          ค้นหา
        </Button>
      </DialogActions>
    </Dialog>

      {/* เงื่อนไขการใช้บริการ */}
      {servicePolicy && (
        <Box mt={4} p={2} sx={{ bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
            <InfoIcon sx={{ mr: 1 }} />
            เงื่อนไขการใช้บริการ
          </Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
            {servicePolicy}
          </Typography>
        </Box>
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
