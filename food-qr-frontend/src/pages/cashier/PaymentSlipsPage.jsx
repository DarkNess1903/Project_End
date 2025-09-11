import React, { useState, useEffect } from 'react';
import {
  Box, Container, AppBar, Toolbar, Typography,
  Card, CardContent, Grid, CardMedia,
  Stack, Button, TextField, Snackbar, Alert, Fab
} from '@mui/material';
import { AccountBalanceWallet, Add } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost/project_END/restaurant-backend/api/payment_slips';

const PaymentSlipsPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [files, setFiles] = useState([]);
  const [slips, setSlips] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleFilesChange = (e) => setFiles([...e.target.files]);

  const handleUpload = async () => {
    if (!selectedDate || files.length === 0) return;
    setLoadingUpload(true);
    const formData = new FormData();
    formData.append('uploaded_by', 'พนักงาน');
    files.forEach(file => formData.append('files[]', file));

    try {
      const res = await axios.post(`${API_BASE}/upload_slips.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setNotification({ open: true, message: 'อัปโหลดสลิปเรียบร้อย', severity: 'success' });
        setFiles([]);
        fetchSlips(selectedDate);
      } else {
        setNotification({ open: true, message: res.data.error || 'เกิดข้อผิดพลาด', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: 'เกิดข้อผิดพลาดในการอัปโหลด', severity: 'error' });
    } finally {
      setLoadingUpload(false);
    }
  };

  const fetchSlips = async (date) => {
    setLoadingSlips(true);
    try {
      const res = await axios.get(`${API_BASE}/get_slips.php?date=${date}`);
      setSlips(res.data.slips || []);
    } catch (error) {
      console.error(error);
      setSlips([]);
    } finally {
      setLoadingSlips(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchSlips(selectedDate);
  }, [selectedDate]);

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Prompt, Roboto, sans-serif' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalanceWallet sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              อัปโหลดสลิปโอนเงิน - แคชเชียร์
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: 3 }}>
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>อัปโหลดสลิปโอนเงิน</Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  type="date"
                  label="เลือกวันที่"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                />

                <Button variant="outlined" component="label" sx={{ minWidth: 180 }}>
                  เลือกไฟล์รูป
                  <input type="file" hidden multiple accept="image/*" onChange={handleFilesChange} />
                </Button>

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={loadingUpload || files.length === 0 || !selectedDate}
                  sx={{ minWidth: 180 }}
                >
                  {loadingUpload ? 'กำลังอัปโหลด...' : 'อัปโหลดสลิป'}
                </Button>
              </Stack>

              {files.length > 0 && (
                <Typography variant="body2">ไฟล์ที่เลือก: {files.map(f => f.name).join(', ')}</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>รายการสลิปวันที่ {selectedDate || '-'}</Typography>

            {loadingSlips ? (
              <Typography>กำลังโหลดสลิป...</Typography>
            ) : slips.length === 0 ? (
              <Typography>ยังไม่มีสลิป</Typography>
            ) : (
              <Grid container spacing={2}>
                {slips.map((slip) => (
                  <Grid item xs={12} sm={6} md={3} key={slip.SlipID}>
                    <Card sx={{ boxShadow: 1 }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={`http://localhost/project_END/restaurant-backend/api/payment_slips/uploads/${slip.UploadDate.slice(0, 10)}/${slip.FileName}`}
                        alt={slip.FileName}
                      />
                      <Stack spacing={1} p={1}>
                        <Typography variant="body2">พนักงาน: {slip.UploadedBy}</Typography>
                        <Typography variant="body2">เวลา: {new Date(slip.UploadDate).toLocaleTimeString()}</Typography>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {files.length === 0 && (
          <Fab color="primary" aria-label="add file" sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => document.querySelector('input[type="file"]').click()}>
            <Add />
          </Fab>
        )}
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentSlipsPage;
