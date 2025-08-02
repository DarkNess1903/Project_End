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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  useEffect(() => {
    fetchSalesReport();
    fetchMenuSales();
  }, [filterType]);

  const fetchSalesReport = async () => {
    try {
      let res;

      if (filterType === 'custom') {
        const start = startDate?.toISOString().split('T')[0];
        const end = endDate?.toISOString().split('T')[0];
        res = await axios.get(`http://localhost/project_END/restaurant-backend/api/reports/sales_by_date.php`, {
          params: {
            period: 'custom',
            start_date: start,
            end_date: end
          }
        });
      } else {
        res = await axios.get(`http://localhost/project_END/restaurant-backend/api/reports/sales_by_date.php?period=${filterType}`);
      }

      setSalesByDate(res.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const fetchMenuSales = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 30);
      const startDate = startDateObj.toISOString().split('T')[0];

      const res = await axios.get(
        `http://localhost/project_END/restaurant-backend/api/reports/sales_by_menu.php?start_date=${startDate}&end_date=${endDate}`
      );

      const dataFormatted = res.data.map(item => ({
        menu_name: item.name,
        total_sales: parseFloat(item.total_sales),
      }));

      setMenuSales(dataFormatted);
    } catch (err) {
      console.error('Fetch sales by menu error:', err);
    }
  };

  const formatCurrency = (value) => `฿${Number(value).toFixed(2)}`;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        รายงานยอดขาย
      </Typography>
      {filterType === 'custom' && (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
          <Stack direction="row" spacing={2} mb={2}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="yyyy-MM-dd"
            />
            <DatePicker
              label="วันที่สิ้นสุด"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="yyyy-MM-dd"
            />
            <Button
              variant="contained"
              onClick={fetchSalesReport}
              disabled={!startDate || !endDate}
            >
              แสดงรายงาน
            </Button>
          </Stack>
        </LocalizationProvider>
      )}

      {/* ปุ่มเลือกช่วงเวลา */}
      <Stack direction="row" spacing={1} mb={2}>
        {['day', 'week', 'month', 'year', 'custom'].map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'contained' : 'outlined'}
            onClick={() => setFilterType(type)}
          >
            {{
              day: 'รายวัน',
              week: 'รายสัปดาห์',
              month: 'รายเดือน',
              year: 'รายปี',
              custom: 'กำหนดเอง'
            }[type]}
          </Button>
        ))}
      </Stack>

      {/* ข้อมูลสรุปยอดขาย */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">ออเดอร์ทั้งหมด</Typography>
            <Typography variant="h6">{summary.total_orders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">ยอดขายรวม</Typography>
            <Typography variant="h6">{formatCurrency(summary.total_sales)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">ต้นทุนวัตถุดิบ</Typography>
            <Typography variant="h6">{formatCurrency(summary.total_cost)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">กำไรขั้นต้น (Net)</Typography>
            <Typography variant="h6">{formatCurrency(summary.net_revenue)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">ภาษีที่ต้องชำระ (7%)</Typography>
            <Typography variant="h6">{formatCurrency(summary.tax)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* กราฟ */}
      <Grid container spacing={3}>
        {/* กราฟยอดขายตามช่วงเวลา */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              กราฟยอดขาย ({{
                day: 'รายวัน',
                week: 'รายสัปดาห์',
                month: 'รายเดือน',
                year: 'รายปี',
                custom: 'ช่วงวันที่กำหนดเอง'
              }[filterType]})
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDate}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="total_amount" name="ยอดขายรวม" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* กราฟยอดขายเมนู */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              เมนูขายดี (30 วันล่าสุด)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={menuSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="menu_name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="total_sales" name="ยอดขาย" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportPage;
