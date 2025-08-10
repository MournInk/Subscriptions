import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Dashboard, CloudDownload, CloudUpload } from '@mui/icons-material';

function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getValue = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return 0;
      case '/import':
        return 1;
      case '/export':
        return 2;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={getValue()} aria-label="navigation tabs">
        <Tab
          icon={<Dashboard />}
          label="Dashboard"
          component={Link}
          to="/dashboard"
        />
        <Tab
          icon={<CloudUpload />}
          label="Import"
          component={Link}
          to="/import"
        />
        <Tab
          icon={<CloudDownload />}
          label="Export"
          component={Link}
          to="/export"
        />
      </Tabs>
    </Box>
  );
}

export default Navigation;