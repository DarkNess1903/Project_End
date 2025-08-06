import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Typography,
  Grid,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Divider,
  Chip,
  Alert,
  Snackbar,
  TableContainer,
  Paper,
  Fab,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  FilterList,
  Receipt,
  Search,
  Save,
  CalendarMonth,
  TrendingDown,
  Category,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Custom theme colors for iPad cashier (consistent with ReportPage)
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

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    Description: '',
    Amount: '',
    ExpenseType: '',
    ExpenseDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    type: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const expenseTypes = [
    'วัตถุดิบ',
    'เครื่องดื่ม',
    'ค่าเช่า',
    'ค่าไฟฟ้า',
    'ค่าน้ำ',
    'เงินเดือน',
    'ค่าขนส่ง',
    'อุปกรณ์',
    'ซ่อมแซม',
    'อื่นๆ'
  ];

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (filter.startDate) params.start_date = filter.startDate;
      if (filter.endDate) params.end_date = filter.endDate;
      if (filter.type) params.expense_type = filter.type;

      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/expenses/index.php', { params });
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost/project_END/restaurant-backend/api/expenses/create.php', formData);
      setFormData({ 
        Description: '', 
        Amount: '', 
        ExpenseType: '', 
        ExpenseDate: format(new Date(), 'yyyy-MM-dd')
      });
      setShowAddForm(false);
      fetchExpenses();
      showNotification('บันทึกรายจ่ายเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error saving expense:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const clearFilters = () => {
    setFilter({ startDate: '', endDate: '', type: '' });
  };

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.Amount || 0), 0);
  const formatCurrency = (value) => `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.colors.background,
      fontFamily: 'Prompt, Roboto, sans-serif'
    }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ backgroundColor: theme.colors.error, mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalanceWallet sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              จัดการรายจ่าย - แคชเชียร์
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={`รวม ${formatCurrency(total)}`} 
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
        {/* Quick Stats */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 3, border: `2px solid ${theme.colors.error}` }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <TrendingDown sx={{ fontSize: 40, color: theme.colors.error, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.colors.error }}>
                  รายจ่ายวันนี้
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.colors.error }}>
                  {formatCurrency(
                    expenses
                      .filter(exp => format(new Date(exp.ExpenseDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                      .reduce((sum, exp) => sum + parseFloat(exp.Amount || 0), 0)
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 3, border: `2px solid ${theme.colors.warning}` }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Receipt sx={{ fontSize: 40, color: theme.colors.warning, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.colors.warning }}>
                  จำนวนรายการ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.colors.warning }}>
                  {expenses.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 3, border: `2px solid ${theme.colors.primary}` }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CalendarMonth sx={{ fontSize: 40, color: theme.colors.primary, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.colors.primary }}>
                  รายจ่ายรวมทั้งหมด
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                  {formatCurrency(total)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Section */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <FilterList sx={{ color: theme.colors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                ตัวกรองข้อมูล
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField 
                  label="จากวันที่" 
                  type="date" 
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 56,
                      fontSize: '16px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField 
                  label="ถึงวันที่" 
                  type="date" 
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 56,
                      fontSize: '16px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField 
                  label="ประเภทรายจ่าย"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 56,
                      fontSize: '16px',
                    }
                  }}
                >
                  <option value="">ทั้งหมด</option>
                  {expenseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1} height="56px">
                  <Button 
                    variant="contained" 
                    startIcon={<Search />}
                    onClick={fetchExpenses}
                    sx={{ 
                      height: '100%',
                      fontSize: '16px',
                      minWidth: 120,
                      backgroundColor: theme.colors.primary
                    }}
                  >
                    ค้นหา
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={clearFilters}
                    sx={{ 
                      height: '100%',
                      fontSize: '16px',
                      minWidth: 80,
                      borderColor: theme.colors.secondary
                    }}
                  >
                    ล้าง
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Add Form (Collapsible) */}
        {showAddForm && (
          <Card sx={{ mb: 3, boxShadow: 3, border: `2px solid ${theme.colors.success}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '18px', color: theme.colors.success }}>
                เพิ่มรายจ่ายใหม่
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="ชื่อรายการ" 
                      fullWidth 
                      required
                      value={formData.Description}
                      onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 56,
                          fontSize: '16px',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="จำนวนเงิน" 
                      type="number" 
                      fullWidth 
                      required
                      value={formData.Amount}
                      onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 56,
                          fontSize: '16px',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="ประเภทรายจ่าย"
                      select
                      fullWidth
                      required
                      SelectProps={{ native: true }}
                      value={formData.ExpenseType}
                      onChange={(e) => setFormData({ ...formData, ExpenseType: e.target.value })}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 56,
                          fontSize: '16px',
                        }
                      }}
                    >
                      <option value="">เลือกประเภท</option>
                      {expenseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="วันที่" 
                      type="date" 
                      fullWidth 
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.ExpenseDate}
                      onChange={(e) => setFormData({ ...formData, ExpenseDate: e.target.value })}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 56,
                          fontSize: '16px',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        type="submit"
                        startIcon={<Save />}
                        sx={{ 
                          height: 48,
                          fontSize: '16px',
                          minWidth: 150,
                          backgroundColor: theme.colors.success
                        }}
                      >
                        บันทึกรายจ่าย
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => setShowAddForm(false)}
                        sx={{ 
                          height: 48,
                          fontSize: '16px',
                          minWidth: 100
                        }}
                      >
                        ยกเลิก
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expenses Table */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                รายการรายจ่าย
              </Typography>
              {!showAddForm && (
                <Button 
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowAddForm(true)}
                  sx={{ 
                    height: 48,
                    fontSize: '16px',
                    backgroundColor: theme.colors.success
                  }}
                >
                  เพิ่มรายจ่าย
                </Button>
              )}
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.colors.background }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>วันที่</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>รายการ</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px' }}>ประเภท</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '16px' }}>จำนวนเงิน</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.ExpenseID} hover>
                      <TableCell sx={{ fontSize: '14px' }}>
                        {format(new Date(exp.ExpenseDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{exp.Description}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>
                        <Chip 
                          label={exp.ExpenseType} 
                          size="small" 
                          sx={{ 
                            backgroundColor: theme.colors.warning + '20',
                            color: theme.colors.warning,
                            fontWeight: 500
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '14px', fontWeight: 600 }}>
                        {formatCurrency(exp.Amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.colors.background }}>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '18px' }}>
                      รวมทั้งหมด
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '18px', color: theme.colors.error }}>
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Floating Action Button for Mobile */}
        {!showAddForm && (
          <Fab
            color="primary"
            aria-label="add expense"
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
            onClick={() => setShowAddForm(true)}
          >
            <Add />
          </Fab>
        )}
      </Container>

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

export default ExpensePage;