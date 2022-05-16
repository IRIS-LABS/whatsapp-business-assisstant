import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    Modal,
    Typography,
    TextField
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
    message: Yup.string().required("This field is required"),
});

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
    input: {
        width: "100%",
        marginTop: 20
    }
});

export default function NewResponseModal({ open, onClose }) {
    const classes = useStyles();

    const formik = useFormik({
        initialValues: {
            name: "",
            message: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log("Values: ", values);
        },
    });


    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className={classes.box}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    New Response
                </Typography>
                <FormControl fullWidth onSubmit={formik.handleSubmit}>
                    <TextField
                        id="name"
                        label="Name"
                        variant="filled"
                        value={formik.values.name}
                        helperText={formik.touched.name && formik.errors.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        className={classes.input}
                    />
                    <TextField
                        id="message"
                        label="Message"
                        variant="filled"
                        multiline
                        maxRows={4}
                        value={formik.values.message}
                        helperText={formik.touched.message && formik.errors.message}
                        onChange={formik.handleChange}
                        error={formik.touched.message && Boolean(formik.errors.message)}
                        className={classes.input}
                    />
                    <Grid container justifyContent="flex-end" marginTop={5}>
                        <Button variant="outlined" style={{ marginRight: 5 }} onClick={onClose}>Close</Button>
                        <Button onClick={formik.handleSubmit} type="submit" variant="contained">Submit</Button>
                    </Grid>
                </FormControl>
            </Box>
        </Modal>
    )
}
