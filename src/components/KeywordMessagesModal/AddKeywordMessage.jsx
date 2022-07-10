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
    keyword: Yup.string().required("This field is required"),
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

export default function AddKeywordMessage({ adding, onBack, keywordMessages, onSubmit }) {
    const classes = useStyles();
    const formik = useFormik({
        initialValues: {
            keyword: "",
            message: "",
        },
        validationSchema: validationSchema,
        onSubmit: values => onSubmit(values, files),
    });
    const [files, setFiles] = useState([]);

    const isKeywordUnique = (keyword) => {
        const index = keywordMessages.findIndex(k => k.keyword.toLowerCase() === keyword.toLowerCase());
        return index === -1;
    };

    return (
        <>
            <Typography id="modal-modal-title" variant="h6" component="h2" className={classes.title}>
                New Keyword Message
            </Typography>
            <FormControl fullWidth onSubmit={formik.handleSubmit}>
                <TextField
                    id="keyword"
                    label="Keyword"
                    margin="normal"
                    variant="filled"
                    value={formik.values.keyword}
                    helperText={(formik.touched.keyword && formik.errors.keyword) || (!isKeywordUnique(formik.values.keyword) && "This Keyword Already Exists...")}
                    onChange={formik.handleChange}
                    error={(formik.touched.keyword && Boolean(formik.errors.keyword)) || (!isKeywordUnique(formik.values.keyword))}
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
                        onClick={onBack}
                        variant="outlined"
                        style={{ marginRight: 10 }}
                    >Back</Button>
                    <Button
                        onClick={() => {
                            console.log("DEBUG: Clicked")
                            if (!isKeywordUnique(formik.values.keyword)) return
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
        </>
    )
}
