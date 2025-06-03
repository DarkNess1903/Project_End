import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Box, Typography, TextField, Button } from '@mui/material';

const QRCodePage = () => {
  const [tableNumber, setTableNumber] = useState(1);

  const baseUrl = 'http://your-restaurant.com'; // เปลี่ยนเป็น URL จริงของคุณ
  const fullUrl = `${baseUrl}/?table=${tableNumber}`;

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 2,
        mt: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" gutterBottom>
        สร้าง QR Code สำหรับโต๊ะ
      </Typography>

      <TextField
        label="หมายเลขโต๊ะ"
        type="number"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box my={2}>
        <QRCodeCanvas value={fullUrl} size={256} />
        <Typography variant="body2" mt={2}>{fullUrl}</Typography>
      </Box>

      <Button
        variant="outlined"
        onClick={() => window.print()}
        fullWidth
      >
        พิมพ์ QR นี้
      </Button>
    </Box>
  );
};

export default QRCodePage;
