import { Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CustomModal from '../CustomModal';
import Notification from '../Notification';
import AddKeywordMessage from './AddKeywordMessage';
import KeywordMessagesTable from "./KeywordMessagesTable";
import ViewKeywordMessage from './ViewKeywordMessage';
const { ipcRenderer } = window.require("electron");


export default function KeywordMessagesModal({ open, onClose, response }) {
    const [viewKeywordMessage, setViewKeywordMessage] = useState(null);
    const [addKeywordMessage, setAddKeywordMessage] = useState(false);
    const [keywordMessages, setKeywordMessages] = useState([]);

    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [notificationOpen, setNotificationOpen] = useState(false);

    const [keywordAdding, setKeywordAdding] = useState(false);
    const [keywordDeleting, setKeywordDeleting] = useState(false);
    const [keywordEditing, setKeywordEditing] = useState(false);

    const [popupOpen, setPopupOpen] = React.useState(false);


    const handleAddKeywordMessage = (keywordMessage, files) => {
        try {
            console.log("INFO: Adding Keyword Message:", keywordMessage);
            console.log("INFO: Adding Keyword Files:", files);
            setKeywordAdding(true);
            const newResponse = { ...response };
            let writeMessage = { ...keywordMessage };
            if (files.length > 0) writeMessage["hasMedia"] = true;

            if (response.keywordMessages) {
                newResponse["keywordMessages"] = [...response.keywordMessages, writeMessage];
            } else {
                newResponse["keywordMessages"] = [writeMessage];
            }
            ipcRenderer.send("add-keyword-message", { newResponse, files: files.map(f => ({ name: f.name, path: f.path })), keywordMessage: writeMessage })
        } catch (e) {
            console.log("Error: ", e);
        }

    };

    const handleDeleteKeywordMessage = (keywordMessage) => {
        try {
            console.log("DEBUG: Delete Keyword Message:", keywordMessage);
            setKeywordDeleting(true);
            const requestData = {
                keyword: keywordMessage.keyword,
                responseName: response.name,
                hasMedia: keywordMessage.hasMedia ? keywordMessage.hasMedia : false
            };

            ipcRenderer.send("delete-keyword-message", requestData);
        } catch (e) {
            setKeywordDeleting(false);
            console.log("Error Hanlde Delete Keyword Message:", e);
            setNotificationMessage("Keyword Message Delete Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setKeywordAdding(false);
        }

    };

    const handleEditKeywordMessage = (keywordMessage) => {
        try {

            console.log("DEBUG: Before Edit Keyword Message:", viewKeywordMessage)
            const index = keywordMessages.findIndex(km => km.keyword === viewKeywordMessage.keyword);
            console.log("Index: ", index);
            console.log("DEBUG: After Edit Keyword Message:", keywordMessage);
            setKeywordEditing(true);
            const updatedResponse = { ...response };
            const existingMessage = updatedResponse["keywordMessages"][index];
            updatedResponse["keywordMessages"][index] = { ...keywordMessage, hasMedia: existingMessage.hasMedia ? existingMessage.hasMedia : false };
            ipcRenderer.send("edit-keyword-message", updatedResponse)

        } catch (e) {
            setKeywordEditing(false);
            console.log("Error Hanlde Edit Keyword Message:", e);
            setNotificationMessage("Keyword Message Edit Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setKeywordEditing(false);
        }

    };

    useEffect(() => {
        ipcRenderer.on("keyword-message-add-failed", (event) => {
            setNotificationMessage("Keyword Message Add Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setKeywordAdding(false);
        });
        ipcRenderer.on("keyword-message-add-success", (event) => {
            console.log("[INFO] Keyword Message Add Success");
            ipcRenderer.send("load-responses");
            setNotificationMessage("Keywrod Message Add Success");
            setNotificationType("success");
            setNotificationOpen(true);
            setKeywordAdding(false);
            setAddKeywordMessage(false);
        });
        ipcRenderer.on("keyword-message-delete-failed", (event) => {
            setNotificationMessage("Keyword Message Delete Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setKeywordDeleting(false);
            setPopupOpen(false);
        });
        ipcRenderer.on("keyword-message-delete-success", (event) => {
            ipcRenderer.send("load-responses");
            setNotificationMessage("Keywrod Message Delete Success");
            setNotificationType("success");
            setNotificationOpen(true);
            setKeywordDeleting(false);
            setPopupOpen(false);
        });
        ipcRenderer.on("keyword-message-edit-failed", (event) => {
            setNotificationMessage("Keyword Message Edit Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setKeywordEditing(false);

        });
        ipcRenderer.on("keyword-message-edit-success", (event) => {
            ipcRenderer.send("load-responses");
            setNotificationMessage("Keywrod Message Edit Success");
            setNotificationType("success");
            setNotificationOpen(true);
            setKeywordEditing(false);
        });
    }, [])

    useEffect(() => {
        if (response && response.keywordMessages) {
            setKeywordMessages(response.keywordMessages)
        }

    }, [response]);

    return (
        <CustomModal open={open} onClose={onClose} >
            {viewKeywordMessage ?
                <ViewKeywordMessage
                    onBack={() => setViewKeywordMessage(null)}
                    editing={keywordEditing}
                    keywordMessage={viewKeywordMessage}
                    keywordMessages={keywordMessages.filter(km => km.keyword !== viewKeywordMessage.keyword)}
                    onEdit={handleEditKeywordMessage}

                /> :
                addKeywordMessage ?
                    <AddKeywordMessage
                        adding={keywordAdding}
                        keywordMessages={keywordMessages}
                        onClose={() => setAddKeywordMessage(false)}
                        onSubmit={handleAddKeywordMessage}
                        onBack={() => setAddKeywordMessage(false)}

                    /> :
                    <KeywordMessagesTable
                        keywordMessages={keywordMessages}
                        onView={(keywordMessage) => setViewKeywordMessage(keywordMessage)}
                        onAddMessage={() => setAddKeywordMessage(true)}
                        onDelete={handleDeleteKeywordMessage}
                        deleting={keywordDeleting}
                        popupOpen={popupOpen}
                        setPopupOpen={setPopupOpen}
                    />
            }

            <Grid container justifyContent="flex-end" marginTop={3}>
                <Button
                    onClick={() => {
                        setViewKeywordMessage(null);
                        onClose()
                    }}
                    variant="outlined"
                // style={{ marginRight: 10 }}
                >Close</Button>
            </Grid>
            <Notification
                open={notificationOpen}
                type={notificationType}
                message={notificationMessage}
                onClose={() => setNotificationOpen(false)}
            />
        </CustomModal>
    )
}
