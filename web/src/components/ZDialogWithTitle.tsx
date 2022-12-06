
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));


export interface DialogHeaderProps {
    children: React.ReactNode,
    closeLabel?: string,
    /** 
     * Callback to close the dialog by clicking a close button in the header.
     * If undefined, the button is omitted
     */
    onClose?: () => void
}

export function ZDialogHeader(props: DialogHeaderProps) {
    const {children, closeLabel, onClose} = props;

    const closeLabelValue = closeLabel || 'close';

    return (
        <DialogTitle sx={{margin: 0, padding: 2}}>
            {children}
            {onClose && (
                <IconButton
                    aria-label={closeLabelValue}
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            )}
            
        </DialogTitle>
    )
}

export interface DialogWithTitleProps {
    title: string;
    children?: React.ReactNode | React.ReactNode[];
    actions?: React.ReactNode;
    open: boolean;
    setOpen?: (value: boolean) => void;
}

export default function ZDialogWithTitle(props: DialogWithTitleProps) {
    const {
        title, children, actions, open, setOpen
    } = props;

    const dialogClose = setOpen ? () => setOpen(false) : undefined;

    return (
        <BootstrapDialog
            open={open}
            onClose={dialogClose}
        >
            <ZDialogHeader
                onClose={dialogClose}
            >
                {title}
            </ZDialogHeader>
            <DialogContent dividers>
                {children}
            </DialogContent>

            { actions && (
                <DialogActions>
                    {actions}
                </DialogActions>
            )}
        </BootstrapDialog>
    );
}