import React from 'react';
import QRCode from "react-qr-code";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    container: {
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%"
    }
})

export default function QRCodeScreen({ value }) {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <h1>Scan The Code To Add An Account</h1>
            <QRCode value={value} />
        </div>
    )
}
