import React from 'react';
import { Grid, Drawer } from '@mui/material';
import {
    Download,
    Info,
    PhoneIphone,
    SmartToy
} from "@mui/icons-material"
import ItemList from './ItemList';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
    },
    drawer: {
        width: "100%"
    },
    heading: {
        marginBottom: 70
    }

});


export default function Layout({ children, selectedIndex, onSelect }) {
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
            text: "Your Numbers",
            icon: <PhoneIphone />,
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
                    <ItemList onSelect={onSelect} items={items} selectedIndex={selectedIndex} />
                </Drawer>
            </Grid>
            <Grid
                item
                className={classes.content}
                xs={6}
                sm={9}
                md={10
                }>
                <h1 className={classes.heading}>
                    {items[selectedIndex].text}
                </h1>
                {children}
            </Grid>
        </Grid>)
}
