import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Rating, Snackbar, Alert, Avatar, Divider } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FeedbackForm = ({ tableName }) => {
  const { orderId } = useParams();

  const [settings, setSettings] = useState(null);

  const [ratingFood, setRatingFood] = useState(0);
  const [ratingService, setRatingService] = useState(0);
  const [ratingCleanliness, setRatingCleanliness] = useState(0);
  const [ratingOverall, setRatingOverall] = useState(0);
  const [comment, setComment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // โหลดข้อมูลร้าน
  useEffect(() => {
    axios
      .get("http://localhost/project_END/restaurant-backend/api/settings/get_settings.php")
      .then((res) => {
        console.log("API settings:", res.data);
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async () => {
    if (!orderId) {
      setNotification({ open: true, message: 'ไม่พบ orderId', severity: 'error' });
      return;
    }

    if (ratingOverall === 0) {
      setNotification({ open: true, message: 'กรุณาให้คะแนนโดยรวม', severity: 'warning' });
      return;
    }

    try {
      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/feedback/save_feedback.php', {
        order_id: orderId,
        table_name: tableName,
        rating_food: ratingFood,
        rating_service: ratingService,
        rating_cleanliness: ratingCleanliness,
        rating_overall: ratingOverall,
        comment,
        contact_email: contactEmail,
        contact_phone: contactPhone
      });

      if (res.data.success) {
        setNotification({ open: true, message: 'ขอบคุณสำหรับความคิดเห็นของคุณ!', severity: 'success' });
        // Reset form
        setRatingFood(0);
        setRatingService(0);
        setRatingCleanliness(0);
        setRatingOverall(0);
        setComment('');
        setContactEmail('');
        setContactPhone('');
      } else {
        setNotification({ open: true, message: res.data.message || 'ส่งความคิดเห็นล้มเหลว', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 3 }}>
      {/* Header ร้าน */}
      {settings && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {settings.logo_url && (
            <Avatar 
              src={settings.logo_url} 
              alt="logo" 
              sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }} 
            />
          )}
          <Typography variant="h5">{settings.store_name}</Typography>
          <Typography variant="body2">ที่อยู่ร้าน: {settings.address}</Typography>
          {settings.contact_phone && (
            <Typography variant="body2">เบอร์โทรร้าน: {settings.contact_phone}</Typography>
          )}
          {settings.contact_email && (
            <Typography variant="body2">อีเมลติดต่อ: {settings.contact_email}</Typography>
          )}
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* แบบฟอร์ม Feedback */}
      <Typography variant="h5" sx={{ mb: 3 }}>แบบฟอร์มความคิดเห็นลูกค้า</Typography>

      <Stack spacing={2}>
        <Box>
          <Typography>อาหาร</Typography>
          <Rating value={ratingFood} onChange={(e, val) => setRatingFood(val)} />
        </Box>

        <Box>
          <Typography>บริการ</Typography>
          <Rating value={ratingService} onChange={(e, val) => setRatingService(val)} />
        </Box>

        <Box>
          <Typography>ความสะอาด</Typography>
          <Rating value={ratingCleanliness} onChange={(e, val) => setRatingCleanliness(val)} />
        </Box>

        <Box>
          <Typography>คะแนนโดยรวม *</Typography>
          <Rating value={ratingOverall} onChange={(e, val) => setRatingOverall(val)} />
        </Box>

        <TextField
          label="ความคิดเห็นเพิ่มเติม"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="เช่น รสชาติอร่อย บริการดี ฯลฯ"
        />

        <TextField
          label="อีเมล (ไม่บังคับ)"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          fullWidth
        />

        <TextField
          label="เบอร์โทร (ไม่บังคับ)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleSubmit}>ส่งความคิดเห็น</Button>
      </Stack>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackForm;
