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

interface Department {
  _id: string;
  name: string;
  description?: string;
  coordinator?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coordinator: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [departmentsRes, coordinatorsRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/users/all/managers'),
      ]);

      setDepartments(departmentsRes.data);
      setCoordinators(coordinatorsRes.data.filter((user: User) =>
        user.role === 'coordinator' || user.role === 'admin'
      ));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      coordinator: '',
    });
    setDepartmentDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      coordinator: department.coordinator?._id || '',
    });
    setDepartmentDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingDepartment) {
        await axios.put(`/api/departments/${editingDepartment._id}`, formData);
      } else {
        await axios.post('/api/departments', formData);
      }

      setDepartmentDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving department:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm('Are you sure you want to deactivate this department?')) {
      try {
        await axios.delete(`/api/departments/${departmentId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 2, sm: 3, md: 4 } }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Department Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddDepartment}
          >
            Add Department
          </Button>
        </Box>

        {departments.length === 0 ? (
          <Alert severity="info">
            No departments found.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Coordinator</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {department.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {department.description || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {department.coordinator ? (
                        <Box>
                          <Typography variant="subtitle2">
                            {department.coordinator.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {department.coordinator.email}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={department.isActive ? 'Active' : 'Inactive'}
                        color={department.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditDepartment(department)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDepartment(department._id)}
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

        {/* Department Dialog */}
        <Dialog open={departmentDialog} onClose={() => setDepartmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Department Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Coordinator</InputLabel>
                  <Select
                    value={formData.coordinator}
                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                    label="Coordinator"
                  >
                    <MenuItem value="">No Coordinator</MenuItem>
                    {coordinators.map((coordinator) => (
                      <MenuItem key={coordinator._id} value={coordinator._id}>
                        {coordinator.name} ({coordinator.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDepartmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Tawk />
    </Container>
  );
};

export default DepartmentManagement;
