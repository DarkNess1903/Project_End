import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemIcon,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Container,
  Avatar,
  Badge,
  Snackbar,
  Alert,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  PhotoCamera,
  Settings,
  Store,
  Image,
  Restaurant,
  Policy,
  Save,
  Edit,
  CloudUpload,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

// Custom theme colors for iPad cashier (consistent with other pages)
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

const SettingsPage = () => {
  const [allMenus, setAllMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // สถานะข้อมูล
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [logoImagePreview, setLogoImagePreview] = useState(null);
  const [shopName, setShopName] = useState('');
  const [terms, setTerms] = useState('');

  // Dialog เลือกเมนูแนะนำ
  const [openDialog, setOpenDialog] = useState(false);
  const [tempSelectedMenus, setTempSelectedMenus] = useState([]);
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // โหลดเมนูทั้งหมด
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get('http://localhost/project_END/restaurant-backend/api/menus/get_active_menus.php');
        setAllMenus(res.data);
      } catch (err) {
        console.error('โหลดเมนูล้มเหลว:', err);
        showNotification('เกิดข้อผิดพลาดในการโหลดเมนู', 'error');
      }
    };
    fetchMenus();
  }, []);

  // โหลดตั้งค่าจาก backend
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost/project_END/restaurant-backend/api/settings/get_settings.php');
        if (res.data.success) {
          const s = res.data.settings;
          setShopName(s.store_name || '');
          setAddress(s.address || '');   
          setTerms(s.service_policy || '');
          setContactEmail(s.contact_email || '');
          setContactPhone(s.contact_phone || '');

          try {
            setRecommendedMenus(
              s.recommended_menu ? JSON.parse(s.recommended_menu) : []
            );
          } catch (e) {
            console.warn("recommended_menu parse error", e);
            setRecommendedMenus([]);
          }
          if (s.cover_image_url) setCoverImagePreview(s.cover_image_url);
          if (s.logo_url) setLogoImagePreview(s.logo_url);
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // เปลี่ยนภาพปก
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showNotification("ไฟล์ใหญ่เกิน 2MB", 'warning');
      return;
    }
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      showNotification('เลือกภาพปกใหม่แล้ว', 'success');
    }
  };

  // เปลี่ยนโลโก้ร้าน
  const handleLogoImageChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showNotification("ไฟล์ใหญ่เกิน 2MB", 'warning');
      return;
    }
    if (file) {
      setLogoImage(file);
      setLogoImagePreview(URL.createObjectURL(file));
      showNotification('เลือกโลโก้ใหม่แล้ว', 'success');
    }
  };

  // เปิด Dialog เลือกเมนู
  const handleOpenDialog = () => {
    setTempSelectedMenus(recommendedMenus);
    setOpenDialog(true);
  };

  // ปิด Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // เลือก / ยกเลิกเลือกเมนูใน Dialog
  const toggleMenu = (menuId) => {
    if (tempSelectedMenus.includes(menuId)) {
      setTempSelectedMenus(tempSelectedMenus.filter(id => id !== menuId));
    } else {
      setTempSelectedMenus([...tempSelectedMenus, menuId]);
    }
  };

  // บันทึกเมนูแนะนำที่เลือกจาก Dialog
  const handleSaveSelection = () => {
    setRecommendedMenus(tempSelectedMenus);
    setOpenDialog(false);
    showNotification('เลือกเมนูแนะนำแล้ว', 'success');
  };

  // บันทึกข้อมูลทั้งหมด
  const handleSaveSettings = async () => {
    if (!shopName.trim()) {
      showNotification("กรุณากรอกชื่อร้าน", 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('store_name', shopName);
      formData.append('address', address);
      formData.append('contact_email', contactEmail);
      formData.append('contact_phone', contactPhone);
      formData.append('service_policy', terms);
      formData.append('recommended_menu', JSON.stringify(recommendedMenus));
      if (coverImage) formData.append('cover_image', coverImage);
      if (logoImage) formData.append('logo_image', logoImage);

      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/settings/save_settings.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showNotification('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        // อัพเดท preview URLs หากมีการอัพโหลดภาพใหม่
        if (res.data.cover_image_url) setCoverImagePreview(res.data.cover_image_url);
        if (res.data.logo_url) setLogoImagePreview(res.data.logo_url);
      } else {
        showNotification('เกิดข้อผิดพลาด: ' + (res.data.message || ''), 'error');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showNotification('บันทึกข้อมูลไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.colors.background,
      fontFamily: 'Prompt, Roboto, sans-serif'
    }}>
      {/* Loading Bar */}
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 9999,
            backgroundColor: theme.colors.primary 
          }} 
        />
      )}

      {/* App Bar */}
      <AppBar position="static" sx={{ backgroundColor: theme.colors.secondary, mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Settings sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: '24px' }}>
              ตั้งค่าร้านอาหาร
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={shopName || 'ยังไม่ได้ตั้งชื่อร้าน'} 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '16px',
                height: 40,
                fontWeight: 600
              }} 
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ px: 3 }}>
        <Grid container spacing={4}>
          {/* ส่วนซ้าย - ข้อมูลร้าน */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              {/* ข้อมูลร้าน */}
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Store sx={{ color: theme.colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                      ข้อมูลร้าน
                    </Typography>
                  </Box>

                  {/* โลโก้ร้าน + ชื่อร้าน */}
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <label htmlFor="logo-upload">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Fab 
                            size="small" 
                            sx={{ 
                              width: 32, 
                              height: 32,
                              backgroundColor: theme.colors.primary,
                              '&:hover': { backgroundColor: theme.colors.primary }
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </Fab>
                        }
                      >
                        <Avatar
                          src={logoImagePreview}
                          sx={{
                            width: 120,
                            height: 120,
                            cursor: 'pointer',
                            border: `3px solid ${theme.colors.primary}`,
                            backgroundColor: theme.colors.background,
                            transition: '0.2s',
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <PhotoCamera sx={{ fontSize: 40, color: theme.colors.text.secondary }} />
                        </Avatar>
                      </Badge>
                      <input 
                        id="logo-upload" 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={handleLogoImageChange} 
                      />
                    </label>

                    <Box flexGrow={1}>
                      <TextField 
                        label="ชื่อร้าน" 
                        value={shopName} 
                        onChange={(e) => setShopName(e.target.value)} 
                        fullWidth
                        required
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 56,
                            fontSize: '18px',
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ color: theme.colors.text.secondary, mt: 1 }}>
                        ชื่อร้านจะแสดงในหน้าแรกของลูกค้า
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

          {/* ข้อมูลร้านเพิ่มเติม */}
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Store sx={{ color: theme.colors.primary, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                  ข้อมูลร้านเพิ่มเติม
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
                ข้อมูลเหล่านี้จะแสดงบนใบเสร็จและหน้า QR Code
              </Typography>

              <TextField
                label="ที่อยู่ร้าน"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="กรอกที่อยู่ร้าน เช่น ถนน ซอย แขวง เขต จังหวัด รหัสไปรษณีย์"
                inputProps={{ maxLength: 255 }}
                sx={{ '& .MuiInputBase-root': { fontSize: '16px' }, mb: 1 }}
              />
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                  {address.length}/255
                </Typography>
              </Box>

              <TextField
                label="อีเมลร้าน"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                fullWidth
                placeholder="example@email.com"
                inputProps={{ maxLength: 100 }}
                sx={{ '& .MuiInputBase-root': { fontSize: '16px' }, mb: 1 }}
              />
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                  {contactEmail.length}/100
                </Typography>
              </Box>

              <TextField
                label="เบอร์โทรร้าน"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                fullWidth
                placeholder="เช่น 0812345678"
                inputProps={{ maxLength: 20 }}
                sx={{ '& .MuiInputBase-root': { fontSize: '16px' }, mb: 1 }}
              />
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                  {contactPhone.length}/20
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* เงื่อนไขการให้บริการ */}
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Policy sx={{ color: theme.colors.warning, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                  เงื่อนไขการให้บริการ
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
                ลูกค้าจะเห็นข้อความนี้ในหน้าแรกหลังจากสแกน QR Code
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
                placeholder="กรอกเงื่อนไขการให้บริการ เช่น จำกัดเวลาใช้โต๊ะ หรือไม่มีค่าใช้จ่ายขั้นต่ำ"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontSize: '16px' } }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                  กรอกข้อมูลที่สำคัญสำหรับลูกค้า
                </Typography>
                <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                  {terms.length}/500
                </Typography>
              </Box>
            </CardContent>
          </Card>

        </Stack>
      </Grid>

          {/* ส่วนขวา - ภาพและเมนู */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              {/* ภาพหน้าปก */}
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Image sx={{ color: theme.colors.success, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                      ภาพหน้าปก
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
                    ขนาดแนะนำ: 377x266 พิกเซล (รองรับเฉพาะ .jpg, .png)
                  </Typography>

                  <Box
                    sx={{
                      border: `2px dashed ${theme.colors.primary}`,
                      borderRadius: 2,
                      position: 'relative',
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.background,
                      overflow: 'hidden',
                      mb: 2,
                      transition: '0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: theme.colors.success,
                        backgroundColor: theme.colors.success + '10',
                      }
                    }}
                    onClick={() => document.getElementById('cover-upload').click()}
                  >
                    {coverImagePreview ? (
                      <Box
                        component="img"
                        src={coverImagePreview}
                        alt="Cover Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box textAlign="center">
                        <CloudUpload sx={{ fontSize: 48, color: theme.colors.text.secondary, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
                          คลิกเพื่อเลือกภาพหน้าปก
                        </Typography>
                      </Box>
                    )}
                    
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: '12px',
                        minWidth: 'auto',
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.9)',
                        },
                      }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </Button>
                  </Box>
                  
                  <input 
                    id="cover-upload"
                    type="file" 
                    hidden 
                    accept="image/jpeg, image/png" 
                    onChange={handleCoverImageChange} 
                  />
                </CardContent>
              </Card>

              {/* เมนูแนะนำ */}
              {/* <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justify="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Restaurant sx={{ color: theme.colors.error, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px' }}>
                        เมนูแนะนำ
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${recommendedMenus.length} เมนู`}
                      sx={{ 
                        backgroundColor: theme.colors.error + '20',
                        color: theme.colors.error,
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {recommendedMenus.length === 0 ? (
                    <Box textAlign="center" py={3}>
                      <Restaurant sx={{ fontSize: 48, color: theme.colors.text.secondary, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
                        ยังไม่ได้เลือกเมนูแนะนำ
                      </Typography>
                    </Box>
                  ) : (
                    <Box mb={2}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {recommendedMenus.map((id) => {
                          const menu = allMenus.find((m) => m.MenuID === id);
                          return menu ? (
                            <Chip 
                              key={id} 
                              label={menu.Name}
                              sx={{
                                backgroundColor: theme.colors.success + '20',
                                color: theme.colors.success,
                                fontWeight: 500,
                                mb: 1
                              }}
                            />
                          ) : null;
                        })}
                      </Stack>
                    </Box>
                  )}

                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<Edit />}
                    onClick={handleOpenDialog}
                    sx={{
                      height: 48,
                      fontSize: '16px',
                      borderColor: theme.colors.primary,
                      color: theme.colors.primary,
                      '&:hover': {
                        backgroundColor: theme.colors.primary + '10',
                        borderColor: theme.colors.primary,
                      }
                    }}
                  >
                    เลือกเมนูแนะนำ
                  </Button>
                </CardContent>
              </Card> */}
            </Stack>
          </Grid>
        </Grid>

        {/* ปุ่มบันทึก */}
        <Box display="flex" justifyContent="center" mt={4} mb={3}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={loading}
            sx={{
              height: 64,
              fontSize: '18px',
              fontWeight: 600,
              minWidth: 200,
              backgroundColor: theme.colors.success,
              '&:hover': {
                backgroundColor: theme.colors.success,
              }
            }}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </Box>
      </Container>

      {/* Dialog เลือกเมนูแนะนำ */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.colors.primary, 
          color: 'white',
          fontSize: '20px',
          fontWeight: 600
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Restaurant />
            เลือกเมนูแนะนำ ({tempSelectedMenus.length} เมนู)
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {allMenus.map((menu) => (
              <ListItem
                key={menu.MenuID}
                button
                onClick={() => toggleMenu(menu.MenuID)}
                sx={{
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': {
                    backgroundColor: theme.colors.background,
                  }
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={tempSelectedMenus.includes(menu.MenuID)}
                    disableRipple
                    sx={{
                      color: theme.colors.primary,
                      '&.Mui-checked': {
                        color: theme.colors.success,
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={menu.Name}
                  primaryTypographyProps={{
                    fontSize: '16px',
                    fontWeight: tempSelectedMenus.includes(menu.MenuID) ? 600 : 400
                  }}
                />
                {tempSelectedMenus.includes(menu.MenuID) && (
                  <CheckCircle sx={{ color: theme.colors.success, ml: 1 }} />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 100
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveSelection}
            sx={{ 
              height: 48,
              fontSize: '16px',
              minWidth: 120,
              backgroundColor: theme.colors.success
            }}
          >
            บันทึก ({tempSelectedMenus.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;