import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, List, ListItemButton, ListItemText, Popover, TextField } from "@mui/material";
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { deckEditRoute } from '../model/routes';
import { createResourceSearchRequest, selectResourceSearch } from "../model/search";
import resourceSearchEnd from '../store/actions/resourceSearchEnd';
import resourceSearchRequest from "../store/actions/resourceSearchRequest";

const MIN_WIDTH = "400px";

export default function ZResourceSearchTool() {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const clientData = useAppSelector(selectResourceSearch);
    const inputEl = useRef<HTMLInputElement>(null);
    const searchText = clientData ? clientData.searchString : '';
    const resources = clientData?.resources;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const searchString = event.currentTarget.value;
        const request = createResourceSearchRequest(searchString);
        dispatch(resourceSearchRequest(request));
    }

    const menuOpen = Boolean(resources && resources.length>0 && inputEl?.current);

    function handleResourceClick(resourceId: string) {
        dispatch(resourceSearchEnd());
        navigate(deckEditRoute(resourceId));
    }

    function handleBlur() {
        dispatch(resourceSearchEnd());
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <TextField
                ref={inputEl}
                id="input-with-icon-textfield"
                label="Search"
                autoComplete="off"
                size="small"
                sx={{
                    minWidth: MIN_WIDTH
                }}
                value={searchText}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                autoFocus={true}
                variant="outlined"
            />
            <Popover
                anchorEl={inputEl.current}
                open={menuOpen}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
            >
                <List 
                    sx={{minWidth: MIN_WIDTH}}
                >
                    {menuOpen && resources && resources.map(resource => (
                            <ListItemButton 
                                key={resource.id}
                                onClick={() => {
                                    handleResourceClick(resource.id);
                                }}
                            >
                                <ListItemText>{resource.name}</ListItemText>
                            </ListItemButton>
                    ))}
                </List>
            </Popover>
        </Box>
    )
}