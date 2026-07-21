"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Container,
  ListSubheader,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar
} from '@mui/material';
import CompanyDetails from './CompanyDetails';
import ChangeCompanyPassword from './ChangeCompanyPassword';
import ProfileSection from './ProfileSection';
import WhatsAppSettings from './WhatsAppSettings';

const GeneralSettings = () => (
  <Box>
    <Typography variant="h4" gutterBottom>General Settings</Typography>
    <Typography>Manage your account's general settings and preferences.</Typography>
  </Box>
);

const BillingSettings = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Billing and Plans</Typography>
    <Typography>Review and manage your subscription and payment methods.</Typography>
  </Box>
);

const MemberPrivileges = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Member Privileges</Typography>
    <Typography>Configure access and permissions for team members.</Typography>
  </Box>
);

const TeamDiscussions = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Team Discussions</Typography>
    <Typography>Manage team communication and discussion settings.</Typography>
  </Box>
);

const WebhookSettings = () => {
  const [payloadUrl, setPayloadUrl] = useState('');
  const [contentType, setContentType] = useState('application/json');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Webhooks</Typography>
      <Typography variant="subtitle1">
        Configure webhooks to receive real-time updates for your repository.
      </Typography>
      {/* You can add your previous webhook configuration component here */}
    </Box>
  );
};

// Main Settings Page Component
export default function SettingsPage() {
  const [selectedSection, setSelectedSection] = useState('general');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = 300;
  const backgroundColor = '#F6F8FA';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Close drawer when selecting an item on mobile
  const handleSectionSelect = (key) => {
    setSelectedSection(key);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarSections = [
    {
      header: 'Account',
      items: [
        { 
          key: 'general', 
          label: 'General', 
          icon: <i className="ri-settings-3-line"></i>,
          component: <GeneralSettings />
        },
        { 
          key: 'profile', 
          label: 'Profile',
          icon: <i className="ri-user-settings-line"></i>, 
          component: <ProfileSection />
        },
        { 
          key: 'company', 
          label: 'Company',
          icon: <i className="ri-building-line"></i>, 
          component: <CompanyDetails />
        },
        { 
          key: 'change-password',
          label: 'Change password', 
          icon: <i className="ri-key-line"></i>,
          component: <ChangeCompanyPassword />
        },
        { 
          key: 'two-factor-authentication', 
          label: 'Two Factor Authentication', 
          icon: <i className="ri-login-circle-line"></i>,
          component: <TeamDiscussions />
        }
      ]
    },
    {
      header: 'Integrations',
      items: [
        {
          key: 'whatsapp-settings',
          label: 'WhatsApp',
          icon: <i className="ri-whatsapp-line"></i>,
          component: <WhatsAppSettings />
        },
      ]
    },
    {
      header: 'Code, planning, and automation',
      items: [
        { 
          key: 'repository', 
          label: 'Repository', 
          icon: <i className="ri-git-repository-line"></i>
        },
        { 
          key: 'actions', 
          label: 'Actions', 
          icon: <i className="ri-code-s-slash-line"></i>
        },
        { 
          key: 'webhooks', 
          label: 'Webhooks', 
          icon: <i className="ri-webhook-line"></i>,
          component: <WebhookSettings />
        },
        { 
          key: 'packages', 
          label: 'Packages', 
          icon: <i className="ri-red-packet-line"></i>
        },
        { 
          key: 'pages', 
          label: 'Pages', 
          icon: <i className="ri-pages-line"></i>
        },
        { 
          key: 'projects', 
          label: 'Projects', 
          icon: <i className="ri-projector-line"></i>
        }
      ]
    },
    {
      header: 'Security',
      items: [
        { 
          key: 'authentication-security', 
          label: 'Authentication security', 
          icon: <i className="ri-git-repository-private-line"></i>
        },
        { 
          key: 'code-security', 
          label: 'Code security and analysis', 
          icon: <i className="ri-lock-password-line"></i>
        },
        { 
          key: 'secrets', 
          label: 'Secrets', 
          icon: <i className="ri-spy-line"></i>
        }
      ]
    }
  ];

  const renderSelectedComponent = () => {
    const section = sidebarSections
      .flatMap(group => group.items)
      .find(item => item.key === selectedSection);
    
    return section?.component || <Typography>Select a section</Typography>;
  };

  const drawer = (
    <>
      <Toolbar />
      {sidebarSections.map((section, sectionIndex) => (
        <React.Fragment key={section.header}>
          {sectionIndex > 0 && <Divider />}
          <List
            subheader={
              <ListSubheader component="div" sx={{ bgcolor: 'transparent',}}>
                {section.header}
              </ListSubheader>
            }
          >
            {section.items.map((item) => (
              <ListItem 
                key={item.key}
                button
                selected={selectedSection === item.key}
                onClick={() => handleSectionSelect(item.key)}
                sx={{ 
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',  // Subtle highlight for selected item
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ))}
    </>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: backgroundColor }}>
      {/* App Bar for mobile - only visible on small screens */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "#E3E5E6",
            width: '100%',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <i className="ri-menu-line bg-gray-900"></i>
            </IconButton>
            <Typography variant="h6" color="black" noWrap component="div">
              Settings
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile drawer - temporary and togglable */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: backgroundColor  // Add background color to mobile drawer
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Desktop drawer - permanent and fixed to the left edge
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              boxShadow: 'none',
              border: 'none',
              mt: "-120px",
              position: 'relative', // This removes the absolute positioning
              bgcolor: backgroundColor // Set background color to match main content
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content area - right up against the sidebar */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, // Responsive padding
          bgcolor: backgroundColor,
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          paddingLeft: 0, // Remove the left padding
          marginLeft: 0, // Remove any margin
        }}
      >
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} /> {/* Space for the AppBar on mobile */}
        <Container maxWidth="lg" sx={{ pl: { xs: 2, md: 4 } }}>
          {renderSelectedComponent()}
        </Container>
      </Box>
    </Box>
  );
}