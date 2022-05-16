import React from 'react';
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { WhatsApp } from "@mui/icons-material";
import { makeStyles, useTheme } from "@mui/styles";

const useStyles = makeStyles({
    account: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 20
    },
    box: {
        width: "100%"
    },
    name: {
        marginTop: 20
    },
    number: {
        color: "grey"
    }


});

export default function ItemList({ items, onSelect, selectedIndex }) {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Box
            role="presentation"
            justifyContent="center"
            className={classes.box}
        // onClick={toggleDrawer(anchor, false)}
        // onKeyDown={toggleDrawer(anchor, false)}
        >
            <div className={classes.account}>

                <WhatsApp color={'primary'} fontSize={"large"} />
                <span className={classes.name}>Sanuja Tharinda</span>
                <span className={classes.number}>+94712111663</span>

            </div>
            <Divider />
            <List>
                {items.map((item, index) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => onSelect(index)}
                            style={{ backgroundColor: index === selectedIndex ? theme.palette.primary.main : "" }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}
