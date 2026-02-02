'use client'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E3B55',
      light: '#4A5568',
      dark: '#1A202C',
    },
    secondary: {
      main: '#E53E3E',
      light: '#FC8181',
      dark: '#C53030',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    },
    h2: {
      fontWeight: 600,
      fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    },
    h3: {
      fontWeight: 600,
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(46, 59, 85, 0.08)',
        },
      },
    },
  },
})

export default function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}