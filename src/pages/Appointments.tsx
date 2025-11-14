import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
} from '@mui/material';
import { VideoCall } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
  };
  doctor?: {
    _id: string;
    name: string;
    email: string;
  };
  leaveRequest?: {
    _id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
  };
  meetingLink: string;
  startTime?: string;
  endTime?: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const appointmentsRes = await axios.get('/api/leaves/medical/my-appointments');
      setAppointments(appointmentsRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'completed': return 'success';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Appointments
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View and join virtual appointments. To schedule new appointments, use the Instant Leave &gt; Schedule Virtual Appointment section.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Leave Request</TableCell>
              <TableCell>Scheduled Date/Time</TableCell>
              <TableCell>Meeting Link</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary" sx={{ py: 3 }}>
                    No appointments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {appointment.employee.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {appointment.employee.employeeId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {appointment.doctor ? (
                      <Typography variant="body2">{appointment.doctor.name}</Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not assigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {appointment.leaveRequest ? (
                      <Box>
                        <Typography variant="body2">{appointment.leaveRequest.leaveType}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(appointment.leaveRequest.startDate).toLocaleDateString()} - {new Date(appointment.leaveRequest.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No leave request</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {appointment.startTime ? (
                      <Box>
                        <Typography variant="body2">
                          {new Date(appointment.startTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(appointment.startTime).toLocaleTimeString()} - {appointment.endTime ? new Date(appointment.endTime).toLocaleTimeString() : 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2">
                          {new Date(appointment.scheduledDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {appointment.scheduledTime}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {appointment.meetingLink ? (
                      <Link
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <VideoCall fontSize="small" />
                        Join Meeting
                      </Link>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No link available
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Appointments;

