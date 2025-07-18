import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');

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

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get(
        'http://localhost/project_END/restaurant-backend/api/tables/index.php'
      );
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // เปิด dialog แสดงเมนูปุ่มต่างๆ
  const handleOpenActionDialog = (table) => {
    setSelectedTable(table);
    setOpenActionDialog(true);
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
      await axios.post(
        'http://localhost/project_END/restaurant-backend/api/tables/move.php',
        {
          fromTableId: selectedTable.TableID,
          toTableId: targetTableId,
        }
      );
      setOpenMoveDialog(false);
      setOpenActionDialog(false);
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  // ตัวอย่างฟังก์ชันสำหรับแต่ละปุ่ม (เพิ่มตามความต้องการ)
  const handleCancelTable = () => {
    alert(`ยกเลิกโต๊ะ ${selectedTable.TableNumber}`);
    // TODO: เพิ่ม logic ยกเลิกโต๊ะที่นี่
  };

  const handleCombineTable = () => {
    alert(`รวมโต๊ะกับโต๊ะอื่นๆ (โต๊ะ ${selectedTable.TableNumber})`);
    // TODO: เพิ่ม logic รวมโต๊ะที่นี่
  };

  const handlePrintInvoice = () => {
    alert(`พิมพ์ใบแจ้งหนี้พร้อม QR Code โต๊ะ ${selectedTable.TableNumber}`);
    // TODO: เพิ่ม logic พิมพ์ใบแจ้งหนี้ที่นี่
  };

  const handlePayBill = () => {
    alert(`จ่ายเงินโต๊ะ ${selectedTable.TableNumber}`);
    // TODO: เพิ่ม logic จ่ายเงินที่นี่
  };

  const handleCheckBill = () => {
    alert(`ตรวจสอบบิลโต๊ะ ${selectedTable.TableNumber}`);
    // TODO: เพิ่ม logic ตรวจสอบบิลที่นี่
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
        <Tooltip title="รีเฟรชโต๊ะ">
          <IconButton color="primary" onClick={fetchTables}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
          <Typography variant="caption" display="block" color="text.secondary">
            {/* ตัวอย่าง แสดงเวลาที่สั่ง */}
            เวลาที่สั่ง: 12:30 น. {/* TODO: ดึงข้อมูลเวลาจริงจาก backend */}
          </Typography>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}
        >
          <Button variant="outlined" color="error" onClick={handleCancelTable}>
            ยกเลิกโต๊ะ
          </Button>
          <Button variant="outlined" onClick={handleOpenMoveDialog}>
            ย้ายเมนู / ย้ายโต๊ะ
          </Button>
          <Button variant="outlined" onClick={handleCombineTable}>
            รวมโต๊ะ
          </Button>
          <Button variant="outlined" onClick={handlePrintInvoice}>
            พิมพ์ใบแจ้งหนี้พร้อม QR Code
          </Button>
          <Button variant="contained" color="primary" onClick={handlePayBill}>
            จ่ายเงิน
          </Button>
          <Button variant="contained" onClick={handleCheckBill}>
            ตรวจสอบบิล
          </Button>
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
                .filter((t) => t.TableID !== selectedTable?.TableID)
                .map((t) => (
                  <MenuItem key={t.TableID} value={t.TableID}>
                    โต๊ะ {t.TableNumber} ({statusLabel[t.Status] || t.Status})
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
    </Box>
  );
};

export default TableManagementPage;
