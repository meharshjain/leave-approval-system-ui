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
  CircularProgress,
  Alert,
  IconButton,
  Link,
} from '@mui/material';
import { CheckCircle, Cancel, VideoCall, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRequest {
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
  medicalApproval: {
    status: string;
    requiresReview: boolean;
    comments?: string;
  };
  virtualAppointment?: {
    _id: string;
    meetingLink: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  createdAt: string;
}

const MedicalReview: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [comments, setComments] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorQualification, setDoctorQualification] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await axios.get('/api/leaves/medical/pending');
      setRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching pending reviews:', error);
      setError(error.response?.data?.message || 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (request: LeaveRequest, status: string) => {
    setSelectedRequest(request);
    setApprovalStatus(status);
    setComments('');
    // Auto-fill doctor name and qualification from user profile
    setDoctorName(user?.name || '');
    setDoctorQualification(user?.position || '');
    setApprovalDialog(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    if (!doctorName.trim() || !doctorQualification.trim()) {
      setError('Doctor name and qualification are required');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      await axios.post(`/api/leaves/medical/approve/${selectedRequest._id}`, {
        status: approvalStatus,
        comments: comments,
        doctorName: doctorName,
        doctorQualification: doctorQualification,
      });

      setApprovalDialog(false);
      fetchPendingReviews();
    } catch (error: any) {
      console.error('Error submitting approval:', error);
      setError(error.response?.data?.message || 'Failed to submit approval');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Medical Review
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Review and approve leave requests requiring medical validation
      </Typography>

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
              <TableCell>Leave Type</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Appointment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" sx={{ py: 3 }}>
                    No pending medical reviews
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {request.employee.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {request.employee.employeeId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell>
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{request.totalDays}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {request.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {request.virtualAppointment?.meetingLink ? (
                      <Link
                        href={request.virtualAppointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <VideoCall fontSize="small" />
                        Join Meeting
                      </Link>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No appointment
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.medicalApproval?.status || 'pending'}
                      color={getStatusColor(request.medicalApproval?.status || 'pending') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleApproval(request, 'approved')}
                        title="Approve"
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleApproval(request, 'rejected')}
                        title="Reject"
                      >
                        <Cancel />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalStatus === 'approved' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Employee: {selectedRequest.employee.name} ({selectedRequest.employee.employeeId})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Leave Type: {selectedRequest.leaveType}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Date Range: {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Doctor Name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Doctor Qualification"
            value={doctorQualification}
            onChange={(e) => setDoctorQualification(e.target.value)}
            margin="normal"
            required
            placeholder="e.g., MBBS, MD, etc."
          />
          <TextField
            fullWidth
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder={approvalStatus === 'approved' ? 'Add any additional notes...' : 'Please provide reason for rejection...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={submitApproval}
            variant="contained"
            color={approvalStatus === 'approved' ? 'success' : 'error'}
            disabled={processing || !doctorName.trim() || !doctorQualification.trim()}
          >
            {processing ? <CircularProgress size={24} /> : approvalStatus === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicalReview;

