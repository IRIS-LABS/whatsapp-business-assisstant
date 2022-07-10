import React, { useEffect, useState } from 'react';
import {
    Button,
    FormControl,
    Grid,
    Typography,
    TextField
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from '../Loader';
// import MediaUploader from '../MediaUploader';

const validationSchema = Yup.object().shape({
    keyword: Yup.string().required("This field is required"),
    message: Yup.string().required("This field is required"),
});

const useStyles = makeStyles({
    title: {
        marginBottom: "150px"
    }

});

export default function ViewKeywordMessage({ onBack, onEdit, editing, keywordMessages, keywordMessage }) {
    const classes = useStyles();

    const isKeywordUnique = (keyword) => {
        const index = keywordMessages.findIndex(k => k.keyword.toLowerCase() === keyword?.toLowerCase());
        return index === -1;
    }


    const formik = useFormik({
        initialValues: {
            keyword: keywordMessage ? keywordMessage.keyword : "",
            message: keywordMessage ? keywordMessage.message : ""
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: values => onEdit(values)
    });



    return (
        <>
            <Typography id="modal-modal-title" variant="h6" component="h2" className={classes.title}>
                Keyword Message
            </Typography>
            <FormControl fullWidth>
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
                <Grid container justifyContent="flex-end" marginTop={5}>
                    <Button
                        onClick={onBack}
                        variant="outlined"
                        style={{ marginRight: 10 }}
                    >Back</Button>
                    <Button
                        onClick={() => {
                            if (!isKeywordUnique(formik.values.keyword)) return
                            formik.handleSubmit();
                        }}
                        type="submit"
                        variant="contained"
                        disabled={editing}
                    >
                        <Loader loading={editing}>
                            Edit
                        </Loader>

                    </Button>
                </Grid>
            </FormControl>
        </>
    )
}
