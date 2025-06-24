// src/pages/cashier/ReportPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const ReportPage = () => {
  const [salesByDate, setSalesByDate] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/reports/sales_by_date.php');
      setSalesByDate(res.data.sales_by_date);
      setTotalSales(res.data.total_sales);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        รายงานยอดขาย
      </Typography>

      <Typography variant="h6" my={2}>
        ยอดขายรวมทั้งหมด: ฿{totalSales.toFixed(2)}
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>วันที่</TableCell>
              <TableCell align="right">ยอดขาย (บาท)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesByDate.map(row => (
              <TableRow key={row.sale_date}>
                <TableCell>{row.sale_date}</TableCell>
                <TableCell align="right">{row.total_amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ReportPage;
