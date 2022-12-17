import { Box, Typography } from "@mui/material";

interface NotFoundProps {
    message: string;
}
export default function ZNotFound(props: NotFoundProps) {
    const {message} = props;

    return (
        <Box sx={{display: "flex", marginTop: "100px", justifyContent: "center", width: "100%"}}>
            <Box sx={{display: "flex"}}>
                <Box sx={{display: "flex", flexDirection: "column", marginRight: "50px"}}>
                    <Typography variant="h1">Not Found</Typography>
                    <Typography sx={{marginBottom: "20px"}}>{message}</Typography>
                </Box>
                <Box>
                    <img src="/images/No_not.png" alt=""/>
                </Box>
            </Box>
        </Box>
    )
}