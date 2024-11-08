import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';

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
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        Configure
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleReconfigure}>
          Update Reference Audio
        </MenuItem>
      </Menu>
    </>
  );
}; 