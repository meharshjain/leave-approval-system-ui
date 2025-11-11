import React, { useState, useEffect } from 'react';
import {
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
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  Settings,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Tawk from '../contexts/Tawk';

interface DashboardStats {
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
  leaveBalance: number;
  rejectedRequests: number;
}

interface RecentRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  totalDays: number;
}

interface ChartData {
  date: string;
  approved: number;
  pending: number;
  rejected: number;
}

type TimeFilter = 'WEEK' | 'MONTH' | 'YEAR';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('WEEK');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { user } = useAuth();

  // Generate chart data based on time filter
  const generateChartData = (filter: TimeFilter): ChartData[] => {
    const today = new Date();
    const data: ChartData[] = [];
    
    let days = 7;
    if (filter === 'MONTH') days = 30;
    if (filter === 'YEAR') days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate sample data - in production, this would come from API
      const baseApproved = Math.floor(Math.random() * 20) + 10;
      const basePending = Math.floor(Math.random() * 15) + 5;
      const baseRejected = Math.floor(Math.random() * 10) + 2;
      
      data.push({
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        approved: baseApproved,
        pending: basePending,
        rejected: baseRejected,
      });
    }
    
    return data;
  };

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
          leaveBalance: totalBalance,
          rejectedRequests: requests.filter((req: any) => req.status === 'rejected').length,
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

  useEffect(() => {
    setChartData(generateChartData(timeFilter));
  }, [timeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Calculate approval rate percentage
  const approvalRate = stats?.totalRequests 
    ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 0, m: 0 }}>
      <Box sx={{ bgcolor: '#1a1a1a', minHeight: '100vh', p: 3, borderRadius: 2 }}>
        {/* KPI Cards Section */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {/* Approval Rate Card */}
          <Card sx={{ 
            flex: '1 1 300px', 
            bgcolor: '#2a2a2a', 
            color: 'white',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Settings sx={{ color: '#666', fontSize: 20 }} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: '#3b82f6', 
                  mr: 1.5,
                  borderRadius: 0.5
                }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Approval Rate
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {approvalRate}%
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                  <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                  <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                WEEKLY SCOPE
              </Typography>
            </CardContent>
          </Card>

          {/* Pending Requests Card */}
          <Card sx={{ 
            flex: '1 1 300px', 
            bgcolor: '#2a2a2a', 
            color: 'white',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Settings sx={{ color: '#666', fontSize: 20 }} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: '#3b82f6', 
                  mr: 1.5,
                  borderRadius: 0.5
                }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Pending Requests
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats?.pendingRequests || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <TrendingDown sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <TrendingDown sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <TrendingDown sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                AWAITING APPROVAL
              </Typography>
            </CardContent>
          </Card>

          {/* Active Leaves Card */}
          <Card sx={{ 
            flex: '1 1 300px', 
            bgcolor: '#2a2a2a', 
            color: 'white',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Settings sx={{ color: '#666', fontSize: 20 }} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: '#3b82f6', 
                  mr: 1.5,
                  borderRadius: 0.5
                }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Leave Balance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats?.leaveBalance || 0}
                </Typography>
                <Box sx={{ 
                  bgcolor: '#1e3a5f', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <Typography variant="caption" sx={{ color: '#60a5fa' }}>
                    4 WEEKS
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                REMAINING DAYS
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Time Filter Buttons */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
          <ButtonGroup variant="text" sx={{ bgcolor: '#2a2a2a' }}>
            <Button
              onClick={() => setTimeFilter('WEEK')}
              sx={{
                color: timeFilter === 'WEEK' ? '#3b82f6' : '#666',
                bgcolor: timeFilter === 'WEEK' ? '#1e3a5f' : 'transparent',
                '&:hover': {
                  bgcolor: timeFilter === 'WEEK' ? '#1e3a5f' : '#333',
                },
                textTransform: 'uppercase',
                fontWeight: 'bold',
                px: 3,
              }}
            >
              Week
            </Button>
            <Button
              onClick={() => setTimeFilter('MONTH')}
              sx={{
                color: timeFilter === 'MONTH' ? '#3b82f6' : '#666',
                bgcolor: timeFilter === 'MONTH' ? '#1e3a5f' : 'transparent',
                '&:hover': {
                  bgcolor: timeFilter === 'MONTH' ? '#1e3a5f' : '#333',
                },
                textTransform: 'uppercase',
                fontWeight: 'bold',
                px: 3,
              }}
            >
              Month
            </Button>
            <Button
              onClick={() => setTimeFilter('YEAR')}
              sx={{
                color: timeFilter === 'YEAR' ? '#3b82f6' : '#666',
                bgcolor: timeFilter === 'YEAR' ? '#1e3a5f' : 'transparent',
                '&:hover': {
                  bgcolor: timeFilter === 'YEAR' ? '#1e3a5f' : '#333',
                },
                textTransform: 'uppercase',
                fontWeight: 'bold',
                px: 3,
              }}
            >
              Year
            </Button>
          </ButtonGroup>
        </Box>

        {/* Chart Section */}
        <Paper sx={{ 
          bgcolor: '#2a2a2a', 
          p: 3, 
          borderRadius: 2,
          minHeight: '400px'
        }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase' }}>
                  Pending
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '50%' }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase' }}>
                  Approved
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: '50%' }} />
                <Typography variant="body2" sx={{ color: '#999', textTransform: 'uppercase' }}>
                  Rejected
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="approved" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorApproved)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorPending)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="rejected" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorRejected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Recent Requests */}
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ bgcolor: '#2a2a2a', p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Recent Leave Requests
            </Typography>
            {recentRequests.length === 0 ? (
              <Typography color="#666">
                No recent leave requests found.
              </Typography>
            ) : (
              <List>
                {recentRequests.map((request) => (
                  <ListItem key={request._id} divider sx={{ borderColor: '#333' }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white' }}>
                          {request.leaveType} - {request.totalDays} days
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: '#666' }}>
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </Typography>
                      }
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
      </Box>
      <Tawk />
    </Box>
  );
};

export default Dashboard;
