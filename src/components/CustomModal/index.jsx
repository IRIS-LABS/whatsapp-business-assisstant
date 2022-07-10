import React from 'react';
import { Box, Modal } from '@mui/material';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
    box: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        backgroundColor: 'white',
        boxShadow: 24,
        padding: 30,
    },
    title: {
        marginBottom: "150px"
    }

});

export default function CustomModal({ open, onClose, children }) {
    const classes = useStyles();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className={classes.box}>
                {children}
            </Box>
        </Modal>
    )
}
