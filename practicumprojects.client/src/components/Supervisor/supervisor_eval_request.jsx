import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'http://localhost:64580/api/EvaluationEditRequest';

export default function Supervisor_eval_request() {
  const [evaluatedGroups, setEvaluatedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    fetchEvaluatedGroups();
  }, []);

  const fetchEvaluatedGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/my-evaluated-groups`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to load evaluated groups.');

      const data = await response.json();
      setEvaluatedGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedGroupId) {
      setError('Please select a thesis group.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for requesting the evaluation edit.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/request-edit`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          groupId: parseInt(selectedGroupId, 10),
          reason: reason.trim()
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to submit edit request.');
      }

      setSuccessMessage('Evaluation edit request sent to admin successfully!');
      setSelectedGroupId('');
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Request Evaluation Edit</div>
              <div className="text-muted text-sm">Request permission from an administrator to re-evaluate a thesis group.</div>
            </div>
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

          <div className="card" style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                  Select Evaluated Group:
                </label>
                {loading ? (
                  <div className="text-muted text-sm">Loading groups...</div>
                ) : (
                  <select
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px' }}
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    <option value="">-- Select a Group --</option>
                    {evaluatedGroups.map((g) => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.groupName} ({g.semesterName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                  Reason for Edit Request:
                </label>
                <textarea
                  className="form-control"
                  style={{ width: '100%', minHeight: '110px', padding: '8px 12px' }}
                  placeholder="Explain why marks need to be adjusted..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !selectedGroupId}
              >
                {submitting ? 'Sending Request...' : 'Send Edit Request to Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}