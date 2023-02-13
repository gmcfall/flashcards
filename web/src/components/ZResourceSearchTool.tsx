import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, List, ListItemButton, ListItemText, Popover, TextField } from "@mui/material";
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useData, useEntityApi } from '../fbase/hooks';
import { deckViewRoute } from '../model/routes';
import { endResourceSearch, performResourceSearch, selectResourceSearch } from "../model/search";

const MIN_WIDTH = "400px";
const SearchResultResourceClassName = "SearchResultResource";

export default function ZResourceSearchTool() {

    const api = useEntityApi();
    const navigate = useNavigate();
    const search = useData(selectResourceSearch);
    const inputEl = useRef<HTMLInputElement>(null);
    const searchText = search.request.searchString;
    const response = search.response;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const searchString = event.currentTarget.value;
        performResourceSearch(api, searchString);
    }

    const menuOpen = Boolean(response.length>0);

    function handleResourceClick(resourceId: string) {
        endResourceSearch(api);
        navigate(deckViewRoute(resourceId));
    }

    function handleBlur(e: React.FocusEvent) {

        // Do nothing if the blur was caused by clicking on a search
        // result resource.  In that case the search will be ended by
        // `handleResourceClick`.

        const classList = e.relatedTarget?.classList;
        if (classList && classList.contains(SearchResultResourceClassName)) {
            return;
        }

        endResourceSearch(api);        
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
                    {menuOpen && response && response.map(resource => (
                            <ListItemButton
                                className={SearchResultResourceClassName}
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