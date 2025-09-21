import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  Chip,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  CircularProgress,
  Pagination
} from "@mui/material";
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
  TrendingDown,
  DateRange,
  Schedule,
  CalendarMonth
} from '@mui/icons-material';

const API_BASE = 'http://localhost/project_END/restaurant-backend/api/reports';

const theme = {
  colors: {
    primary: '#1565c0',
    secondary: '#37474f',
    success: '#2e7d32',
    warning: '#f57c00',
    error: '#d32f2f',
    background: '#f8f9fa',
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
};

const ReportPage = () => {
  const [salesByDate, setSalesByDate] = useState([]);
  const [menuSales, setMenuSales] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_cost: 0,
    total_orders: 0,
  });
  const [filterType, setFilterType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [topMenus, setTopMenus] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalCostMenus = menuSales.reduce((sum, item) => sum + item.total_cost, 0);
  const netProfit = summary.total_sales - summary.total_cost - totalExpense;

  const formatLocalDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [page, setPage] = useState(1); // หน้าเริ่มต้น = 1
  const rowsPerPage = 5; // จำนวนความคิดเห็นต่อหน้า
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    fetchSalesReport();
    fetchMenuSales();

    let startDate, endDate;
    const today = new Date();

    if (filterType === 'custom' && selectedDate) {
      startDate = formatLocalDate(selectedDate);
      endDate = formatLocalDate(selectedDate);
    } else if (filterType === 'day') {
      startDate = formatLocalDate(today);
      endDate = formatLocalDate(today);
    } else if (filterType === 'week') {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      startDate = formatLocalDate(monday);
      endDate = formatLocalDate(today);
    } else if (filterType === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatLocalDate(firstDay);
      endDate = formatLocalDate(today);
    } else if (filterType === 'year') {
      const firstJan = new Date(today.getFullYear(), 0, 1);
      startDate = formatLocalDate(firstJan);
      endDate = formatLocalDate(today);
    }

    fetchExpenses(startDate, endDate);
    fetchTopMenus(startDate, endDate);
    fetchFeedback(startDate, endDate);
  }, [filterType, selectedDate]);

  const fetchTopMenus = async (start, end) => {
    try {
      const res = await axios.get(`${API_BASE}/sales_by_menutop.php`, {
        params: { start_date: start, end_date: end },
      });
      setTopMenus(res.data.data || []);
    } catch (err) {
      console.error("Fetch top menus error:", err);
    }
  };

  const fetchFeedback = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/load_feedback.php`, {
        params: { startDate, endDate },
      });
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axios.get(`${API_BASE}/sales_by_expenses.php`, { params });
      const otherExpenses = res.data; // ไม่ต้อง filter เพราะ PHP ส่งเฉพาะค่าใช้จ่ายแล้ว
      const total = otherExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

      setExpenses(otherExpenses);
      setTotalExpense(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // ดึงข้อมูลรายงานยอดขายตามช่วงเวลา
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
        res = await axios.get(`${API_BASE}/sales_by_date.php`, {
          params: { period: filterType }
        });
      }

      setSalesByDate(res.data.sales || []);
      setSummary(res.data.summary || {});
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  // ดึงข้อมูลยอดขายแยกตามเมนู
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
        total_cost: parseFloat(item.total_cost), // <-- เพิ่มต้นทุนรวมของเมนู
      }));

      setMenuSales(formatted);
    } catch (err) {
      console.error('Fetch sales by menu error:', err);
    }
  };

  // แปลงตัวเลขเป็นสกุลเงินบาทไทย
  const formatCurrency = (value) =>
    `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

  // ชื่อสีปุ่มกรองแบบชัดเจน (ใช้กับ Chip)
  const getFilterChipColor = (type) => (filterType === type ? 'primary' : 'default');
  const getFilterChipVariant = (type) => (filterType === type ? 'filled' : 'outlined');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        fontFamily: 'Prompt, Roboto, sans-serif',
      }}
    >
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
        {/* ตัวเลือกช่วงเวลา */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}>
              เลือกช่วงเวลา
            </Typography>

            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap>
              {[
                { key: 'day', label: 'รายวัน', icon: <CalendarToday /> },
                { key: 'week', label: 'รายสัปดาห์', icon: <DateRange /> },
                { key: 'month', label: 'รายเดือน', icon: <CalendarMonth /> },
                { key: 'year', label: 'รายปี', icon: <Schedule /> },
                { key: 'custom', label: 'กำหนดเอง', },
              ].map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  icon={item.icon || null}
                  onClick={() => {
                    setFilterType(item.key);
                    if (item.key !== 'custom') setSelectedDate(null);
                  }}
                  color={getFilterChipColor(item.key)}
                  variant={getFilterChipVariant(item.key)}
                  sx={{
                    height: 48,
                    fontSize: '16px',
                    fontWeight: 500,
                    px: 2,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))}
            </Stack>

            {/* ตัวเลือกวันที่แบบกำหนดเอง */}
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
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            )}
          </CardContent>
        </Card>

        {/* สรุปข้อมูล (Summary Cards) */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              title: 'ออเดอร์ทั้งหมด',
              value: summary.total_orders,
              color: theme.colors.primary,
              icon: <Receipt sx={{ fontSize: 32 }} />,
              format: (v) => v?.toLocaleString('th-TH') || '0',
            },
            {
              title: 'ยอดขายรวม',
              value: summary.total_sales,
              color: theme.colors.success,
              icon: <TrendingUp sx={{ fontSize: 32 }} />,
              format: formatCurrency,
            },
            {
              title: 'ต้นทุนวัตถุดิบ',
              value: summary.total_cost,
              color: theme.colors.warning,
              icon: <Assessment sx={{ fontSize: 32 }} />,
              format: formatCurrency,
            },
            {
              title: 'รายจ่ายอื่นๆ',
              value: totalExpense,
              color: theme.colors.error,
              icon: <TrendingDown sx={{ fontSize: 32 }} />,
              format: formatCurrency,
            },
            {
              title: netProfit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุนสุทธิ',
              value: Math.abs(netProfit), // แสดงเป็นตัวเลขบวกเสมอ
              color: netProfit >= 0 ? theme.colors.success : theme.colors.error, // สีเขียวหรือแดง
              icon: <TrendingUp sx={{ fontSize: 32 }} />,
              format: formatCurrency,
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  minHeight: 140,
                  boxShadow: 3,
                  border: `2px solid ${item.color}`,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: item.color,
                      mb: 0.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: '20px',
                      color: item.color,
                    }}
                  >
                    {item.format(item.value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Grid container spacing={3} alignItems="stretch">
        {/* Left: Top 5 เมนูขายดี */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3, boxShadow: 3, height: "100%" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: "18px" }}>
                เมนูขายดี 5 อันดับ
              </Typography>

              <Box sx={{ flex: 1 }}>
                {topMenus.length === 0 ? (
                  <Typography sx={{ color: "#757575" }}>ไม่มีข้อมูล</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: "none", maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>อันดับ</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>ชื่อเมนู</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>จำนวนขาย</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>ยอดขาย</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topMenus.map((item, index) => (
                          <TableRow key={item.MenuName}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell>{item.MenuName}</TableCell>
                            <TableCell align="center">{item.total_qty}</TableCell>
                            <TableCell align="right">{formatCurrency(item.total_sales)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Feedback Summary + ความคิดเห็น */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column" sx={{ height: "100%" }}>
            {/* คะแนนเฉลี่ยแต่ละด้าน */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: "18px" }}>
                    คะแนนเฉลี่ยแต่ละด้าน
                  </Typography>

                  {feedbacks.length > 0 ? (
                    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                      <Table size="small">
                        <TableBody>
                          {["อาหาร", "บริการ", "ความสะอาด", "โดยรวม"].map((aspect) => {
                            const avg =
                              feedbacks.reduce((sum, fb) => {
                                switch (aspect) {
                                  case "อาหาร": return sum + parseFloat(fb.rating_food);
                                  case "บริการ": return sum + parseFloat(fb.rating_service);
                                  case "ความสะอาด": return sum + parseFloat(fb.rating_cleanliness);
                                  case "โดยรวม": return sum + parseFloat(fb.rating_overall);
                                  default: return sum;
                                }
                              }, 0) / feedbacks.length;

                            return (
                              <TableRow key={aspect}>
                                <TableCell sx={{ fontWeight: 600 }}>{aspect}</TableCell>
                                <TableCell>
                                  <Rating value={avg} precision={0.1} readOnly size="small" /> ({avg.toFixed(1)})
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography sx={{ color: "#757575" }}>ไม่มีข้อมูลคะแนน</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ความคิดเห็นลูกค้า */}
            <Grid item xs={12} sx={{ flex: 1 }}>
              <Card sx={{ boxShadow: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: "18px" }}>
                    ความคิดเห็นลูกค้า
                  </Typography>

                  {feedbacks.length > 0 ? (
                    <>
                      {/* รายการความคิดเห็น */}
                      <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                        {feedbacks
                          .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                          .map((fb) => (
                            <Box
                              key={fb.id}
                              sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: 2 }}
                            >
                              <Typography sx={{ fontSize: "14px", color: "#555" }}>
                                {fb.comment}
                              </Typography>
                              <Typography sx={{ fontSize: "12px", color: "#999", mt: 0.5 }}>
                                วันที่: {fb.feedback_date}
                              </Typography>
                            </Box>
                          ))}
                      </Box>

                      {/* Pagination ไม่ถูกบัง */}
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Pagination
                          count={Math.ceil(feedbacks.length / rowsPerPage)}
                          page={page}
                          onChange={handleChangePage}
                          color="primary"
                        />
                      </Box>
                    </>
                  ) : (
                    <Typography sx={{ color: "#757575" }}>ไม่มีความคิดเห็นลูกค้า</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default ReportPage;
