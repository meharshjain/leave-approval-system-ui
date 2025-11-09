import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  History,
  Person,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Tawk from '../contexts/Tawk';

interface DashboardStats {
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
  leaveBalance: number;
}

interface RecentRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  totalDays: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [leaveResponse, balanceResponse] = await Promise.all([
          axios.get('/api/leave/my-requests?limit=5'),
          axios.get('/api/leave/balance')
        ]);

        const requests = leaveResponse.data.leaveRequests;
        const balances = balanceResponse.data;

        const totalBalance = balances.reduce((sum: number, balance: any) => sum + balance.remaining, 0);

        setStats({
          pendingRequests: requests.filter((req: any) => req.status === 'pending').length,
          approvedRequests: requests.filter((req: any) => req.status === 'approved').length,
          totalRequests: requests.length,
          leaveBalance: totalBalance
        });

        setRecentRequests(requests);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Stats Cards */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Requests
                  </Typography>
                  <Typography variant="h4">
                    {stats?.pendingRequests || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4">
                    {stats?.approvedRequests || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <History color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalRequests || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Leave Balance
                  </Typography>
                  <Typography variant="h4">
                    {stats?.leaveBalance || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Requests */}
      <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Requests
            </Typography>
            {recentRequests.length === 0 ? (
              <Typography color="textSecondary">
                No recent leave requests found.
              </Typography>
            ) : (
              <List>
                {recentRequests.map((request) => (
                  <ListItem key={request._id} divider>
                    <ListItemText
                      primary={`${request.leaveType} - ${request.totalDays} days`}
                      secondary={`${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
      </Box>
      <Tawk />
    </Container>
  );
};

export default Dashboard;
