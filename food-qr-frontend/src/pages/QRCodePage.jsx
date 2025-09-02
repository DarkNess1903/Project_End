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
  Card,
  CardContent,
  CardActions,
  Chip,
  AppBar,
  Toolbar,
  Container,
  Fab,
  Badge,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Edit,
  Delete,
  Add,
  Print,
  QrCode,
  TableRestaurant,
  People,
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost/project_END/restaurant-backend/api/tables';

// Custom theme colors for iPad cashier (consistent with other pages)
const theme = {
  colors: {
    primary: '#1565c0', // น้ำเงินเข้ม
    secondary: '#37474f', // เทาเข้ม
    success: '#2e7d32', // เขียวเข้ม
    warning: '#f57c00', // ส้มเข้ม
    error: '#d32f2f', // แดงเข้ม
    background: '#f8f9fa', // เทาอ่อน
    surface: '#ffffff',
    text: {
      primary: '#212121',
      secondary: '#757575',
    }
  }
};

const statusOptions = [
  { value: 'available', label: 'ว่าง', color: theme.colors.success, icon: <CheckCircle /> },
  { value: 'occupied', label: 'มีลูกค้า', color: theme.colors.error, icon: <Cancel /> },
  { value: 'reserved', label: 'จองแล้ว', color: theme.colors.warning, icon: <Schedule /> },
];

const TableQRManagement = () => {
  const [tables, setTables] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [form, setForm] = useState({ TableNumber: '', Capacity: '', Status: 'available' });
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printTable, setPrintTable] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // ดึงข้อมูลโต๊ะทั้งหมด
  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/index.php`);
      // ตรวจสอบว่าเป็น array หรือ object
      const tableArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setTables(tableArray);
    } catch (error) {
      console.error('Error fetching tables:', error);
      showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      setTables([]);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

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
        showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
        return;
      }

      if (editTable) {
        await axios.post(`${API_URL}/update.php`, {
          TableID: editTable.TableID,
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
          Status: form.Status,
        });
        showNotification('แก้ไขข้อมูลโต๊ะเรียบร้อยแล้ว', 'success');
      } else {
        await axios.post(`${API_URL}/create.php`, {
          TableNumber: form.TableNumber,
          Capacity: form.Capacity,
          Status: 'available',
        });
        showNotification('เพิ่มโต๊ะใหม่เรียบร้อยแล้ว', 'success');
      }

      fetchTables();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving table:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleDeleteTable = async (table) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโต๊ะ ${table.TableNumber}?`)) {
      try {
        await axios.post(`${API_URL}/delete.php`, { TableID: table.TableID });
        fetchTables();
        showNotification(`ลบโต๊ะ ${table.TableNumber} เรียบร้อยแล้ว`, 'success');
      } catch (error) {
        console.error('Error deleting table:', error);
        showNotification('เกิดข้อผิดพลาดในการลบโต๊ะ', 'error');
      }
    }
  };

  const handleOpenQRDialog = (table) => {
    setPrintTable(table);
    setPrintDialogOpen(true);
  };

  const handleCloseQRDialog = () => {
    setPrintDialogOpen(false);
    setPrintTable(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getStatusCounts = () => {
    const counts = {
      available: tables.filter(t => t.Status === 'available').length,
      occupied: tables.filter(t => t.Status === 'occupied').length,
      reserved: tables.filter(t => t.Status === 'reserved').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.colors.background,
      fontFamily: 'Prompt, Roboto, sans-serif'
    }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ backgroundColor: theme.colors.primary, mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <TableRestaurant sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              จัดการโต๊ะอาหาร & QR Code
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={`${tables.length} โต๊ะ`} 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '16px',
                height: 40,
                fontWeight: 600
              }} 
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: 3 }}>

        {/* Action Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
            รายการโต๊ะทั้งหมด
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              height: 48,
              fontSize: '16px',
              backgroundColor: theme.colors.success,
              minWidth: 150
            }}
          >
            เพิ่มโต๊ะใหม่
          </Button>
        </Box>

        {/* Tables Grid */}
        <Grid container spacing={3}>
          {tables.map((table) => {
            const fullUrl = `${window.location.origin}/?table=${table.TableNumber}`;
            const statusInfo = getStatusInfo(table.Status);
            
            return (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={table.TableID}>
                <Card sx={{ 
                  boxShadow: 3,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${statusInfo.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                    {/* Table Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                        โต๊ะ {table.TableNumber}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(table)}
                          sx={{ 
                            backgroundColor: theme.colors.primary + '20',
                            color: theme.colors.primary,
                            '&:hover': { backgroundColor: theme.colors.primary + '30' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTable(table)}
                          sx={{ 
                            backgroundColor: theme.colors.error + '20',
                            color: theme.colors.error,
                            '&:hover': { backgroundColor: theme.colors.error + '30' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Table Info */}
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                      <People sx={{ color: theme.colors.text.secondary }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ความจุ: {table.Capacity} คน
                      </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Chip 
                      icon={statusInfo.icon}
                      label={statusInfo.label}
                      sx={{ 
                        backgroundColor: statusInfo.color + '20',
                        color: statusInfo.color,
                        fontWeight: 600,
                        mb: 3,
                        fontSize: '14px',
                        height: 32
                      }}
                    />

                    {/* QR Code */}
                    <Box 
                      sx={{ 
                        backgroundColor: 'white',
                        padding: 2,
                        borderRadius: 2,
                        border: '2px solid #f0f0f0',
                        mb: 2,
                        display: 'inline-block'
                      }}
                    >
                      <QRCodeCanvas value={fullUrl} size={160} />
                    </Box>

                    {/* URL Display */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        wordBreak: 'break-all', 
                        color: theme.colors.text.secondary,
                        fontSize: '12px',
                        display: 'block',
                        backgroundColor: theme.colors.background,
                        padding: 1,
                        borderRadius: 1,
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {fullUrl}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Print />}
                      onClick={() => handleOpenQRDialog(table)}
                      sx={{ 
                        height: 48,
                        fontSize: '14px',
                        fontWeight: 600,
                        borderColor: theme.colors.primary,
                        color: theme.colors.primary,
                        '&:hover': {
                          backgroundColor: theme.colors.primary + '10',
                          borderColor: theme.colors.primary,
                        }
                      }}
                    >
                      พิมพ์ QR Code
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Empty State */}
        {tables.length === 0 && (
          <Box textAlign="center" py={8}>
            <TableRestaurant sx={{ fontSize: 80, color: theme.colors.text.secondary, mb: 2 }} />
            <Typography variant="h6" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
              ยังไม่มีโต๊ะในระบบ
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ backgroundColor: theme.colors.success }}
            >
              เพิ่มโต๊ะแรก
            </Button>
          </Box>
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add table"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: theme.colors.success,
          '&:hover': {
            backgroundColor: theme.colors.success,
          },
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      {/* Dialog เพิ่ม/แก้ไขโต๊ะ */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.colors.primary, 
          color: 'white',
          fontSize: '20px',
          fontWeight: 600
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TableRestaurant />
            {editTable ? 'แก้ไขข้อมูลโต๊ะ' : 'เพิ่มโต๊ะใหม่'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="หมายเลขโต๊ะ"
              value={form.TableNumber}
              onChange={(e) => setForm({ ...form, TableNumber: e.target.value })}
              type="number"
              fullWidth
              required
              sx={{
                '& .MuiInputBase-root': {
                  height: 56,
                  fontSize: '16px',
                }
              }}
            />
            <TextField
              label="ความจุ (คน)"
              value={form.Capacity}
              onChange={(e) => setForm({ ...form, Capacity: e.target.value })}
              type="number"
              fullWidth
              required
              sx={{
                '& .MuiInputBase-root': {
                  height: 56,
                  fontSize: '16px',
                }
              }}
            />
            {editTable && (
              <FormControl fullWidth>
                <InputLabel>สถานะโต๊ะ</InputLabel>
                <Select
                  value={form.Status}
                  onChange={(e) => setForm({ ...form, Status: e.target.value })}
                  label="สถานะโต๊ะ"
                  sx={{ height: 56, fontSize: '16px' }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 100
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTable}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 120,
              backgroundColor: theme.colors.success
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog พิมพ์ QR Code */}
      <Dialog
        open={printDialogOpen}
        onClose={handleCloseQRDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: { print: 'none' },
          backgroundColor: theme.colors.primary,
          color: 'white',
          fontSize: '20px',
          fontWeight: 600
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <QrCode />
            พิมพ์ QR Code โต๊ะ {printTable?.TableNumber}
          </Box>
        </DialogTitle>
        <DialogContent
          id="print-area"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 4,
            textAlign: 'center'
          }}
        >
          {printTable && (
            <>
              <Typography variant="h2" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                โต๊ะ {printTable.TableNumber}
              </Typography>
              <Box 
                sx={{ 
                  backgroundColor: 'white',
                  padding: 3,
                  borderRadius: 2,
                  border: '3px solid #000'
                }}
              >
                <QRCodeCanvas
                  value={`${window.location.origin}/?table=${printTable.TableNumber}`}
                  size={300}
                />
              </Box>
              <Typography variant="h6" sx={{ color: theme.colors.text.secondary }}>
                ความจุ: {printTable.Capacity} คน
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {`${window.location.origin}/?table=${printTable.TableNumber}`}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ display: { print: 'none' }, p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseQRDialog}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 100
            }}
          >
            ปิด
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 120,
              backgroundColor: theme.colors.primary
            }}
          >
            พิมพ์
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TableQRManagement;