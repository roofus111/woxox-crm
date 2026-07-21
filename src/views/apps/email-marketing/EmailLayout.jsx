'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, useMediaQuery, useTheme, IconButton, Divider, Chip,
} from '@mui/material';
import Image from 'next/image';
import woxoxLogo from '@core/svg/woxoxlogo2.0.png';

const NAV_ITEMS = [
  { label: 'Dashboard', href: 'dashboard', icon: 'ri-dashboard-line' },
  { label: 'Inbox', href: 'inbox', icon: 'ri-inbox-line' },
  { label: 'Sent', href: 'sent', icon: 'ri-send-plane-line' },
  { label: 'Scheduled', href: 'scheduled', icon: 'ri-time-line' },
  { label: 'Drafts', href: 'drafts', icon: 'ri-draft-line' },
  { divider: true, label: 'Marketing' },
  { label: 'Campaigns', href: 'campaigns', icon: 'ri-megaphone-line' },
  { label: 'Automation', href: 'automation', icon: 'ri-flow-chart' },
  { label: 'Templates', href: 'templates', icon: 'ri-layout-line' },
  { label: 'Email Builder', href: 'builder', icon: 'ri-drag-drop-line' },
  { divider: true, label: 'Audience' },
  { label: 'Lists', href: 'lists', icon: 'ri-contacts-line' },
  { label: 'Segments', href: 'segments', icon: 'ri-filter-3-line' },
  { divider: true, label: 'Insights' },
  { label: 'Analytics', href: 'analytics', icon: 'ri-bar-chart-line' },
  { divider: true, label: 'Configuration' },
  { label: 'SMTP Settings', href: 'smtp', icon: 'ri-server-line' },
  { label: 'Sender Domains', href: 'domains', icon: 'ri-global-line' },
  { label: 'Suppression List', href: 'suppression', icon: 'ri-forbid-line' },
  { label: 'Activity Logs', href: 'logs', icon: 'ri-history-line' },
  { label: 'Webhooks', href: 'webhooks', icon: 'ri-webhook-line' },
  { label: 'Settings', href: 'settings', icon: 'ri-settings-3-line' },
];

const DRAWER_WIDTH = 260;

export default function EmailLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const pathname = usePathname();
  const locale = params.lang;
  const basePath = `/${locale}/manager/email`;

  const sidebar = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <Image src={woxoxLogo} alt="Woxox" width={28} height={28} style={{ objectFit: 'contain' }} />
          Email Marketing
          <Chip label="Beta" size="small" sx={{ ml: 0.5, height: 20, fontSize: 11, bgcolor: 'warning.main', color: 'warning.contrastText' }} />
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>Enterprise Campaign Manager</Typography>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return (
              <Box key={idx} sx={{ px: 2, pt: 2, pb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  {item.label}
                </Typography>
              </Box>
            );
          }
          const href = `${basePath}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={href}
              selected={active}
              sx={{ mx: 1, borderRadius: 1, mb: 0.25 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <i className={item.icon} style={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Chip
          icon={<i className="ri-add-line" />}
          label="Compose"
          component={Link}
          href={`${basePath}/compose`}
          clickable
          color="primary"
          sx={{ width: '100%' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
      {isMobile ? (
        sidebar
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
          }}
        >
          {sidebar}
        </Drawer>
      )}
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto', bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
}
