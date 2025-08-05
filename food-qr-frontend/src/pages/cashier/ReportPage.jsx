import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  Chip,
  Container,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import thLocale from 'date-fns/locale/th';
import {
  TrendingUp,
  Assessment,
  Receipt,
  CalendarToday,
  Print,
} from '@mui/icons-material';

const API_BASE = 'http://localhost/project_END/restaurant-backend/api/reports';

// Custom theme colors for iPad cashier
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

const ReportPage = () => {
  const [salesByDate, setSalesByDate] = useState([]);
  const [menuSales, setMenuSales] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_cost: 0,
    net_revenue: 0,
    tax: 0,
    total_orders: 0,
  });
  const [filterType, setFilterType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchSalesReport();
    fetchMenuSales();
  }, [filterType, selectedDate]);

  const fetchSalesReport = async () => {
    try {
      let res;

      if (filterType === 'custom' && selectedDate) {
        const date = selectedDate.toISOString().split('T')[0];
        res = await axios.get(`${API_BASE}/sales_by_date.php`, {
          params: {
            period: 'custom',
            start_date: date,
            end_date: date,
          },
        });
      } else if (filterType === 'day') {
        const today = new Date().toISOString().split('T')[0];
        res = await axios.get(`${API_BASE}/sales_by_date.php`, {
          params: {
            period: 'custom',
            start_date: today,
            end_date: today,
          },
        });
      } else {
        res = await axios.get(`${API_BASE}/sales_by_date.php?period=${filterType}`);
      }

      setSalesByDate(res.data.sales || []);
      setSummary(res.data.summary || {});
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const fetchMenuSales = async () => {
    try {
      let start, end;

      if (filterType === 'custom' && selectedDate) {
        start = end = selectedDate.toISOString().split('T')[0];
      } else if (filterType === 'day') {
        start = end = new Date().toISOString().split('T')[0];
      } else {
        const now = new Date();
        end = now.toISOString().split('T')[0];
        const past = new Date();
        past.setDate(now.getDate() - 30);
        start = past.toISOString().split('T')[0];
      }

      const res = await axios.get(`${API_BASE}/sales_by_menu.php`, {
        params: { start_date: start, end_date: end },
      });

      const formatted = res.data.map((item) => ({
        menu_name: item.name,
        total_sales: parseFloat(item.total_sales),
      }));
      setMenuSales(formatted);
    } catch (err) {
      console.error('Fetch sales by menu error:', err);
    }
  };

  const formatCurrency = (value) => `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

  const getFilterChipColor = (type) => {
    return filterType === type ? 'primary' : 'default';
  };

  const getFilterChipVariant = (type) => {
    return filterType === type ? 'filled' : 'outlined';
  };

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
            <Assessment sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              รายงานยอดขาย - แคชเชียร์
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton color="inherit" size="large">
              <Print sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: 3 }}>
        {/* Filter Section */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}>
              เลือกช่วงเวลา
            </Typography>
            
            {/* Period Buttons */}
            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap>
              {[
                { key: 'day', label: 'รายวัน', icon: <CalendarToday /> },
                { key: 'week', label: 'รายสัปดาห์', icon: null },
                { key: 'month', label: 'รายเดือน', icon: null },
                { key: 'year', label: 'รายปี', icon: null },
                { key: 'custom', label: 'กำหนดเอง', icon: null },
              ].map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => {
                    setFilterType(item.key);
                    if (item.key !== 'custom') {
                      setSelectedDate(null);
                    }
                  }}
                  color={getFilterChipColor(item.key)}
                  variant={getFilterChipVariant(item.key)}
                  sx={{
                    height: 48,
                    fontSize: '16px',
                    fontWeight: 500,
                    px: 2,
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                />
              ))}
            </Stack>

            {/* Date Picker */}
            {filterType === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                <Box sx={{ mt: 2 }}>
                  <DatePicker
                    label="เลือกวันที่"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    format="yyyy-MM-dd"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 56,
                        fontSize: '16px',
                      }
                    }}
                  />
                </Box>
              </LocalizationProvider>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              title: 'ออเดอร์ทั้งหมด',
              value: summary.total_orders,
              color: theme.colors.primary,
              icon: <Receipt sx={{ fontSize: 32 }} />,
              format: (v) => v?.toLocaleString('th-TH') || '0'
            },
            {
              title: 'ยอดขายรวม',
              value: summary.total_sales,
              color: theme.colors.success,
              icon: <TrendingUp sx={{ fontSize: 32 }} />,
              format: formatCurrency
            },
            {
              title: 'ต้นทุนวัตถุดิบ',
              value: summary.total_cost,
              color: theme.colors.warning,
              icon: <Assessment sx={{ fontSize: 32 }} />,
              format: formatCurrency
            },
            {
              title: 'กำไรขั้นต้น',
              value: summary.net_revenue,
              color: theme.colors.success,
              icon: <TrendingUp sx={{ fontSize: 32 }} />,
              format: formatCurrency
            },
            {
              title: 'ภาษี 7%',
              value: summary.tax,
              color: theme.colors.error,
              icon: <Receipt sx={{ fontSize: 32 }} />,
              format: formatCurrency
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  height: '140px',
                  boxShadow: 3,
                  border: `2px solid ${item.color}`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.colors.text.secondary,
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: item.color,
                      fontSize: '20px',
                      mt: 1,
                    }}
                  >
                    {item.format(item.value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Charts Section */}
        <Grid container spacing={4}>
          {/* Sales Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ boxShadow: 3, height: '450px' }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '18px' }}>
                  กราฟยอดขาย ({
                    {
                      day: 'รายวัน',
                      week: 'รายสัปดาห์',
                      month: 'รายเดือน',
                      year: 'รายปี',
                      custom: 'ช่วงวันที่กำหนดเอง',
                    }[filterType]
                  })
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesByDate} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 14 }}
                      stroke={theme.colors.text.secondary}
                    />
                    <YAxis 
                      tick={{ fontSize: 14 }}
                      stroke={theme.colors.text.secondary}
                    />
                    <Tooltip 
                      formatter={(v) => [formatCurrency(v), 'ยอดขายรวม']} 
                      contentStyle={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.primary}`,
                        borderRadius: 8,
                        fontSize: '14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line
                      type="monotone"
                      dataKey="total_sales"
                      name="ยอดขายรวม"
                      stroke={theme.colors.primary}
                      strokeWidth={3}
                      dot={{ r: 6, fill: theme.colors.primary }}
                      activeDot={{ r: 8, fill: theme.colors.success }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Menu Sales Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ boxShadow: 3, height: '450px' }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '18px' }}>
                  เมนูขายดี ({filterType === 'custom' || filterType === 'day' ? 'วันที่เลือก' : '30 วันล่าสุด'})
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={menuSales.slice(0, 8)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="menu_name" 
                      tick={{ fontSize: 12 }}
                      stroke={theme.colors.text.secondary}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 14 }}
                      stroke={theme.colors.text.secondary}
                    />
                    <Tooltip 
                      formatter={(v) => [formatCurrency(v), 'ยอดขาย']} 
                      contentStyle={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.success}`,
                        borderRadius: 8,
                        fontSize: '14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Bar 
                      dataKey="total_sales" 
                      name="ยอดขาย" 
                      fill={theme.colors.success}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportPage;