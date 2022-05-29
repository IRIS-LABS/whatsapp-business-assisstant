import React, { useEffect, useState } from 'react';
import { Grid, Drawer } from '@mui/material';
import {
    Download,
    Info,
    Settings,
    // PhoneIphone,
    SmartToy
} from "@mui/icons-material"
import ItemList from './ItemList';
import { makeStyles } from '@mui/styles';
const { ipcRenderer } = window.require("electron");

const useStyles = makeStyles({

    drawer: {
        width: "100%"
    },
    heading: {
        marginBottom: 70
    },
    headingContainer: {
        display: "flex",
        justifyContent: "center"
    }

});


export default function Layout({ children, selectedIndex, onSelect }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        ipcRenderer.on("user-recieved", (event, user) => {
            setUser(user);
        });
    }, [])

    const classes = useStyles();
    const items = [
        {
            text: 'Bot Responses',
            icon: <SmartToy />,
        },
        {
            text: 'Numbers',
            icon: <Download />,
        },
        {
            text: "Settings",
            icon: <Settings />,
        },
        {
            text: "About",
            icon: <Info />,
        }
    ];
    return (
        <Grid container>
            <Grid item xs={6} sm={3} md={2}>
                <Drawer
                    anchor={"left"}
                    open={true}
                    variant="persistent"
                    className={classes.drawer}
                >
                    <ItemList
                        user={user}
                        onSelect={onSelect}
                        items={items}
                        selectedIndex={selectedIndex}
                    />
                </Drawer>
            </Grid>
            <Grid
                item
                xs={6}
                sm={9}
                md={10}
                justifyContent="center"
            >
                <div className={classes.headingContainer}>
                    <h1 className={classes.heading}>
                        {items[selectedIndex].text}
                    </h1>
                </div>
                {children}
            </Grid>
        </Grid>)
}
