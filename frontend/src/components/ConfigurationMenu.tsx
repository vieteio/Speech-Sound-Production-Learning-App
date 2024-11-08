import React from 'react';
import { Button, Menu, MenuItem, Box, Typography, Fade } from '@mui/material';

interface ConfigurationMenuProps {
  onReconfigure: () => void;
}

export const ConfigurationMenu: React.FC<ConfigurationMenuProps> = ({ onReconfigure }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReconfigure = () => {
    handleClose();
    onReconfigure();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        }}
        title="Configure reference pronunciation"
      >
        Configure Reference
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        TransitionComponent={Fade}
        transitionDuration={200}
        elevation={4}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={handleReconfigure}
          sx={{
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          }}
        >
          Update Reference Pronunciation
        </MenuItem>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Change the reference recording used for comparison
          </Typography>
        </Box>
      </Menu>
    </>
  );
}; 