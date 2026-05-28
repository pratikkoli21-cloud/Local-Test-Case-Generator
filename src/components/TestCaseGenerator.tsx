import { useState, type ChangeEvent, type DragEvent } from 'react'

interface TestCase {
  id: string
  title: string
  description: string
  category: 'positive' | 'negative' | 'boundary' | 'integration'
  steps: string[]
  expectedResult: string
}

type StatusType = 'success' | 'warning' | 'error' | 'info'

const focusKeys = [
  { key: 'functional', label: 'Functional' },
  { key: 'negative', label: 'Negative' },
  { key: 'boundary', label: 'Boundary / Edge' },
  { key: 'integration', label: 'Integration' },
  { key: 'uiux', label: 'UI / UX' },
  { key: 'performance', label: 'Performance' },
  { key: 'security', label: 'Security' }
] as const

type FocusKey = typeof focusKeys[number]['key']

const domainOptions = [
  'BFSI / Payments / Fintech',
  'E-commerce / Retail',
  'Healthcare / Medical',
  'Insurance',
  'Logistics / Supply Chain',
  'Education / Learning',
  'Travel / Hospitality',
  'Government / Public Services',
  'Manufacturing / Industry',
  'Real Estate',
  'Entertainment / Gaming',
  'Other'
] as const


export default function TestCaseGenerator() {
  const [requirement, setRequirement] = useState('')
  const [domainContext, setDomainContext] = useState('BFSI / Payments / Fintech')
  const [focusAreas, setFocusAreas] = useState<Record<FocusKey, boolean>>({
    functional: true,
    negative: true,
    boundary: true,
    integration: true,
    uiux: false,
    performance: false,
    security: false
  })
  const [uploadName, setUploadName] = useState('')
  const [uploadMessage, setUploadMessage] = useState('Upload a document or paste a requirement to begin.')
  const [statusType, setStatusType] = useState<StatusType>('info')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const setFocus = (key: FocusKey, value: boolean) => {
    setFocusAreas(prev => ({ ...prev, [key]: value }))
  }

  const readFile = async (file: File) => {
    setUploadName(file.name)
    setStatusType('success')
    setUploadMessage(`Loaded ${file.name}. Ready to generate test cases.`)

    const textTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv']
    if (textTypes.includes(file.type) || file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.txt')) {
      const text = await file.text()
      setRequirement(text)
    }
  }

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files.length > 0) {
      await readFile(event.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      await readFile(event.target.files[0])
    }
  }

  const generateTestCases = async () => {
    if (!requirement.trim() && !uploadName.trim()) {
      setStatusType('error')
      setUploadMessage('Add a requirement or upload a file first so the generator has something to work with.')
      return
    }

    setIsGenerating(true)
    setStatusType('info')
    setUploadMessage('Generating test cases — this should take a moment.')
    await new Promise(resolve => setTimeout(resolve, 700))

    const generated = createTestCases(requirement.trim() || `Uploaded: ${uploadName}`)
    setTestCases(generated)
    setIsGenerating(false)
    setStatusType('success')
    setUploadMessage(`Generated ${generated.length} test cases successfully.`)
  }

  const createTestCases = (req: string): TestCase[] => {
    const normalized = req.toLowerCase()
    const hasPayment = /payment|transfer|upi|neft|imps/.test(normalized)
    const hasAuth = /login|otp|auth|password/.test(normalized)
    const hasKyc = /kyc|aml|compliance|verification/.test(normalized)

    const pool: TestCase[] = []
    const selectedFocus = focusKeys.filter(item => focusAreas[item.key]).map(item => item.key)
    const labels = selectedFocus.length > 0 ? selectedFocus : ['functional', 'negative', 'boundary', 'integration']
    const createCase = (id: string, title: string, description: string, category: TestCase['category'], steps: string[], expectedResult: string) => ({
      id,
      title,
      description,
      category,
      steps,
      expectedResult
    })

    if (labels.includes('functional')) {
      pool.push(createCase('TC_POS_001', 'Positive flow - primary scenario', `Verify the main feature flow for ${domainContext}.`, 'positive', ['Provide valid input', 'Complete the run without blocking errors', 'Confirm expected success state'], 'System completes the main flow and returns the expected result.'))
    }

    if (labels.includes('negative')) {
      pool.push(createCase('TC_NEG_001', 'Negative validation - invalid input', 'Verify the system rejects bad input and surfaces clear error messaging.', 'negative', ['Enter invalid values', 'Attempt to submit', 'Observe error feedback'], 'System blocks the invalid entry and shows a human-readable message.'))
    }

    if (labels.includes('boundary')) {
      pool.push(createCase('TC_BOUND_001', 'Boundary value check', 'Verify minimum and maximum values at the edge of acceptance.', 'boundary', ['Enter the lowest allowed value', 'Enter the highest allowed value', 'Try values just beyond the limit'], 'System accepts valid boundaries and rejects out-of-range values.'))
    }

    if (labels.includes('integration')) {
      pool.push(createCase('TC_INT_001', 'Integration check', 'Verify third-party and backend service interactions.', 'integration', ['Trigger the service call', 'Simulate success and failure', 'Confirm graceful handling'], 'System handles integration responses without breaking the user flow.'))
    }

    if (hasPayment) {
      pool.push(createCase('TC_PAY_001', 'Payment validation', 'Verify payment routing, amount checks, and balance validation.', 'boundary', ['Submit a valid payment', 'Test exceeded limit', 'Verify settlement status'], 'Payment flow behaves correctly and shows status updates.'))
    }

    if (hasAuth) {
      pool.push(createCase('TC_AUTH_001', 'Authentication flow', 'Validate login, OTP, and session behavior.', 'negative', ['Request OTP', 'Enter expired OTP', 'Check session expiry'], 'Authentication is enforced securely and unauthorized actions are blocked.'))
    }

    if (hasKyc) {
      pool.push(createCase('TC_KYC_001', 'KYC compliance', 'Verify document upload and compliance handling.', 'integration', ['Upload documents', 'Simulate compliance checks', 'Confirm verification status'], 'System enforces KYC rules and moves valid cases forward.'))
    }

    return pool.slice(0, 12)
  }

  return (
    <div className="card">
      <div className="section-title">
        <div>
          <h2>UPLOAD DOCUMENT</h2>
          <p>BRD, PRD, Jira story — PDF, DOCX, TXT, MD, image</p>
        </div>
      </div>

      <label
        htmlFor="file-upload"
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="upload-icon">⇪</div>
        <strong>Click to upload or drag & drop</strong>
        <span>BRD, PRD, Jira story — PDF, DOCX, TXT, MD, image</span>
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
      </label>

      {uploadName && (
        <div className={`status-pill ${statusType}`}>
          <div>{uploadName}</div>
          <p>{uploadMessage}</p>
        </div>
      )}

      <div className="section-title section-title--small">
        <div>
          <h3>OR PASTE REQUIREMENT / STORY TEXT</h3>
          <p>Paste your user story, acceptance criteria, BRD section, or Jira description here.</p>
        </div>
      </div>

      <div className="form-group">
        <textarea
          id="requirement"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Write the user story, acceptance criteria and business rules in plain language..."
        />
      </div>


      <div className="form-group">
        <label htmlFor="domainContext">DOMAIN CONTEXT</label>
        <select
          id="domainContext"
          value={domainContext}
          onChange={(e) => setDomainContext(e.target.value)}
        >
          {domainOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="form-group focus-section">
        <label>FOCUS AREAS</label>
        <div className="focus-grid">
          {focusKeys.map(item => (
            <label key={item.key} className="checkbox-pill">
              <input
                type="checkbox"
                checked={focusAreas[item.key]}
                onChange={(e) => setFocus(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="generate-btn" onClick={generateTestCases} disabled={isGenerating}>
        {isGenerating ? 'Generating test cases...' : 'Generate Test Cases'}
      </button>

      {testCases.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Generated Test Cases</h2>
            <p>{testCases.length} cases created for {domainContext}</p>
          </div>
          <div className="test-cases">
            {testCases.map(tc => (
              <div key={tc.id} className="test-case">
                <div className="test-case-header">
                  <strong>{tc.id}</strong>
                  <span>{tc.category.toUpperCase()}</span>
                </div>
                <h3>{tc.title}</h3>
                <p className="test-description">{tc.description}</p>
                <div className="test-detail-row">
                  <div>
                    <strong>Steps</strong>
                    <ol>
                      {tc.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <strong>Expected Result</strong>
                    <p>{tc.expectedResult}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
