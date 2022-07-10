import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, TablePagination } from '@mui/material';
import EditResponseModal from "../../components/EditResponseModal";
import Popup from '../../components/Popup';
import Notification from '../../components/Notification';
import KeywordMessagesModal from '../../components/KeywordMessagesModal';
const { ipcRenderer } = window.require("electron");

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


export default function ResponsesTable({ responses, onResponseDelete, onResponseUpdate }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [data, setData] = React.useState([]);
    const [popupOpen, setPopupOpen] = React.useState(false);
    const [deleteResponse, setDeleteResponse] = React.useState();

    const [responseEditing, setResponseEditing] = React.useState(false);
    const [editResponseOpen, setEditResponseOpen] = React.useState(false);
    const [viewingResponse, setViewingResponse] = React.useState({ name: "", message: "" });

    const [keywordMessagesOpen, setKeywordMessagesOpen] = React.useState(false);
    const [keywordViewResponse, setKeywordViewResponse] = React.useState(null);


    const [notificationMessage, setNotificationMessage] = React.useState("");
    const [notificationType, setNotificationType] = React.useState("success");
    const [notificationOpen, setNotificationOpen] = React.useState(false);

    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        ipcRenderer.on("response-deleted", (event, newResponses) => {
            setNotificationMessage("Response Deleted Succeesfully...");
            setNotificationType("success");
            setNotificationOpen(true);
            setLoading(false);
            setPopupOpen(false);
            onResponseDelete(newResponses);
        });

        ipcRenderer.on("response-delete-failed", (event) => {
            setNotificationMessage("Response Delete Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setLoading(false);
            setPopupOpen(false);
        });

        ipcRenderer.on("response-updated", (event, newResponses) => {
            setNotificationMessage("Response Updated Succeesfully...");
            setNotificationType("success");
            setNotificationOpen(true);
            setResponseEditing(false);
            setEditResponseOpen(false);
            console.log("DEBUG: Calling Response Update");
            onResponseUpdate(newResponses);
            console.log("DEBUG: Called Response Update");
        });

        ipcRenderer.on("response-update-failed", (event) => {
            setNotificationMessage("Response Update Failed...");
            setNotificationType("error");
            setNotificationOpen(true);
            setResponseEditing(false);
            setEditResponseOpen(false);
        });
    }, []);

    React.useEffect(() => {
        if (responses && keywordViewResponse) {
            console.log("DEBUG: Responses:", responses);
            const item = responses.find(r => r.name === keywordViewResponse.name);
            if (item)
                setKeywordViewResponse(item);
        }
    }, [responses])

    React.useEffect(() => {
        if (responses.length <= rowsPerPage) setData(responses)
        else setData(responses.slice(0, rowsPerPage));
        setPage(0);
    }, [responses, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        const endIndex = (newPage + 1) * rowsPerPage;
        const startIndex = endIndex - rowsPerPage;
        if (responses.length < endIndex + 1) setData(responses.slice(startIndex))
        else setData(responses.slice(startIndex, endIndex))
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (response) => {
        setDeleteResponse(response);
        setPopupOpen(true);
    };

    const handleDeleteConfirm = () => {
        setLoading(true)
        ipcRenderer.send("delete-response", deleteResponse)
    };

    const handleViewResponse = (response) => {
        setViewingResponse(response);
        setEditResponseOpen(true);
    };

    const handleViewKeywordMessages = (response) => {
        setKeywordViewResponse(response);
        setKeywordMessagesOpen(true);
    };

    const handleEditResponse = (newResponse, files) => {
        console.log("DEBUG: Edited Response: ", newResponse);
        console.log("DEBUG: New Files: ", files);
        const index = responses.findIndex(r => r.name === viewingResponse.name);
        const updatedResponses = [...responses];
        const existingResponse = updatedResponses[index];
        updatedResponses[index] = { ...existingResponse, ...newResponse };

        ipcRenderer.send("update-responses", { responses: updatedResponses, editedResponse: existingResponse, files });
    };


    return (
        <div style={{ paddingRight: 20, paddingBottom: 20 }}>
            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
                <Table aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>First Message</StyledTableCell>
                            <StyledTableCell>Keyword Messages</StyledTableCell>
                            <StyledTableCell>Delete</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(response => (
                            <StyledTableRow key={response.name}>
                                <StyledTableCell component="th">
                                    {response.name}
                                </StyledTableCell>
                                <StyledTableCell><Button variant="contained" style={{ color: "#FFF" }} onClick={() => handleViewResponse(response)} >View</Button></StyledTableCell>
                                <StyledTableCell><Button variant="contained" style={{ color: "#FFF" }} onClick={() => handleViewKeywordMessages(response)} >View</Button></StyledTableCell>
                                <StyledTableCell><Button variant="contained" color={"error"} disabled={response.selected} onClick={() => handleDeleteClick(response)}>Delete</Button></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={responses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <Popup
                title={"Are you sure you want to delete?"}
                content={"Once you delete, this response will be removed permanantly"}
                open={popupOpen}
                onCancel={() => setPopupOpen(false)}
                onConfirm={handleDeleteConfirm}
                loading={loading}
            />

            <EditResponseModal
                editing={responseEditing}
                onClose={() => setEditResponseOpen(false)}
                onSubmit={handleEditResponse}
                open={editResponseOpen}
                responses={responses.filter(r => r.name !== viewingResponse.name)}
                response={viewingResponse}
            />

            <KeywordMessagesModal
                onClose={() => setKeywordMessagesOpen(false)}
                open={keywordMessagesOpen}
                response={keywordViewResponse}
            />

            <Notification
                open={notificationOpen}
                type={notificationType}
                message={notificationMessage}
                onClose={() => setNotificationOpen(false)}
            />
        </div>
    );
}