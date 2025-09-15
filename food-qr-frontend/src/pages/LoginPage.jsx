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
  InputAdornment,
  Avatar,
} from '@mui/material';
import { AccountCircle, Lock } from '@mui/icons-material';
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
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', res.data.user);

        setNotification({ open: true, message: 'เข้าสู่ระบบสำเร็จ', severity: 'success' });

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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <AccountCircle fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
              เข้าสู่ระบบ - แคชเชียร์
            </Typography>

            <TextField
              label="ชื่อผู้ใช้"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4, py: 1.5, fontWeight: 600, fontSize: '16px' }}
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
