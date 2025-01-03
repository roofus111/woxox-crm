// React Imports
import { useRef, useState } from 'react';
import axios from 'axios';

// Next Imports
import { useParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI Imports
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

// Third-party Imports
import { signOut, useSession } from 'next-auth/react';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n';

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
});

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Refs
  const anchorRef = useRef(null);

  // Hooks
  const router = useRouter();
  const { data: session } = useSession();
  const { settings } = useSettings();
  const { lang: locale } = useParams();

  const handleDropdownOpen = () => {
    setOpen((prevOpen) => !prevOpen); // Toggle state here
  };

  const handleUserLogout = async () => {
    try {
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenChangePasswordDialog = () => {
    setChangePasswordDialogOpen(true);
  };

  const handleCloseChangePasswordDialog = () => {
    setChangePasswordDialogOpen(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale));
    }

    if (anchorRef.current?.contains(event?.target)) {
      return;
    }

    setOpen(false);
  };

  const handleSubmitChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage (or use another method)

      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      // Send a request to the backend to verify the current password and update the password
      const response = await axios.post(
        'http://localhost:8000/api/change-password',
        {
          currentPassword, // Send the current password for verification
          newPassword, // Send the new password
          confirmPassword, // Send the confirm password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is passed correctly
          },
        }
      );

      if (response.data.message === 'Password updated successfully') {
        toast.success('Password changed successfully!');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setChangePasswordDialogOpen(false);
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap="circular"
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="mis-2"
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className="cursor-pointer bs-[38px] is-[38px]"
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-end"
        anchorEl={anchorRef.current}
        className="min-is-[240px] !mbs-4 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
            }}
          >
            <Paper elevation={settings.skin === 'bordered' ? 0 : 8}>
              <ClickAwayListener onClickAway={(e) => handleDropdownClose(e)}>
                <MenuList>
                  <div className="flex items-center plb-2 pli-4 gap-2" tabIndex={-1}>
                    <Avatar alt={session?.user?.name || ''} src={session?.user?.image || ''} />
                    <div className="flex items-start flex-col">
                      <Typography variant="body2" className="font-medium" color="text.primary">
                        {session?.user?.name || ''}
                      </Typography>
                      <Typography variant="caption">{session?.user?.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className="mlb-1" />
                  <MenuItem className="gap-3 pli-4" onClick={(e) => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className="ri-user-3-line" />
                    <Typography color="text.primary">My Profile</Typography>
                  </MenuItem>
                  <MenuItem className="gap-3 pli-4" onClick={(e) => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className="ri-settings-4-line" />
                    <Typography color="text.primary">Settings</Typography>
                  </MenuItem>
                  <MenuItem className="gap-3 pli-4" onClick={handleOpenChangePasswordDialog}>
                    <i className="ri-lock-password-line" />
                    <Typography color="text.primary">Change Password</Typography>
                  </MenuItem>
                  <MenuItem className="gap-3 pli-4" onClick={(e) => handleDropdownClose(e, '/pages/pricing')}>
                    <i className="ri-money-dollar-circle-line" />
                    <Typography color="text.primary">Pricing</Typography>
                  </MenuItem>
                  <MenuItem className="gap-3 pli-4" onClick={(e) => handleDropdownClose(e, '/pages/faq')}>
                    <i className="ri-question-line" />
                    <Typography color="text.primary">FAQ</Typography>
                  </MenuItem>
                  <div className="flex items-center plb-1.5 pli-4">
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      endIcon={<i className="ri-logout-box-r-line" />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onClose={handleCloseChangePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            value={passwords.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            fullWidth
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitChangePassword} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserDropdown;
