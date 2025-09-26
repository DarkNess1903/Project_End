import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup,
  Chip,
  Divider,  
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount, updateNote } = useCart();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [note, setNote] = useState('');
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const handleAddMore = () => {
    navigate("/menu"); // เปลี่ยนเส้นทางไปหน้าสั่งอาหาร
  };

  // สี theme เดียวกันกับหน้าอื่นๆ
  const theme = {
    primary: '#2E3440',
    secondary: '#5E81AC',
    accent: '#D08770',
    success: '#A3BE8C',
    warning: '#EBCB8B',
    error: '#BF616A',
    background: '#ECEFF4',
    surface: '#FFFFFF',
    text: {
      primary: '#2E3440',
      secondary: '#4C566A',
      light: '#D8DEE9'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  const handleOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    const table = parseInt(localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0');

    try {
      // 1️⃣ เช็คว่ามี order ค้างอยู่หรือไม่
      const checkRes = await axios.get(
        `http://localhost/project_END/restaurant-backend/api/orders/get_order_by_table.php?table_id=${table}`
      );

      let orderId = null;
      if (checkRes.data.success && checkRes.data.order && checkRes.data.order.Status !== 'paid') {
        // มี order pending → ใช้ออร์เดอร์เดิม
        orderId = checkRes.data.order.OrderID;
      }

      // 2️⃣ เตรียม payload items
      const payload = {
        items: items.map(item => ({
          menu_id: item.MenuID,
          quantity: Number(item.quantity), // ให้แน่ใจว่าเป็น number
          note: item.note || ''
        }))
      };

      let res;

      if (orderId) {
        // ✅ มี order อยู่แล้ว → เพิ่มรายการ
        res = await axios.post(
          'http://localhost/project_END/restaurant-backend/api/orders/add_items.php',
          { order_id: orderId, ...payload },
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // ✅ ยังไม่มี order → สร้างใหม่
        res = await axios.post(
          'http://localhost/project_END/restaurant-backend/api/orders/create.php',
          { table_id: table, ...payload },
          { headers: { 'Content-Type': 'application/json' } }
        );
        orderId = res.data.order_id; // อัปเดต orderId สำหรับแสดง
      }

      // 3️⃣ แจ้งผลลัพธ์
      if (res.data.success) {
        setSnackbar({
          open: true,
          message: `🎉 สั่งอาหารเรียบร้อย! หมายเลขออร์เดอร์: ${orderId}`,
          severity: 'success'
        });
        clearCart();
        setTimeout(() => navigate(`/?table=${table}`), 2000);
      } else {
        setSnackbar({
          open: true,
          message: `❌ เกิดข้อผิดพลาด: ${res.data.error || res.data.message || 'ไม่ทราบสาเหตุ'}`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setSnackbar({
        open: true,
        message: '❌ เกิดข้อผิดพลาดในการสั่งอาหาร',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (item) => {
    setSelectedItem(item);
    setNote(item.note || '');
    setOpenNoteDialog(true);
  };

  const handleSaveNote = () => {
    if (selectedItem) {
      updateNote(selectedItem.MenuID, note);
      setSnackbar({
        open: true,
        message: '✅ อัปเดตหมายเหตุเรียบร้อย',
        severity: 'success'
      });
    }
    setOpenNoteDialog(false);
    setSelectedItem(null);
    setNote('');
  };

  const handleQuantityChange = (menuId, change) => {
    const item = items.find(i => i.MenuID === menuId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1 && newQuantity <= 99) {
        updateQuantity(menuId, newQuantity);
      }
    }
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbar({
      open: true,
      message: '🗑️ ล้างตะกร้าเรียบร้อย',
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      pb: 2
    }}>
      {/* Enhanced Header */}
      <Box
        sx={{
          background: theme.gradient,
          color: 'white',
          p: 2,
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          mb: 3
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
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
            <Box>
              <Typography variant="h5" fontWeight="700">
                🛒 ตะกร้าของคุณ
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {items.length} รายการ
              </Typography>
            </Box>
          </Box>

          {items.length > 0 && (
            <IconButton
              onClick={handleClearCart}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <ClearAllIcon />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box sx={{ px: 2, maxWidth: 600, margin: 'auto' }}>
        {/* Empty Cart State */}
        {items.length === 0 ? (
          <Card
            sx={{
              borderRadius: '24px',
              textAlign: 'center',
              py: 6,
              background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.background} 100%)`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>
                🛒
              </Typography>
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{ color: theme.primary, mb: 1 }}
              >
                ตะกร้าว่างเปล่า
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.text.secondary, mb: 3 }}
              >
                เลือกเมนูอร่อยๆ จากหน้าหลักกันเถอะ!
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  const table = localStorage.getItem('tableName')?.replace('โต๊ะ ', '') || '0';
                  navigate(`/?table=${table}`);
                }}
                sx={{
                  borderRadius: '16px',
                  px: 4,
                  py: 1.5,
                  background: theme.gradient,
                  fontWeight: '600'
                }}
              >
                เลือกเมนู
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2} mb={3}>
            {items.map(item => (
              <Card
                key={item.MenuID}
                sx={{
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  backgroundColor: theme.surface,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                  {/* รูปภาพเมนู */}
                  <Box
                    component="img"
                    src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
                    alt={item.Name}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '16px',
                      objectFit: 'cover',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />

                  {/* รายละเอียดเมนู */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{
                        color: theme.primary,
                        fontSize: '1.1rem',
                        mb: 0.5
                      }}
                    >
                      {item.Name}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.accent,
                        fontWeight: '600',
                        mb: 1
                      }}
                    >
                      {item.Price.toLocaleString()} × {item.quantity} = ฿{(item.Price * item.quantity).toLocaleString()}
                    </Typography>


                    {item.note && (
                      <Chip
                        label={`📝 ${item.note}`}
                        size="small"
                        sx={{
                          backgroundColor: `${theme.secondary}15`,
                          color: theme.secondary,
                          fontSize: '0.8rem',
                          mb: 1,
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    )}

                    {/* Controls */}
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      {/* Quantity Controls */}
                      <ButtonGroup
                        size="small"
                        sx={{
                          '& .MuiButton-root': {
                            borderRadius: '8px',
                            borderColor: theme.secondary,
                            color: theme.secondary,
                            minWidth: '36px',
                            height: '36px'
                          }
                        }}
                      >
                        <Button
                          onClick={() => handleQuantityChange(item.MenuID, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button disabled sx={{
                          fontWeight: '600',
                          color: `${theme.primary} !important`,
                          borderLeft: `1px solid ${theme.secondary} !important`,
                          borderRight: `1px solid ${theme.secondary} !important`
                        }}>
                          {item.quantity}
                        </Button>
                        <Button
                          onClick={() => handleQuantityChange(item.MenuID, 1)}
                          disabled={item.quantity >= 99}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>

                      {/* Edit Note Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditNote(item)}
                        startIcon={<EditIcon />}
                        sx={{
                          borderRadius: '8px',
                          borderColor: theme.secondary,
                          color: theme.secondary,
                          fontSize: '0.8rem',
                          '&:hover': {
                            backgroundColor: `${theme.secondary}10`,
                            borderColor: theme.secondary
                          }
                        }}
                      >
                        แก้ไข
                      </Button>

                      {/* Delete Button */}
                      <IconButton
                        onClick={() => removeFromCart(item.MenuID)}
                        sx={{
                          color: theme.error,
                          backgroundColor: `${theme.error}10`,
                          '&:hover': { backgroundColor: `${theme.error}20` }
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {/* Order Summary */}
        {items.length > 0 && (
          <>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 3,
                background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.background} 100%)`
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ color: theme.primary, mb: 2 }}
                >
                  สรุปคำสั่งซื้อ
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ color: theme.text.secondary }}>
                    จำนวนรายการ:
                  </Typography>
                  <Typography fontWeight="500">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} รายการ
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="700" sx={{ color: theme.primary }}>
                    ยอดรวมทั้งสิ้น:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{
                      color: theme.accent,
                      background: `linear-gradient(45deg, ${theme.accent}, ${theme.warning})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    ฿{totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Order Buttons */}
            <Box display="flex" gap={2}>
              {/* ปุ่มสั่งอาหารเพิ่มเติม */}
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleAddMore} // ฟังก์ชันเพิ่มเมนู
                sx={{
                  py: 2,
                  borderRadius: '16px',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: theme.primary,
                  borderColor: theme.primary,
                  '&:hover': {
                    background: theme.primary,
                    color: '#fff',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <AddCircleOutlineIcon />
                เพิ่มเมนู
              </Button>

              {/* ปุ่มยืนยันคำสั่งซื้อ */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleOrder}
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: '16px',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  background: theme.gradient,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  },
                  '&:disabled': {
                    background: theme.text.light,
                    color: theme.text.secondary,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    กำลังส่งคำสั่ง...
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    onClick={() => {
                      const confirmOrder = window.confirm(
                        "⚠️ คุณแน่ใจที่จะยืนยันคำสั่งซื้อหรือไม่?\nหลังจากยืนยันแล้วจะไม่สามารถแก้ไขเมนูหรือยกเลิกเมนูได้"
                      );
                      if (confirmOrder) {
                        handleOrder();
                      }
                    }}
                    disabled={loading || items.length === 0}
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <CheckCircleIcon />
                    ยืนยันคำสั่งซื้อ
                  </Box>
                )}
              </Button>
            </Box>
          </>
        )}
      </Box>
      {/* Note Edit Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '1.3rem',
          color: theme.primary
        }}>
          📝 แก้ไขหมายเหตุ
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedItem && (
            <Box mb={2}>
              <Typography variant="body1" fontWeight="600" sx={{ color: theme.primary }}>
                {selectedItem.Name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.text.secondary }}>
                ฿{selectedItem.Price} × {selectedItem.quantity}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="หมายเหตุพิเศษ"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ระบุความต้องการพิเศษ เช่น ไม่ใส่ผัก, เผ็ดน้อย, เพิ่มข้าว..."
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenNoteDialog(false)}
            sx={{
              borderRadius: '12px',
              color: theme.text.secondary
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            sx={{
              borderRadius: '12px',
              px: 3,
              backgroundColor: theme.secondary,
              '&:hover': { backgroundColor: theme.primary }
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            borderRadius: '16px',
            fontWeight: '500',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;