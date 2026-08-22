import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'https://thesismanagementsystem-6opj.onrender.com/api/ExaminerEvaluation';

const defaultCriteria = {
  researchTopicAndObjectives: 0,
  literatureReview: 0,
  methodology: 0,
  developmentAndImplementation: 0,
  testingAndResults: 0,
  documentationQuality: 0,
  presentation: 0,
};

export default function Supervisor_ex_evaluate() {
  const [unevaluatedGroups, setUnevaluatedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupDetails, setGroupDetails] = useState(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Per-student rubric state: { [studentId]: { researchTopicAndObjectives: 0, ... } }
  const [studentMarks, setStudentMarks] = useState({});
  const [remarks, setRemarks] = useState('');

  const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

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

  const handleDropdownChange = async (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSuccessMessage(null);
    setError(null);

    if (!groupId) {
      setGroupDetails(null);
      setStudentMarks({});
      return;
    }

    setLoadingDetails(true);

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

      // Initialize marks state for each student in the group
      const initialMarks = {};
      if (data.members && data.members.length > 0) {
        data.members.forEach(member => {
          initialMarks[member.studentId] = { ...defaultCriteria };
        });
      }
      setStudentMarks(initialMarks);
      setRemarks('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleScoreChange = (studentId, fieldKey, maxVal, value) => {
    let numVal = parseFloat(value) || 0;
    if (numVal < 0) numVal = 0;
    if (numVal > maxVal) numVal = maxVal;

    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [fieldKey]: numVal
      }
    }));
  };

  const computeStudentTotal = (studentId) => {
    const marksObj = studentMarks[studentId];
    if (!marksObj) return 0;
    return Object.values(marksObj).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!selectedGroupId || !groupDetails) {
      setError('Please select a group from the dropdown first.');
      return;
    }

    const members = groupDetails.members || [];
    if (members.length === 0) {
      setError('No students available in this group to evaluate.');
      return;
    }

    const studentEvaluations = members.map(m => ({
      studentId: m.studentId,
      researchTopicAndObjectives: studentMarks[m.studentId]?.researchTopicAndObjectives || 0,
      literatureReview: studentMarks[m.studentId]?.literatureReview || 0,
      methodology: studentMarks[m.studentId]?.methodology || 0,
      developmentAndImplementation: studentMarks[m.studentId]?.developmentAndImplementation || 0,
      testingAndResults: studentMarks[m.studentId]?.testingAndResults || 0,
      documentationQuality: studentMarks[m.studentId]?.documentationQuality || 0,
      presentation: studentMarks[m.studentId]?.presentation || 0,
      remarks: remarks
    }));

    const payload = {
      groupId: parseInt(selectedGroupId, 10),
      studentEvaluations: studentEvaluations
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

      setSuccessMessage('Evaluations submitted successfully!');
      setGroupDetails(null);
      setSelectedGroupId('');
      setStudentMarks({});
      setRemarks('');
      fetchUnevaluatedGroups();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRubricRow = (label, fieldKey, maxScore) => {
    const members = groupDetails?.members || [];
    return (
      <div 
        key={fieldKey} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `minmax(220px, 1fr) repeat(${members.length}, 180px)`, 
          gap: '16px', 
          alignItems: 'center', 
          padding: '12px 0', 
          borderBottom: '1px solid var(--border, #eee)' 
        }}
      >
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>{label}</div>
          <div className="text-muted text-sm">Max: {maxScore}</div>
        </div>

        {members.map(member => (
          <div key={member.studentId} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
            <input
              type="number"
              className="form-control"
              style={{ width: '80px', textAlign: 'right' }}
              min="0"
              max={maxScore}
              step="0.5"
              value={studentMarks[member.studentId]?.[fieldKey] ?? 0}
              onChange={(e) => handleScoreChange(member.studentId, fieldKey, maxScore, e.target.value)}
            />
            <span className="text-muted text-sm">/ {maxScore}</span>
          </div>
        ))}
      </div>
    );
  };

  const members = groupDetails?.members || [];

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
                      {members.map(m => m.fullName).join(' & ') || 'No Members'} · Supervisor: {groupDetails.supervisorName}
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
                <div className="section-title" style={{ marginBottom: '16px' }}>Individual Evaluation Rubric</div>

                {/* Table Header: Criteria vs Student Column Headers */}
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `minmax(220px, 1fr) repeat(${members.length}, 180px)`, 
                    gap: '16px', 
                    paddingBottom: '12px', 
                    borderBottom: '2px solid var(--border, #ccc)' 
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Evaluation Criteria</div>
                  {members.map(member => (
                    <div key={member.studentId} style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary, #0056b3)' }}>
                      {member.fullName}
                    </div>
                  ))}
                </div>

                {/* Rubric Input Rows */}
                <div style={{ marginBottom: '16px' }}>
                  {renderRubricRow('Research Topic & Objectives', 'researchTopicAndObjectives', 15)}
                  {renderRubricRow('Literature Review & Background', 'literatureReview', 15)}
                  {renderRubricRow('Methodology', 'methodology', 15)}
                  {renderRubricRow('Development & Implementation', 'developmentAndImplementation', 20)}
                  {renderRubricRow('Testing & Validation', 'testingAndResults', 15)}
                  {renderRubricRow('Documentation Quality', 'documentationQuality', 10)}
                  {renderRubricRow('Presentation & Defense', 'presentation', 10)}
                </div>

                {/* Footer Section: Remarks & Total Scores per Student */}
                <div style={{ borderTop: '2px solid var(--border, #eee)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div className="form-label">Examiner Remarks</div>
                    <textarea 
                      className="form-control" 
                      style={{ width: '380px', minHeight: '80px' }} 
                      placeholder="Overall feedback and suggestions for the group..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
                    {members.map(member => (
                      <div key={member.studentId}>
                        <div className="text-muted text-sm">{member.fullName}'s Total</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: 'var(--primary, #0056b3)' }}>
                          {computeStudentTotal(member.studentId)} / 100
                        </div>
                      </div>
                    ))}
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