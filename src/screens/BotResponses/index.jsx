import React, { useState } from 'react';
import {
    FormControl,
    Grid,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper
} from '@mui/material';
import NewResponseModal from "./../../components/NewResponseModal";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    deleteButton: {
        marginLeft: 20
    },
    newResponseButton: {
        display: "ïnline-block"
    },
    tableContainer: {
        marginTop: 30,
        width: "60%",
        maxWidth: 400
    }
})

export default function BotResponses() {
    const classes = useStyles();
    const responses = [
        {
            name: "Hi"
        },
        {
            name: "Hello"
        }

    ];
    const [value, setValue] = useState(responses[0].name);
    const [newResponseOpen, setNewResponsesOpen] = useState(false);

    return (
        <>
            <Grid container justifyContent="space-around" alignItems="center">
                <Grid item xs={7}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Response</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={value}
                            label="Select Response"
                            onChange={(e) => setValue(e.target.value)}
                        >
                            {responses.map(r => <MenuItem value={r.name}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={5} alignSelf="flex-end" paddingLeft={1}>
                    <Button onClick={() => setNewResponsesOpen(true)} className={classes.newResponseButton} variant="contained">Add New Response</Button>
                </Grid>
            </Grid>
            <Grid container>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {responses.map((row) => (
                                <TableRow
                                    key={row.name}
                                // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell padding="small">
                                        {row.name}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="contained">View</Button>
                                        <Button variant="contained" color={"error"} className={classes.deleteButton}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <NewResponseModal open={newResponseOpen} onClose={() => setNewResponsesOpen(false)} />
        </>
    );
}
