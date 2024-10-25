import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useParams } from 'next/navigation';

export default function UserFooterContent() {
  const [value, setValue] = React.useState(0);
  const params = useParams();
  const { lang: locale } = params;

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        borderTop: '1px solid #e0e0e0', // Add a border top for better visibility
        bgcolor: 'background.paper', // Use theme's paper background for integration
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction href={`/${locale}/home`} label="Home" icon={<i className="ri-home-8-fill"></i>} />
        <BottomNavigationAction href={`/${locale}/leads`} label="Leads" icon={<i className="ri-contacts-fill"></i>} />
        <BottomNavigationAction href={`/${locale}/followup`} label="Follow Up" icon={<i className="ri-chat-check-fill"></i>} />
        <BottomNavigationAction href={`/${locale}/notes`} label="Notes" icon={<i className="ri-book-2-fill"></i>} />
        <BottomNavigationAction href={`/${locale}/tasks`} label="Tasks" icon={<i class="ri-task-fill"></i>} />
      </BottomNavigation>
    </Box>
  );
}
