import { createTheme } from '@mui/material';

// Custom color palette
export const theme = createTheme({
  palette: {
    primary: {
      main: '#2B6CB0', // Professional blue
      light: '#EBF8FF', // Light blue background
      dark: '#2C5282', // Darker blue for contrast
    },
    secondary: {
      main: '#38A169', // Success green
      light: '#C6F6D5', // Light green for success states
      dark: '#276749', // Dark green for contrast
    },
    error: {
      main: '#E53E3E', // Clear red for errors
      light: '#FED7D7', // Light red for error backgrounds
    },
    background: {
      default: '#F7FAFC', // Light gray-blue background
      paper: '#FFFFFF', // White surface
    },
    text: {
      primary: '#2D3748', // Dark gray for main text
      secondary: '#4A5568', // Medium gray for secondary text
    },
  },
  typography: {
    h4: {
      color: '#2D3748',
      fontWeight: 600,
    },
    h5: {
      color: '#2D3748',
      fontWeight: 600,
    },
    h6: {
      color: '#4A5568',
      fontWeight: 600,
    },
    subtitle1: {
      color: '#4A5568',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More modern look
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
}); 