import React from 'react';
import Lottie from "lottie-react";
import Failed from "./Failed.json";


export default function AnimatedFailed({ width, height }) {
    return (
        <Lottie style={{ height, width }} animationData={Failed} />
    )
}
