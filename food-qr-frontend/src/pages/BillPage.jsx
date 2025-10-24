import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Chip,
  Container,
  Paper
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PaymentIcon from '@mui/icons-material/Payment';

// Modern Minimal Theme
const theme = {
  primary: '#1a1a1a',
  secondary: '#666666',
  accent: '#4A90E2', 
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    light: '#999999'
  },
  shadow: '0 2px 12px rgba(0,0,0,0.08)',
  borderRadius: '12px'
};

const BillPage = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table') || '0';
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`http://localhost/project_END/restaurant-backend/api/orders/get_current.php?table_id=${tableId}`);
        if (res.data.success) {
          setOrderItems(res.data.items);
          setTotalAmount(res.data.total_amount);
        }
      } catch (err) {
        console.error('Error fetching bill:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [tableId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'served': return theme.success;
      case 'preparing': return theme.warning;
      default: return theme.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'served': return 'เสิร์ฟแล้ว';
      case 'preparing': return 'กำลังทำ';
      default: return 'รอดำเนินการ';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: theme.background
      }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress 
            size={48} 
            sx={{ color: theme.accent }}
          />
          <Typography 
            variant="body1" 
            sx={{ color: theme.text.secondary }}
          >
            กำลังโหลดใบเสร็จ...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (orderItems.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.background,
        padding: 2
      }}>
        <Container maxWidth="sm">
          <Stack spacing={3} alignItems="center" sx={{ pt: 8 }}>
            <RestaurantIcon 
              sx={{ 
                fontSize: 80, 
                color: theme.text.light,
                opacity: 0.5 
              }} 
            />
            <Typography 
              variant="h6" 
              align="center"
              sx={{ 
                color: theme.text.secondary,
                fontWeight: 500
              }}
            >
              ไม่พบรายการอาหารในโต๊ะนี้
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
                navigate(`/?table=${table}`);
              }}
              sx={{
                borderColor: theme.accent,
                color: theme.accent,
                '&:hover': {
                  borderColor: theme.accent,
                  backgroundColor: `${theme.accent}10`
                }
              }}
            >
              กลับไปสั่งอาหาร
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background,
      pb: 10 // Space for bottom navigation
    }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: theme.surface,
          borderBottom: `1px solid ${theme.background}`,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Container maxWidth="sm">
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={2}
            sx={{ py: 2 }}
          >
            <IconButton
              onClick={() => {
                const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
                navigate(`/?table=${table}`);
              }}
              sx={{ 
                color: theme.text.primary,
                '&:hover': { backgroundColor: `${theme.accent}10` }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
              <ReceiptLongIcon sx={{ color: theme.accent, fontSize: 28 }} />
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.text.primary,
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  บิลรายการอาหาร
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.text.secondary,
                    fontSize: '0.85rem'
                  }}
                >
                  โต๊ะ {tableId}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* Order Items */}
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        <Stack spacing={2}>
          {/* Items Header */}
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.text.secondary,
              fontWeight: 600,
              px: 1
            }}
          >
            รายการอาหาร ({orderItems.length} รายการ)
          </Typography>

          {/* Items List */}
          {orderItems.map((item, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                backgroundColor: theme.surface,
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.background}`,
                '&:hover': {
                  boxShadow: theme.shadow,
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack spacing={2}>
                  {/* Item Header */}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          color: theme.text.primary,
                          fontWeight: 600,
                          mb: 0.5
                        }}
                      >
                        {item.Name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.text.secondary,
                          fontSize: '0.9rem'
                        }}
                      >
                        จำนวน: {item.Quantity} × ฿{item.Price.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: theme.text.primary,
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}
                    >
                      ฿{(item.Price * item.Quantity).toFixed(2)}
                    </Typography>
                  </Stack>

                  {/* Status */}
                  <Stack direction="row" justifyContent="flex-end">
                    <Chip
                      label={getStatusText(item.Status)}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(item.Status)}15`,
                        color: getStatusColor(item.Status),
                        fontWeight: 600,
                        border: `1px solid ${getStatusColor(item.Status)}30`,
                        height: 28
                      }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {/* Total Section */}
          <Card
            elevation={0}
            sx={{
              backgroundColor: theme.surface,
              borderRadius: theme.borderRadius,
              border: `2px solid ${theme.accent}20`,
              mt: 2
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.text.primary,
                    fontWeight: 700
                  }}
                >
                  รวมทั้งหมด
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: theme.accent,
                    fontWeight: 800
                  }}
                >
                  ฿{totalAmount.toFixed(2)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Bottom Payment Button */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.surface,
          borderTop: `1px solid ${theme.background}`,
          zIndex: 100
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PaymentIcon />}
              onClick={() => navigate(`/payment?table=${tableId}`)}
              sx={{
                backgroundColor: theme.accent,
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                py: 1.5,
                borderRadius: theme.borderRadius,
                boxShadow: theme.shadow,
                '&:hover': {
                  backgroundColor: theme.accent,
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(74, 144, 226, 0.3)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              ดำเนินการชำระเงิน
            </Button>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default BillPage;