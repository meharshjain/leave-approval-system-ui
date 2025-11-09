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
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
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
  managerApproval: {
    status: string;
    comments?: string;
  };
  coordinatorApproval: {
    status: string;
    comments?: string;
  };
  createdAt: string;
}

const LeaveApproval: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get('/api/leave/pending-approvals');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (request: LeaveRequest, status: string) => {
    setSelectedRequest(request);
    setApprovalStatus(status);
    setComments('');
    setApprovalDialog(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await axios.put(`/api/leave/approve/${selectedRequest._id}`, {
        status: approvalStatus,
        comments: comments,
      });

      setApprovalDialog(false);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error submitting approval:', error);
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

  const getApprovalStatus = (request: LeaveRequest) => {
    if (user?.role === 'manager') {
      return request.managerApproval.status;
    } else if (user?.role === 'coordinator') {
      return request.coordinatorApproval.status;
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
          Leave Approvals
        </Typography>

        {requests.length === 0 ? (
          <Alert severity="info">
            No pending leave requests found.
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
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {request.employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.employee.employeeId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(request.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.totalDays}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getApprovalStatus(request)}
                        color={getStatusColor(getApprovalStatus(request)) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApproval(request, 'approved')}
                          disabled={getApprovalStatus(request) !== 'pending'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleApproval(request, 'rejected')}
                          disabled={getApprovalStatus(request) !== 'pending'}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {approvalStatus === 'approved' ? 'Approve' : 'Reject'} Leave Request
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employee: {selectedRequest.employee.name} ({selectedRequest.employee.employeeId})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Leave Type: {selectedRequest.leaveType}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {selectedRequest.totalDays} days
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reason: {selectedRequest.reason}
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comments (Optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              color={approvalStatus === 'approved' ? 'success' : 'error'}
              variant="contained"
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 
                approvalStatus === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default LeaveApproval;
