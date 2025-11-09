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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRecord {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  managerApproval: {
    status: string;
    approvedBy?: {
      name: string;
    };
    approvedAt?: string;
    comments?: string;
  };
  coordinatorApproval: {
    status: string;
    approvedBy?: {
      name: string;
    };
    approvedAt?: string;
    comments?: string;
  };
  createdAt: string;
}

const LeaveRecords: React.FC = () => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<LeaveRecord[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaveRecords();
  }, [academicYear]);

  useEffect(() => {
    filterRecords();
  }, [records, searchEmployee]);

  const fetchLeaveRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leave/records/${academicYear}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching leave records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchEmployee) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record =>
      record.employee.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      record.employee.employeeId.toLowerCase().includes(searchEmployee.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getApprovalStatus = (record: LeaveRecord) => {
    const managerStatus = record.managerApproval.status;
    const coordinatorStatus = record.coordinatorApproval.status;
    
    if (managerStatus === 'rejected' || coordinatorStatus === 'rejected') {
      return 'rejected';
    }
    if (managerStatus === 'approved' && coordinatorStatus === 'approved') {
      return 'approved';
    }
    return 'pending';
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
        <Typography variant="h4" gutterBottom>
          Leave Records
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                label="Academic Year"
              >
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <TextField
              fullWidth
              label="Search Employee"
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <Box sx={{ flex: '0 0 auto' }}>
            <Button
              variant="outlined"
              onClick={fetchLeaveRecords}
              sx={{ height: '56px' }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {filteredRecords.length === 0 ? (
          <Alert severity="info">
            No leave records found for the selected criteria.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Manager Approval</TableCell>
                  <TableCell>Coordinator Approval</TableCell>
                  <TableCell>Applied Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {record.employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.employee.employeeId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{record.leaveType}</TableCell>
                    <TableCell>
                      {new Date(record.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(record.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.totalDays}</TableCell>
                    <TableCell>
                      <Chip
                        label={getApprovalStatus(record)}
                        color={getStatusColor(getApprovalStatus(record)) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={record.managerApproval.status}
                          color={getStatusColor(record.managerApproval.status) as any}
                          size="small"
                        />
                        {record.managerApproval.approvedBy && (
                          <Typography variant="caption" display="block">
                            by {record.managerApproval.approvedBy.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={record.coordinatorApproval.status}
                          color={getStatusColor(record.coordinatorApproval.status) as any}
                          size="small"
                        />
                        {record.coordinatorApproval.approvedBy && (
                          <Typography variant="caption" display="block">
                            by {record.coordinatorApproval.approvedBy.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default LeaveRecords;
