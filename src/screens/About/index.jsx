import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    row: {
        color: "black",
        display: "block",
        margin: 20,
        fontSize: 20
    }
});

export default function About() {
    const classes = useStyles();

    return (
        <div>
            <span className={classes.row}>App Name: WhatsApp Business Assistant</span>
            <span className={classes.row}>Version: 1.1.0</span>
        </div>
    )
}
