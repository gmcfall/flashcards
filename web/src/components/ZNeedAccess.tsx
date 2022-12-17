import { Box, Typography, TextareaAutosize, Button } from "@mui/material";

export default function ZNeedAccess() {

    return (
        <Box sx={{display: "flex", marginTop: "100px", justifyContent: "center", width: "100%"}}>
            <Box sx={{display: "flex"}}>
                <Box sx={{display: "flex", flexDirection: "column", marginRight: "50px"}}>
                    <Typography variant="h1">You need access</Typography>
                    <Typography sx={{marginBottom: "20px"}}>Request access, or switch to an account with access.</Typography>
                    <TextareaAutosize
                        style={{minWidth: "200px", padding: "10px"}}
                        minRows={5}
                        maxRows={10}
                        placeholder="Message (optional)"
                    />
                    <Box sx={{marginTop: "20px"}}>
                        <Button variant="contained">Request Access</Button>
                    </Box>
                </Box>
                <Box>
                    <img src="/images/goldenKey.png" alt=""/>
                </Box>
            </Box>
        </Box>
    )
}