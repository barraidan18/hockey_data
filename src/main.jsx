import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'  // Put this before App import
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)