import React from 'react';
import Lottie from "lottie-react";
import WhatsAppLoader from "./WhatsAppLoader.json";


export default function Loader({ width, height }) {
  return (
    <Lottie style={{ height, width }} animationData={WhatsAppLoader} loop={true} />
  )
}
