import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'http://localhost:64580/api/EvaluationEditRequest';

const defaultCriteria = {
  researchTopicAndObjectives: 0,
  literatureReview: 0,
  methodology: 0,
  developmentAndImplementation: 0,
  testingAndResults: 0,
  documentationQuality: 0,
  presentation: 0,
};

export default function Supervisor_eval_edit() {
  const [approvedGroups, setApprovedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupDetails, setGroupDetails] = useState(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [studentMarks, setStudentMarks] = useState({});

  const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    fetchApprovedGroups();
  }, []);

  const fetchApprovedGroups = async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/my-approved-groups`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to load approved editable groups.');

      const data = await response.json();
      setApprovedGroups(data);
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
      const response = await fetch(`${API_BASE_URL}/group-edit-details/${groupId}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to load group details for editing.');
      }

      const data = await response.json();
      setGroupDetails(data);

      // Pre-fill existing marks into component state
      const initialMarks = {};
      if (data.members && data.members.length > 0) {
        data.members.forEach((member) => {
          if (member.existingMarks) {
            initialMarks[member.studentId] = { ...member.existingMarks };
          } else {
            initialMarks[member.studentId] = { ...defaultCriteria };
          }
        });
      }
      setStudentMarks(initialMarks);
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

    setStudentMarks((prev) => ({
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

  const handleSubmitEdit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!selectedGroupId || !groupDetails) {
      setError('Please select a group first.');
      return;
    }

    const members = groupDetails.members || [];
    const studentEvaluations = members.map((m) => ({
      studentId: m.studentId,
      researchTopicAndObjectives: studentMarks[m.studentId]?.researchTopicAndObjectives || 0,
      literatureReview: studentMarks[m.studentId]?.literatureReview || 0,
      methodology: studentMarks[m.studentId]?.methodology || 0,
      developmentAndImplementation: studentMarks[m.studentId]?.developmentAndImplementation || 0,
      testingAndResults: studentMarks[m.studentId]?.testingAndResults || 0,
      documentationQuality: studentMarks[m.studentId]?.documentationQuality || 0,
      presentation: studentMarks[m.studentId]?.presentation || 0
    }));

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/submit-edit`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          groupId: parseInt(selectedGroupId, 10),
          studentEvaluations: studentEvaluations
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to submit updated evaluation.');
      }

      setSuccessMessage('Evaluation updated successfully!');
      setGroupDetails(null);
      setSelectedGroupId('');
      setStudentMarks({});
      fetchApprovedGroups();
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

        {members.map((member) => (
          <div key={member.studentId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Edit Evaluation</div>
              <div className="text-muted text-sm">Update marks for approved groups.</div>
            </div>
            <button
              className="btn-primary"
              onClick={handleSubmitEdit}
              disabled={submitting || !selectedGroupId}
            >
              {submitting ? 'Updating...' : 'Save Updated Marks'}
            </button>
          </div>

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

          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="form-label" style={{ marginBottom: '8px' }}>Select Group to Edit:</div>
            {loadingGroups ? (
              <div className="text-muted text-sm">Loading approved groups...</div>
            ) : (
              <select
                className="form-control"
                style={{ width: '100%', maxWidth: '450px', padding: '8px 12px' }}
                value={selectedGroupId}
                onChange={handleDropdownChange}
              >
                <option value="">-- Select an Approved Group --</option>
                {approvedGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName} ({g.semesterName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingDetails && <div className="card"><p className="text-muted">Loading marks details...</p></div>}

          {groupDetails && (
            <div className="card">
              <div className="section-title" style={{ marginBottom: '16px' }}>
                Editing Marks for: {groupDetails.groupName} ({groupDetails.title})
              </div>

              {/* Rubric Header */}
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
                {members.map((member) => (
                  <div key={member.studentId} style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary, #0056b3)' }}>
                    {member.fullName}
                  </div>
                ))}
              </div>

              {/* Score Input Rows */}
              <div style={{ marginBottom: '16px' }}>
                {renderRubricRow('Research Topic & Objectives', 'researchTopicAndObjectives', 15)}
                {renderRubricRow('Literature Review & Background', 'literatureReview', 15)}
                {renderRubricRow('Methodology', 'methodology', 15)}
                {renderRubricRow('Development & Implementation', 'developmentAndImplementation', 20)}
                {renderRubricRow('Testing & Validation', 'testingAndResults', 15)}
                {renderRubricRow('Documentation Quality', 'documentationQuality', 10)}
                {renderRubricRow('Presentation & Defense', 'presentation', 10)}
              </div>

              {/* Totals Section */}
              <div style={{ borderTop: '2px solid var(--border, #eee)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '32px' }}>
                {members.map((member) => (
                  <div key={member.studentId} style={{ textAlign: 'right' }}>
                    <div className="text-muted text-sm">{member.fullName}'s Total</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary, #0056b3)' }}>
                      {computeStudentTotal(member.studentId)} / 100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}