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
  ButtonGroup,
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
  Today,
  DateRange,
  CalendarToday,
  Schedule,
} from '@mui/icons-material';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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
    quickFilter: '', // เพิ่ม state สำหรับ quick filter
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

  // ฟังก์ชันสำหรับ quick date filters
  const handleQuickFilter = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // เริ่มต้นที่วันจันทร์
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = '';
        endDate = '';
    }

    setFilter({
      ...filter,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
      quickFilter: period
    });
  };

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
    setFilter({ startDate: '', endDate: '', type: '', quickFilter: '' });
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนวันที่แบบ manual
  const handleDateChange = (field, value) => {
    setFilter({ 
      ...filter, 
      [field]: value,
      quickFilter: '' // ล้าง quick filter เมื่อเปลี่ยนวันที่แบบ manual
    });
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
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: 2 }}>
        {/* Filter Section */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <FilterList sx={{ color: theme.colors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                ตัวกรองข้อมูล
              </Typography>
            </Box>
            
            {/* Quick Filter Buttons */}
            <Box mb={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.colors.text.secondary }}>
                เลือกช่วงเวลาด่วน:
              </Typography>
              <ButtonGroup variant="outlined" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant={filter.quickFilter === 'today' ? 'contained' : 'outlined'}
                  startIcon={<Today />}
                  onClick={() => handleQuickFilter('today')}
                  sx={{ 
                    minWidth: 120,
                    height: 40,
                    fontSize: '14px',
                    ...(filter.quickFilter === 'today' && {
                      backgroundColor: theme.colors.primary,
                      color: 'white'
                    })
                  }}
                >
                  วันนี้
                </Button>
                <Button
                  variant={filter.quickFilter === 'week' ? 'contained' : 'outlined'}
                  startIcon={<DateRange />}
                  onClick={() => handleQuickFilter('week')}
                  sx={{ 
                    minWidth: 120,
                    height: 40,
                    fontSize: '14px',
                    ...(filter.quickFilter === 'week' && {
                      backgroundColor: theme.colors.primary,
                      color: 'white'
                    })
                  }}
                >
                  สัปดาห์นี้
                </Button>
                <Button
                  variant={filter.quickFilter === 'month' ? 'contained' : 'outlined'}
                  startIcon={<CalendarMonth />}
                  onClick={() => handleQuickFilter('month')}
                  sx={{ 
                    minWidth: 120,
                    height: 40,
                    fontSize: '14px',
                    ...(filter.quickFilter === 'month' && {
                      backgroundColor: theme.colors.primary,
                      color: 'white'
                    })
                  }}
                >
                  เดือนนี้
                </Button>
                <Button
                  variant={filter.quickFilter === 'year' ? 'contained' : 'outlined'}
                  startIcon={<Schedule />}
                  onClick={() => handleQuickFilter('year')}
                  sx={{ 
                    minWidth: 120,
                    height: 40,
                    fontSize: '14px',
                    ...(filter.quickFilter === 'year' && {
                      backgroundColor: theme.colors.primary,
                      color: 'white'
                    })
                  }}
                >
                  ปีนี้
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleQuickFilter('')}
                  sx={{ 
                    minWidth: 100,
                    height: 40,
                    fontSize: '14px',
                    borderColor: theme.colors.secondary,
                    color: theme.colors.secondary
                  }}
                >
                  ทั้งหมด
                </Button>
              </ButtonGroup>
            </Box>

            {/* Filter by Type */}
            <Box mt={3}>
              <Grid container spacing={2} alignItems="center">
                {/* <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                    label="ประเภทรายจ่าย"
                    select
                    fullWidth
                    SelectProps={{ native: true }}
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 48,
                        fontSize: '14px',
                      }
                    }}
                  >
                    <option value="">ทั้งหมด</option>
                    {expenseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </TextField>
                </Grid> */}
                <Grid item xs={12} sm={6} md={4}>
                  <Stack direction="row" spacing={1} height="48px">
                    {/* <Button 
                      variant="contained" 
                      startIcon={<Search />}
                      onClick={fetchExpenses}
                      sx={{ 
                        height: '100%',
                        fontSize: '14px',
                        minWidth: 100,
                        backgroundColor: theme.colors.primary
                      }}
                    >
                      ค้นหา
                    </Button> */}
                    {/* <Button 
                      variant="outlined" 
                      onClick={clearFilters}
                      sx={{ 
                        height: '100%',
                        fontSize: '14px',
                        minWidth: 80,
                        borderColor: theme.colors.secondary
                      }}
                    >
                      ล้าง
                    </Button> */}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
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

        {/* Summary Card */}
        {/* <Card sx={{ mb: 3, boxShadow: 2, backgroundColor: theme.colors.error + '10' }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.colors.error }}>
                สรุปรายจ่าย {filter.quickFilter && (
                  <Chip 
                    label={
                      filter.quickFilter === 'today' ? 'วันนี้' :
                      filter.quickFilter === 'week' ? 'สัปดาห์นี้' :
                      filter.quickFilter === 'month' ? 'เดือนนี้' :
                      filter.quickFilter === 'year' ? 'ปีนี้' : ''
                    }
                    size="small"
                    sx={{ 
                      ml: 1,
                      backgroundColor: theme.colors.primary,
                      color: 'white'
                    }}
                  />
                )}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.colors.error }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
          </CardContent>
        </Card> */}

        {/* Expenses Table */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                รายการรายจ่าย ({expenses.length} รายการ)
              </Typography>
              {!showAddForm && (
                <Button 
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowAddForm(true)}
                  sx={{ 
                    height: 48,
                    fontSize: '16px',
                    backgroundColor: theme.colors.success,
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  เพิ่มรายจ่าย
                </Button>
              )}
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 1, maxHeight: 600 }}>
              <Table stickyHeader sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: theme.colors.background }}>วันที่</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: theme.colors.background }}>รายการ</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: theme.colors.background }}>ประเภท</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '16px', backgroundColor: theme.colors.background }}>จำนวนเงิน</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: theme.colors.text.secondary }}>
                        <Typography variant="body1">
                          ไม่พบข้อมูลรายจ่ายในช่วงเวลาที่เลือก
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((exp) => (
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
                    ))
                  )}
                  {expenses.length > 0 && (
                    <TableRow sx={{ backgroundColor: theme.colors.background }}>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '18px' }}>
                        รวมทั้งหมด
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '18px', color: theme.colors.error }}>
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  )}
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