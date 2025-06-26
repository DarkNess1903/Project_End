import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const SettingsPage = () => {
  const [allMenus, setAllMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);

  // โหลดเมนูทั้งหมด
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get('http://localhost/project_END/restaurant-backend/api/menus/get_active_menus.php');
        setAllMenus(res.data);
      } catch (err) {
        console.error('โหลดเมนูล้มเหลว:', err);
      }
    };
    fetchMenus();
  }, []);

  // สถานะข้อมูล
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [logoImage, setLogoImage] = useState(null);
  const [logoImagePreview, setLogoImagePreview] = useState(null);

  const [shopName, setShopName] = useState('');
  const [terms, setTerms] = useState('');

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // Dialog เลือกเมนูแนะนำ
  const [openDialog, setOpenDialog] = useState(false);
  const [tempSelectedMenus, setTempSelectedMenus] = useState([]);

  // โหลดตั้งค่าจาก backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost/project_END/restaurant-backend/api/settings/get_settings.php');
        if (res.data.success) {
          const s = res.data.settings;
          setShopName(s.store_name || '');
          setTerms(s.service_policy || '');
          setRecommendedMenus(s.recommended_menu ? JSON.parse(s.recommended_menu) : []);
          setCategories(s.categories || []);
          if (s.cover_image_url) setCoverImagePreview(s.cover_image_url);
          if (s.logo_url) setLogoImagePreview(s.logo_url);
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
      }
    };
    fetchSettings();
  }, []);

  // เปลี่ยนภาพปก
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  // เปลี่ยนโลโก้ร้าน
  const handleLogoImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      setLogoImagePreview(URL.createObjectURL(file));
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
  };

  // เพิ่มหมวดหมู่
  const addCategory = () => {
    if (newCategory.trim() !== '') {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };
  // ลบหมวดหมู่
  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // บันทึกข้อมูลทั้งหมด
  const handleSaveSettings = async () => {
    try {
      const formData = new FormData();
      formData.append('store_name', shopName);
      formData.append('service_policy', terms);
      formData.append('recommended_menu', JSON.stringify(recommendedMenus));
      formData.append('categories', JSON.stringify(categories));

      if (coverImage) {
        formData.append('cover_image', coverImage);
      }
      if (logoImage) {
        formData.append('logo_image', logoImage);
      }

      const res = await axios.post('http://localhost/project_END/restaurant-backend/api/settings/save_settings.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        alert('บันทึกข้อมูลเรียบร้อย');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (res.data.message || ''));
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  // เมนูแนะนำตัวแรก (สำหรับภาพใหญ่)
  const firstMenu = allMenus.find(m => m.MenuID === recommendedMenus[0]);

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Typography variant="h4" mb={3}>
        ตั้งค่าร้านอาหาร
      </Typography>

      <Stack spacing={3}>
        {/* ภาพหน้าปก */}
        <Box>
          <Typography variant="h6" gutterBottom>
            ภาพหน้าปก
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            ขนาดแนะนำ: 377x266 พิกเซล (รองรับเฉพาะ .jpg, .png) — จะแสดงในหน้าแรก
          </Typography>

          <Box
            sx={{
              border: '1px dashed grey',
              borderRadius: 2,
              position: 'relative',
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              overflow: 'hidden',
              mb: 1,
            }}
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
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีภาพหน้าปก
              </Typography>
            )}
            <Button
              variant="contained"
              size="small"
              component="label"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 12,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                },
              }}
            >
              แก้ไขภาพ
              <input type="file" hidden accept="image/jpeg, image/png" onChange={handleCoverImageChange} />
            </Button>
          </Box>
        </Box>

        {/* โลโก้ร้าน + ชื่อร้าน */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            โลโก้ร้านและชื่อร้าน
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <label htmlFor="logo-upload">
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #ccc',
                  bgcolor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {logoImagePreview ? (
                  <Box
                    component="img"
                    src={logoImagePreview}
                    alt="Logo"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PhotoCameraIcon fontSize="large" sx={{ color: '#aaa' }} />
                )}
              </Box>
              <input id="logo-upload" type="file" hidden accept="image/*" onChange={handleLogoImageChange} />
            </label>

            <TextField label="ชื่อร้าน" value={shopName} onChange={(e) => setShopName(e.target.value)} fullWidth />
          </Box>
        </Box>

        {/* เงื่อนไขการให้บริการ */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            เงื่อนไขการให้บริการ
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            ลูกค้าจะเห็นข้อความนี้ในหน้าแรกหลังจากสแกน QR
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            inputProps={{ maxLength: 500 }}
            placeholder="กรอกเงื่อนไขการให้บริการ เช่น จำกัดเวลาใช้โต๊ะ หรือไม่มีค่าใช้จ่ายขั้นต่ำ"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary" align="right" display="block">
            {terms.length}/500
          </Typography>
        </Box>

        {/* เมนูแนะนำ */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            เมนูแนะนำ
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            เมนูที่แนะนำให้ลูกค้าดู สร้างความน่าสนใจด้วยภาพเมนูที่โดดเด่น
          </Typography>

          {/* ภาพเมนูแนะนำตัวแรก (ใหญ่) */}
          {firstMenu && firstMenu.ImageURL && (
            <Box
              component="img"
              src={firstMenu.ImageURL}
              alt={firstMenu.Name}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2,
                boxShadow: 3,
              }}
            />
          )}

          {/* รายการเมนูแนะนำแบบ scroll แนวนอน */}
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 1,
              mb: 2,
              py: 1,
              border: '1px solid #ccc',
              borderRadius: 1,
              bgcolor: '#fafafa',
            }}
          >
            {recommendedMenus.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                ยังไม่มีเมนูแนะนำ
              </Typography>
            )}
            {recommendedMenus.map((menuId) => {
              const menu = allMenus.find((m) => m.MenuID === menuId);
              if (!menu) return null;

              return (
                <Box
                  key={menuId}
                  sx={{
                    minWidth: 120,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: 1,
                    bgcolor: 'white',
                    textAlign: 'center',
                    cursor: 'default',
                  }}
                >
                  {menu.ImageURL ? (
                    <Box
                      component="img"
                      src={menu.ImageURL}
                      alt={menu.Name}
                      sx={{ width: '100%', height: 100, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#eee',
                        color: '#999',
                        fontSize: 14,
                      }}
                    >
                      ไม่มีรูป
                    </Box>
                  )}
                  <Typography variant="body2" noWrap sx={{ px: 0.5, py: 0.5 }}>
                    {menu.Name}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* ปุ่มเปิด Dialog เลือกเมนูแนะนำ */}
          <Button variant="contained" onClick={handleOpenDialog}>
            เลือกเมนูแนะนำ
          </Button>

          {/* Dialog เลือกเมนู */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>เลือกเมนูแนะนำ</DialogTitle>
            <DialogContent dividers>
              <List>
                {allMenus.map((menu) => (
                  <ListItem key={menu.MenuID} button onClick={() => toggleMenu(menu.MenuID)}>
                    <ListItemIcon>
                      <Checkbox checked={tempSelectedMenus.includes(menu.MenuID)} />
                    </ListItemIcon>
                    <ListItemText primary={menu.Name} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>ยกเลิก</Button>
              <Button variant="contained" onClick={handleSaveSelection}>
                บันทึก
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* หมวดหมู่ */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            หมวดหมู่เมนู
          </Typography>

          <Stack direction="row" spacing={1} mb={1}>
            <TextField
              size="small"
              placeholder="เพิ่มหมวดหมู่ เช่น อาหาร, เครื่องดื่ม"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={addCategory}>
              เพิ่ม
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ maxHeight: 200, overflowY: 'auto' }}>
            <List dense>
              {categories.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={item} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => removeCategory(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* ปุ่มบันทึก */}
        <Box textAlign="right">
          <Button variant="contained" color="primary" onClick={handleSaveSettings}>
            บันทึก
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
