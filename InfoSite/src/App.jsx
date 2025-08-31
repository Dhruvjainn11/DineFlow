import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Annsh from './pages/Annsh'
import AnnshLanding from './pages/AnnshLanding'
import './index.css'

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AnnshLanding />} />
          <Route path="/old" element={<Annsh />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App