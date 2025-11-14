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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import {
  CloudUpload,
  VideoCall,
  Delete,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRequestForm {
  leaveType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  reason: string;
  scheduledDate: Dayjs | null;
  scheduledTime: string;
  meetingLink: string;
}

interface LeaveBalance {
  leaveType: string;
  remaining: number;
  totalAllocated: number;
  used: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instant-leave-tabpanel-${index}`}
      aria-labelledby={`instant-leave-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InstantLeaveApproval: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [validationProgress, setValidationProgress] = useState(0);
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestForm>({
    defaultValues: {
      leaveType: 'sick',
      startDate: null,
      endDate: null,
      reason: '',
      scheduledDate: null,
      scheduledTime: '',
      meetingLink: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const leaveType = watch('leaveType');

  // Fetch leave balances
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await axios.get('/api/leave/balance');
        setLeaveBalances(response.data);
      } catch (error) {
        console.error('Error fetching leave balances:', error);
      }
    };
    fetchLeaveBalances();
  }, []);

  // Calculate available leave balance for selected leave type
  const currentBalance = leaveBalances.find((b) => b.leaveType === leaveType);
  const availableDays = currentBalance?.remaining || 10;

  // Calculate total days
  const totalDays = startDate && endDate ? endDate.diff(startDate, 'day') + 1 : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage('');
    setError('');
    setSelectedFile(null);
    setFilePreview(null);
    reset();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Submit document-based instant leave
  const onSubmitDocument = async (data: LeaveRequestForm) => {
    if (!data.startDate || !data.endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (!selectedFile) {
      setError('Please upload a medical document');
      return;
    }

    /* if (totalDays > availableDays) {
      setError(`Insufficient leave balance. Available: ${availableDays} days, Requested: ${totalDays} days`);
      return;
    }
 */
    setLoading(true);
    setUploading(true);
    setValidationProgress(0);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('medicalDocument', selectedFile);
      formData.append('leaveType', data.leaveType);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());
      formData.append('reason', data.reason);
      formData.append('academicYear', new Date().getFullYear().toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setValidationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await axios.post('/api/leave/instant/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setValidationProgress(percentCompleted);
          }
        },
      });

      clearInterval(progressInterval);
      setValidationProgress(100);

      setMessage(response.data.message || 'Instant leave request approved successfully!');
      
      // Show validation details if available
      if (response.data.validationResult) {
        const validation = response.data.validationResult;
        setMessage(
          `${response.data.message}\n\nValidated by: ${validation.doctorName || 'AI'}\n` +
          `Qualification: ${validation.doctorQualification || 'N/A'}\n` +
          `Reason: ${validation.reason || 'Document validated successfully'}`
        );
      }

      // Reset form
      reset();
      setSelectedFile(null);
      setFilePreview(null);
      setValidationProgress(0);

      // Refresh leave balances
      const balanceResponse = await axios.get('/api/leave/balance');
      setLeaveBalances(balanceResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit instant leave request');
      if (err.response?.data?.reason) {
        setError(`${err.response.data.message}: ${err.response.data.reason}`);
      }
      setValidationProgress(0);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Submit appointment-based instant leave
  const onSubmitAppointment = async (data: LeaveRequestForm) => {
    if (!data.startDate || !data.endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (!data.scheduledDate || !data.scheduledTime) {
      setError('Please select appointment date and time');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.scheduledTime)) {
      setError('Please enter a valid time in HH:MM format (24-hour)');
      return;
    }

    /* if (totalDays > availableDays) {
      setError(`Insufficient leave balance. Available: ${availableDays} days, Requested: ${totalDays} days`);
      return;
    } */

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/leave/instant/appointment', {
        leaveType: data.leaveType,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        reason: data.reason,
        academicYear: new Date().getFullYear().toString(),
        scheduledDate: data.scheduledDate.toISOString(),
        scheduledTime: data.scheduledTime,
        meetingLink: data.meetingLink,
      });

      setMessage(response.data.message || 'Virtual appointment scheduled successfully!');
      
      // Reset form
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule virtual appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Instant Leave Approval
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Quickly request and get approval for leaves through medical document upload or virtual appointment
        </Typography>

        {/* Leave Balance Display */}
        {currentBalance && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Available Leave Balance:</strong> {availableDays} days ({leaveType} leave)
            </Typography>
            {totalDays > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Requested:</strong> {totalDays} days | <strong>Remaining after approval:</strong> {Math.max(0, availableDays - totalDays)} days
              </Typography>
            )}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
            {message.split('\n').map((line, idx) => (
              <Typography key={idx} variant="body2">
                {line}
              </Typography>
            ))}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="instant leave options">
            <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Medical Document" />
            <Tab icon={<VideoCall />} iconPosition="start" label="Schedule Virtual Appointment" />
          </Tabs>
        </Box>

        {/* Document Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleSubmit(onSubmitDocument)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Leave Type and Dates */}
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
                          <MenuItem value="sick">Sick Leave</MenuItem>
                          <MenuItem value="emergency">Emergency Leave</MenuItem>
                        </Select>
                      )}
                    />
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

              {/* Reason */}
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
                      rows={3}
                      fullWidth
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
                    />
                  )}
                />
              </Box>

              {/* File Upload */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Medical Document
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload a medical document signed by a doctor (MBBS or above). Accepted formats: PDF, JPEG, PNG, GIF, WEBP (Max 10MB)
                </Typography>

                {!selectedFile ? (
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PDF, JPEG, PNG, GIF, WEBP (Max 10MB)
                    </Typography>
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </Box>
                ) : (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {filePreview ? (
                          <Box
                            component="img"
                            src={filePreview}
                            alt="Preview"
                            sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2">PDF</Typography>
                          </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1">{selectedFile.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <IconButton onClick={handleRemoveFile} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Uploading and validating document with AI...
                    </Typography>
                    <LinearProgress variant="determinate" value={validationProgress} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {validationProgress}% complete
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || uploading || !selectedFile}
                  startIcon={loading || uploading ? <CircularProgress size={20} /> : <CheckCircle />}
                  sx={{ mt: 2 }}
                >
                  {uploading ? 'Validating...' : loading ? 'Submitting...' : 'Submit for Instant Approval'}
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Virtual Appointment Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleSubmit(onSubmitAppointment)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Leave Type and Dates */}
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
                          <MenuItem value="sick">Sick Leave</MenuItem>
                          <MenuItem value="emergency">Emergency Leave</MenuItem>
                        </Select>
                      )}
                    />
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
                          label="Leave Start Date"
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
                          label="Leave End Date"
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

              {/* Reason */}
              <Box>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: 'Reason is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reason for Leave"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
                    />
                  )}
                />
              </Box>

              {/* Appointment Scheduling */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Schedule Virtual Appointment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Schedule a virtual appointment with a doctor. After the appointment, if approved, your leave will be automatically granted.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Controller
                        name="scheduledDate"
                        control={control}
                        rules={{ required: 'Appointment date is required' }}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="Appointment Date"
                            minDate={dayjs()}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.scheduledDate,
                                helperText: errors.scheduledDate?.message,
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Controller
                      name="scheduledTime"
                      control={control}
                      rules={{ 
                        required: 'Appointment time is required',
                        pattern: {
                          value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                          message: 'Please enter time in HH:MM format (24-hour)'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Appointment Time"
                          type="time"
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 minutes
                          }}
                          error={!!errors.scheduledTime}
                          helperText={errors.scheduledTime?.message || 'Format: HH:MM (24-hour)'}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Controller
                    name="meetingLink"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Meeting Link (Optional)"
                        placeholder="https://meet.google.com/..."
                        fullWidth
                        helperText="Provide a meeting link for the virtual appointment (e.g., Google Meet, Zoom)"
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <VideoCall />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default InstantLeaveApproval;

