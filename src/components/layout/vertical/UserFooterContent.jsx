import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
// import RestoreIcon from '@mui/icons-material/Restore';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UserFooterContent() {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={<i class="ri-home-8-fill"></i>} />
        <BottomNavigationAction label="Leads" icon={<i class="ri-contacts-fill"></i>} />
        <BottomNavigationAction label="Follow Up" icon={<i class="ri-chat-check-fill"></i>} />
      </BottomNavigation>
    </Box>

  );
}
