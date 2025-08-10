import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

test('renders subscription manager title', () => {
  renderWithProviders(<App />);
  const titleElement = screen.getByText(/Subscription Manager/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders navigation tabs', () => {
  renderWithProviders(<App />);
  
  const dashboardTab = screen.getByText(/Dashboard/i);
  const importTab = screen.getByText(/Import/i);
  const exportTab = screen.getByText(/Export/i);
  
  expect(dashboardTab).toBeInTheDocument();
  expect(importTab).toBeInTheDocument();
  expect(exportTab).toBeInTheDocument();
});