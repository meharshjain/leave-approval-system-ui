import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import Tawk from '../contexts/Tawk';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  department: {
    _id: string;
    name: string;
  };
  role: string;
  manager?: {
    _id: string;
    name: string;
  };
  position?: string;
  phone?: string;
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    role: 'employee',
    manager: '',
    position: '',
    phone: '',
  });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, departmentsRes, managersRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/departments'),
        axios.get('/api/users/all/managers'),
      ]);

      setUsers(usersRes.data.users);
      setDepartments(departmentsRes.data);
      setManagers(managersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      department: '',
      role: 'employee',
      manager: '',
      position: '',
      phone: '',
    });
    setUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department._id,
      role: user.role,
      manager: user.manager?._id || '',
      position: user.position || '',
      phone: user.phone || '',
    });
    setUserDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, formData);
      } else {
        await axios.post('/api/auth/register', formData);
      }
      
      setUserDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'coordinator': return 'secondary';
      case 'employee': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>

        {users.length === 0 ? (
          <Alert severity="info">
            No users found.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.name}
                        </Typography>
                        {user.position && (
                          <Typography variant="caption" color="text.secondary">
                            {user.position}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.employeeId}</TableCell>
                    <TableCell>{user.department.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.manager?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* User Dialog */}
        <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      label="Department"
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      label="Role"
                    >
                      <MenuItem value="employee">Employee</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="coordinator">Coordinator</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Manager</InputLabel>
                    <Select
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      label="Manager"
                    >
                      <MenuItem value="">No Manager</MenuItem>
                      {managers.map((manager) => (
                        <MenuItem key={manager._id} value={manager._id}>
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Tawk />
    </Container>
  );
};

export default UserManagement;
