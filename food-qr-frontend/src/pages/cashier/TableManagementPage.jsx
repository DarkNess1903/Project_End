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

} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BuildIcon from '@mui/icons-material/Build';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

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
  const handleOpenNotificationDialog = () => {
    setNotificationDialogOpen(true);
  };

  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  const statusLabel = {
    available: 'ว่าง',
    occupied:  'สั่งแล้ว',
    reserved:  'เสิร์ฟแล้ว',
  };

  const statusStyles = {
    available: {
      bg: 'linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%)',
      icon: <RadioButtonUncheckedIcon color="disabled" />,
    },
    occupied: {
      bg: 'linear-gradient(135deg, #fff9c4 0%, #fdd835 100%)',
      icon: <RestaurantIcon color="warning" />,
    },
    reserved: {
      bg: 'linear-gradient(135deg, #a5d6a7 0%, #4caf50 100%)',
      icon: <CheckCircleIcon color="success" />,
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
    const interval = setInterval(fetchStaffCalls, 5000); // รีเฟรชทุก 5 วิ

    return () => clearInterval(interval);
  }, []);

  
  const handleMarkAsHandled = async (callId) => {
  try {
    await axios.post('http://localhost/project_END/restaurant-backend/api/staff_call/update_status.php', {
      call_id: callId,
    });
    // รีโหลดรายการใหม่
    fetchStaffCalls(); // ฟังก์ชันที่คุณใช้โหลดรายการอยู่แล้ว
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

  // เปิด dialog แสดงเมนูปุ่มต่างๆ
  const handleOpenActionDialog = (table) => {
    // เปิด dialog เฉพาะโต๊ะสถานะ occupied หรือ reserved เท่านั้น
    if (table.Status === 'occupied' || table.Status === 'reserved') {
      setSelectedTable(table);
      setOpenActionDialog(true);
    } else {
      // อาจจะแจ้งเตือนผู้ใช้ว่าไม่สามารถจัดการโต๊ะนี้ได้
      alert('ไม่สามารถจัดการโต๊ะที่สถานะว่างได้');
    }
  };

  // ปิด dialog เมนูปุ่มต่างๆ
  const handleCloseActionDialog = () => {
    setSelectedTable(null);
    setOpenActionDialog(false);
  };

  // เปิด dialog ย้ายโต๊ะ
  const handleOpenMoveDialog = () => {
    setTargetTableId('');
    setOpenMoveDialog(true);
  };

  // ปิด dialog ย้ายโต๊ะ
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

  // ตัวอย่างฟังก์ชันสำหรับแต่ละปุ่ม (เพิ่มตามความต้องการ)
  const handleCancelTable = () => {
    alert(`ยกเลิกโต๊ะ ${selectedTable.TableNumber}`);
    // TODO: เพิ่ม logic ยกเลิกโต๊ะที่นี่
  };

  const handleClick = (orderId) => {
    if (!orderId) {
      alert('ไม่มีคำสั่งซื้อสำหรับโต๊ะนี้');
      return;
    }
    // เติม prefix /cashier
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
        // 🔁 รีเฟรชข้อมูลบิล
        handleCheckBill();
      } else {
        alert("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", error);
    }
  };

return (
  <Box display="flex" height="100vh" sx={{ bgcolor: '#f0f4f8' }}>
    <Box flex={1} p={3}>
      {/* หัวข้อ */}
      <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h4">
        จัดการโต๊ะ
      </Typography>
        <Box>
          <Tooltip title="การเรียกพนักงาน">
          <IconButton color="secondary" onClick={handleOpenNotificationDialog}>
            <Badge badgeContent={callNotifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
          <Tooltip title="รีเฟรชโต๊ะ">
            <IconButton color="primary" onClick={fetchTables}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* สรุปสถานะ */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Chip
          label={`โต๊ะทั้งหมด: ${tables.length}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`ว่าง: ${tables.filter((t) => t.Status === 'available').length}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`สั่งอาหารแล้ว: ${tables.filter((t) => t.Status === 'occupied').length}`}
          color="warning"
          variant="outlined"
        />
        <Chip
          label={`เสิร์ฟแล้ว: ${tables.filter((t) => t.Status === 'reserved').length}`}
          color="primary"
          variant="outlined"
        />
      </Paper>

      {/* ตารางแสดงโต๊ะ */}
      <Grid container spacing={3}>
        {tables.map((table) => {
          const style = statusStyles[table.Status] || {};
          return (
            <Grid item xs={6} sm={4} md={3} key={table.TableID}>
              <Tooltip
                title={`สถานะ: ${statusLabel[table.Status] || table.Status}`}
              >
                <Box
                  onClick={() => handleOpenActionDialog(table)}
                  sx={{
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 3,
                    background: style.bg || '#ddd',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.15s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    minHeight: 160,
                    textAlign: 'center',
                    bgcolor: '#fff',
                  }}
                >
                  <Box sx={{ fontSize: 48 }}>
                    {style.icon || <RadioButtonUncheckedIcon />}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    โต๊ะ {table.TableNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {statusLabel[table.Status] || table.Status}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
    
      {/* Dialog แสดงปุ่มคำสั่ง */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog}>
        <DialogTitle>
          จัดการโต๊ะ {selectedTable?.TableNumber}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            {/* TODO: ดึงเวลาที่สั่งจริงจาก backend มาแสดง */}
            เวลาที่สั่ง: {selectedTable?.OrderTime ?? 'ไม่พบข้อมูล'}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
          <Button variant="outlined" color="error" onClick={handleCancelTable}>
            ยกเลิกโต๊ะ
          </Button>
          <Button variant="outlined" onClick={handleOpenMoveDialog}>
            ย้ายเมนู / ย้ายโต๊ะ
          </Button>
          <Button variant="contained" onClick={handleCheckBill}>
            ตรวจสอบบิล
          </Button>

          {/* ปุ่มจ่ายเงิน */}
          {selectedTable?.OrderID ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleClick(selectedTable.OrderID)}
            >
              จ่ายเงิน
            </Button>
          ) : (
            <Button variant="contained" color="success" disabled>
              ไม่มีออร์เดอร์ที่ต้องจ่าย
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ย้ายโต๊ะ */}
      <Dialog open={openMoveDialog} onClose={handleCloseMoveDialog}>
        <DialogTitle>ย้ายลูกค้าจากโต๊ะ {selectedTable?.TableNumber}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>เลือกโต๊ะใหม่</InputLabel>
            <Select
              value={targetTableId}
              onChange={(e) => setTargetTableId(e.target.value)}
              label="เลือกโต๊ะใหม่"
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
        <DialogActions>
          <Button onClick={handleCloseMoveDialog}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleMoveTable}
            disabled={!targetTableId}
          >
            ยืนยันการย้าย
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog เรียกพนักงาน */}
        <Dialog open={notificationDialogOpen} onClose={handleCloseNotificationDialog} fullWidth maxWidth="sm">
          <DialogTitle>การเรียกพนักงาน</DialogTitle>
          <DialogContent dividers>
            {callNotifications.length === 0 ? (
              <Typography align="center" color="textSecondary">
                ไม่มีรายการเรียกพนักงานในขณะนี้
              </Typography>
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
                      secondaryAction={
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => handleMarkAsHandled(call.call_id)}
                        >
                          เคลียร์แล้ว
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <IconComponent color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`โต๊ะ ${call.table_number}`}
                        secondary={`ข้อความ: ${message}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNotificationDialog}>ปิด</Button>
          </DialogActions>
        </Dialog>

      {/* Dialog บิล */}
        <Dialog open={billDialogOpen} onClose={() => setBillDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>บิลของโต๊ะ {selectedTable?.TableNumber}</DialogTitle>
          <DialogContent>
            {billData ? (
              <>
                <Typography variant="subtitle1">เวลาสั่ง: {billData.order.OrderTime}</Typography>
                <Typography variant="subtitle1">จำนวนเมนู: {billData.items.length}</Typography>
                <Typography variant="subtitle1">ยอดรวม: ฿{parseFloat(billData.order.TotalAmount).toFixed(2)}</Typography>
                
                <Divider sx={{ my: 2 }} />

                <List>
                  {billData.items.map((item) => (
                    <ListItem key={item.OrderItemID} alignItems="flex-start" sx={{ mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={`http://localhost/project_END/restaurant-backend/${item.ImageURL}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${item.MenuName} x ${item.Quantity}`}
                        secondary={
                          <>
                            หมายเหตุ: {item.Note || "-"}<br />
                            ราคา: ฿{parseFloat(item.SubTotal).toFixed(2)}
                          </>
                        }
                      />
                      <Button
                        variant="outlined"
                        color={item.Status === "served" ? "success" : "warning"}
                        onClick={() => handleToggleItemStatus(item.OrderItemID, item.Status)}
                      >
                        {item.Status === "served" ? "เสิร์ฟแล้ว" : "กำลังทำ → เสิร์ฟ"}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography>กำลังโหลด...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBillDialogOpen(false)}>ปิด</Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default TableManagementPage;
