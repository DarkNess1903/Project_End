import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InfoIcon from '@mui/icons-material/Info';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';

import { useCart } from '../contexts/CartContext';
import { Badge } from '@mui/material';

import {
  Card, CardMedia, CardContent, Typography, Grid, CardActionArea,
  Fab, Box, TextField, InputAdornment, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Toolbar, Stack, Chip
} from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [servicePolicy, setServicePolicy] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();
  const query = useQuery();
  const { totalItems } = useCart();
  const location = useLocation();

  // สี theme ใหม่
  const theme = {
    primary: '#2E3440',     // Dark charcoal
    secondary: '#5E81AC',   // Soft blue
    accent: '#D08770',      // Warm orange
    success: '#A3BE8C',     // Green
    warning: '#EBCB8B',     // Yellow
    background: '#ECEFF4',  // Light gray
    surface: '#FFFFFF',     // White
    text: {
      primary: '#2E3440',
      secondary: '#4C566A',
      light: '#D8DEE9'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const table = params.get('table');
    if (table) {
      if (localStorage.getItem('table_id') !== table) {
        axios.get(`http://localhost/project_END/restaurant-backend/api/tables/check_table.php?table=${table}`)
          .then(res => {
            if (res.data.exists) {
              localStorage.setItem('tableName', `โต๊ะ ${table}`);
              localStorage.setItem('table_id', table);
            } else {
              alert('ไม่พบโต๊ะนี้ในระบบ');
              localStorage.removeItem('tableName');
              localStorage.removeItem('table_id');
            }
          })
          .catch(err => {
            console.error('เช็คโต๊ะล้มเหลว:', err);
            alert('เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ');
          });
      }
    }
  }, [query]);

    const categoryButtons = [
    { label: 'ทั้งหมด', category: 'all', icon: '🍽️' },
    { label: 'เมนูแนะนำ', category: 'recommended', icon: '⭐' },
    { label: 'อาหารจานหลัก', category: 'main', icon: '🍖' },
    { label: 'อาหารว่าง', category: 'appetizer', icon: '🥗' },
    { label: 'ของหวาน', category: 'dessert', icon: '🍰' },
    { label: 'เครื่องดื่ม', category: 'drink', icon: '🥤' },
  ];

  const tableName = localStorage.getItem('tableName') || 'ไม่ระบุ';

  const sendStaffCall = async (reason) => {
    try {
      const tableId = localStorage.getItem('table_id');
      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/staff_call/create.php', {
        table_id: tableId,
        service_type: reason
      });
      if (res.data.success) {
        alert('พนักงานจะมาที่โต๊ะของคุณในไม่ช้า');
      } else {
        alert('เรียกพนักงานไม่สำเร็จ');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err.message);
      alert('เกิดข้อผิดพลาดในการเรียกพนักงาน');
    } finally {
      setCallDialogOpen(false);
    }
  };

  const handleViewBill = () => {
    const tableId = new URLSearchParams(window.location.search).get('table') || '0';
    navigate(`/bill?table=${tableId}`);
  };

  useEffect(() => {
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

    axios.get('http://localhost/project_END/restaurant-backend/api/settings/get_settings.php')
      .then(res => {
        if (res.data.success) {
          const s = res.data.settings;
          setStoreName(s.store_name || '');
          setServicePolicy(s.service_policy || '');
          if (s.logo_url) setLogoUrl(`${s.logo_url}`);
          if (s.cover_image_url) setCoverImage(`${s.cover_image_url}`);
        }
      })
      .catch(err => {
        console.error('โหลด settings ล้มเหลว:', err);
      });
  }, []);
  
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredMenus(menus);
    } else {
      setFilteredMenus(menus.filter((menu) => menu.Category === category));
    }
  };

 return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background,
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif'
    }}>
      {/* Header Bar - ปรับปรุงให้สวยขึ้น */}
      <Box
        sx={{
          background: theme.gradient,
          color: 'white',
          p: 2,
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          mb: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              px: 3,
              py: 1.5,
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: '600',
              fontSize: '1.1rem',
            }}
          >
            📍 {tableName}
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => setCallDialogOpen(true)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <SupportAgentIcon />
            </IconButton>
            <IconButton
              onClick={handleViewBill}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <ReceiptLongIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Staff Call Dialog */}
      <Dialog 
        open={callDialogOpen} 
        onClose={() => setCallDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            minWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontWeight: '600',
          fontSize: '1.3rem',
          color: theme.primary
        }}>
          🔔 เรียกพนักงาน
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[
              { label: 'ขออุปกรณ์', type: 'ขออุปกรณ์', icon: '🍴', color: theme.secondary },
              { label: 'เครื่องปรุง', type: 'ขอเครื่องปรุง', icon: '🧂', color: theme.success },
              { label: 'ชำระเงิน', type: 'ชำระเงิน', icon: '💳', color: theme.accent },
              { label: 'อื่นๆ', type: 'อื่นๆ', icon: '💬', color: theme.warning },
            ].map((item) => (
              <Grid item xs={6} key={item.type}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => sendStaffCall(item.type)}
                  sx={{
                    borderRadius: '16px',
                    py: 2,
                    borderColor: item.color,
                    color: item.color,
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: `${item.color}15`,
                      borderColor: item.color,
                    }
                  }}
                >
                  <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    {item.label}
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setCallDialogOpen(false)}
            sx={{ 
              borderRadius: '12px',
              px: 4,
              color: theme.text.secondary
            }}
          >
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cover Image - Enhanced */}
      {coverImage && (
        <Box sx={{ 
          position: 'relative',
          width: '100%', 
          height: 200, 
          overflow: 'hidden', 
          mb: 3,
          mx: 2,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <img
            src={coverImage}
            alt="cover"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              p: 2
            }}
          />
        </Box>
      )}

      {/* Restaurant Info - Redesigned */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        mb={3}
        sx={{ px: 2 }}
      >
        {logoUrl && (
          <Box
            component="img"
            src={logoUrl}
            alt="logo"
            sx={{
              width: 70,
              height: 70,
              borderRadius: '20px',
              objectFit: 'cover',
              mr: 2,
              border: `3px solid ${theme.secondary}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          />
        )}
        <Box textAlign="center">
          <Typography 
            variant="h4" 
            fontWeight="700"
            sx={{ 
              color: theme.primary,
              fontSize: '1.8rem',
              mb: 0.5
            }}
          >
            {storeName}
          </Typography>
        </Box>
      </Box>

      {/* Category Filter - Modern Design */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <RestaurantMenuIcon sx={{ mr: 1, color: theme.secondary }} />
          <Typography 
            variant="h6" 
            fontWeight="600"
            sx={{ color: theme.primary }}
          >
            หมวดหมู่เมนู
          </Typography>
        </Box>
        
        <Box display="flex" gap={1} sx={{ overflowX: 'auto', pb: 1 }}>
          <IconButton
            onClick={() => setSearchOpen(true)}
            sx={{
              backgroundColor: theme.surface,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              mr: 1,
              '&:hover': { backgroundColor: theme.secondary, color: 'white' }
            }}
          >
            <SearchIcon />
          </IconButton>
          
          {categoryButtons.map((item) => (
            <Chip
              key={item.category}
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <span>{item.icon}</span>
                  {item.label}
                </Box>
              }
              onClick={() => handleCategoryFilter(item.category)}
              variant={selectedCategory === item.category ? "filled" : "outlined"}
              sx={{
                borderRadius: '16px',
                px: 1,
                py: 2,
                fontSize: '0.9rem',
                fontWeight: '500',
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                ...(selectedCategory === item.category ? {
                  backgroundColor: theme.secondary,
                  color: 'white',
                  '&:hover': { backgroundColor: theme.secondary }
                } : {
                  borderColor: theme.secondary,
                  color: theme.secondary,
                  '&:hover': { backgroundColor: `${theme.secondary}10` }
                })
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Enhanced Search Dialog */}
      <Dialog 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px', p: 1 }
        }}
      >
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          🔍 ค้นหาเมนู
          <IconButton 
            onClick={() => setSearchOpen(false)}
            sx={{ color: theme.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="พิมพ์ชื่อเมนูที่ต้องการ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              const results = menus.filter(menu =>
                menu.Name.toLowerCase().includes(searchText.toLowerCase())
              );
              setFilteredMenus(results);
              setSearchOpen(false);
            }}
            variant="contained"
            fullWidth
            sx={{
              borderRadius: '16px',
              py: 1.5,
              backgroundColor: theme.secondary,
              '&:hover': { backgroundColor: theme.primary }
            }}
          >
            ค้นหา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Policy - Enhanced */}
      {servicePolicy && (
        <Box 
          sx={{ 
            mx: 2,
            mb: 3,
            p: 3,
            backgroundColor: theme.surface,
            borderRadius: '20px',
            border: `1px solid ${theme.secondary}30`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Typography 
            variant="h6" 
            display="flex" 
            alignItems="center" 
            gutterBottom
            sx={{ color: theme.primary, fontWeight: '600' }}
          >
            <InfoIcon sx={{ mr: 1, color: theme.secondary }} />
            📋 นโยบายร้าน
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.text.secondary,
              lineHeight: 1.6
            }}
            whiteSpace="pre-line"
          >
            {servicePolicy}
          </Typography>
        </Box>
      )}

      {/* Menu Grid - Enhanced Cards */}
      <Box sx={{ px: 2, pb: 10 }}>
        <Grid container spacing={2}>
          {filteredMenus.length > 0 ? (
            filteredMenus.map(menu => (
              <Grid key={menu.MenuID} item xs={12} sm={6} md={4}>
                <Card sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardActionArea component={Link} to={`/menu/${menu.MenuID}`}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
                        alt={menu.Name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: theme.accent,
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        ฿{menu.Price}
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontWeight: '600',
                          color: theme.primary,
                          fontSize: '1.1rem',
                          mb: 1
                        }}
                      >
                        {menu.Name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.text.secondary,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {menu.Description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box 
                textAlign="center" 
                py={6}
                sx={{
                  backgroundColor: theme.surface,
                  borderRadius: '20px',
                  mx: 1
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  🔍
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: theme.text.secondary,
                    fontWeight: '500'
                  }}
                >
                  ไม่พบเมนูที่ตรงกับคำค้นหา
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: theme.text.secondary,
                    mt: 1
                  }}
                >
                  ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Enhanced Floating Cart Button */}
      <Fab
        onClick={() => navigate('/cart')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: theme.gradient,
          color: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1300
        }}
      >
        <Badge 
          badgeContent={totalItems} 
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: theme.accent,
              color: 'white',
              fontWeight: '600',
              border: '2px solid white'
            }
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: '1.5rem' }} />
        </Badge>
      </Fab>
    </Box>
  );
};

export default MenuPage;