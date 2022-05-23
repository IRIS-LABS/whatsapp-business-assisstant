import React, { useEffect, useState } from 'react';
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
import Loader from '../Loader';
import MediaUploader from '../MediaUploader';

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
    title: {
        marginBottom: "150px"
    }

});

export default function NewResponseModal({ open, onClose, onSubmit, adding, responses }) {
    const classes = useStyles();
    const formik = useFormik({
        initialValues: {
            name: "",
            message: "",
        },
        validationSchema: validationSchema,
        onSubmit: values => onSubmit(values, files),
    });
    const [files, setFiles] = useState([]);

    const isNameUnique = (name) => {
        const index = responses.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
        // console.log("DEBUG: Index: ", index)
        return index === -1;
    }

    useEffect(() => {
        formik.handleReset()
    }, [open])


    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className={classes.box}>
                <Typography id="modal-modal-title" variant="h6" component="h2" className={classes.title}>
                    New Response
                </Typography>
                <FormControl fullWidth onSubmit={formik.handleSubmit}>
                    <TextField
                        id="name"
                        label="Name"
                        margin="normal"
                        variant="filled"
                        value={formik.values.name}
                        helperText={(formik.touched.name && formik.errors.name) || (!isNameUnique(formik.values.name) && "This Name Already Exists. Please Choose A Different Name")}
                        onChange={formik.handleChange}
                        error={(formik.touched.name && Boolean(formik.errors.name)) || (!isNameUnique(formik.values.name))}
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
                    />
                    <MediaUploader
                        onChange={setFiles}
                    />
                    <Grid container justifyContent="flex-end" marginTop={5}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            style={{ marginRight: 10 }}
                        >Close</Button>
                        <Button
                            onClick={() => {
                                if (!isNameUnique(formik.values.name)) return
                                formik.handleSubmit();
                            }}
                            type="submit"
                            variant="contained"
                            disabled={adding}
                        >
                            <Loader loading={adding}>
                                Submit
                            </Loader>

                        </Button>
                    </Grid>
                </FormControl>
            </Box>
        </Modal>
    )
}
