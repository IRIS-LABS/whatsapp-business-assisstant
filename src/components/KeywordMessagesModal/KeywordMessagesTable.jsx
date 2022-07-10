import React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, TablePagination, Grid } from '@mui/material';
import Popup from "../Popup";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export default function KeywordMessagesModal({ keywordMessages, onView, onDelete, onAddMessage, deleting, popupOpen, setPopupOpen }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [data, setData] = React.useState([]);

    const [deleteKeywordMessage, setDeleteKeywordMessage] = React.useState();

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        const endIndex = (newPage + 1) * rowsPerPage;
        const startIndex = endIndex - rowsPerPage;
        if (keywordMessages.length < endIndex + 1) setData(keywordMessages.slice(startIndex))
        else setData(keywordMessages.slice(startIndex, endIndex))
        setPage(newPage);
    };

    React.useEffect(() => {
        if (keywordMessages.length <= rowsPerPage) setData(keywordMessages)
        else setData(keywordMessages.slice(0, rowsPerPage));
        setPage(0);
    }, [keywordMessages, rowsPerPage]);

    return (
        <>
            <Grid container justifyContent="space-between" alignItems="center" marginTop={5}>
                <h1>Keyword Messages</h1>
                <Button
                    onClick={onAddMessage}
                    variant="contained"
                    size="small"
                    style={{ height: 50 }}
                >
                    Add Message
                </Button>
            </Grid>

            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
                <Table aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell>Keyword</StyledTableCell>
                            <StyledTableCell>View</StyledTableCell>
                            <StyledTableCell>Delete</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((keywordMessage, index) => (
                            <StyledTableRow key={keywordMessage.keyword}>
                                <StyledTableCell>
                                    {(page) * 5 + (index + 1)}
                                </StyledTableCell>
                                <StyledTableCell component="th">
                                    {keywordMessage.keyword}
                                </StyledTableCell>
                                <StyledTableCell><Button variant="contained" style={{ color: "#FFF" }} onClick={() => onView(keywordMessage)}>View</Button></StyledTableCell>
                                <StyledTableCell><Button variant="contained" color={"error"} onClick={() => {
                                    setDeleteKeywordMessage(keywordMessage);
                                    setPopupOpen(true);
                                }}>Delete</Button></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5]}
                component="div"
                count={keywordMessages.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Popup
                title={"Are you sure you want to delete?"}
                content={"Once you delete, this keyword message will be removed permanantly"}
                open={popupOpen}
                onCancel={() => {
                    setPopupOpen(false);
                    setDeleteKeywordMessage(null);
                }}
                onConfirm={() => {
                    onDelete(deleteKeywordMessage)
                    setDeleteKeywordMessage(null);
                }}
                loading={deleting}
            />
        </>
    )
}
