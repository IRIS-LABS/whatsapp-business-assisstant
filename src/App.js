import React, { useState, useEffect } from 'react';
import BotResponses from "./screens/BotResponses";
import Numbers from "./screens/Numbers";
import YourNumbers from "./screens/YourNumbers";
import About from "./screens/About";
import QRCodeScreen from './screens/QRCode';
import WhatsAppLoader from "./components/AnimatedLoader";
import Layout from './components/Layout';
const { ipcRenderer } = window.require("electron");


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const LayoutElements = [<BotResponses />, <Numbers />, <YourNumbers />, <About />];

  useEffect(() => {
    console.log("INFO: Loading APP")
    setLoading(true)
    ipcRenderer.send('init-WhatsApp')

    ipcRenderer.on('qr-code', (event, qr) => {
      console.log("INFO: QR CODE:", qr);
      setQRCode(qr);
      setLoading(false);
    });

    ipcRenderer.on('authenticated', (event, message) => {
      console.log("INFO:", message);
      setIsAuthenticated(true);
      setLoading(false);
    });

    ipcRenderer.on('auth-failed', (event, message) => {
      console.log("INFO:", message);
    });

  }, []);


  if (loading)
    return <WhatsAppLoader height="90vh" width="100%" />

  if (!isAuthenticated)
    return <QRCodeScreen value={qrCode} />


  return (
    <Layout selectedIndex={selectedIndex} onSelect={setSelectedIndex}>
      {LayoutElements[selectedIndex]}
    </Layout>
  );
}

export default App;
