import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Loader from './Loader';

export default function Popup({ title, content, open, onCancel, onConfirm, loading = false }) {

  return (
    <div>
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Loader loading={loading}>
            <Button onClick={onConfirm} variant="contained" autoFocus>
              Confirm
            </Button>
          </Loader>
        </DialogActions>
      </Dialog>
    </div>
  );
}
