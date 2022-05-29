import React from 'react';
import { DropzoneArea } from 'react-mui-dropzone';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: 10
    },
    dropzone: {
        padding: 10,
        color: theme.palette.primary.main,
        overflow: 'scroll',
        maxHeight: 200
    }
}))

export default function MediaUploader({ onChange }) {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <DropzoneArea
                filesLimit={5}
                maxFileSize={100000000}
                dropzoneProps={{ maxSize: 100 }}
                dropzoneClass={classes.dropzone}
                acceptedFiles={['image/*', 'video/*']}
                onChange={onChange}
            // initialFiles={initialFiles}
            />
        </div>
    )
}
