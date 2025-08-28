import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Annsh from './pages/Annsh'
import AnnshLanding from './pages/AnnshLanding'
import './index.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnnshLanding />} />
        <Route path="/old" element={<Annsh />} />
      </Routes>
    </Router>
  )
}

export default App