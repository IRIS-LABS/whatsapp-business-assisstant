import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import Notification from '../../components/Notification';
import Loader from '../../components/Loader';
import LocalSwicth from '../../components/LocalSwicth';
const { ipcRenderer } = window.require("electron");

const Settings = () => {
    const [showBrowser, setShowBrowser] = useState(false);
    const [settingLoading, setSettingsLoading] = useState(true);

    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [notificationOpen, setNotificationOpen] = useState(false);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        ipcRenderer.on("settings-loaded", (event, settings) => {
            setShowBrowser(settings.showBrowser);
            setSettingsLoading(false);
        });
        ipcRenderer.on("settings-load-failed", (event) => {
            setNotificationMessage("Failed To Load Settings...");
            setNotificationType("error");
            setNotificationOpen(true);
            setSettingsLoading(false);
        });

        ipcRenderer.on("settings-updated", (event, settings) => {
            setSaving(false);
            setShowBrowser(settings.showBrowser);
            setNotificationMessage("Settings updated successfully...");
            setNotificationType("success");
            setNotificationOpen(true);
        });
        ipcRenderer.on("settings-update-failed", (event) => {
            setSaving(false);
            setNotificationMessage("Failed To Update Settings...");
            setNotificationType("error");
            setNotificationOpen(true);
        });
        ipcRenderer.send("load-settings");
    }, []);

    const handleSave = newSettings => {
        setSaving(true);
        ipcRenderer.send("update-settings", newSettings);
    };

    return (
        <Loader loading={settingLoading}>
            <div style={{ display: "block" }}>
                <span>Browser Open: </span>
                <LocalSwicth
                    checked={showBrowser}
                    onChange={(event) => setShowBrowser(event.target.checked)}
                />
            </div>
            <Loader loading={saving}>
                <Button variant="contained" style={{ display: "block", marginTop: 15, marginBottom: 5 }} onClick={() => handleSave({ showBrowser })}>
                    Save
                </Button>
            </Loader>
            <span style={{ fontSize: 14 }}>Please note that the saved changes will take effect the next time you launch the app...</span>
            <Notification
                open={notificationOpen}
                type={notificationType}
                message={notificationMessage}
                onClose={() => setNotificationOpen(false)}
            />
        </Loader>

    )
};

export default React.memo(Settings);
