import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'https://thesismanagementsystem-6opj.onrender.com/api/ExaminerEvaluation';

export default function StudentEvaluation() {
  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [evaluationData, setEvaluationData] = useState(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [error, setError] = useState(null);

  // Helper to retrieve token from sessionStorage
  const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fetch groups where current user is assigned as student
  useEffect(() => {
    fetchStudentGroups();
  }, []);

  const fetchStudentGroups = async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/my-student-groups`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        throw new Error('Unauthorized session. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to load groups (${response.status})`);
      }

      const data = await response.json();
      setStudentGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Handle Group Selection
  const handleGroupChange = async (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setError(null);
    setEvaluationData(null);

    if (!groupId) return;

    setLoadingEvaluation(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student-evaluation/${groupId}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        throw new Error('Unauthorized session. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to load evaluation data (${response.status})`);
      }

      const data = await response.json();
      setEvaluationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Calculate letter grade based on total score
  const calculateGrade = (score) => {
    if (score >= 80) return 'A+';
    if (score >= 75) return 'A';
    if (score >= 70) return 'A-';
    if (score >= 65) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 55) return 'B-';
    if (score >= 50) return 'C+';
    if (score >= 45) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  // Compute average for a rubric field across all evaluation entries
  const computeAverage = (evaluations, fieldKey) => {
    if (!evaluations || evaluations.length === 0) return '0.0';
    const sum = evaluations.reduce((acc, curr) => acc + (parseFloat(curr[fieldKey]) || 0), 0);
    return (sum / evaluations.length).toFixed(1);
  };

  // Render individual rubric row
  const renderEvalRow = (title, score, maxScore) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border, #eee)' }}>
      <div style={{ fontWeight: '500' }}>{title}</div>
      <div>
        <span style={{ fontWeight: '700' }}>{score}</span>
        <span className="text-muted text-sm"> / {maxScore}</span>
      </div>
    </div>
  );

  const evaluations = evaluationData?.evaluations || [];
  const hasEvaluations = evaluations.length > 0;

  const avgResearch = hasEvaluations ? computeAverage(evaluations, 'researchTopicAndObjectives') : '0.0';
  const avgLiterature = hasEvaluations ? computeAverage(evaluations, 'literatureReview') : '0.0';
  const avgMethodology = hasEvaluations ? computeAverage(evaluations, 'methodology') : '0.0';
  const avgImplementation = hasEvaluations ? computeAverage(evaluations, 'developmentAndImplementation') : '0.0';
  const avgTesting = hasEvaluations ? computeAverage(evaluations, 'testingAndResults') : '0.0';
  const avgDocumentation = hasEvaluations ? computeAverage(evaluations, 'documentationQuality') : '0.0';
  const avgPresentation = hasEvaluations ? computeAverage(evaluations, 'presentation') : '0.0';

  const totalScore = (
    parseFloat(avgResearch) +
    parseFloat(avgLiterature) +
    parseFloat(avgMethodology) +
    parseFloat(avgImplementation) +
    parseFloat(avgTesting) +
    parseFloat(avgDocumentation) +
    parseFloat(avgPresentation)
  ).toFixed(1);

  const grade = calculateGrade(parseFloat(totalScore));
  const examinersList = evaluations.map(e => e.evaluatorName).filter(Boolean).join(', ');

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          {/* SECTION HEAD */}
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px' }}>Evaluation Results</div>
              <div className="text-muted text-sm">
                {selectedGroupId && hasEvaluations && examinersList
                  ? `Evaluator(s): ${examinersList}`
                  : 'Select your thesis group to view evaluation results'}
              </div>
            </div>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="card" style={{ backgroundColor: '#ffe6e6', color: '#cc0000', marginBottom: '16px', padding: '12px 16px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* GROUP SELECTION DROPDOWN */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="form-label" style={{ marginBottom: '8px', fontWeight: '600' }}>
              Select Group:
            </div>
            {loadingGroups ? (
              <div className="text-muted text-sm">Loading groups...</div>
            ) : (
              <select
                className="form-control"
                style={{ width: '100%', maxWidth: '450px', padding: '8px 12px' }}
                value={selectedGroupId}
                onChange={handleGroupChange}
              >
                <option value="">-- Choose a Group --</option>
                {studentGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName} ({g.semesterName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* LOADING STATE */}
          {loadingEvaluation && (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div className="text-muted">Loading evaluation details...</div>
            </div>
          )}

          {/* NO EVALUATION YET */}
          {selectedGroupId && !loadingEvaluation && !hasEvaluations && (
            <div className="card" style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Evaluation is not done yet
              </div>
              <div className="text-muted text-sm">
                Your group has not been evaluated by examiners or supervisors yet.
              </div>
            </div>
          )}

          {/* EVALUATION RESULTS CONTENT */}
          {selectedGroupId && !loadingEvaluation && hasEvaluations && (
            <>
              {/* TOTAL SCORE BANNER */}
              <div
                style={{
                  background: '#FFF5F5',
                  border: '1px solid #FFC8C8',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: 'var(--primary)' }}>
                  {grade}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{totalScore} / 100</div>
                  <div className="text-muted text-sm">
                    {evaluationData?.semesterName || 'Current Semester'} · Average Thesis Evaluation Marks
                  </div>
                </div>
              </div>

              {/* RUBRIC BREAKDOWN */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: '16px' }}>
                  Rubric Breakdown (Average Scores)
                </div>

                {renderEvalRow('Research Topic & Objectives', avgResearch, '15')}
                {renderEvalRow('Literature Review', avgLiterature, '15')}
                {renderEvalRow('Methodology', avgMethodology, '15')}
                {renderEvalRow('Development & Implementation', avgImplementation, '20')}
                {renderEvalRow('Testing & Results', avgTesting, '15')}
                {renderEvalRow('Documentation Quality', avgDocumentation, '10')}
                {renderEvalRow('Presentation', avgPresentation, '10')}

                <div
                  style={{
                    borderTop: '2px solid var(--border)',
                    paddingTop: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700 }}>Total Score</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                    {totalScore} / 100
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