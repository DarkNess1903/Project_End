import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Chip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  ListItemAvatar,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BuildIcon from '@mui/icons-material/Build';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import TimerIcon from '@mui/icons-material/Timer';

const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');
  const [callNotifications, setCallNotifications] = useState([]);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billData, setBillData] = useState(null);

  const navigate = useNavigate();

  // ธีมสีแบบเดียวกับ Layout
  const themeColors = {
    primary: '#1565c0',
    primaryLight: '#1976d2',
    secondary: '#37474f',
    background: '#f8fafc',
    surface: '#ffffff',
    textPrimary: '#263238',
    textSecondary: '#546e7a',
    success: '#2e7d32',
    warning: '#f57c00',
    error: '#d32f2f',
    divider: '#e1e5e9',
  };

  const handleOpenNotificationDialog = () => {
    setNotificationDialogOpen(true);
  };

  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  const statusLabel = {
    available: 'ว่าง',
    occupied: 'สั่งแล้ว',
    reserved: 'เสิร์ฟแล้ว',
  };

  const statusStyles = {
    available: {
      bg: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      borderColor: themeColors.divider,
      icon: <RadioButtonUncheckedIcon sx={{ fontSize: 48, color: '#90a4ae' }} />,
      chipColor: 'default',
    },
    occupied: {
      bg: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
      borderColor: themeColors.warning,
      icon: <RestaurantIcon sx={{ fontSize: 48, color: themeColors.warning }} />,
      chipColor: 'warning',
    },
    reserved: {
      bg: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      borderColor: themeColors.success,
      icon: <CheckCircleIcon sx={{ fontSize: 48, color: themeColors.success }} />,
      chipColor: 'success',
    },
  };

  const fetchStaffCalls = async () => {
    try {
      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/staff_call/read.php');
      if (res.data.success) {
        setCallNotifications(res.data.data);
      }
    } catch (err) {
      console.error('โหลดข้อมูลเรียกพนักงานล้มเหลว:', err);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchStaffCalls();
    const interval = setInterval(fetchStaffCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsHandled = async (callId) => {
    try {
      await axios.post('http://localhost/project_END/restaurant-backend/api/staff_call/update_status.php', {
        call_id: callId,
      });
      fetchStaffCalls();
    } catch (err) {
      console.error('อัปเดตสถานะล้มเหลว:', err);
      alert('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/tables/index.php');
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenActionDialog = (table) => {
    if (table.Status === 'occupied' || table.Status === 'reserved') {
      setSelectedTable(table);
      setOpenActionDialog(true);
    } else {
      alert('ไม่สามารถจัดการโต๊ะที่สถานะว่างได้');
    }
  };

  const handleCloseActionDialog = () => {
    setSelectedTable(null);
    setOpenActionDialog(false);
  };

  const handleOpenMoveDialog = () => {
    setTargetTableId('');
    setOpenMoveDialog(true);
  };

  const handleCloseMoveDialog = () => {
    setOpenMoveDialog(false);
  };

  const handleMoveTable = async () => {
    try {
      await axios.post('http://localhost/project_END/restaurant-backend/api/tables/move.php', {
        fromTableId: selectedTable.TableID,
        toTableId: targetTableId,
      });
      setOpenMoveDialog(false);
      setOpenActionDialog(false);
      fetchTables();
    } catch (err) {
      alert(err?.response?.data?.error || 'เกิดข้อผิดพลาด');
      console.error(err);
    }
  };

  const handleCancelTable = () => {
    alert(`ยกเลิกโต๊ะ ${selectedTable.TableNumber}`);
  };

  const handleClick = (orderId) => {
    if (!orderId) {
      alert('ไม่มีคำสั่งซื้อสำหรับโต๊ะนี้');
      return;
    }
    navigate(`/cashier/payment/${orderId}`);
  };

  const handleCheckBill = async () => {
    if (!selectedTable) return;
    try {
      const res = await axios.get(`http://localhost/project_END/restaurant-backend/api/orders/get_order_by_table.php?table_id=${selectedTable.TableID}`);
      if (res.data.success) {
        setBillData(res.data);
        setBillDialogOpen(true);
      } else {
        alert('ไม่พบข้อมูลบิลของโต๊ะนี้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลบิล');
    }
  };

  const handleToggleItemStatus = async (orderItemID, currentStatus) => {
    const newStatus = currentStatus === "served" ? "cooking" : "served";

    try {
      const response = await axios.post(
        "http://localhost/project_END/restaurant-backend/api/orders/update_item_status.php",
        {
          order_item_id: orderItemID,
          status: newStatus,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        console.log("อัปเดตสถานะสำเร็จ:", response.data);
        handleCheckBill();
      } else {
        alert("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", error);
    }
  };

  return (
    <Box sx={{ bgcolor: themeColors.background, minHeight: '100vh', p: 3 }}>
      {/* Header Section */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 3, 
          border: `1px solid ${themeColors.divider}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TableRestaurantIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" color={themeColors.textPrimary}>
                  จัดการโต๊ะ
                </Typography>
                <Typography variant="subtitle1" color={themeColors.textSecondary}>
                  ระบบจัดการโต๊ะและออเดอร์
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Tooltip title="การเรียกพนักงาน">
                <IconButton 
                  color="error" 
                  onClick={handleOpenNotificationDialog}
                  sx={{ 
                    width: 56, 
                    height: 56,
                    borderRadius: 2,
                    bgcolor: callNotifications.length > 0 ? '#ffebee' : 'transparent',
                  }}
                >
                  <Badge badgeContent={callNotifications.length} color="error">
                    <NotificationsIcon sx={{ fontSize: 28 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="รีเฟรชโต๊ะ">
                <IconButton 
                  color="primary" 
                  onClick={fetchTables}
                  sx={{ 
                    width: 56, 
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#e3f2fd',
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          border: `1px solid ${themeColors.divider}`,
          background: themeColors.surface,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" mb={2} color={themeColors.textPrimary}>
            สรุปสถานะโต๊ะ
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="700" color={themeColors.primary}>
                  {tables.length}
                </Typography>
                <Typography variant="body1" color={themeColors.textSecondary}>
                  โต๊ะทั้งหมด
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="700" color={themeColors.success}>
                  {tables.filter((t) => t.Status === 'available').length}
                </Typography>
                <Typography variant="body1" color={themeColors.textSecondary}>
                  โต๊ะว่าง
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="700" color={themeColors.warning}>
                  {tables.filter((t) => t.Status === 'occupied').length}
                </Typography>
                <Typography variant="body1" color={themeColors.textSecondary}>
                  สั่งแล้ว
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="700" color={themeColors.primary}>
                  {tables.filter((t) => t.Status === 'reserved').length}
                </Typography>
                <Typography variant="body1" color={themeColors.textSecondary}>
                  เสิร์ฟแล้ว
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <Grid container spacing={3}>
        {tables.map((table) => {
          const style = statusStyles[table.Status] || {};
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={table.TableID}>
              <Card
                onClick={() => handleOpenActionDialog(table)}
                elevation={0}
                sx={{
                  cursor: table.Status !== 'available' ? 'pointer' : 'default',
                  borderRadius: 3,
                  border: `2px solid ${style.borderColor || themeColors.divider}`,
                  background: style.bg || '#f5f5f5',
                  transition: 'all 0.3s ease-in-out',
                  minHeight: 200,
                  '&:hover': table.Status !== 'available' ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    borderColor: themeColors.primary,
                  } : {},
                }}
              >
                <CardContent 
                  sx={{ 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                  }}
                >
                  {/* Icon */}
                  <Box sx={{ mb: 2 }}>
                    {style.icon || <RadioButtonUncheckedIcon sx={{ fontSize: 48 }} />}
                  </Box>
                  
                  {/* Table Number */}
                  <Typography 
                    variant="h5" 
                    fontWeight="700"
                    color={themeColors.textPrimary}
                    sx={{ mb: 1 }}
                  >
                    โต๊ะ {table.TableNumber}
                  </Typography>
                  
                  {/* Status Chip */}
                  <Chip
                    label={statusLabel[table.Status] || table.Status}
                    color={style.chipColor || 'default'}
                    size="small"
                    sx={{
                      fontWeight: '600',
                      fontSize: '12px',
                      borderRadius: 2,
                    }}
                  />
                  
                  {/* Additional Info for Occupied/Reserved Tables */}
                  {(table.Status === 'occupied' || table.Status === 'reserved') && (
                    <Box sx={{ mt: 1, width: '100%' }}>
                      <Typography variant="caption" color={themeColors.textSecondary}>
                        แตะเพื่อจัดการ
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Action Dialog */}
      <Dialog 
        open={openActionDialog} 
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: 400,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <TableRestaurantIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="600">
                จัดการโต๊ะ {selectedTable?.TableNumber}
              </Typography>
              <Typography variant="body2" color={themeColors.textSecondary}>
                เวลาที่สั่ง: {selectedTable?.OrderTime ?? 'ไม่พบข้อมูล'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={handleCancelTable}
              sx={{ 
                py: 2,
                borderRadius: 2,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              ยกเลิกโต๊ะ
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<SwapHorizIcon />}
              onClick={handleOpenMoveDialog}
              sx={{ 
                py: 2,
                borderRadius: 2,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              ย้ายเมนู / ย้ายโต๊ะ
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={handleCheckBill}
              sx={{ 
                py: 2,
                borderRadius: 2,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              ตรวจสอบบิล
            </Button>

            {selectedTable?.OrderID ? (
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={() => handleClick(selectedTable.OrderID)}
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                จ่ายเงิน
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                size="large"
                disabled
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  fontSize: '16px',
                }}
              >
                ไม่มีออร์เดอร์ที่ต้องจ่าย
              </Button>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseActionDialog}
            size="large"
            sx={{ 
              px: 4,
              borderRadius: 2,
              fontSize: '16px',
            }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Table Dialog */}
      <Dialog 
        open={openMoveDialog} 
        onClose={handleCloseMoveDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          ย้ายลูกค้าจากโต๊ะ {selectedTable?.TableNumber}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>เลือกโต๊ะใหม่</InputLabel>
            <Select
              value={targetTableId}
              onChange={(e) => setTargetTableId(e.target.value)}
              label="เลือกโต๊ะใหม่"
              sx={{ borderRadius: 2 }}
            >
              {tables
                .filter(
                  (t) =>
                    t.Status === 'empty' && t.TableID !== selectedTable?.TableID
                )
                .map((t) => (
                  <MenuItem key={t.TableID} value={t.TableID}>
                    โต๊ะ {t.TableNumber}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseMoveDialog}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleMoveTable}
            disabled={!targetTableId}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            ยืนยันการย้าย
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Call Dialog */}
      <Dialog 
        open={notificationDialogOpen} 
        onClose={handleCloseNotificationDialog} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <NotificationsIcon color="error" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="600">
              การเรียกพนักงาน
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {callNotifications.length === 0 ? (
            <Box textAlign="center" py={4}>
              <PeopleIcon sx={{ fontSize: 64, color: themeColors.textSecondary, mb: 2 }} />
              <Typography variant="h6" color={themeColors.textSecondary}>
                ไม่มีรายการเรียกพนักงานในขณะนี้
              </Typography>
            </Box>
          ) : (
            <List>
              {callNotifications.map((call) => {
                let IconComponent = ChatBubbleOutlineIcon;
                const message = call.message || "";

                if (message.includes('อุปกรณ์')) {
                  IconComponent = BuildIcon;
                } else if (message.includes('ปรับอากาศ')) {
                  IconComponent = AcUnitIcon;
                }

                return (
                  <ListItem
                    key={call.call_id}
                    divider
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: '#fff3e0',
                      '&:hover': {
                        bgcolor: '#ffe0b2',
                      },
                    }}
                    secondaryAction={
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleMarkAsHandled(call.call_id)}
                        sx={{ borderRadius: 2 }}
                      >
                        เคลียร์แล้ว
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <IconComponent color="primary" sx={{ fontSize: 32 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="600">
                          โต๊ะ {call.table_number}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body1" color={themeColors.textSecondary}>
                          {message}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseNotificationDialog}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog 
        open={billDialogOpen} 
        onClose={() => setBillDialogOpen(false)} 
        fullWidth 
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ReceiptIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="600">
              บิลของโต๊ะ {selectedTable?.TableNumber}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {billData ? (
            <>
              {/* Bill Summary */}
              <Card elevation={0} sx={{ mb: 3, bgcolor: themeColors.background, borderRadius: 2 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TimerIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color={themeColors.textSecondary}>
                            เวลาสั่ง
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {billData.order.OrderTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <RestaurantIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color={themeColors.textSecondary}>
                            จำนวนเมนู
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {billData.items.length} รายการ
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PaymentIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color={themeColors.textSecondary}>
                            ยอดรวม
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color={themeColors.primary}>
                            ฿{parseFloat(billData.order.TotalAmount).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Items List */}
              <Typography variant="h6" fontWeight="600" mb={2}>
                รายการอาหาร
              </Typography>
              
              <List sx={{ bgcolor: themeColors.surface, borderRadius: 2 }}>
                {billData.items.map((item, index) => (
                  <ListItem 
                    key={item.OrderItemID} 
                    alignItems="flex-start" 
                    sx={{ 
                      mb: 1,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: themeColors.background,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
                        sx={{ width: 64, height: 64, borderRadius: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ ml: 2 }}
                      primary={
                        <Typography variant="h6" fontWeight="600">
                          {item.MenuName} x {item.Quantity}
                        </Typography>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color={themeColors.textSecondary} mb={1}>
                            หมายเหตุ: {item.Note || "ไม่มี"}
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color={themeColors.primary}>
                            ฿{parseFloat(item.SubTotal).toFixed(2)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant={item.Status === "served" ? "contained" : "outlined"}
                      color={item.Status === "served" ? "success" : "warning"}
                      size="large"
                      onClick={() => handleToggleItemStatus(item.OrderItemID, item.Status)}
                      sx={{ 
                        borderRadius: 2,
                        minWidth: 140,
                        fontWeight: '600',
                      }}
                    >
                      {item.Status === "served" ? "เสิร์ฟแล้ว" : "กำลังทำ → เสิร์ฟ"}
                    </Button>
                  </ListItem>
                ))}
              </List>

              {/* Progress Indicator */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" fontWeight="600">
                    ความคืบหน้าการเสิร์ฟ
                  </Typography>
                  <Typography variant="body2" color={themeColors.textSecondary}>
                    {billData.items.filter(item => item.Status === "served").length}/{billData.items.length} รายการ
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(billData.items.filter(item => item.Status === "served").length / billData.items.length) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: themeColors.divider,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: themeColors.success,
                    },
                  }}
                />
              </Box>
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={themeColors.textSecondary}>
                กำลังโหลดข้อมูลบิล...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBillDialogOpen(false)}
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
            }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableManagementPage;