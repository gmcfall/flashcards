import EmailIcon from '@mui/icons-material/Email';
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectRegisterEmailForm, selectRegistrationState } from "../model/auth";
import { RegisterEmailData, RegisterEmailForm, RegisterState, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_VERIFY } from "../model/types";
import authRegisterEmailChange from '../store/actions/authRegisterEmailChange';
import authRegisterEmailFormChange from '../store/actions/authRegisterEmailFormChange';
import authRegisterEmailFormSubmit from '../store/actions/authRegisterEmailFormSubmit';
import authRegisterFacebook from '../store/actions/authRegisterFacebook';
import authRegisterGoogle from "../store/actions/authRegisterGoogle";
import authRegisterNameChange from '../store/actions/authRegisterNameChange';
import authRegisterPasswordChange from '../store/actions/authRegisterPasswordChange';
import authRegisterStateUpdate from '../store/actions/authRegisterStateUpdate';
import authRegisterTwitter from '../store/actions/authRegisterTwitter';
import ZDialogWithTitle from './ZDialogWithTitle';
import ZFacebookIcon from "./ZFacebookIcon";
import ZGoogleIcon from "./ZGoogleIcon";
import ZTwitterIcon from "./ZTwitterIcon";


export const dialogContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '1em',
    padding: '2em',
}


function ZRegisterStart() {

    const dispatch = useAppDispatch();

    function handleGoogleClick() {
        dispatch(authRegisterGoogle());
    }

    function handleFacebookClick() {
        dispatch(authRegisterFacebook());
    }

    function handleTwitterClick() {
        dispatch(authRegisterTwitter());
    }

    function handleEmailClick() {
        dispatch(authRegisterStateUpdate(REGISTER_EMAIL));
    }

    return (
        <Box sx={{display: "flex", flexDirection: 'column'}}>

            <Box sx={dialogContentStyle}>
                <Button 
                    startIcon={<ZGoogleIcon/>}
                    onClick={handleGoogleClick}
                >
                    Continue with Google
                </Button>
                <Button 
                    startIcon={<ZFacebookIcon/>}
                    onClick={handleFacebookClick}
                >
                    Continue with Facebook
                </Button>
                <Button 
                    startIcon={<ZTwitterIcon/>}
                    onClick={handleTwitterClick}
                >
                    Continue with Twitter
                </Button>
                <Button 
                    startIcon={<EmailIcon/>}
                    onClick={handleEmailClick}
                >
                    Create an account with Email and Password
                </Button>

            </Box>

        </Box>

    )
}


interface RegisterEmailAlertProps {
    form: RegisterEmailForm;
}

function ZRegisterEmailAlert(props: RegisterEmailAlertProps) {
    const {form} = props;
    const {invalidEmail, invalidPassword, invalidDisplayName} = form;

    if (!invalidEmail && !invalidPassword && !invalidDisplayName) {
        return null;
    }

    const parts: string[] = [];
    if (invalidEmail) {
        parts.push("an email address");
    }
    if (invalidPassword) {
        parts.push("a password");
    }
    if (invalidDisplayName) {
        parts.push("a display name");
    }

    let msg = "You must enter " + parts[0];

    for (let i=1; i<parts.length; i++) {
        if (i === parts.length-1) {
            msg += ' and '
        } else {
            msg += ", ";
        }
        msg += parts[i];
    }

    return <Alert severity='error'>{msg}</Alert>
}

function ZRegisterEmailForm() {

    const dispatch = useAppDispatch();
    const form = useAppSelector(selectRegisterEmailForm);
    if (!form) {
        return null;
    }

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(authRegisterEmailChange(event.currentTarget.value))
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(authRegisterPasswordChange(event.currentTarget.value))
    }

    function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(authRegisterNameChange(event.currentTarget.value))
    }

    return (
        
        <Box sx={{display: "flex", flexDirection: "column", gap: "2em", minWidth: "30em"}}>
            
            <ZRegisterEmailAlert form={form}/>
            <TextField 
                label="Email" 
                variant="outlined"
                value={form.email}
                onChange={handleEmailChange}
            />
            <TextField
                label="Password" 
                variant="outlined"
                type="password"
                value={form.password}
                onChange={handlePasswordChange}
            />

            <TextField
                label="Display Name"
                variant="outlined"
                helperText="Your real name or an alias"
                value={form.displayName}
                onChange={handleNameChange}
            />
                
        </Box>
        
    )
}


interface SetOpenAsProps {
    setOpen: (value: boolean) => void
}

function ZEmailFormActions(props: SetOpenAsProps) {

    const {setOpen} = props;

    const dispatch = useAppDispatch();
    const form = useAppSelector(selectRegisterEmailForm);

    function handleCancel() {
        setOpen(false);
    }

    function handleCreateAccount() {
        const email = form?.email.trim() || '';
        const password = form?.password.trim() || '';
        const displayName = form?.displayName.trim() || '';

        const invalidEmail = !email;
        const invalidPassword = !password;
        const invalidDisplayName = !displayName;

        if (invalidEmail || invalidPassword || invalidDisplayName) {
            const newForm : RegisterEmailForm = {
                email,
                password,
                displayName,
                invalidEmail,
                invalidPassword,
                invalidDisplayName
            }
            dispatch(authRegisterEmailFormChange(newForm))
        } else {
            const data: RegisterEmailData = {
                email,
                password,
                displayName
            }
            dispatch(authRegisterEmailFormSubmit(data))
        }
    }

    return (
        <Box sx={{display: 'flex', gap: '1em'}}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleCreateAccount}>Create Account</Button>
        </Box>
    )
}

function ZOkButton(props: SetOpenAsProps) {
    const {setOpen} = props;
    function handleClick() {
        setOpen(false);
    }

    return (
        <Button onClick={handleClick}>Ok</Button>
    )
}

interface DialogActionsProps {
    state: RegisterState,
    setOpen: (value: boolean) => void
}

function ZDialogActions(props: DialogActionsProps) {
    const {state, setOpen} = props;

    switch (state) {
        case REGISTER_EMAIL: 
            return <ZEmailFormActions setOpen={setOpen}/>

        case REGISTER_EMAIL_VERIFY:
            return <ZOkButton setOpen={setOpen}/>

        default:
            return null;
    }
}

function ZRegisterEmailVerifyAnnounce() {
    return (
        <Box>
            <Alert severity='info'>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
                    <Typography>
                        Almost done! You need to verify your email address.
                    </Typography>
                    <Typography>
                        We sent you an email containing a link to complete 
                        the verification process. Simply follow the link.
                    </Typography>
                    <Typography>
                        If you don't find the email in your inbox, check your
                        spam folder.
                    </Typography>
                </Box>
            </Alert>
        </Box>
    )
}

interface RegisterDialogProps {
    setOpen: (value: boolean) => void;
}


function dialogContent(state: RegisterState) {
    switch (state) {
        case REGISTER_BEGIN:
            return <ZRegisterStart/>

        case REGISTER_EMAIL:
            return <ZRegisterEmailForm/>

        case REGISTER_EMAIL_VERIFY:
            return <ZRegisterEmailVerifyAnnounce/>

        default:
            return null;
    }
}

export default function ZRegisterDialog(props: RegisterDialogProps) {
    const {setOpen} = props;

    const registerState = useAppSelector(selectRegistrationState);
    if (!registerState) {
        return null;
    }

    const actions = (
        <ZDialogActions
            state={registerState}
            setOpen={setOpen}
        />
    )

    return (
        <ZDialogWithTitle 
            open={true}
            title="Create an Account"
            setOpen={setOpen}
            actions={actions}
        >
           {dialogContent(registerState)}
        </ZDialogWithTitle>
    )
}