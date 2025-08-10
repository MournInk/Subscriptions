import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  Add,
  Delete,
  Refresh
} from '@mui/icons-material';
import { subscriptionAPI, nodeAPI } from '../services/api';

function Import() {
  const [subscriptionData, setSubscriptionData] = useState({
    name: '',
    url: '',
    type: 'auto'
  });
  const [nodeData, setNodeData] = useState({
    name: '',
    type: 'vmess',
    config: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const subscriptionTypes = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'clash', label: 'Clash' },
    { value: 'flclash', label: 'FLClash' },
    { value: 'v2ray', label: 'V2Ray' },
    { value: 'xray', label: 'XRay' },
    { value: 'ssr', label: 'ShadowsocksR' },
    { value: 'ss', label: 'Shadowsocks' }
  ];

  const nodeTypes = [
    'vmess', 'vless', 'trojan', 'shadowsocks', 'ssr', 'hysteria2', 'socks5', 'xhttp', 'http', 'anytls'
  ];

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await subscriptionAPI.create(subscriptionData);
      setSuccess(`Subscription "${subscriptionData.name}" imported successfully with ${response.data.nodes} nodes`);
      setSubscriptionData({ name: '', url: '', type: 'auto' });
      loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await nodeAPI.create(nodeData);
      setSuccess(`Node "${nodeData.name}" added successfully`);
      setNodeData({ name: '', type: 'vmess', config: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add node');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getAll();
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    }
  };

  const handleRefreshSubscription = async (id) => {
    try {
      setLoading(true);
      await subscriptionAPI.refresh(id);
      setSuccess('Subscription refreshed successfully');
      loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to refresh subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await subscriptionAPI.delete(id);
      setSuccess('Subscription deleted successfully');
      loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subscription');
    }
  };

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Import Subscriptions & Nodes
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Import Subscription */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom startIcon={<CloudUpload />}>
                Import Subscription
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Import nodes from subscription URLs. Supports various formats including Clash, V2Ray, SSR, and more.
              </Typography>
              
              <Box component="form" onSubmit={handleSubscriptionSubmit}>
                <TextField
                  fullWidth
                  label="Subscription Name"
                  value={subscriptionData.name}
                  onChange={(e) => setSubscriptionData({...subscriptionData, name: e.target.value})}
                  required
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Subscription URL"
                  value={subscriptionData.url}
                  onChange={(e) => setSubscriptionData({...subscriptionData, url: e.target.value})}
                  required
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/subscription"
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={subscriptionData.type}
                    label="Type"
                    onChange={(e) => setSubscriptionData({...subscriptionData, type: e.target.value})}
                  >
                    {subscriptionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<CloudUpload />}
                  disabled={loading}
                >
                  Import Subscription
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Manual Node */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Manual Node
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Manually add individual nodes with their configuration.
              </Typography>
              
              <Box component="form" onSubmit={handleNodeSubmit}>
                <TextField
                  fullWidth
                  label="Node Name"
                  value={nodeData.name}
                  onChange={(e) => setNodeData({...nodeData, name: e.target.value})}
                  required
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Node Type</InputLabel>
                  <Select
                    value={nodeData.type}
                    label="Node Type"
                    onChange={(e) => setNodeData({...nodeData, type: e.target.value})}
                  >
                    {nodeTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Node Configuration"
                  value={nodeData.config}
                  onChange={(e) => setNodeData({...nodeData, config: e.target.value})}
                  required
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  placeholder="vmess:// or vless:// or JSON configuration"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  disabled={loading}
                >
                  Add Node
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Existing Subscriptions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Existing Subscriptions
              </Typography>
              <Paper variant="outlined">
                <List>
                  {subscriptions.map((subscription) => (
                    <ListItem key={subscription.id}>
                      <ListItemText
                        primary={subscription.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              URL: {subscription.url}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip label={subscription.type} size="small" sx={{ mr: 1 }} />
                              <Chip 
                                label={subscription.is_active ? 'Active' : 'Inactive'} 
                                size="small" 
                                color={subscription.is_active ? 'success' : 'default'}
                                sx={{ mr: 1 }}
                              />
                              {subscription.expires_at && (
                                <Chip 
                                  label={`Expires: ${new Date(subscription.expires_at).toLocaleDateString()}`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="refresh"
                          onClick={() => handleRefreshSubscription(subscription.id)}
                          sx={{ mr: 1 }}
                        >
                          <Refresh />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteSubscription(subscription.id)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {subscriptions.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="No subscriptions found"
                        secondary="Import your first subscription using the form above"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Import;