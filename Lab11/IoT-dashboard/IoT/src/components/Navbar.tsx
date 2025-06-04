import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import KiLogo from '../assets/KI.jpg';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#111' }}>
      <Container maxWidth={false}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          
          {/* Lewa sekcja */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LanguageIcon />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              IoT Dashboard
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#ccc', fontWeight: 400 }}
            >
              DEVICES STATE
            </Typography>
          </Box>

          {/* Prawa sekcja: logo KI z assets */}
          <Box
            component="img"
            src={KiLogo}
            alt="KI Logo"
            sx={{ height: 30, mr: 2 }}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
