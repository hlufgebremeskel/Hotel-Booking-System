import { Box, Typography } from '@mui/material';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box className="footer">
      <Box className="footer-content">
        <Typography className="footer-text">
          &copy; {currentYear} Hotel Booking System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

