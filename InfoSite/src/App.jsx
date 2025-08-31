import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import AnnshLanding from './pages/AnnshLanding'
import './index.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnnshLanding />} />
        
      </Routes>
    </Router>
  )
}

export default App