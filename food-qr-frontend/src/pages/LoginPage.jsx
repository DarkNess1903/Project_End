import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_BASE = 'http://localhost/project_END/restaurant-backend/api/admin';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setNotification({ open: true, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', severity: 'warning' });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/login.php`, { username, password });

      if (res.data.success) {
        // เก็บ token และ user ใน localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', res.data.user);

        setNotification({ open: true, message: 'เข้าสู่ระบบสำเร็จ', severity: 'success' });

        // redirect ไป /cashier/tables
        setTimeout(() => {
          navigate('/cashier/tables', { replace: true });
        }, 1000);
      } else {
        setNotification({ open: true, message: res.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', severity: 'error' });
      }
    } catch (error) {
      console.error(error);
      setNotification({ open: true, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              เข้าสู่ระบบ - แคชเชียร์
            </Typography>

            <TextField
              label="ชื่อผู้ใช้"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleLogin}
            >
              เข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
