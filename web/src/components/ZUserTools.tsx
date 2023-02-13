import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useEntityApi } from '../fbase/hooks';
import { useSessionUser } from '../hooks/customHooks';
import { authSignOut } from '../model/auth';
import ZAccountDeleteConfirm from './ZAccountDeleteConfirm';
import ZAccountSettings from './ZAccountSettings';

export default function ZUserTools() {

    const [accountSettingsOpen, setAccountSettingsOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

    const api = useEntityApi();

    const user = useSessionUser();

    if (!user) {
        return null;
    }

    const open = Boolean(anchorEl);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    function handleSignOut() {
        handleCloseMenu();
        authSignOut(api);
    }

    function handleAccountSettingsOpen() {
        handleCloseMenu();
        setAccountSettingsOpen(true);
    }

    function openDeleteAccountConfirmationDialog() {
        handleCloseMenu();
        setConfirmDeleteOpen(true);
    }

    const displayName = user.displayName;

    return (
        <span>
            {displayName || null}
            <IconButton
                id="account-button"
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? true : undefined}
                onClick={handleOpenMenu}
            >
                <AccountCircleIcon/>
            </IconButton>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                MenuListProps={{
                    "aria-labelledby": 'account-button'
                }}
            >
                <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
                <MenuItem onClick={handleAccountSettingsOpen}>User Profile</MenuItem>
                <MenuItem onClick={openDeleteAccountConfirmationDialog}>Delete Account</MenuItem>
            </Menu>
            {accountSettingsOpen && (
                <ZAccountSettings
                    setOpen={setAccountSettingsOpen}
                />
            )}
            
            <ZAccountDeleteConfirm
                open={confirmDeleteOpen}
                setOpen={setConfirmDeleteOpen}
            />
        </span>
    );
}