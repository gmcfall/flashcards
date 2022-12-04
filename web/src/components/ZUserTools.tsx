import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import authSignout from "../store/actions/authSignout";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ZAccountSettings from './ZAccountSettings';
import ZAccountDeleteConfirm from './ZAccountDeleteConfirm';

export default function ZUserTools() {

    const [accountSettingsOpen, setAccountSettingsOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);

    if (!session) {
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
        dispatch(authSignout());
    }

    function handleAccountSettingsOpen() {
        handleCloseMenu();
        setAccountSettingsOpen(true);
    }

    function openDeleteAccountConfirmationDialog() {
        handleCloseMenu();
        setConfirmDeleteOpen(true);
    }

    const user = session.user;
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
                <MenuItem onClick={handleAccountSettingsOpen}>Account Settings</MenuItem>
                <MenuItem onClick={openDeleteAccountConfirmationDialog}>Delete Account</MenuItem>
            </Menu>
            <ZAccountSettings
                open={accountSettingsOpen}
                setOpen={setAccountSettingsOpen}
            />
            <ZAccountDeleteConfirm
                open={confirmDeleteOpen}
                setOpen={setConfirmDeleteOpen}
            />
        </span>
    );
}