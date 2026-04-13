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
  Link,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { Upload, InsertDriveFile, Close } from '@mui/icons-material';

interface LeaveRequestForm {
  leaveType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  reason: string;
}

interface FileData {
  file: File | null;
  name: string;
  error: string;
}


const leaveTypes = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'paid', label: 'Paid Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'restricted', label: 'Restricted Holiday' },
];

const LeaveRequest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<FileData>({ file: null, name: '', error: '' });

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setAttachment({ file: null, name: '', error: 'Only JPEG, PNG, and PDF files are allowed' });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAttachment({ file: null, name: '', error: 'File size must be less than 5MB' });
      return;
    }

    setAttachment({ file, name: file.name, error: '' });
  };

  const removeAttachment = () => {
    setAttachment({ file: null, name: '', error: '' });
  };

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
      const formData = new FormData();
      formData.append('leaveType', data.leaveType);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());
      formData.append('reason', data.reason);
      formData.append('academicYear', new Date().getFullYear().toString());
      if (attachment.file) {
        formData.append('attachment', attachment.file);
      }

      const response = await axios.post('/api/leave/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Leave request submitted successfully!');

      // Reset form
      setValue('leaveType', '');
      setValue('startDate', null);
      setValue('endDate', null);
      setValue('reason', '');
      removeAttachment();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const totalDays = startDate && endDate ? endDate.diff(startDate, 'day') + 1 : 0;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 300px' }, minWidth: { xs: '100%', sm: '250px' } }}>
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

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 300px' }, minWidth: { xs: '100%', sm: '250px' }, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Days: {totalDays > 0 ? totalDays : 'Select dates'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 300px' }, minWidth: { xs: '100%', sm: '250px' } }}>
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

            {/* Attach Document */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Attach Document (Optional)
              </Typography>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="attachment-input"
              />
              <label htmlFor="attachment-input">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<Upload />}
                  sx={{ mb: 1 }}
                >
                  Choose File
                </Button>
              </label>
              {attachment.error && (
                <Typography variant="caption" color="error" sx={{ display: 'block', ml: 1 }}>
                  {attachment.error}
                </Typography>
              )}
              {attachment.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <InsertDriveFile fontSize="small" />
                  <Typography variant="body2">{attachment.name}</Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={removeAttachment}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <Close fontSize="small" />
                  </Button>
                </Box>
              )}
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
