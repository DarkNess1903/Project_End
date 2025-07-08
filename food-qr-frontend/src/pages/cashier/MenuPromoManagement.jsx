import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Switch, FormControlLabel } from '@mui/material';

const MenuPromoManagement = () => {
  const [menus, setMenus] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('menu'); // 'menu' หรือ 'promo'
  const [editItem, setEditItem] = useState(null);

  const CategoryLabel = {
    main: 'เมนูหลัก',
    appetizer: 'ของว่าง',
    dessert: 'ขนม',
    drink: 'เครื่องดื่ม',
    recommended: 'เมนูแนะนำ'
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

  const [promoForm, setPromoForm] = useState({
    Name: '',
    Description: '',
    DiscountType: 'percent',
    DiscountValue: '',
    StartDate: '',
    EndDate: ''
  });

  // URL API
  const MENU_API = 'http://localhost/project_END/restaurant-backend/api/menus/index.php';
  const MENU_CREATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/create.php';
  const MENU_UPDATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/update.php';
  const MENU_DELETE_API = 'http://localhost/project_END/restaurant-backend/api/menus/delete.php';
  const MENU_TOGGLE_STATUS_API = 'http://localhost/project_END/restaurant-backend/api/menus/toggle_status.php';
  const PROMO_API = 'http://localhost/project_END/restaurant-backend/api/promotions/index.php';
  const PROMO_CREATE_API = 'http://localhost/project_END/restaurant-backend/api/promotions/create.php';

  // โหลดข้อมูล
  useEffect(() => {
    fetchMenus();
    fetchPromotions(); // เพิ่มส่วนนี้
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
      imageFile: null, // ไม่โหลดไฟล์รูปเดิม
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
    // ===== บันทึกโปรโมชั่น =====
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

    try {
      await axios.post(
        PROMO_CREATE_API,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setOpenDialog(false);
      fetchPromotions();
      // reset form
      setForm({
        Name: '',
        Description: '',
        DiscountType: 'percent',
        DiscountValue: '',
        StartDate: '',
        EndDate: '',
      });
    } catch (error) {
      console.error("Save promo error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกโปรโมชั่น");
    }
  }
};

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        จัดการเมนูอาหาร
      </Typography>
      
    <Box mb={5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">โปรโมชั่น</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setDialogMode('promo');
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
        >
          เพิ่มโปรโมชั่น
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อโปรโมชั่น</TableCell>
              <TableCell>รายละเอียด</TableCell>
              <TableCell>ส่วนลด</TableCell>
              <TableCell>เริ่ม</TableCell>
              <TableCell>สิ้นสุด</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.PromotionID}>
                <TableCell>{promo.Name}</TableCell>
                <TableCell>{promo.Description}</TableCell>
                <TableCell>
                  {promo.DiscountType === 'percent'
                    ? `${promo.DiscountValue}%`
                    : `${promo.DiscountValue} บาท`}
                </TableCell>
                <TableCell>{promo.StartDate}</TableCell>
                <TableCell>{promo.EndDate}</TableCell>
                <TableCell sx={{ color: promo.Status === 'active' ? 'green' : 'gray' }}>
                  {promo.Status === 'active' ? 'กำลังใช้งาน' : 'หมดอายุ'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">เมนูอาหาร</Typography>
          <Button variant="contained" onClick={handleAddMenu}>
            เพิ่มเมนูใหม่
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 5 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รูป</TableCell>
                <TableCell>ชื่อเมนู</TableCell>
                <TableCell>ราคา</TableCell>
                <TableCell>ต้นทุน</TableCell>
                <TableCell>หมวดหมู่</TableCell>
                <TableCell>รายละเอียด</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menus.map((menu) => (
                <TableRow key={menu.MenuID}>
                  <TableCell>
                    {menu.ImageURL && (
                      <Box
                        component="img"
                        src={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
                        alt={menu.Name}
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{menu.Name}</TableCell>
                  <TableCell>{menu.Price} บาท</TableCell>
                  <TableCell>{menu.Cost}</TableCell>
                  <TableCell>{CategoryLabel[menu.Category] || menu.Category}</TableCell>
                  <TableCell>{menu.Description}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={menu.Status === 'active'}
                          onChange={() => handleToggleStatus(menu)}
                          color="success"
                        />
                      }
                      label={menu.Status === 'active' ? 'เปิดขาย' : 'ปิดขาย'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditMenu(menu)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteMenu(menu.MenuID)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

            {/* Dialog ฟอร์มเพิ่มโปรโมชั่น */}
      <Dialog open={openDialog && dialogMode === 'promo'} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>เพิ่มโปรโมชั่น</DialogTitle>
        <DialogContent>
          <TextField label="ชื่อโปรโมชั่น" fullWidth margin="dense" value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          <TextField label="รายละเอียด" fullWidth margin="dense" multiline rows={2} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          <TextField select label="ประเภทส่วนลด" fullWidth margin="dense" value={form.DiscountType}
            onChange={(e) => setForm({ ...form, DiscountType: e.target.value })}>
            <MenuItem value="percent">เปอร์เซ็นต์ (%)</MenuItem>
            <MenuItem value="amount">จำนวนเงิน (บาท)</MenuItem>
          </TextField>
          <TextField label="มูลค่าส่วนลด" type="number" fullWidth margin="dense" value={form.DiscountValue}
            onChange={(e) => setForm({ ...form, DiscountValue: e.target.value })} />
          <TextField label="วันที่เริ่ม" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={form.StartDate} onChange={(e) => setForm({ ...form, StartDate: e.target.value })} />
          <TextField label="วันที่สิ้นสุด" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={form.EndDate} onChange={(e) => setForm({ ...form, EndDate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ฟอร์มเพิ่ม/แก้ไขเมนู */}
      <Dialog open={openDialog && dialogMode === 'menu'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? "แก้ไข" : "เพิ่ม"} เมนูอาหาร</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ชื่อเมนู"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="ราคา"
              type="number"
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              fullWidth
            />
            <TextField
              label="ต้นทุน"
              type="number"
              value={menuForm.cost}
              onChange={(e) => setMenuForm({ ...menuForm, cost: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                label="หมวดหมู่"
                value={menuForm.category}
                onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              >
                <MenuItem value="main">อาหารคาว</MenuItem>
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
              rows={2}
            />
            <Button
              variant="outlined"
              component="label"
            >
              เลือกรูปภาพ
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setMenuForm({ ...menuForm, imageFile: e.target.files[0] })
                }
              />
            </Button>
            {menuForm.imageFile && (
              <Typography variant="body2" color="text.secondary">
                {menuForm.imageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPromoManagement;