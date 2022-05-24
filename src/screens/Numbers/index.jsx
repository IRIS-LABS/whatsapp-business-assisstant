import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import NumbersTable from './NumbersTable';
import { CSVLink } from "react-csv";
import Notification from '../../components/Notification';

const { ipcRenderer } = window.require("electron");

export default function Numbers() {
    const [contacts, setContacts] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {
        ipcRenderer.send("load-contacts");
        ipcRenderer.on("contacts-loaded", (event, data) => {
            console.log("INFO: Contacts Loaded: ", data)
            setContacts(data);
        })
        ipcRenderer.on("contacts-load-failed", (event) => {
            console.log("ERROR: Couldn't load responses...");
            setNotificationMessage("Contacts Load Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
        })

    }, []);

    return (
        <>
            {contacts.length > 0 && <Button variant="contained"><CSVLink style={{ textDecoration: "none", color: "#000" }} data={contacts.map(c => ({ Name: c.name, PhoneNumber: c.phoneNumber }))} filename="numbers">Download Numbers (CSV)</CSVLink></Button>}
            <NumbersTable contacts={contacts} />
            <Notification
                message={notificationMessage}
                type={notificationType}
                open={notificationOpen}
            />
        </>
    )
}
