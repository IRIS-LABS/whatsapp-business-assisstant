import React from 'react';
import { Button } from '@mui/material';
import AnimatedFailed from '../../components/AnimatedFailed';
const { ipcRenderer } = window.require("electron");

export default function LoadFailed() {

    const handleRestart = () => {
        ipcRenderer.send("restart-app")
    };

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>

            <div style={{ justifyContent: "center", display: "flex", flexDirection: "column" }}>
                <h1 style={{ display: "block" }}>WhatsApp Web Launch Failed</h1>
                <AnimatedFailed
                    width={"100%"}
                    height={"60vh"}
                />
                <Button variant="contained" style={{ display: "block", marginTop: 30 }} onClick={handleRestart}>Restart App</Button>
            </div>
        </div>
    )
}
