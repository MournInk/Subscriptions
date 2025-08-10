import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import Export from './pages/Export';
import Navigation from './components/Navigation';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Subscription Manager
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/import" element={<Import />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;