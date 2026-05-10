import { useState } from 'react'
import './App.css'
import TestCaseGenerator from './components/TestCaseGenerator'

function App() {
  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🧪 Test Cases Generator</h1>
          <p>Generate comprehensive test cases for BFSI/Fintech requirements using industry-standard QC practices</p>
        </div>

        <TestCaseGenerator />
      </div>
    </div>
  )
}

export default App