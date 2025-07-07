import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_URL = 'http://localhost/project_END/restaurant-backend/api/tables';

const statusOptions = [
  { value: 'available', label: 'ว่าง' },
  { value: 'occupied', label: 'มีลูกค้า' },
  { value: 'reserved', label: 'จองแล้ว' },
];

const TableQRManagement = () => {
  const [tables, setTables] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [form, setForm] = useState({ TableNumber: '', Capacity: '', Status: 'available' });

  // สำหรับ dialog พิมพ์ QR
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printTable, setPrintTable] = useState(null);

  // ดึงข้อมูลโต๊ะทั้งหมด
  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/index.php`);
      setTables(res.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenDialog = (table = null) => {
    setEditTable(table);
    setForm({
      TableNumber: table?.TableNumber || '',
      Capacity: table?.Capacity || '',
      Status: table?.Status || 'available',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ TableNumber: '', Capacity: '', Status: 'available' });
    setEditTable(null);
  };

  const handleSaveTable = async () => {
    try {
      if (!form.TableNumber || !form.Capacity) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      if (editTable) {
        await axios.post(`${API_URL}/update.php`, {
          TableID: editTable.TableID,
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
          Status: form.Status,
        });
      } else {
        await axios.post(`${API_URL}/create.php`, {
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
          Status: 'available',
        });
      }

      fetchTables();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving table:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโต๊ะนี้?')) {
      try {
        await axios.post(`${API_URL}/delete.php`, { TableID: id });
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        alert('เกิดข้อผิดพลาดในการลบโต๊ะ');
      }
    }
  };

  // เปิด dialog พิมพ์ QR
  const handleOpenQRDialog = (table) => {
    setPrintTable(table);
    setPrintDialogOpen(true);
  };

  // ปิด dialog พิมพ์ QR
  const handleCloseQRDialog = () => {
    setPrintDialogOpen(false);
    setPrintTable(null);
  };

  // ฟังก์ชันพิมพ์ QR Code
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">จัดการโต๊ะอาหาร</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          เพิ่มโต๊ะใหม่
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tables.map((table) => {
          const fullUrl = `${window.location.origin}/?table=${table.TableNumber}`;
          return (
            <Grid item xs={12} sm={6} md={4} key={table.TableID}>
              <Paper sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
                <Typography variant="h6">โต๊ะ {table.TableNumber}</Typography>
                <Typography variant="body2">ความจุ: {table.Capacity} คน</Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                  สถานะ: {statusOptions.find(opt => opt.value === table.Status)?.label || table.Status}
                </Typography>
                <Box mt={1}>
                  <QRCodeCanvas value={fullUrl} size={180} />
                </Box>
                <Typography variant="caption" sx={{ wordBreak: 'break-all', mt: 1 }}>
                  {fullUrl}
                </Typography>
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(table)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteTable(table.TableID)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => handleOpenQRDialog(table)}
                >
                  พิมพ์ QR Code
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog เพิ่ม/แก้ไขโต๊ะ */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editTable ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะ'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="หมายเลขโต๊ะ"
              value={form.TableNumber}
              onChange={(e) => setForm({ ...form, TableNumber: e.target.value })}
              type="number"
              fullWidth
            />
            <TextField
              label="ความจุ (คน)"
              value={form.Capacity}
              onChange={(e) => setForm({ ...form, Capacity: e.target.value })}
              type="number"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveTable}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog พิมพ์ QR Code */}
      <Dialog
        open={printDialogOpen}
        onClose={handleCloseQRDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: { print: 'none' } }}>
          พิมพ์ QR Code โต๊ะ {printTable?.TableNumber}
        </DialogTitle>
        <DialogContent
          id="print-area"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 3,
          }}
        >
          {printTable && (
            <>
              <Typography variant="h2" gutterBottom>
                โต๊ะ {printTable.TableNumber}
              </Typography>
              <QRCodeCanvas
                value={`${window.location.origin}/?table=${printTable.TableNumber}`}
                size={300}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ display: { print: 'none' } }}>
          <Button onClick={handleCloseQRDialog}>ปิด</Button>
          <Button variant="contained" onClick={handlePrint}>
            พิมพ์
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableQRManagement;
