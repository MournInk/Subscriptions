import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Refresh,
  Speed,
  Storage,
  CloudQueue,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subscriptionAPI, nodeAPI, healthAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    subscriptions: { total: 0, active: 0 },
    nodes: { total: 0, tested: 0, fast: 0, avg_latency: null }
  });
  const [topNodes, setTopNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthRes, subscriptionStats, nodeStats, topNodesRes] = await Promise.all([
        healthAPI.check(),
        subscriptionAPI.getStats(),
        nodeAPI.getStats(),
        nodeAPI.getTop(10)
      ]);

      setHealth(healthRes.data);
      setStats({
        subscriptions: subscriptionStats.data,
        nodes: nodeStats.data
      });
      setTopNodes(topNodesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAll = async () => {
    try {
      setTesting(true);
      await nodeAPI.testAll();
      // Refresh data after a short delay
      setTimeout(() => {
        fetchData();
        setTesting(false);
      }, 2000);
    } catch (err) {
      setError('Failed to start speed test');
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  const latencyData = topNodes.map((node, index) => ({
    name: node.name.substring(0, 10) + '...',
    latency: node.latency,
    index: index + 1
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Speed />}
            onClick={handleTestAll}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test All Nodes'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {health && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          System is healthy - Last updated: {new Date(health.timestamp).toLocaleString()}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudQueue sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Subscriptions
                  </Typography>
                  <Typography variant="h4">
                    {stats.subscriptions.active}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    of {stats.subscriptions.total} total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Storage sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Nodes
                  </Typography>
                  <Typography variant="h4">
                    {stats.nodes.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.nodes.tested} tested
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Speed sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Fast Nodes
                  </Typography>
                  <Typography variant="h4">
                    {stats.nodes.fast}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {'<100ms latency'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Latency
                  </Typography>
                  <Typography variant="h4">
                    {stats.nodes.avg_latency ? Math.round(stats.nodes.avg_latency) + 'ms' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    across all nodes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Latency Chart */}
        {latencyData.length > 0 && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Nodes
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="latency" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top Nodes Table */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 10 Nodes
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Latency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topNodes.slice(0, 10).map((node) => (
                      <TableRow key={node.id}>
                        <TableCell component="th" scope="row">
                          {node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name}
                        </TableCell>
                        <TableCell>
                          <Chip label={node.type} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {node.latency ? `${node.latency}ms` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;