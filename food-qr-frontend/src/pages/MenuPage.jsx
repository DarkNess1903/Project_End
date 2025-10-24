// MenuPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InfoIcon from '@mui/icons-material/Info';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../contexts/CartContext';
import { Badge } from '@mui/material';

import {
  Card, CardMedia, CardContent, Typography, Grid,
  Fab, Box, TextField, InputAdornment, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip,
  ButtonGroup, Snackbar, Alert
} from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BASE_URL = 'http://localhost/project_END/restaurant-backend';

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
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();
  const { totalItems, addToCart } = useCart();

  // Theme
  const theme = {
    primary: '#2E3440',
    secondary: '#5E81AC',
    accent: '#D08770',
    success: '#A3BE8C',
    warning: '#EBCB8B',
    background: '#ECEFF4',
    surface: '#FFFFFF',
    text: {
      primary: '#2E3440',
      secondary: '#4C566A',
      light: '#D8DEE9'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // ====== Init table from URL ======
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const table = params.get('table');
    if (table) {
      if (localStorage.getItem('table_id') !== table) {
        axios.get(`${BASE_URL}/api/tables/check_table.php?table=${encodeURIComponent(table)}`)
          .then(res => {
            if (res.data?.exists) {
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
  }, [location.search]);

  const categoryButtons = [
    { label: 'ทั้งหมด', category: 'all' },
    // { label: 'เมนูแนะนำ', category: 'recommended', icon: '⭐' },
    { label: 'อาหารจานหลัก', category: 'main' },
    { label: 'อาหารว่าง', category: 'appetizer' },
    { label: 'ของหวาน', category: 'dessert' },
    { label: 'เครื่องดื่ม', category: 'drink' },
  ];

  const tableName = localStorage.getItem('tableName') || 'ไม่ระบุ';

  const sendStaffCall = async (reason) => {
    try {
      const tableId = localStorage.getItem('table_id') || '';
      const res = await axios.post(`${BASE_URL}/api/staff_call/create.php`, {
        table_id: tableId,
        service_type: reason
      });
      if (res.data?.success) {
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

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setQuantity(1);
    setNote('');
    setOrderDialogOpen(true);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;
    if (quantity < 1) {
      setSnackbar({ open: true, message: 'จำนวนต้องมากกว่า 0', severity: 'warning' });
      return;
    }
    addToCart({ ...selectedMenu, quantity, note });
    setSnackbar({
      open: true,
      message: `เพิ่ม ${selectedMenu.Name} ลงตะกร้าแล้ว!`,
      severity: 'success'
    });
    setOrderDialogOpen(false);
  };

  const handleSnackbarClose = () => setSnackbar(s => ({ ...s, open: false }));

  // ====== Load menus & settings ======
  useEffect(() => {
    axios.get(`${BASE_URL}/api/menus/get_active_menus.php`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setMenus(res.data);
          setFilteredMenus(res.data);
        }
      })
      .catch(err => console.error('โหลดเมนูล้มเหลว:', err));

    axios.get(`${BASE_URL}/api/settings/get_settings.php`)
      .then(res => {
        if (res.data?.success) {
          const s = res.data.settings || {};
          setStoreName(s.store_name || '');
          setServicePolicy(s.service_policy || '');
          const l = s.logo_url ? (s.logo_url.startsWith('http') ? s.logo_url : `${BASE_URL}/${s.logo_url}`) : null;
          const c = s.cover_image_url ? (s.cover_image_url.startsWith('http') ? s.cover_image_url : `${BASE_URL}/${s.cover_image_url}`) : null;
          setLogoUrl(l);
          setCoverImage(c);
        }
      })
      .catch(err => console.error('โหลด settings ล้มเหลว:', err));
  }, []);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredMenus(menus);
    } else {
      setFilteredMenus(menus.filter((menu) => (menu.Category || '').toLowerCase() === category.toLowerCase()));
    }
  };

  const menuImage = (imgPath) => {
    if (!imgPath) return `${BASE_URL}/assets/images/default_menu.jpg`;
    return imgPath.startsWith('http') ? imgPath : `${BASE_URL}/${imgPath}`;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif'
    }}>
      {/* Header Bar */}
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
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {tableName}
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
            {/* <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <SearchIcon />
            </IconButton> */}
          </Box>
        </Box>
      </Box>

      {/* Order Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        {selectedMenu && (
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, fontSize: '1.3rem', color: theme.primary, pb: 1 }}>
              สั่งเมนู
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center" mb={3}>
                <Box
                  component="img"
                  src={menuImage(selectedMenu.ImageURL)}
                  alt={selectedMenu.Name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: '16px',
                    mb: 2,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Typography variant="h5" fontWeight={700} sx={{ color: theme.primary, mb: 1 }}>
                  {selectedMenu.Name}
                </Typography>
                {!!selectedMenu.Description && (
                  <Typography variant="body2" sx={{ color: theme.text.secondary, mb: 2 }}>
                    {selectedMenu.Description}
                  </Typography>
                )}
                <Chip
                  label={`฿${Number(selectedMenu.Price).toLocaleString()}`}
                  sx={{
                    backgroundColor: theme.accent,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>

              {/* Quantity */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} sx={{ color: theme.primary, mb: 2 }}>
                  จำนวน
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                  <ButtonGroup
                    variant="outlined"
                    sx={{
                      '& .MuiButton-root': {
                        borderRadius: '12px',
                        borderColor: theme.secondary,
                        color: theme.secondary,
                        minWidth: 48,
                        height: 48
                      }
                    }}
                  >
                    <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      <RemoveIcon />
                    </Button>
                    <Button
                      disabled
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color: theme.primary,
                        borderLeft: `1px solid ${theme.secondary}`,
                        borderRight: `1px solid ${theme.secondary}`
                      }}
                    >
                      {quantity}
                    </Button>
                    <Button onClick={() => handleQuantityChange(1)} disabled={quantity >= 99}>
                      <AddIcon />
                    </Button>
                  </ButtonGroup>

                  <Typography variant="body1" sx={{ color: theme.text.secondary, ml: 2 }}>
                    รวม <strong style={{ color: theme.accent }}>
                      ฿{(Number(selectedMenu.Price) * quantity).toLocaleString()}
                    </strong>
                  </Typography>
                </Box>
              </Box>

              {/* Note */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} sx={{ color: theme.primary, mb: 2 }}>
                  หมายเหตุพิเศษ
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ระบุความต้องการพิเศษ เช่น ไม่ใส่ผัก, เผ็ดน้อย, เพิ่มข้าว..."
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: `${theme.secondary}08`,
                      '&:hover fieldset': { borderColor: theme.secondary },
                      '&.Mui-focused fieldset': { borderColor: theme.secondary }
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
              <Button onClick={() => setOrderDialogOpen(false)} sx={{ borderRadius: '12px', px: 3, color: theme.text.secondary, flex: 1 }}>
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="contained"
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  flex: 2,
                  background: theme.gradient,
                  fontWeight: 600,
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }
                }}
              >
                เพิ่มลงตะกร้า • ฿{(Number(selectedMenu.Price) * quantity).toLocaleString()}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Staff Call Dialog */}
      <Dialog
        open={callDialogOpen}
        onClose={() => setCallDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 2, minWidth: 320 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, fontSize: '1.3rem', color: theme.primary }}>
          🔔 เรียกพนักงาน
        </DialogTitle>
        <DialogContent sx={{ p: 6 }}>
          <Grid container spacing={2}>
            {[
              { label: 'ขออุปกรณ์', type: 'ขออุปกรณ์', icon: '🍴', color: theme.secondary },
              { label: 'เครื่องปรุง', type: 'ขอเครื่องปรุง', icon: '🧂', color: theme.success },
              { label: 'ชำระเงิน', type: 'ชำระเงิน', icon: '💳', color: theme.accent },
              { label: 'อื่นๆ', type: 'อื่นๆ', icon: '💬', color: theme.warning },
            ].map((item) => (
              <Grid item xs={6} key={item.type} sx={{ display: 'flex' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => sendStaffCall(item.type)}
                  sx={{
                    height: '100px',
                    width : '100px',
                    py: 2, 
                    aspectRatio: '1 / 1',
                    borderRadius: '16px',
                    py: 2,
                    borderColor: item.color,
                    color: item.color,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: `${item.color}15`, borderColor: item.color }
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
          <Button onClick={() => setCallDialogOpen(false)} sx={{ borderRadius: '12px', px: 4, color: theme.text.secondary }}>
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cover Image */}
      {coverImage && (
        <Box sx={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', mb: 3, mx: 2, borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <img src={coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', p: 2 }} />
        </Box>
      )}

      {/* Restaurant Info */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={3} sx={{ px: 2 }}>
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
          <Typography variant="h4" fontWeight={700} sx={{ color: theme.primary, fontSize: '1.8rem', mb: 0.5 }}>
            {storeName}
          </Typography>
        </Box>
      </Box>

      {/* Category Filter */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <RestaurantMenuIcon sx={{ mr: 1, color: theme.secondary }} />
          <Typography variant="h6" fontWeight={600} sx={{ color: theme.primary }}>
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

          {categoryButtons.map((item) => {
            const active = selectedCategory === item.category;
            return (
              <Chip
                key={item.category}
                label={<Box display="flex" alignItems="center" gap={0.5}><span>{item.icon}</span>{item.label}</Box>}
                onClick={() => handleCategoryFilter(item.category)}
                variant={active ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '16px',
                  px: 1,
                  py: 2,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  ...(active
                    ? { backgroundColor: theme.secondary, color: 'white', '&:hover': { backgroundColor: theme.secondary } }
                    : { borderColor: theme.secondary, color: theme.secondary, '&:hover': { backgroundColor: `${theme.secondary}10` } })
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon /> ค้นหาเมนู
          </Typography>
          <IconButton onClick={() => setSearchOpen(false)} sx={{ color: theme.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.secondary }} />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const results = menus.filter(menu =>
                  (menu.Name || '').toLowerCase().includes(searchText.toLowerCase())
                );
                setFilteredMenus(results);
                setSearchOpen(false);
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              const results = menus.filter(menu =>
                (menu.Name || '').toLowerCase().includes(searchText.toLowerCase())
              );
              setFilteredMenus(results);
              setSearchOpen(false);
            }}
            variant="contained"
            fullWidth
            sx={{ borderRadius: '16px', py: 1.5, backgroundColor: theme.secondary, '&:hover': { backgroundColor: theme.primary } }}
          >
            ค้นหา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Policy */}
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
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom sx={{ color: theme.primary, fontWeight: 600 }}>
            <InfoIcon sx={{ mr: 1, color: theme.secondary }} />
            นโยบายร้าน
          </Typography>
          <Typography variant="body2" sx={{ color: theme.text.secondary, lineHeight: 1.6 }} whiteSpace="pre-line">
            {servicePolicy}
          </Typography>
        </Box>
      )}

      {/* Menu Grid */}
      <Box sx={{ px: 2, pb: 10 }}>
        <Grid container spacing={2}>
          {filteredMenus.length > 0 ? (
            filteredMenus.map(menu => (
              <Grid key={menu.MenuID} item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={menuImage(menu.ImageURL)}
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
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      ฿{Number(menu.Price).toLocaleString()}
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.primary, fontSize: '1.1rem', mb: 1 }}>
                      {menu.Name}
                    </Typography>
                    {!!menu.Description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.text.secondary,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2
                        }}
                      >
                        {menu.Description}
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleMenuClick(menu)}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        fontWeight: 600,
                        background: theme.gradient,
                        fontSize: '0.9rem',
                        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      สั่งเลย
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={6} sx={{ backgroundColor: theme.surface, borderRadius: '20px', mx: 1 }}>
                <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600 }}>
                  ไม่พบเมนูที่ตรงกับคำค้นหา
                </Typography>
                <Typography variant="body2" sx={{ color: theme.text.secondary, mt: 1 }}>
                  ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Floating Cart */}
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
          '&:hover': { transform: 'scale(1.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' },
          transition: 'all 0.3s ease',
          zIndex: 1300
        }}
      >
        <Badge
          badgeContent={totalItems}
          sx={{ '& .MuiBadge-badge': { backgroundColor: theme.accent, color: 'white', fontWeight: 600, border: '2px solid white' } }}
        >
          <ShoppingCartIcon sx={{ fontSize: '1.5rem' }} />
        </Badge>
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuPage;
