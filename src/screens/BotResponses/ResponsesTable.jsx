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


export default function ResponsesTable({ responses }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [data, setData] = React.useState([]);

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

    return (
        <div style={{ paddingRight: 20, paddingBottom: 20 }}>
            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
                <Table aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>View</StyledTableCell>
                            <StyledTableCell>Delete</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(response => (
                            <StyledTableRow key={response.name}>
                                <StyledTableCell component="th">
                                    {response.name}
                                </StyledTableCell>
                                <StyledTableCell><Button variant="contained">View</Button></StyledTableCell>
                                <StyledTableCell><Button variant="contained" color={"error"} disabled={response.selected}>Delete</Button></StyledTableCell>
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
        </div>
    );
}