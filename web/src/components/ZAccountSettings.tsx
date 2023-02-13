import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useSessionUser } from "../hooks/customHooks";
import ZUserProfileForm from './ZUserProfileForm';

interface AccountSettingsProps {
    setOpen: (value: boolean) => void;
}

export default function ZAccountSettings(props: AccountSettingsProps) {
    const {setOpen} = props;

    const user = useSessionUser();

    function handleClose() {
        setOpen(false);
    }

    if (!user) {
        return null;
    }

    return (
        <Dialog
                open={true}
                onClose={handleClose}
        >
            <DialogTitle>
                Update User Profile
            </DialogTitle>
            <ZUserProfileForm user={user} onClose={handleClose}/>
       </Dialog>
    )
}