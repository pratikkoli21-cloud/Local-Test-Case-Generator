import { useState, type ChangeEvent, type DragEvent } from 'react'
import ExcelJS from 'exceljs'

interface TestCase {
  srNo: number
  reqId: string
  testCaseId: string
  testCase: string
  testScenario: string
  preConditions: string
  testData: string
  testCaseType: string
  module: string
  subModule: string
  testSteps: string[]
  expectedResult: string
  actualResult: string
  status: string
  executedBy: string
  bugId: string
  executionDate: string
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


export default function TestCaseGenerator() {
  const [requirement, setRequirement] = useState('')
  const [focusAreas, setFocusAreas] = useState<Record<FocusKey, boolean>>({
    functional: false,
    negative: false,
    boundary: false,
    integration: false,
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
    setFocusAreas((prev: Record<FocusKey, boolean>) => ({ ...prev, [key]: value }))
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

  const removeDocument = () => {
    setUploadName('')
    setUploadMessage('Upload a document or paste a requirement to begin.')
    setStatusType('info')
    setRequirement('')
    // Optionally clear a file input value if referenced by ref
  }

  const generateTestCases = async () => {
    if (!requirement.trim() && !uploadName.trim()) {
      setStatusType('error')
      setUploadMessage('Add a requirement or upload a file first so the generator has something to work with.')
      return
    }

    try {
      setIsGenerating(true)
      setStatusType('info')
      setUploadMessage('Analyzing full BRD structure and extracting requirements...')

      const promptText = `You are a Senior QA Automation Engineer. Your task is to generate an EXHAUSTIVE and COMPREHENSIVE suite of test cases based on the provided Business Requirements Document (BRD) or requirement text.
      
Focus Areas: ${Object.keys(focusAreas).filter(k => focusAreas[k as FocusKey]).join(', ')}.

Strict Instructions:
1. EXHAUSTIVE COVERAGE: You MUST extract every single feature, module, and sub-module from the text. For EACH feature, generate comprehensive test cases covering positive flows, negative flows, boundary limits, and edge cases. Do not summarize or group multiple scenarios into one. Generate as many test cases as possible to ensure 100% test coverage.
2. REALISTIC TEST DATA: NEVER use random, generic, or fake data like "test", "abc", or "N/A". You MUST extract specific limits, user roles, dates, and variable parameters directly from the requirement. Format the 'testData' string on separate lines using step-by-step numbering, for example: "1. Title: [Value]\\n2. Category: [Value]\\n3. Body: [Value]\\n4. Attachment: [Value]".
3. GRANULARITY: Keep test steps highly detailed and actionable.

Return ONLY a valid JSON object with a single key "testCases" containing the full array of objects. Do not include any conversational text or markdown ticks.

Each test case object MUST exactly match this structure:
{"srNo": 1, "reqId": "REQ-001", "testCaseId": "TC-001", "testCase": "Short title", "testScenario": "Scenario description", "preConditions": "Setup steps", "testData": "1. Title: ...\\n2. Category: ...", "testCaseType": "Functional", "module": "Module Name", "subModule": "Sub Module", "testSteps": ["Step 1", "Step 2"], "expectedResult": "Expected outcome", "actualResult": "", "status": "Not Executed", "executedBy": "", "bugId": "", "executionDate": ""}

Requirement:
${requirement.trim() || `Uploaded file: ${uploadName}`}`;

      // Point to your new local backend server
      const response = await fetch('http://127.0.0.1:8002/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown backend error' }));
        throw new Error(errorData.detail || `Backend API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract text from your backend's response
      const responseText = data.responseText || '';
      
      // Clean up markdown ticks if the model disobeys (even with JSON mime type)
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // Remove invalid control characters from the JSON string
      cleanJson = cleanJson.replace(/[\x00-\x1F\x7F]/g, ' ').trim();
      
      let parsed: Record<string, any> = {};
      try {
        parsed = JSON.parse(cleanJson || '{}');
      } catch (parseError) {
        console.warn("JSON parsing failed, likely due to AI hitting max token limits. Attempting to rescue valid test cases...");
        
        // Find the last completely closed object in the string to discard the cut-off text
        const lastValidBrace = cleanJson.lastIndexOf('}');
        if (lastValidBrace !== -1) {
          const rescuedStr = cleanJson.substring(0, lastValidBrace + 1);
          try {
            parsed = JSON.parse(rescuedStr + ']}'); // Rescue standard object structure
          } catch {
            try {
              parsed = JSON.parse(rescuedStr + ']'); // Rescue raw array structure
            } catch {
              throw parseError; // Throw original if all rescue attempts fail
            }
          }
        } else {
          throw parseError;
        }
      }
      
      const generated = parsed.testCases || parsed.test_cases || (Array.isArray(parsed) ? parsed : []);
      
      if (!generated || generated.length === 0) {
        throw new Error("The AI model returned an empty test case array. Please adjust the requirement or try again.")
      }

      setTestCases(generated)
      setStatusType('success')
      setUploadMessage(`Generated ${generated.length} test cases successfully.`)
    } catch (error) {
      console.error("Test generation crashed:", error)
      setStatusType('error');
      let errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Failed to communicate with the AI backend. Please make sure your local server is running on http://127.0.0.1:8002.';
      } else if (errorMessage.includes('JSON') || errorMessage.includes('empty test case')) {
        errorMessage = `Data Parsing Error: ${errorMessage}`;
      }
      setUploadMessage(errorMessage);
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToExcel = async () => {
    if (testCases.length === 0) return

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Cases");

    const headers = ['Sr no.', 'Requirement ID', 'Test Case ID', 'Test Case', 'Test Scenario', 'Pre-Conditions', 'Test Data', 'Test Case Type', 'Module/Feature', 'Sub-Module', 'Test Steps', 'Expected Result', 'Actual Result', 'Status', 'Executed by', 'Bug ID', 'Execution Date']
    
    // Add headers
    const headerRow = worksheet.addRow(headers);
    
    // Apply Header Styling
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB4C6E7' } // Blue, Accent 5, Lighter 40%
      };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Add Rows
    testCases.forEach((tc: TestCase) => {
      const row = worksheet.addRow([
        tc.srNo,
        tc.reqId,
        tc.testCaseId,
        tc.testCase,
        tc.testScenario,
        tc.preConditions,
        tc.testData,
        tc.testCaseType,
        tc.module,
        tc.subModule,
        (tc.testSteps || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n'),
        tc.expectedResult,
        tc.actualResult,
        tc.status,
        tc.executedBy,
        tc.bugId,
        tc.executionDate
      ]);

      // Apply Row Styling (Borders & Wrap Text)
      row.eachCell((cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'top', wrapText: true };
      });
    });

    // Auto-adjust column widths based on text length (capped at 60 characters so wrap-text functions beautifully)
    worksheet.columns.forEach((column: Partial<ExcelJS.Column>) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        const lines = cellValue.split('\n');
        const maxLineLength = Math.max(...lines.map((line: string) => line.length));
        if (maxLineLength > maxLength) {
          maxLength = maxLineLength;
        }
      });
      if (column) {
        column.width = Math.min(Math.max(maxLength + 2, 12), 60);
      }
    });

    // Export the file natively to browser
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test-cases.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ backgroundColor: '#f3f2f1', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
    <div className="card" style={{ maxWidth: '1200px', width: '100%', boxSizing: 'border-box', margin: '0 auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', color: '#242424', border: '1px solid #edebe9' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '20px', backgroundColor: '#f0f6ff', color: '#0f6cbd', fontSize: '2.5em', marginBottom: '16px', boxShadow: '0 4px 12px rgba(15, 108, 189, 0.15)' }}>
          ✨
        </div>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '2.2em', fontWeight: '600', letterSpacing: '-0.02em' }}>Test Case Generator</h1>
        <p style={{ margin: 0, color: '#616161', fontSize: '1.1em' }}>Describe your requirement or upload a document to generate comprehensive test cases.</p>
      </div>

      <div style={{ backgroundColor: '#eefbfa', padding: '24px', borderRadius: '16px', border: '1px solid #cce8d6', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15em', color: '#0f6cbd', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💡</span> How to generate test cases:
        </h3>
        <ol style={{ margin: 0, paddingLeft: '24px', lineHeight: '1.7', fontSize: '0.95em', color: '#242424' }}>
          <li><strong>Upload</strong> or drag & drop a file, or <strong>paste</strong> your requirement text below.</li>
          <li>Select the <strong>Focus Areas</strong> for your testing scope.</li>
          <li>Click <strong>Generate</strong> to create the test cases.</li>
          <li>Use the <strong>Delete icon (🗑️)</strong> to remove an uploaded file if needed.</li>
          <li>Click <strong>Export to Excel</strong> to download the generated test cases.</li>
          <li><strong>Reload</strong> the webpage to clear all data and start over.</li>
        </ol>
      </div>

      <div style={{ backgroundColor: '#faf9f8', padding: '32px', borderRadius: '16px', border: '1px solid #edebe9', marginBottom: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '1.1em', color: '#242424' }}>
            <span style={{ marginRight: '8px', fontSize: '1.2em' }}>📄</span> Upload Document
          </label>
          <p style={{ color: '#616161', fontSize: '0.95em', marginBottom: '16px' }}>Extract requirements directly from a BRD, PRD, Jira story, or image.</p>
          <label
            htmlFor="file-upload"
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #c7e0f4', borderRadius: '12px', padding: '40px 20px', backgroundColor: '#f8fcff', cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <div style={{ fontSize: '2.5em', color: '#0f6cbd', marginBottom: '12px' }}>⇪</div>
            <strong style={{ color: '#0f6cbd', fontSize: '1.1em', marginBottom: '8px' }}>Click to upload or drag & drop</strong>
            <span style={{ color: '#616161', fontSize: '0.9em' }}>PDF, DOCX, TXT, MD, PNG, JPG</span>
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {uploadName && (
          <div style={{ padding: '16px', backgroundColor: statusType === 'error' ? '#fdf3f4' : '#eefbfa', border: `1px solid ${statusType === 'error' ? '#f2c6c8' : '#cce8d6'}`, borderRadius: '12px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.5em' }}>{statusType === 'error' ? '❌' : '✔️'}</span>
              <div>
                <div style={{ fontWeight: '600', color: '#242424', fontSize: '1em' }}>{uploadName}</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: '#616161' }}>{uploadMessage}</p>
              </div>
            </div>
            <button onClick={removeDocument} style={{ background: 'transparent', border: 'none', color: '#616161', cursor: 'pointer', fontSize: '1.2em', padding: '8px' }} title="Remove Document">🗑️</button>
          </div>
        )}

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '1.1em', color: '#242424' }}>
            <span style={{ marginRight: '8px', fontSize: '1.2em' }}>✍️</span> Or paste requirement text
          </label>
          <textarea
            id="requirement"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Write the user story, acceptance criteria, and business rules in plain language..."
            style={{ width: '100%', minHeight: '200px', padding: '16px', borderRadius: '12px', border: '1px solid #d1d1d1', backgroundColor: '#ffffff', color: '#242424', fontSize: '1.05em', lineHeight: '1.6', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)', outline: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px', marginBottom: '32px' }}>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '1.1em', color: '#242424' }}>
              <span style={{ marginRight: '8px', fontSize: '1.2em' }}>🎯</span> Focus Areas
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {focusKeys.map(item => (
                <label key={item.key} style={{ padding: '10px 20px', borderRadius: '24px', border: `1px solid ${focusAreas[item.key] ? '#0f6cbd' : '#d1d1d1'}`, backgroundColor: focusAreas[item.key] ? '#eefbfa' : '#ffffff', color: focusAreas[item.key] ? '#0f6cbd' : '#424242', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95em', fontWeight: focusAreas[item.key] ? '600' : '400', transition: 'all 0.2s ease', boxShadow: focusAreas[item.key] ? '0 2px 4px rgba(15,108,189,0.1)' : '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <input
                    type="checkbox"
                    checked={focusAreas[item.key]}
                    onChange={(e) => setFocus(item.key, e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={generateTestCases} 
        disabled={isGenerating}
        style={{ width: '100%', padding: '18px', backgroundColor: isGenerating ? '#f3f2f1' : '#0f6cbd', color: isGenerating ? '#a19f9d' : '#ffffff', border: 'none', borderRadius: '12px', fontSize: '1.15em', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', boxShadow: isGenerating ? 'none' : '0 6px 16px rgba(15, 108, 189, 0.25)', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: '1.3em' }}>{isGenerating ? '⏳' : '✨'}</span> 
        {isGenerating ? 'Analyzing requirements & generating cases...' : 'Generate Comprehensive Test Cases'}
      </button>

      {testCases.length > 0 && (
        <div className="results-section" style={{ marginTop: '32px', backgroundColor: '#faf9f8', padding: '32px', borderRadius: '16px', border: '1px solid #edebe9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#eefbfa', color: '#0f6cbd', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '1.5em' }}>✨</span>
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5em', color: '#242424', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>Here are your generated test cases</h2>
                <p style={{ margin: 0, color: '#616161', fontSize: '0.95em' }}>I've created {testCases.length} comprehensive cases based on your requirements.</p>
              </div>
            </div>
            <button 
              onClick={exportToExcel}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', backgroundColor: '#ffffff', color: '#0f6cbd', 
                border: '1px solid #c7e0f4', borderRadius: '8px', cursor: 'pointer', 
                fontWeight: '600', fontSize: '0.9em', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                transition: 'background-color 0.2s',
                fontFamily: '"Segoe UI", system-ui, sans-serif'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <span style={{ fontSize: '1.2em' }}>⬇️</span> Export to Excel
            </button>
          </div>
          <div className="test-cases" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {testCases.map((tc) => (
              <div key={tc.testCaseId} className="test-case" style={{
                backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', 
                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontFamily: '"Segoe UI", system-ui, sans-serif'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ backgroundColor: '#f0f0f0', color: '#424242', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '600' }}>
                      #{tc.srNo}
                    </div>
                    <div style={{ backgroundColor: '#f0f0f0', color: '#424242', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '600' }}>
                      #{tc.testCaseId}
                    </div>
                    <div style={{ backgroundColor: '#f0f0f0', color: '#424242', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '600' }}>
                      Req: {tc.reqId}
                    </div>
                    <span style={{
                      backgroundColor: '#eefbfa',
                      color: '#0f6cbd',
                      padding: '4px 12px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '600', textTransform: 'capitalize'
                    }}>
                      {tc.testCaseType}
                    </span>
                    <span style={{ color: '#616161', fontSize: '0.85em' }}>
                      Module: <strong>{tc.module}</strong> {tc.subModule ? `> ${tc.subModule}` : ''}
                    </span>
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25em', color: '#242424', fontWeight: '600' }}>{tc.testCase}</h3>
                <p style={{ color: '#616161', marginBottom: '24px', lineHeight: '1.5', fontSize: '0.95em' }}><strong>Scenario:</strong> {tc.testScenario}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fcfcfc', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <strong style={{ color: '#242424', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95em' }}>
                      <span style={{fontSize:'1.1em'}}>📌</span> Pre-Conditions
                    </strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95em', color: '#616161', lineHeight: '1.5' }}>{tc.preConditions}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#fcfcfc', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <strong style={{ color: '#242424', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95em' }}>
                      <span style={{fontSize:'1.1em'}}>💾</span> Test Data
                    </strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95em', color: '#616161', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{tc.testData}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <strong style={{ color: '#242424', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95em' }}>
                       <span style={{fontSize:'1.1em'}}>🔄</span> Test Steps
                    </strong>
                    <ol style={{ margin: '12px 0 0 0', paddingLeft: '24px', color: '#424242', fontSize: '0.95em', lineHeight: '1.6' }}>
                  {(tc.testSteps || []).map((step, idx) => (
                        <li key={`step-${idx}`}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <strong style={{ color: '#242424', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95em' }}>
                      <span style={{fontSize:'1.1em'}}>🎯</span> Expected Result
                    </strong>
                    <p style={{ margin: '12px 0 0 0', fontSize: '0.95em', color: '#424242', lineHeight: '1.6' }}>{tc.expectedResult}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85em', color: '#616161', backgroundColor: '#f8f8f8', padding: '12px 16px', borderRadius: '6px', flexWrap: 'wrap' }}>
                  <div><strong>Status:</strong> {tc.status}</div>
                  <div><strong>Actual Result:</strong> {tc.actualResult || '--'}</div>
                  <div><strong>Executed By:</strong> {tc.executedBy || '--'}</div>
                  <div><strong>Execution Date:</strong> {tc.executionDate || '--'}</div>
                  <div><strong>Bug ID:</strong> {tc.bugId || '--'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
