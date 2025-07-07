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
} from '@mui/material';
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Switch, FormControlLabel } from '@mui/material';

const MenuPromoManagement = () => {
  const [menus, setMenus] = useState([]);
  const [promotions, setPromotions] = useState([]); // สมมติคุณมี API สำหรับโปรโมชั่น

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('menu'); // 'menu' หรือ 'promo'
  const [editItem, setEditItem] = useState(null);

  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    description: "",
    cost: "",
    imageFile: null,
    category: "main",
  });
  const [promoForm, setPromoForm] = useState({ title: '', description: '' });

  // URL API (ปรับตามจริง)
  const MENU_API = 'http://localhost/project_END/restaurant-backend/api/menus/index.php';
  const MENU_CREATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/create.php';
  const MENU_UPDATE_API = 'http://localhost/project_END/restaurant-backend/api/menus/update.php';
  const MENU_DELETE_API = 'http://localhost/project_END/restaurant-backend/api/menus/delete.php';

  // ฟังก์ชันโหลดเมนูจาก API
  const fetchMenus = async () => {
    try {
      const res = await axios.get(MENU_API);
      setMenus(res.data);
    } catch (error) {
      console.error('Fetch menu error:', error);
    }
  };

  // โหลดข้อมูลตอน mount
  useEffect(() => {
    fetchMenus();
    // TODO: fetch promotions ด้วยเหมือนกันถ้ามี API
  }, []);

  // เปิด dialog เพิ่มเมนู
  const handleAddMenu = () => {
    setDialogMode('menu');
    setEditItem(null);
    setMenuForm({ name: '', price: '', description: '', cost: '', imageUrl: '' });
    setOpenDialog(true);
  };

  // เปิด dialog แก้ไขเมนู
  const handleEditMenu = (menu) => {
    setDialogMode('menu');
    setEditItem(menu);
    setMenuForm({
      name: menu.Name,
      price: menu.Price,
      description: menu.Description || '',
      cost: menu.Cost || '',
      imageUrl: menu.ImageURL || '',
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

  // บันทึกข้อมูลเมนู (เพิ่ม/แก้ไข)
  const handleSave = async () => {
  if (!menuForm.name || !menuForm.price) {
    alert("กรุณากรอกชื่อและราคา");
    return;
  }

  const formData = new FormData();
    formData.append("name", menuForm.name);
    formData.append("price", Number(menuForm.price));
    formData.append("description", menuForm.description);
    formData.append("cost", Number(menuForm.cost) || 0);
    formData.append("category", menuForm.category || "main");

    if (editItem) {
      formData.append("menu_id", editItem.MenuID);
    }

    if (menuForm.imageFile) {
      formData.append("image", menuForm.imageFile);
    }

    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
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
  };

  const handleToggleStatus = async (menu) => {
  try {
    const newStatus = menu.Status === 'active' ? 'inactive' : 'active';
    await axios.post('http://localhost/project_END/restaurant-backend/api/menus/toggle_status.php', {
      MenuID: menu.MenuID,
      Status: newStatus,
    });
    fetchMenus();
  } catch (error) {
    console.error('Error toggling status:', error);
  }
};

  // ตัวอย่าง UI (เฉพาะเมนู) — คุณเพิ่มโปรโมชั่นเองตามรูปแบบนี้ได้
  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        จัดการเมนูอาหาร
      </Typography>
      

      <Box mb={5}>
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">โปรโมชั่น</Typography>
          <Button variant="contained">
            เพิ่มโปรโมชั่น
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">เมนูอาหาร</Typography>
          <Button variant="contained" onClick={handleAddMenu}>
            เพิ่มเมนูใหม่
          </Button>
        </Box>

        <Grid container spacing={2}>
          {menus.map((menu) => (
            <Grid item xs={12} key={menu.MenuID}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* ภาพชิดซ้าย */}
                {menu.ImageURL && (
                  <Box
                    component="img"
                    src={`http://localhost/project_END/restaurant-backend/${menu.ImageURL}`}
                    alt={menu.Name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                )}

                {/* รายละเอียดตรงกลาง */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {menu.Name}
                  </Typography>
                  <Typography>ราคา: {menu.Price} บาท</Typography>
                  <Typography>ต้นทุน: {menu.Cost}</Typography>
                  <Typography>หมวดหมู่: {menu.Category}</Typography>
                  <Typography>รายละเอียด: {menu.Description}</Typography>
                </Box>

                {/* ปุ่มจัดการขวาสุด */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
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
                  <Box>
                    <IconButton size="small" onClick={() => handleEditMenu(menu)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteMenu(menu.MenuID)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

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
