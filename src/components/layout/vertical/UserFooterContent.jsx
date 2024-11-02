import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        {/* Use Link with a wrapping component that can handle onClick */}
        <Link href={`/${locale}/home`} passHref>
          <BottomNavigationWrapper label="Home" icon={<i className="ri-home-8-fill"></i>} />
        </Link>
        <Link href={`/${locale}/leads`} passHref>
          <BottomNavigationWrapper label="Leads" icon={<i className="ri-contacts-fill"></i>} />
        </Link>
        <Link href={`/${locale}/followup`} passHref>
          <BottomNavigationWrapper label="Follow Up" icon={<i className="ri-chat-check-fill"></i>} />
        </Link>
        <Link href={`/${locale}/notes`} passHref>
          <BottomNavigationWrapper label="Notes" icon={<i className="ri-book-2-fill"></i>} />
        </Link>
        <Link href={`/${locale}/tasks`} passHref>
          <BottomNavigationWrapper label="Tasks" icon={<i className="ri-task-fill"></i>} />
        </Link>
      </BottomNavigation>
    </Box>
  );
}

// Custom component to wrap BottomNavigationAction
function BottomNavigationWrapper({ icon, label, ...props }) {
  return (
    <div {...props} style={{ width: '100%' }}> {/* Div to handle the click area properly */}
      <BottomNavigationAction label={label} icon={icon} />
    </div>
  );
}
