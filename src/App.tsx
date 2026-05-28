import './App.css'
import TestCaseGenerator from './components/TestCaseGenerator'

function App() {
  return (
    <div className="app">
      <div className="container">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Professional Test Case Generator</p>
            <h1>Transform requirements into comprehensive test cases in seconds</h1>
            <p className="subtitle">Upload documents or paste requirements — get structured scenarios with clear steps, expected results, and test coverage.</p>
          </div>
        </header>

        <TestCaseGenerator />
      </div>
    </div>
  )
}

export default App