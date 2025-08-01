import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Button, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Typography
} from '@mui/material';
import { format } from 'date-fns';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    Description: '',
    Amount: '',
    ExpenseType: '',
    ExpenseDate: '',
  });
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    type: '',
  });

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (filter.startDate) params.start_date = filter.startDate;
      if (filter.endDate) params.end_date = filter.endDate;
      if (filter.type) params.expense_type = filter.type;

      const res = await axios.get('http://localhost/project_END/restaurant-backend/api/expenses/index.php', { params });
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost/project_END/restaurant-backend/api/expenses/create.php', formData);
      setFormData({ Description: '', Amount: '', ExpenseType: '', ExpenseDate: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.Amount || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6">เพิ่มรายจ่าย</Typography>
          <form onSubmit={handleSubmit} className="grid gap-2 mt-2">
            <TextField label="ชื่อรายการ" fullWidth required
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })} />
            <TextField label="จำนวนเงิน" type="number" fullWidth required
              value={formData.Amount}
              onChange={(e) => setFormData({ ...formData, Amount: e.target.value })} />
            <TextField label="ประเภท" fullWidth
              value={formData.ExpenseType}
              onChange={(e) => setFormData({ ...formData, ExpenseType: e.target.value })} />
            <TextField label="วันที่" type="date" InputLabelProps={{ shrink: true }} fullWidth required
              value={formData.ExpenseDate}
              onChange={(e) => setFormData({ ...formData, ExpenseDate: e.target.value })} />
            <Button variant="contained" color="primary" type="submit">บันทึกรายจ่าย</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">รายการรายจ่าย</Typography>
          <div className="flex gap-2 mt-2 mb-2">
            <TextField label="จากวันที่" type="date" InputLabelProps={{ shrink: true }}
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} />
            <TextField label="ถึงวันที่" type="date" InputLabelProps={{ shrink: true }}
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} />
            <TextField label="ประเภท"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })} />
            <Button variant="outlined" onClick={fetchExpenses}>ค้นหา</Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>วันที่</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell>ประเภท</TableCell>
                <TableCell>จำนวน</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.ExpenseID}>
                  <TableCell>{format(new Date(exp.ExpenseDate), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{exp.Description}</TableCell>
                  <TableCell>{exp.ExpenseType}</TableCell>
                  <TableCell>{parseFloat(exp.Amount).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>รวม</strong></TableCell>
                <TableCell><strong>฿{total.toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensePage;
