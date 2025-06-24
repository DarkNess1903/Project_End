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
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_URL = 'http://localhost/project_END/restaurant-backend/api/tables';

const TableQRManagement = () => {
  const [tables, setTables] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [form, setForm] = useState({ TableNumber: '', Capacity: '' });

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
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ TableNumber: '', Capacity: '' });
    setEditTable(null);
  };

  const handleSaveTable = async () => {
    try {
      if (editTable) {
        // แก้ไข
        await axios.post(`${API_URL}/update.php`, {
          TableID: editTable.TableID,
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
        });
      } else {
        // เพิ่มใหม่
        await axios.post(`${API_URL}/create.php`, {
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
        });
      }
      fetchTables();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving table:', error);
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโต๊ะนี้?')) {
      try {
        await axios.post(`${API_URL}/delete.php`, { TableID: id });
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
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
                <Box mt={1}>
                  <QRCodeCanvas value={fullUrl} size={180} />
                </Box>
                <Typography variant="caption" sx={{ wordBreak: 'break-all', mt: 1 }}>{fullUrl}</Typography>
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(table)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteTable(table.TableID)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  onClick={() => window.print()}
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  พิมพ์ QR นี้
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
    </Box>
  );
};

export default TableQRManagement;
