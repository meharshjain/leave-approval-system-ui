import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Person, Link as LinkIcon, CheckCircle, Cancel } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';


interface ProfileForm {
  name: string;
  phone: string;
  position: string;
  password: string;
}


const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<boolean | null>(null);
  const [checkingGoogle, setCheckingGoogle] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      position: user?.position || '',
      password: '',
    },
  });

  useEffect(() => {
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    try {
      const response = await axios.get('/api/google/status');
      setGoogleAuthStatus(response.data.isAuthenticated);
    } catch (error) {
      console.error('Error checking Google auth:', error);
      setGoogleAuthStatus(false);
    } finally {
      setCheckingGoogle(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await axios.get('/api/google/auth');
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to initiate Google authentication');
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await axios.delete('/api/google/disconnect');
      setGoogleAuthStatus(false);
      setMessage('Google account disconnected successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to disconnect Google account');
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updates: any = {
        name: data.name,
        phone: data.phone,
        position: data.position,
      };
      // Only send password if provided
      if (data.password) updates.password = data.password;

      await updateProfile(updates);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" color="error">
            User not found
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar sx={{ width: 64, height: 64, mr: 3 }}>
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user.position || 'Employee'} • {user.department.name}
            </Typography>
          </Box>
        </Box>

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
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={user.employeeId}
                  disabled
                  helperText="Employee ID cannot be changed"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={user.department.name}
                  disabled
                  helperText="Department cannot be changed"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ 
                    pattern: {
                      value: /^[0-9+\-\s()]*$/,
                      message: 'Invalid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Position"
                      error={!!errors.position}
                      helperText={errors.position?.message}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user.role}
                  disabled
                  helperText="Role cannot be changed"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Manager"
                  value={user.manager?.name || 'N/A'}
                  disabled
                  helperText="Manager cannot be changed"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            error={!!errors?.password}
            helperText={errors?.password ? errors.password.message : 'Enter new password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(v => !v)}
                    edge="end"
                    tabIndex={-1} // optional: prevents focusing icon when tabbing
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            autoComplete="new-password"
          />
        )}
      />
    </Box>
            </Box>

            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Google Calendar Integration */}
        {(user?.role === 'doctor' || user?.role === 'manager' || user?.role === 'admin') && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" gutterBottom>
              Google Calendar Integration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect your Google account to automatically generate Google Meet links for appointments
            </Typography>
            <Card variant="outlined">
              <CardContent>
                {checkingGoogle ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography>Checking connection status...</Typography>
                  </Box>
                ) : googleAuthStatus ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <CheckCircle color="success" />
                      <Typography variant="body1" fontWeight="medium">
                        Google account connected
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleDisconnectGoogle}
                    >
                      Disconnect Google
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <Cancel color="error" />
                      <Typography variant="body1">
                        Google account not connected
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<LinkIcon />}
                      onClick={handleConnectGoogle}
                    >
                      Connect Google Account
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
