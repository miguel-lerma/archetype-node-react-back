import React from 'react'
import { createRoot } from 'react-dom/client'
const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
function App(){ return (<div style={{fontFamily:'sans-serif',padding:'2rem'}}><h1>Frontend ✔️</h1><p>API base: <code>{api}</code></p></div>) }
createRoot(document.getElementById('root')).render(<App/>)
