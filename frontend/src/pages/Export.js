import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudDownload,
  GetApp,
  Preview,
  Close
} from '@mui/icons-material';
import { exportAPI, nodeAPI } from '../services/api';

function Export() {
  const [exportFormat, setExportFormat] = useState('clash');
  const [nodeLimit, setNodeLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [topNodes, setTopNodes] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const formatDescriptions = {
    clash: 'Clash/FLClash YAML configuration file',
    flclash: 'FLClash YAML configuration file',
    v2ray: 'V2Ray subscription (Base64 encoded)',
    xray: 'XRay subscription (Base64 encoded)',
    ssr: 'ShadowsocksR subscription',
    shadowsocks: 'Shadowsocks subscription',
    json: 'Raw JSON data of all nodes'
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [formatsRes, nodesRes] = await Promise.all([
        exportAPI.getFormats(),
        nodeAPI.getTop(nodeLimit)
      ]);
      
      setAvailableFormats(formatsRes.data.available_formats || []);
      setTopNodes(nodesRes.data);
    } catch (err) {
      setError('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await exportAPI.export(exportFormat, nodeLimit);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from content-disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `subscription.${exportFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Successfully exported ${nodeLimit} nodes in ${exportFormat} format`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to export subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await exportAPI.export(exportFormat, Math.min(nodeLimit, 3));
      
      let content = '';
      if (response.data instanceof Blob) {
        content = await response.data.text();
      } else {
        content = response.data;
      }
      
      // Limit preview content length
      if (content.length > 2000) {
        content = content.substring(0, 2000) + '\n...\n[Content truncated]';
      }
      
      setPreviewContent(content);
      setPreviewOpen(true);
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [nodeLimit]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Export Subscriptions
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Export the top performing nodes in various subscription formats for use with different proxy clients.
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
        {/* Export Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Configuration
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  {availableFormats.map((format) => (
                    <MenuItem key={format} value={format}>
                      {format.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Number of Nodes"
                value={nodeLimit}
                onChange={(e) => setNodeLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                inputProps={{ min: 1, max: 50 }}
                sx={{ mb: 2 }}
                helperText="Maximum 50 nodes"
              />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {formatDescriptions[exportFormat] || 'Select a format to see description'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CloudDownload />}
                  onClick={handleExport}
                  disabled={loading || topNodes.length === 0}
                  fullWidth
                >
                  Export Subscription
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={handlePreview}
                  disabled={loading || topNodes.length === 0}
                >
                  Preview
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Status
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Available Nodes: {topNodes.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Export Format: {exportFormat.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Nodes to Export: {Math.min(nodeLimit, topNodes.length)}
                </Typography>
              </Box>

              {topNodes.length === 0 && (
                <Alert severity="warning">
                  No nodes available for export. Import some subscriptions and run speed tests first.
                </Alert>
              )}

              {topNodes.length > 0 && (
                <Alert severity="info">
                  Ready to export {Math.min(nodeLimit, topNodes.length)} top performing nodes
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Nodes Preview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Nodes ({topNodes.length} available)
              </Typography>
              <Paper variant="outlined">
                <List>
                  {topNodes.slice(0, Math.min(nodeLimit, 10)).map((node, index) => (
                    <ListItem key={node.id}>
                      <ListItemText
                        primary={`${index + 1}. ${node.name}`}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Type: {node.type} | Latency: {node.latency ? `${node.latency}ms` : 'N/A'}
                            </Typography>
                            {node.last_tested && (
                              <Typography variant="caption" color="textSecondary">
                                Last tested: {new Date(node.last_tested).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={node.type} 
                          size="small" 
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={node.latency ? `${node.latency}ms` : 'Not tested'} 
                          size="small" 
                          color={node.latency && node.latency < 100 ? 'success' : 'default'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {topNodes.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="No nodes available"
                        secondary="Import subscriptions and run speed tests to see nodes here"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
              
              {topNodes.length > 10 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Showing first 10 nodes. {topNodes.length - 10} more available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview: {exportFormat.toUpperCase()} Format
          <Button
            onClick={() => setPreviewOpen(false)}
            sx={{ float: 'right' }}
            startIcon={<Close />}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={20}
            value={previewContent}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Export;