import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch
} from '@mui/material';
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Pagination } from '@mui/material';

const MenuPromoManagement = () => {
  const [menus, setMenus] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('menu'); // 'menu' หรือ 'promo'
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [promoPage, setPromoPage] = useState(1);

  // ภายใน component MenuPromoManagement
  const [openDescDialog, setOpenDescDialog] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState('');

  const handleOpenDesc = (desc) => {
    setSelectedDesc(desc || 'ไม่มีรายละเอียด');
    setOpenDescDialog(true);
  };

  const handleCloseDesc = () => {
    setOpenDescDialog(false);
};

  // ธีมสีแบบเดียวกับ Layout
  const themeColors = {
    primary: '#1565c0',
    primaryLight: '#1976d2',
    secondary: '#37474f',
    background: '#f8fafc',
    surface: '#ffffff',
    textPrimary: '#263238',
    textSecondary: '#546e7a',
    success: '#2e7d32',
    warning: '#f57c00',
    error: '#d32f2f',
    divider: '#e1e5e9',
  };

  const CategoryLabel = {
    main: 'เมนูหลัก',
    appetizer: 'ของว่าง',
    dessert: 'ขนม',
    drink: 'เครื่องดื่ม',
    recommended: 'เมนูแนะนำ'
  };

  const CategoryColors = {
    main: '#1565c0',
    appetizer: '#f57c00',
    dessert: '#e91e63',
    drink: '#00acc1',
    recommended: '#43a047'
  };

  const [form, setForm] = useState({
    Name: '',
    Description: '',
    DiscountType: 'percent',
    DiscountValue: '',
    StartDate: '',
    EndDate: '',
  });

  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    cost: "",
    description: "",
    category: "main",
    imageFile: null,
  });

  // URL API
  const MENU_API = 'http://localhost/project_END/restaurant-backend/api/menus/index.php';
  const MENU_CREATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/create.php';
  const MENU_UPDATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/update.php';
  const MENU_DELETE_API = 'http://localhost/project_END/restaurant-backend/api/menus/delete.php';
  const MENU_TOGGLE_STATUS_API = 'http://localhost/project_END/restaurant-backend/api/menus/toggle_status.php';
  const PROMO_API = 'http://localhost/project_END/restaurant-backend/api/promotions/index.php';
  const PROMO_CREATE_API = 'http://localhost/project_END/restaurant-backend/api/promotions/create.php';
  const PROMO_UPDATE_API = 'http://localhost/project_END/restaurant-backend/api/promotions/update.php';
  const PROMO_DELETE_API = 'http://localhost/project_END/restaurant-backend/api/promotions/delete.php';

  // โหลดข้อมูล
  useEffect(() => {
    fetchMenus();
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(PROMO_API);
      setPromotions(res.data);
    } catch (error) {
      console.error('Fetch promotions error:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await axios.get(MENU_API);
      setMenus(res.data);
    } catch (error) {
      console.error('Fetch menu error:', error);
    }
  };

  // เปิด dialog เพิ่มเมนู
  const handleAddMenu = () => {
    setDialogMode('menu');
    setEditItem(null);
    setMenuForm({
      name: '',
      price: '',
      cost: '',
      description: '',
      category: 'main',
      imageFile: null,
    });
    setOpenDialog(true);
  };

  // เปิด dialog แก้ไขเมนู
  const handleEditMenu = (menu) => {
    setDialogMode('menu');
    setEditItem(menu);
    setMenuForm({
      name: menu.Name || '',
      price: menu.Price || '',
      cost: menu.Cost || '',
      description: menu.Description || '',
      category: menu.Category || 'main',
      imageFile: null,
    });
    setOpenDialog(true);
  };

  // ลบเมนู
  const handleDeleteMenu = async (id) => {
    if (window.confirm('ลบเมนูนี้จริงหรือไม่?')) {
      try {
        await axios.post(MENU_DELETE_API, { MenuID: id });
        fetchMenus();
      } catch (error) {
        console.error('Delete menu error:', error);
      }
    }
  };

  // Toggle สถานะเปิด/ปิดขาย
  const handleToggleStatus = async (menu) => {
    try {
      const newStatus = menu.Status === 'active' ? 'inactive' : 'active';
      await axios.post(MENU_TOGGLE_STATUS_API, {
        MenuID: menu.MenuID,
        Status: newStatus,
      });
      fetchMenus();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleSave = async () => {
    if (dialogMode === 'menu') {
      // ===== บันทึกเมนูอาหาร =====
      if (!menuForm.name || !menuForm.price) {
        alert("กรุณากรอกชื่อและราคาของเมนู");
        return;
      }

      const formData = new FormData();
      formData.append("name", menuForm.name);
      formData.append("price", Number(menuForm.price));
      formData.append("cost", Number(menuForm.cost) || 0);
      formData.append("description", menuForm.description);
      formData.append("category", menuForm.category);

      if (editItem) {
        formData.append("menu_id", editItem.MenuID);
      }

      if (menuForm.imageFile) {
        formData.append("image", menuForm.imageFile);
      }

      try {
        await axios.post(
          editItem ? MENU_UPDATE_API : MENU_CREATE_API,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setOpenDialog(false);
        fetchMenus();
      } catch (error) {
        console.error("Save menu error:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกเมนู");
      }
    } else if (dialogMode === 'promo') {
      // เช็คข้อมูลโปรโมชั่น
      if (!form.Name || !form.DiscountValue || !form.StartDate || !form.EndDate) {
        alert("กรุณากรอกข้อมูลโปรโมชั่นให้ครบถ้วน");
        return;
      }

      const formData = new FormData();
      formData.append("Name", form.Name);
      formData.append("Description", form.Description);
      formData.append("DiscountType", form.DiscountType);
      formData.append("DiscountValue", Number(form.DiscountValue));
      formData.append("StartDate", form.StartDate);
      formData.append("EndDate", form.EndDate);

      if (editItem) {
        formData.append("PromotionID", editItem.PromotionID);
      }

      try {
        await axios.post(
          editItem ? PROMO_UPDATE_API : PROMO_CREATE_API,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setOpenDialog(false);
        fetchPromotions();
        setForm({
          Name: '',
          Description: '',
          DiscountType: 'percent',
          DiscountValue: '',
          StartDate: '',
          EndDate: '',
        });
        setEditItem(null);
      } catch (error) {
        console.error("Save promo error:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกโปรโมชั่น");
      }
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('ลบโปรโมชั่นนี้จริงหรือไม่?')) return;

    try {
      await axios.post(
        PROMO_DELETE_API,
        { PromotionID: id },
        { headers: { "Content-Type": "application/json" } }
      );
      fetchPromotions();
    } catch (error) {
      console.error('Delete promo error:', error);
      alert('ลบโปรโมชั่นไม่สำเร็จ');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditPromo = (promo) => {
    setDialogMode('promo');
    setEditItem(promo);
    setForm({
      Name: promo.Name || '',
      Description: promo.Description || '',
      DiscountType: promo.DiscountType || 'percent',
      DiscountValue: promo.DiscountValue || '',
      StartDate: promo.StartDate || '',
      EndDate: promo.EndDate || '',
    });
    setOpenDialog(true);
  };

  const activeMenus = menus.filter(menu => menu.Status === 'active').length;
  const activePromos = promotions.filter(promo => promo.Status === 'active').length;

  return (
    <Box sx={{ bgcolor: themeColors.background, minHeight: '100vh', p: 3 }}>
      {/* Header Section */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 3, 
          border: `1px solid ${themeColors.divider}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RestaurantIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" color={themeColors.textPrimary}>
                  จัดการเมนูและโปรโมชั่น
                </Typography>
                <Typography variant="subtitle1" color={themeColors.textSecondary}>
                  ระบบจัดการเมนูอาหารและโปรโมชั่นพิเศษ
                </Typography>
              </Box>
            </Box>
            
            {/* Summary Stats */}
            <Grid container spacing={2} sx={{ maxWidth: 400 }}>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="700" color={themeColors.primary}>
                    {activeMenus}
                  </Typography>
                  <Typography variant="body2" color={themeColors.textSecondary}>
                    เมนูที่เปิดขาย
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="700" color={themeColors.success}>
                    {activePromos}
                  </Typography>
                  <Typography variant="body2" color={themeColors.textSecondary}>
                    โปรโมชั่นใช้งาน
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: `1px solid ${themeColors.divider}`,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '16px',
              fontWeight: '600',
              textTransform: 'none',
            },
          }}
        >
          <Tab
            icon={<RestaurantIcon />}
            label={`เมนูอาหาร (${menus.length})`}
            iconPosition="start"
            sx={{ px: 4 }}
          />
          <Tab
            icon={<LocalOfferIcon />}
            label={`โปรโมชั่น (${promotions.length})`}
            iconPosition="start"
            sx={{ px: 4 }}
          />
        </Tabs>
      </Card>

      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="600" color={themeColors.textPrimary}>
              รายการเมนูอาหาร
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddMenu}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              เพิ่มเมนูใหม่
            </Button>
          </Box>

          {/* ตารางเมนู */}
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>รูป</TableCell>
                  <TableCell>ชื่อเมนู</TableCell>
                  <TableCell>คำอธิบาย</TableCell>
                  <TableCell>ราคา</TableCell>
                  <TableCell>ต้นทุน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage) // แสดงแค่หน้าปัจจุบัน
                  .map((menu) => (
                  <TableRow key={menu.MenuID}>
                    <TableCell>
                      {menu.ImageURL ? (
                        <Box
                          component="img"
                          src={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
                          alt={menu.Name}
                          sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 40, color: themeColors.textSecondary }} />
                      )}
                    </TableCell>
                    <TableCell>{menu.Name}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleOpenDesc(menu.Description)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                    <TableCell>฿{menu.Price}</TableCell>
                    <TableCell>{menu.Cost ? `฿${menu.Cost}` : '-'}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          icon={menu.Status === 'active' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          label={menu.Status === 'active' ? 'เปิดขาย' : 'ปิดขาย'}
                          color={menu.Status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: '600' }}
                        />
                        <Switch
                          checked={menu.Status === 'active'}
                          onChange={() => handleToggleStatus(menu)}
                          color="success"
                          size="small"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditMenu(menu)}
                          sx={{ borderRadius: 2 }}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteMenu(menu.MenuID)}
                          sx={{ borderRadius: 2 }}
                        >
                          ลบ
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Dialog open={openDescDialog} onClose={handleCloseDesc} maxWidth="sm" fullWidth>
              <DialogTitle>คำอธิบายเมนู</DialogTitle>
              <DialogContent>
                <Typography>{selectedDesc}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDesc}>ปิด</Button>
              </DialogActions>
            </Dialog>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(menus.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="600" color={themeColors.textPrimary}>
              รายการโปรโมชั่น
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogMode('promo');
                setEditItem(null);
                setForm({
                  Name: '',
                  Description: '',
                  DiscountType: 'percent',
                  DiscountValue: '',
                  StartDate: '',
                  EndDate: '',
                });
                setOpenDialog(true);
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              เพิ่มโปรโมชั่น
            </Button>
          </Box>

          {/* ตารางโปรโมชั่น */}
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อโปรโมชั่น</TableCell>
                  <TableCell>คำอธิบาย</TableCell>
                  <TableCell>ส่วนลด</TableCell>
                  <TableCell>วันที่ใช้งาน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions
                  .slice((promoPage - 1) * rowsPerPage, promoPage * rowsPerPage)
                  .map((promo) => (
                  <TableRow key={promo.PromotionID}>
                    <TableCell>{promo.Name}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedDesc(promo.Description || 'ไม่มีรายละเอียด');
                          setOpenDescDialog(true);
                        }}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                    <TableCell>
                      {promo.DiscountType === 'percent'
                        ? `${promo.DiscountValue}%`
                        : `฿${promo.DiscountValue}`}
                    </TableCell>
                    <TableCell>{promo.StartDate} - {promo.EndDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={promo.Status === 'active' ? 'ใช้งานได้' : 'หมดอายุ'}
                        color={promo.Status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: '600' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditPromo(promo)}
                          sx={{ borderRadius: 2 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePromo(promo.PromotionID)}
                          sx={{ borderRadius: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination โปรโมชั่น */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(promotions.length / rowsPerPage)}
              page={promoPage}
              onChange={(e, value) => setPromoPage(value)}
              color="primary"
            />
          </Box>

          {/* Dialog แสดงรายละเอียด */}
          <Dialog open={openDescDialog} onClose={() => setOpenDescDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>รายละเอียดโปรโมชั่น</DialogTitle>
            <DialogContent>
              <Typography>{selectedDesc}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDescDialog(false)}>ปิด</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Dialog สำหรับโปรโมชั่น */}
      <Dialog 
        open={openDialog && dialogMode === 'promo'} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalOfferIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="600">
              {editItem ? 'แก้ไข' : 'เพิ่ม'}โปรโมชั่น
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>
            <TextField 
              label="ชื่อโปรโมชั่น" 
              fullWidth 
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            <TextField 
              label="รายละเอียด" 
              fullWidth 
              multiline 
              rows={3} 
              value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>ประเภทส่วนลด</InputLabel>
              <Select
                label="ประเภทส่วนลด"
                value={form.DiscountType}
                onChange={(e) => setForm({ ...form, DiscountType: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="percent">เปอร์เซ็นต์ (%)</MenuItem>
                <MenuItem value="amount">จำนวนเงิน (บาท)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="มูลค่าส่วนลด" 
              type="number" 
              fullWidth 
              value={form.DiscountValue}
              onChange={(e) => setForm({ ...form, DiscountValue: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            <Box display="flex" gap={2}>
              <TextField 
                label="วันที่เริ่ม" 
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={form.StartDate} 
                onChange={(e) => setForm({ ...form, StartDate: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              <TextField 
                label="วันที่สิ้นสุด" 
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={form.EndDate} 
                onChange={(e) => setForm({ ...form, EndDate: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            size="large"
            sx={{ borderRadius: 2, px: 3 }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            size="large"
            sx={{ borderRadius: 2, px: 3 }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับเมนู */}
      <Dialog 
        open={openDialog && dialogMode === 'menu'} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <RestaurantIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="600">
              {editItem ? "แก้ไข" : "เพิ่ม"}เมนูอาหาร
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} mt={0.5}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <TextField
                  label="ชื่อเมนู"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                
                <Box display="flex" gap={2}>
                  <TextField
                    label="ราคาขาย"
                    type="number"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <MonetizationOnIcon sx={{ mr: 1, color: themeColors.textSecondary }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  
                  <TextField
                    label="ต้นทุน"
                    type="number"
                    value={menuForm.cost}
                    onChange={(e) => setMenuForm({ ...menuForm, cost: e.target.value })}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    label="หมวดหมู่"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    startAdornment={<CategoryIcon sx={{ mr: 1, color: themeColors.textSecondary }} />}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="main">เมนูหลัก</MenuItem>
                    <MenuItem value="appetizer">ของทานเล่น</MenuItem>
                    <MenuItem value="dessert">ของหวาน</MenuItem>
                    <MenuItem value="drink">เครื่องดื่ม</MenuItem>
                    <MenuItem value="recommended">เมนูแนะนำ</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="รายละเอียด"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>
            </Grid>

            {/* Right Column - Image Upload */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: `2px dashed ${themeColors.divider}`,
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: themeColors.background,
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                {menuForm.imageFile ? (
                  <>
                    <Avatar
                      variant="rounded"
                      src={URL.createObjectURL(menuForm.imageFile)}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `2px solid ${themeColors.primary}`,
                      }}
                    />
                    <Typography variant="body2" color={themeColors.textSecondary}>
                      {menuForm.imageFile.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setMenuForm({ ...menuForm, imageFile: null })}
                      sx={{ borderRadius: 2 }}
                    >
                      ลบรูป
                    </Button>
                  </>
                ) : editItem && editItem.ImageURL ? (
                  <>
                    <Avatar
                      variant="rounded"
                      src={`http://localhost/project_END/restaurant-backend/${editItem.ImageURL}`}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `2px solid ${themeColors.divider}`,
                      }}
                    />
                    <Typography variant="body2" color={themeColors.textSecondary}>
                      รูปปัจจุบัน
                    </Typography>
                  </>
                ) : (
                  <>
                    <ImageIcon sx={{ fontSize: 64, color: themeColors.textSecondary }} />
                    <Typography variant="h6" color={themeColors.textSecondary}>
                      เลือกรูปภาพเมนู
                    </Typography>
                    <Typography variant="body2" color={themeColors.textSecondary}>
                      ขนาดแนะนำ: 400x400px
                    </Typography>
                  </>
                )}

                <Button
                  variant="contained"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontSize: '16px',
                  }}
                >
                  {menuForm.imageFile ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, imageFile: e.target.files[0] })
                    }
                  />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            size="large"
            sx={{ 
              borderRadius: 2, 
              px: 4,
              fontSize: '16px',
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!menuForm.name || !menuForm.price}
            size="large"
            sx={{ 
              borderRadius: 2, 
              px: 4,
              fontSize: '16px',
            }}
          >
            {editItem ? 'อัปเดต' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPromoManagement;