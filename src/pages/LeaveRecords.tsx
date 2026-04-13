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
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
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
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [dateError, setDateError] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'month' | 'range'>('month');
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaveRecords();
  }, [academicYear, filterMode]);

  // Reset fields when filter mode changes
  useEffect(() => {
    if (filterMode === 'month') {
      setDateFrom(null);
      setDateTo(null);
      setDateError('');
    } else {
      setMonthFilter('all');
    }
  }, [filterMode]);

  const fetchLeaveRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('filterMode', filterMode);

      if (filterMode === 'month') {
        params.append('academicYear', academicYear);
        if (monthFilter && monthFilter !== 'all') params.append('month', monthFilter);
      } else {
        // Range mode doesn't use academicYear in query, but URL requires it
        if (dateFrom) params.append('fromDate', dateFrom.toISOString());
        if (dateTo) params.append('toDate', dateTo.toISOString());
      }

      if (searchEmployee) params.append('searchQuery', searchEmployee);

      // academicYear is always required in the URL path
      const url = `/api/leave/records/${academicYear}?${params.toString()}`;
      const response = await axios.get(url);
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error('Error fetching leave records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom.isAfter(dateTo)) {
      setDateError('From date must be before To date');
    } else {
      setDateError('');
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!searchEmployee) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record =>
      record.employee.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      record.employee.employeeId.toLowerCase().includes(searchEmployee.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [records, searchEmployee]);

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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Leave Records
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {/* Filter Mode Toggle */}
          <Box sx={{ flex: '1 1 100%', minWidth: '300px' }}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>Filter By:</Typography>
              <RadioGroup
                row
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as 'month' | 'range')}
              >
                <FormControlLabel value="month" control={<Radio />} label="Year + Month" />
                <FormControlLabel value="range" control={<Radio />} label="Specific Date Range" />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FormControl fullWidth disabled={filterMode !== 'month'}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                label="Academic Year"
              >
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
            <FormControl fullWidth disabled={filterMode !== 'month'}>
              <InputLabel>Month</InputLabel>
              <Select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                label="Month"
              >
                <MenuItem value="all">All Months</MenuItem>
                <MenuItem value="1">January</MenuItem>
                <MenuItem value="2">February</MenuItem>
                <MenuItem value="3">March</MenuItem>
                <MenuItem value="4">April</MenuItem>
                <MenuItem value="5">May</MenuItem>
                <MenuItem value="6">June</MenuItem>
                <MenuItem value="7">July</MenuItem>
                <MenuItem value="8">August</MenuItem>
                <MenuItem value="9">September</MenuItem>
                <MenuItem value="10">October</MenuItem>
                <MenuItem value="11">November</MenuItem>
                <MenuItem value="12">December</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
              <DatePicker
                label="From Date"
                value={dateFrom}
                onChange={(value) => setDateFrom(value)}
                disabled={filterMode !== 'range'}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!dateError,
                    helperText: filterMode === 'range' ? dateError : ' '
                  }
                }}
              />
            </Box>

            <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
              <DatePicker
                label="To Date"
                value={dateTo}
                onChange={(value) => setDateTo(value)}
                disabled={filterMode !== 'range'}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!dateError,
                    helperText: filterMode === 'range' ? (dateError || ' ') : ' '
                  }
                }}
              />
            </Box>
          </LocalizationProvider>

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

          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={fetchLeaveRecords}
              sx={{ height: '56px' }}
              disabled={!!dateError}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterMode('month');
                setMonthFilter('all');
                setDateFrom(null);
                setDateTo(null);
                setSearchEmployee('');
                setDateError('');
                setAcademicYear(new Date().getFullYear().toString());
                fetchLeaveRecords();
              }}
              sx={{ height: '56px' }}
              startIcon={<Clear />}
            >
              Clear
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
