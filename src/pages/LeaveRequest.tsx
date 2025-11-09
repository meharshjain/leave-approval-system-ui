import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

interface LeaveRequestForm {
  leaveType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  reason: string;
}


const leaveTypes = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'personal', label: 'Personal' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'paternity', label: 'Paternity' },
  { value: 'other', label: 'Other' },
];

const LeaveRequest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveRequestForm>({
    defaultValues: {
      leaveType: '',
      startDate: null,
      endDate: null,
      reason: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = endDate.diff(startDate, 'day') + 1;
      if (days < 0) {
        setError('End date must be after start date');
      } else {
        setError('');
      }
    }
  }, [startDate, endDate]);

  const onSubmit = async (data: LeaveRequestForm) => {
    if (!data.startDate || !data.endDate) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/leave/request', {
        leaveType: data.leaveType,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        reason: data.reason,
        academicYear: new Date().getFullYear().toString(),
      });

      setMessage('Leave request submitted successfully!');
      
      // Reset form
      setValue('leaveType', '');
      setValue('startDate', null);
      setValue('endDate', null);
      setValue('reason', '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const totalDays = startDate && endDate ? endDate.diff(startDate, 'day') + 1 : 0;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit Leave Request
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <FormControl fullWidth error={!!errors.leaveType}>
                  <InputLabel>Leave Type</InputLabel>
                  <Controller
                    name="leaveType"
                    control={control}
                    rules={{ required: 'Leave type is required' }}
                    render={({ field }) => (
                      <Select {...field} label="Leave Type">
                        {leaveTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.leaveType && (
                    <Typography variant="caption" color="error">
                      {errors.leaveType.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Days: {totalDays > 0 ? totalDays : 'Select dates'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: 'Start date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Start Date"
                        minDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: 'End date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="End Date"
                        minDate={startDate || dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            <Box>
              <Controller
                name="reason"
                control={control}
                rules={{ required: 'Reason is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reason"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Request'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaveRequest;
