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
  IconButton,
  TextField,
  Stack,
  Fab,
  Chip,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  ButtonGroup,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useCart } from '../contexts/CartContext';
import { Badge } from '@mui/material';

const MenuDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { addToCart } = useCart();
  const { totalItems } = useCart();

  // สี theme เดียวกันกับหน้า MenuPage
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

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost/project_END/restaurant-backend/api/menus/show.php?id=${id}`)
      .then(res => {
        setMenu(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'ไม่สามารถโหลดข้อมูลเมนูได้',
          severity: 'error'
        });
      });
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity < 1) {
      setSnackbar({
        open: true,
        message: 'จำนวนต้องมากกว่า 0',
        severity: 'warning'
      });
      return;
    }
    
    addToCart({ ...menu, quantity, note });
    setSnackbar({
      open: true,
      message: `เพิ่ม ${menu.Name} ลงตะกร้าแล้ว!`,
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.background,
        p: 2
      }}>
        {/* Loading Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        {/* Loading Card */}
        <Card sx={{ borderRadius: '24px', overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={300} />
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" height={40} width="80%" />
            <Skeleton variant="text" height={20} width="100%" sx={{ mt: 1 }} />
            <Skeleton variant="text" height={20} width="60%" />
            <Skeleton variant="text" height={32} width="30%" sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!menu) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 2
      }}>
        <Typography variant="h5" sx={{ color: theme.text.secondary, mb: 2 }}>
          😔 ไม่พบเมนูที่คุณต้องการ
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ 
            borderRadius: '16px',
            backgroundColor: theme.secondary 
          }}
        >
          กลับหน้าหลัก
        </Button>
      </Box>
    );
  }

  const totalPrice = menu.Price * quantity;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background,
      pb: 10
    }}>
      {/* Enhanced Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: theme.gradient,
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }}
      >
        <IconButton
          onClick={() => {
            const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
            navigate(`/?table=${table}`);
          }}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            mr: 2,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="600">
          รายละเอียดเมนู
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Enhanced Menu Card */}
        <Card
          sx={{
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            backgroundColor: theme.surface,
            mb: 3
          }}
        >
          {/* Hero Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
              alt={menu.Name}
              sx={{ objectFit: 'cover' }}
            />
            
            {/* Price Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: theme.accent,
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: '20px',
                fontSize: '1.2rem',
                fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              ฿{menu.Price}
            </Box>

            {/* Category Badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
              }}
            >
              <Chip
                label={menu.Category === 'main' ? '🍖 จานหลัก' : 
                      menu.Category === 'appetizer' ? '🥗 อาหารว่าง' :
                      menu.Category === 'dessert' ? '🍰 ของหวาน' :
                      menu.Category === 'drink' ? '🥤 เครื่องดื่ม' : '🍽️ เมนูพิเศษ'}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Menu Title & Description */}
            <Typography 
              variant="h4" 
              fontWeight="700" 
              sx={{ 
                color: theme.primary,
                mb: 1,
                fontSize: '1.8rem'
              }}
            >
              {menu.Name}
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.text.secondary,
                lineHeight: 1.6,
                mb: 3
              }}
            >
              {menu.Description}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Quantity Selector */}
            <Box mb={3}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                sx={{ color: theme.primary, mb: 2 }}
              >
                🔢 จำนวน
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <ButtonGroup 
                  variant="outlined" 
                  sx={{ 
                    '& .MuiButton-root': {
                      borderRadius: '12px',
                      borderColor: theme.secondary,
                      color: theme.secondary,
                      minWidth: '48px',
                      height: '48px'
                    }
                  }}
                >
                  <Button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon />
                  </Button>
                  <Button disabled sx={{ 
                    fontWeight: '700', 
                    fontSize: '1.2rem',
                    color: `${theme.primary} !important`,
                    borderLeft: `1px solid ${theme.secondary} !important`,
                    borderRight: `1px solid ${theme.secondary} !important`
                  }}>
                    {quantity}
                  </Button>
                  <Button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 99}
                  >
                    <AddIcon />
                  </Button>
                </ButtonGroup>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.text.secondary,
                    ml: 2
                  }}
                >
                  รวม <strong style={{ color: theme.accent }}>฿{totalPrice.toLocaleString()}</strong>
                </Typography>
              </Box>
            </Box>

            {/* Note Section */}
            <Box mb={4}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                sx={{ color: theme.primary, mb: 2 }}
              >
                📝 หมายเหตุพิเศษ
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
                    '&:hover fieldset': {
                      borderColor: theme.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.secondary,
                    }
                  }
                }}
              />
            </Box>

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleAddToCart}
              sx={{
                borderRadius: '16px',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: '600',
                background: theme.gradient,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🛒 เพิ่มลงตะกร้า • ฿{totalPrice.toLocaleString()}
            </Button>
          </CardContent>
        </Card>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: '12px',
            fontWeight: '500'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuDetailPage;