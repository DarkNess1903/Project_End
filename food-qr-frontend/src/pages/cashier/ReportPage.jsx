import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
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

const ReportPage = () => {
  const [salesByDate, setSalesByDate] = useState([]);
  const [menuSales, setMenuSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [filterType, setFilterType] = useState('day');
  const [totalOrders, setTotalOrders] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);

  useEffect(() => {
    fetchSalesReport();
    fetchMenuSales();
  }, [filterType]);

  const fetchSalesReport = async () => {
    try {
      const res = await axios.get(
        `http://localhost/project_END/restaurant-backend/api/reports/sales_by_date.php?filter=${filterType}`
      );
      setSalesByDate(res.data.sales_by_date);
      setTotalSales(res.data.total_sales);
      setTotalOrders(res.data.total_orders);
      setNetRevenue(res.data.net_revenue);
    } catch (err) {
      console.error('Fetch sales by date error:', err);
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
        total_sales: item.total_sales,
      }));

      setMenuSales(dataFormatted);
    } catch (err) {
      console.error('Fetch sales by menu error:', err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        รายงานยอดขาย
      </Typography>

      {/* ปุ่มเลือกช่วงเวลา */}
      <Stack direction="row" spacing={1} mb={2}>
        <Button
          variant={filterType === 'day' ? 'contained' : 'outlined'}
          onClick={() => setFilterType('day')}
        >
          รายวัน
        </Button>
        <Button
          variant={filterType === 'month' ? 'contained' : 'outlined'}
          onClick={() => setFilterType('month')}
        >
          รายเดือน
        </Button>
        <Button
          variant={filterType === 'year' ? 'contained' : 'outlined'}
          onClick={() => setFilterType('year')}
        >
          รายปี
        </Button>
      </Stack>

      {/* ตัวเลขสรุปยอด */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">ออเดอร์ทั้งหมด</Typography>
            <Typography variant="h6">{totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">รายได้รวม</Typography>
            <Typography variant="h6">฿{Number(totalSales).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">รายได้สุทธิ</Typography>
            <Typography variant="h6">฿{Number(netRevenue).toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* กราฟ */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              กราฟยอดขาย {filterType === 'day' ? 'รายวัน' : filterType === 'month' ? 'รายเดือน' : 'รายปี'}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDate}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              กราฟยอดขายของเมนู (30 วันที่ผ่านมา)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={menuSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="menu_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportPage;
