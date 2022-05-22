import React, { useEffect, useState } from 'react';
import {
    FormControl,
    Grid,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import NewResponseModal from "./../../components/NewResponseModal";
import { makeStyles } from '@mui/styles';
import Loader from '../../components/Loader';
import Notification from "../../components/Notification";
const { ipcRenderer } = window.require("electron");

const useStyles = makeStyles({
    deleteButton: {
        marginLeft: 40
    },
    newResponseButton: {
        display: "ïnline-block",
        marginLeft: 40
    },
})

export default function BotResponses() {
    const [responseAdding, setResponseAdding] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [responses, setResponses] = useState([]);
    const [value, setValue] = useState("");
    const [selectedResponse, setSelectedResponse] = useState();
    const [newResponseOpen, setNewResponsesOpen] = useState(false);

    const handleSave = () => {
        const index = responses.findIndex(r => r.name == value);
        const newResponses = responses.map(r => {
            delete r.selected
            return r
        })
        const selectedItem = responses[index];
        newResponses[index] = { ...selectedItem, selected: true };
        setSelecting(true)
        ipcRenderer.send("select-response", newResponses)
    };

    const getSelectedItem = (responses) => responses.find(r => r.selected);

    const handleAddResponse = (values) => {
        setResponseAdding(true);
        ipcRenderer.send("add-response", values)
    };

    useEffect(() => {
        ipcRenderer.send("load-responses");
        ipcRenderer.on("responses-loaded", (event, data) => {
            console.log("INFO: Data Loaded: ", data)
            setResponses(data.responses);
            setValue(data.selectedResponse.name);
            setSelectedResponse(data.selectedResponse)
        })
        ipcRenderer.on("responses-load-failed", (event, data) => {
            console.log("ERROR: Couldn't load responses...")
        })
        ipcRenderer.on("response-added", (event, data) => {
            setResponseAdding(false);
            console.log("INFO: Response Added Successfully");
            console.log("DEBUG: Data: ", data);
            console.log("DEBUG: Responses: ", responses);
            ipcRenderer.send("load-responses");
            setNotificationMessage("Response Added Successfully");
            setNotificationType("success");
            setNotificationOpen(true);
            setNewResponsesOpen(false);
        })
        ipcRenderer.on("response-add-failed", (event) => {
            setResponseAdding(false);
            setNotificationMessage("Response Add Failed");
            setNotificationType("error");
            setNotificationOpen(true);
        })
        ipcRenderer.on("response-selected", (event, data) => {
            setSelecting(false);
            setResponses(data);
            setSelectedResponse(getSelectedItem(data));
            setNotificationMessage("Response Selection Success");
            setNotificationType("success");
            setNotificationOpen(true);
            console.log("INFO: Response Saved")
        })
        ipcRenderer.on("response-select-failed", (event) => {
            setSelecting(false);
            setNotificationMessage("Response Selection Error");
            setNotificationType("error")
            setNotificationOpen(true);
        })
    }, [])

    return (
        <>
            <div
                style={{ marginBottom: 20 }}
            >
                Selected Response: {selectedResponse ? selectedResponse.name : ""}
            </div>
            <Grid container>
                <Grid item xs={7}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Change Selected Response</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={value}
                            label="Select Response"
                            onChange={(e) => setValue(e.target.value)}
                        >
                            {responses.map(r => <MenuItem value={r.name} key={r.name}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={5} alignSelf="flex-end" paddingLeft={1}>
                    <Button onClick={handleSave} variant="contained">
                        <Loader loading={selecting}>
                            Save
                        </Loader>
                    </Button>
                    <Button onClick={() => setNewResponsesOpen(true)} style={{ marginLeft: 15 }} variant="contained">Add New Response</Button>
                </Grid>
            </Grid>
            <NewResponseModal
                open={newResponseOpen}
                onClose={() => setNewResponsesOpen(false)}
                onSubmit={handleAddResponse}
                adding={responseAdding}
                responses={responses}
            />
            <Notification
                open={notificationOpen}
                type={notificationType}
                message={notificationMessage}
                onClose={() => setNotificationOpen(false)}
            />
        </>
    );
}
