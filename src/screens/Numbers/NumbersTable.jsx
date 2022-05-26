import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from "@mui/material/TablePagination";

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


export default function NumbersTable({ contacts }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    if (contacts.length <= rowsPerPage) setData(contacts)
    else setData(contacts.slice(0, rowsPerPage));
    setPage(0);
  }, [contacts, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    const endIndex = (newPage + 1) * rowsPerPage;
    const startIndex = endIndex - rowsPerPage;
    if (contacts.length < endIndex + 1) setData(contacts.slice(startIndex))
    else setData(contacts.slice(startIndex, endIndex))
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
              <StyledTableCell>Phone Number</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(contact => (
              <StyledTableRow key={contact.phoneNumber}>
                <StyledTableCell component="th">
                  {contact.name}
                </StyledTableCell>
                <StyledTableCell>{contact.phoneNumber}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={contacts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}