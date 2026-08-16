import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'http://localhost:64580/api/ExaminerEvaluation';

export default function Supervisor_ex_evaluate() {
  const [unevaluatedGroups, setUnevaluatedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupDetails, setGroupDetails] = useState(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Rubric Marks State
  const [marks, setMarks] = useState({
    researchTopicAndObjectives: 0,
    literatureReview: 0,
    methodology: 0,
    developmentAndImplementation: 0,
    testingAndResults: 0,
    documentationQuality: 0,
    presentation: 0,
  });

  const [remarks, setRemarks] = useState('');

  // Helper to retrieve token from sessionStorage
  const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fetch Unevaluated Groups on Mount
  useEffect(() => {
    fetchUnevaluatedGroups();
  }, []);

  const fetchUnevaluatedGroups = async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/unevaluated-groups`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Token is missing or expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch groups (${response.status})`);
      }

      const data = await response.json();
      setUnevaluatedGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Handle Dropdown Selection Change
  const handleDropdownChange = async (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSuccessMessage(null);
    setError(null);

    if (!groupId) {
      setGroupDetails(null);
      return;
    }

    setLoadingDetails(true);
    resetForm();

    try {
      const response = await fetch(`${API_BASE_URL}/group-details/${groupId}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        throw new Error('Unauthorized session. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to load group details (${response.status})`);
      }

      const data = await response.json();
      setGroupDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const resetForm = () => {
    setMarks({
      researchTopicAndObjectives: 0,
      literatureReview: 0,
      methodology: 0,
      developmentAndImplementation: 0,
      testingAndResults: 0,
      documentationQuality: 0,
      presentation: 0,
    });
    setRemarks('');
  };

  const handleScoreChange = (field, maxVal, value) => {
    let numVal = parseFloat(value) || 0;
    if (numVal < 0) numVal = 0;
    if (numVal > maxVal) numVal = maxVal;

    setMarks(prev => ({
      ...prev,
      [field]: numVal
    }));
  };

  // Compute Total Score
  const totalScore = Object.values(marks).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  // Submit Evaluation Handler
  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!selectedGroupId || !groupDetails) {
      setError('Please select a group from the dropdown first.');
      return;
    }

    const studentIds = groupDetails.members ? groupDetails.members.map(m => m.studentId) : [];

    const payload = {
      groupId: parseInt(selectedGroupId, 10),
      studentIds: studentIds,
      researchTopicAndObjectives: marks.researchTopicAndObjectives,
      literatureReview: marks.literatureReview,
      methodology: marks.methodology,
      developmentAndImplementation: marks.developmentAndImplementation,
      testingAndResults: marks.testingAndResults,
      documentationQuality: marks.documentationQuality,
      presentation: marks.presentation,
      remarks: remarks
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Session expired.');
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to submit evaluation.');
      }

      setSuccessMessage('Evaluation submitted successfully!');
      setGroupDetails(null);
      setSelectedGroupId('');
      resetForm();
      fetchUnevaluatedGroups();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render Rubric input row using your design layout
  const renderRubricRow = (label, fieldKey, maxScore) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border, #eee)' }}>
      <div>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{label}</div>
        <div className="text-muted text-sm">Maximum Score: {maxScore}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number"
          className="form-control"
          style={{ width: '80px', textAlign: 'right' }}
          min="0"
          max={maxScore}
          step="0.5"
          value={marks[fieldKey]}
          onChange={(e) => handleScoreChange(fieldKey, maxScore, e.target.value)}
        />
        <span className="text-muted text-sm">/ {maxScore}</span>
      </div>
    </div>
  );

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          {/* SECTION HEAD */}
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px' }}>Thesis Evaluation</div>
              <div className="text-muted text-sm">
                {groupDetails 
                  ? `${groupDetails.groupName} · ${groupDetails.semesterName}` 
                  : 'Select a group from the dropdown below to begin evaluation'}
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              disabled={submitting || !selectedGroupId}
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="card" style={{ backgroundColor: '#ffe6e6', color: '#cc0000', marginBottom: '16px', padding: '12px 16px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {successMessage && (
            <div className="card" style={{ backgroundColor: '#e6ffe6', color: '#008000', marginBottom: '16px', padding: '12px 16px' }}>
              {successMessage}
            </div>
          )}

          {/* GROUP SELECTOR DROPDOWN CARD */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="form-label" style={{ marginBottom: '8px' }}>Select Thesis Group to Evaluate:</div>
            {loadingGroups ? (
              <div className="text-muted text-sm">Loading available groups...</div>
            ) : (
              <select
                className="form-control"
                style={{ width: '100%', maxWidth: '450px', padding: '8px 12px' }}
                value={selectedGroupId}
                onChange={handleDropdownChange}
              >
                <option value="">-- Choose a Group --</option>
                {unevaluatedGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName} ({g.semesterName}) - Status: {g.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* GROUP OVERVIEW CARD */}
          {loadingDetails && <div className="card"><p className="text-muted">Loading group details...</p></div>}

          {groupDetails && (
            <>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{groupDetails.title}</div>
                    <div className="text-muted text-sm">
                      {groupDetails.members.map(m => m.fullName).join(' & ') || 'No Members'} · Supervisor: {groupDetails.supervisorName}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary btn-sm">View Thesis PDF</button>
                    <button className="btn-secondary btn-sm">View Attendance</button>
                  </div>
                </div>

                <div className="workflow-steps">
                  <div className="wf-step done"><div className="wf-dot"></div>In Progress</div>
                  <div className="wf-step done"><div className="wf-dot"></div>Completed</div>
                  <div className="wf-step active"><div className="wf-dot"></div>Under Examination</div>
                  <div className="wf-step"><div className="wf-dot"></div>Archived</div>
                </div>
              </div>

              {/* EVALUATION RUBRIC CARD */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: '16px' }}>Evaluation Rubric</div>
                
                <div style={{ marginBottom: '16px' }}>
                  {renderRubricRow('Research Topic & Objectives', 'researchTopicAndObjectives', 15)}
                  {renderRubricRow('Literature Review & Background', 'literatureReview', 15)}
                  {renderRubricRow('Methodology', 'methodology', 15)}
                  {renderRubricRow('Development & Implementation', 'developmentAndImplementation', 20)}
                  {renderRubricRow('Testing & Validation', 'testingAndResults', 15)}
                  {renderRubricRow('Documentation Quality', 'documentationQuality', 10)}
                  {renderRubricRow('Presentation & Defense', 'presentation', 10)}
                </div>

                <div style={{ borderTop: '2px solid var(--border, #eee)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="form-label">Examiner Remarks</div>
                    <textarea 
                      className="form-control" 
                      style={{ width: '400px', minHeight: '70px' }} 
                      placeholder="Overall feedback and suggestions…"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted text-sm">Total Score</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: 'var(--primary, #0056b3)' }} id="totalScore">
                      {totalScore} / 100
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}