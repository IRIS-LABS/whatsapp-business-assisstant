import React from 'react';
import { CircularProgress } from '@mui/material';

export default function Loader({ children, loading }) {

    if (loading) return <CircularProgress size={30} color="primary" />

    return children
}
