import React, { useEffect } from 'react';
import { Box, Modal } from '@mui/material';
import { makeStyles } from '@mui/material';

const useStyles = makeStyles({
    box: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        backgroundColor: 'white',
        boxShadow: 24,
        padding: 30,
    }
});

export default function NewKeywordModal({ open, onClose }) {
    const classes = useStyles();

    useEffect(() => {
        console.log("New Keyword Modal")
    })


    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className={classes.box}>
                <h1>New Keyword Modal</h1>

            </Box>
        </Modal>
    )
}
