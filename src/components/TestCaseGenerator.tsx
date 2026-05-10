import { useState } from 'react'

interface TestCase {
  id: string
  title: string
  description: string
  category: 'positive' | 'negative' | 'boundary' | 'integration'
  steps: string[]
  expectedResult: string
}

export default function TestCaseGenerator() {
  const [requirement, setRequirement] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])

  const generateTestCases = () => {
    if (!requirement.trim()) {
      alert('Please enter a requirement description')
      return
    }

    const generated = generateTestCasesFromRequirement(requirement)
    setTestCases(generated)
  }

  const generateTestCasesFromRequirement = (req: string): TestCase[] => {
    const cases: TestCase[] = []

    // Parse requirement for key elements
    const lowerReq = req.toLowerCase()
    const hasPayment = lowerReq.includes('payment') || lowerReq.includes('transfer')
    const hasAuth = lowerReq.includes('login') || lowerReq.includes('auth') || lowerReq.includes('otp')
    const hasAccount = lowerReq.includes('account') || lowerReq.includes('balance')
    const hasKyc = lowerReq.includes('kyc') || lowerReq.includes('verification')

    // Positive Test Cases
    cases.push({
      id: 'TC_POS_001',
      title: 'Happy Path - Successful Transaction',
      description: 'Verify successful completion of the primary user journey',
      category: 'positive',
      steps: [
        'Navigate to the application/feature',
        'Enter valid credentials/data',
        'Complete the required actions',
        'Submit the request'
      ],
      expectedResult: 'Transaction completes successfully with confirmation'
    })

    // Negative Test Cases
    cases.push({
      id: 'TC_NEG_001',
      title: 'Invalid Input Handling',
      description: 'Verify system handles invalid inputs gracefully',
      category: 'negative',
      steps: [
        'Enter invalid data (e.g., special characters, wrong format)',
        'Attempt to proceed with the transaction'
      ],
      expectedResult: 'System displays appropriate error message and prevents invalid submission'
    })

    cases.push({
      id: 'TC_NEG_002',
      title: 'Missing Required Fields',
      description: 'Verify validation for mandatory fields',
      category: 'negative',
      steps: [
        'Leave required fields empty',
        'Attempt to submit the form'
      ],
      expectedResult: 'System highlights missing fields and blocks submission'
    })

    // Boundary Test Cases
    cases.push({
      id: 'TC_BVA_001',
      title: 'Boundary Value Analysis - Min/Max Limits',
      description: 'Test system behavior at boundary values',
      category: 'boundary',
      steps: [
        'Enter minimum allowed value',
        'Enter maximum allowed value',
        'Enter value just below minimum',
        'Enter value just above maximum'
      ],
      expectedResult: 'System accepts valid boundaries and rejects invalid ones appropriately'
    })

    cases.push({
      id: 'TC_BVA_002',
      title: 'Concurrent User Sessions',
      description: 'Verify behavior under concurrent access',
      category: 'boundary',
      steps: [
        'Open multiple browser sessions',
        'Perform simultaneous operations',
        'Check for race conditions and data integrity'
      ],
      expectedResult: 'System handles concurrent operations without data corruption'
    })

    // Integration Test Cases
    cases.push({
      id: 'TC_INT_001',
      title: 'Third-party API Integration',
      description: 'Verify integration with external services',
      category: 'integration',
      steps: [
        'Simulate API responses (success/failure/timeout)',
        'Monitor system behavior under different API states'
      ],
      expectedResult: 'System handles all API response scenarios gracefully'
    })

    cases.push({
      id: 'TC_INT_002',
      title: 'Database Connectivity',
      description: 'Verify database operations and error handling',
      category: 'integration',
      steps: [
        'Simulate database connection issues',
        'Test transaction rollback on failures'
      ],
      expectedResult: 'System maintains data consistency during connectivity issues'
    })

    // Domain-specific cases
    if (hasPayment) {
      cases.push({
        id: 'TC_DOM_001',
        title: 'Payment Amount Validation',
        description: 'Verify payment amount constraints and limits',
        category: 'boundary',
        steps: [
          'Enter payment amount at daily/monthly limits',
          'Attempt transactions exceeding limits',
          'Verify balance checks before processing'
        ],
        expectedResult: 'System enforces payment limits and validates balances correctly'
      })
    }

    if (hasAuth) {
      cases.push({
        id: 'TC_DOM_002',
        title: 'Authentication Security',
        description: 'Verify secure authentication mechanisms',
        category: 'negative',
        steps: [
          'Attempt login with expired OTP',
          'Test session timeout scenarios',
          'Verify biometric authentication failures'
        ],
        expectedResult: 'System maintains security and prevents unauthorized access'
      })
    }

    if (hasKyc) {
      cases.push({
        id: 'TC_DOM_003',
        title: 'KYC Compliance Validation',
        description: 'Verify KYC and compliance requirements',
        category: 'integration',
        steps: [
          'Test with various document types',
          'Verify AML/FATCA compliance checks',
          'Test document upload and validation'
        ],
        expectedResult: 'System enforces compliance requirements and validates documents'
      })
    }

    return cases
  }

  return (
    <>
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="requirement">Requirement Description</label>
          <textarea
            id="requirement"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Describe the feature/requirement in detail. Include actors, data flows, business rules, and constraints..."
          />
        </div>
        <button className="generate-btn" onClick={generateTestCases}>
          Generate Test Cases
        </button>
      </div>

      {testCases.length > 0 && (
        <div className="results-section">
          <h2>Generated Test Cases ({testCases.length})</h2>
          <div className="test-cases">
            {['positive', 'negative', 'boundary', 'integration'].map(category => {
              const categoryCases = testCases.filter(tc => tc.category === category)
              if (categoryCases.length === 0) return null

              return (
                <div key={category} className="test-case">
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Test Cases</h3>
                  <ul>
                    {categoryCases.map(tc => (
                      <li key={tc.id}>
                        <strong>{tc.id}: {tc.title}</strong><br />
                        <em>{tc.description}</em><br />
                        <strong>Steps:</strong> {tc.steps.join(' → ')}<br />
                        <strong>Expected:</strong> {tc.expectedResult}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}