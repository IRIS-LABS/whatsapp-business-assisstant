import React from 'react';
import { Switch } from '@mui/material';

export default function LocalSwicth({ checked, onChange }) {

    return (
        <Switch
            onChange={onChange}
            checked={checked}
        />
    )
}
