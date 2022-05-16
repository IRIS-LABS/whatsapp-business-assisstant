import React, { useState, useEffect } from 'react';
import BotResponses from "./screens/BotResponses";
import Numbers from "./screens/Numbers";
import YourNumbers from "./screens/YourNumbers";
import About from "./screens/About";
import WhatsAppLoader from "./components/AnimatedLoader";
import QRCode from "react-qr-code";
import Layout from './components/Layout';
const { ipcRenderer } = window.require("electron");


function App() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const LayoutElements = [<BotResponses />, <Numbers />, <YourNumbers />, <About />];

  useEffect(() => {
    console.log("APP LOADING")
    setLoading(true)
    ipcRenderer.send('init-WhatsApp')

    ipcRenderer.on('qr-code', (event, qr) => {
      console.log("QR CODE:", qr);
      setValue(qr);
      setLoading(false);
    });
    ipcRenderer.on('ready', (event, message) => {
      console.log(message);
      setLoading(false);
      setMessage(message)
    });
  }, []);


  if (loading)
    return <WhatsAppLoader height="90vh" width="100%" />


  return (
    <Layout selectedIndex={selectedIndex} onSelect={setSelectedIndex}>
      {LayoutElements[selectedIndex]}
    </Layout>
  );
}

export default App;
