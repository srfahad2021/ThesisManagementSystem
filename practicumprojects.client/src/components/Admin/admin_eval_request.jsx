import React, { useState, useEffect } from 'react';
import '../style.css';

const API_BASE_URL = 'http://localhost:64580/api/EvaluationEditRequest';

export default function Admin_eval_request() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});

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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/all-requests`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to load evaluation edit requests.');

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (requestId, approve) => {
    setActionLoadingId(requestId);
    setError(null);
    setSuccessMessage(null);

    const remarks = remarksMap[requestId] || '';

    try {
      const response = await fetch(`${API_BASE_URL}/process-request`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          requestId: requestId,
          approve: approve,
          adminRemarks: remarks
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to process request.');
      }

      setSuccessMessage(`Request #${requestId} ${approve ? 'Approved' : 'Rejected'} successfully.`);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Evaluation Edit Requests (Admin)</div>
              <div className="text-muted text-sm">Approve or reject requests from supervisors seeking to update marks.</div>
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

          {loading ? (
            <div className="card"><p className="text-muted">Loading requests...</p></div>
          ) : requests.length === 0 ? (
            <div className="card"><p className="text-muted">No edit requests found.</p></div>
          ) : (
            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px' }}>Group</th>
                    <th style={{ padding: '12px 16px' }}>Evaluator</th>
                    <th style={{ padding: '12px 16px' }}>Reason</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Admin Remarks / Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.requestId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{req.groupName}</td>
                      <td style={{ padding: '12px 16px' }}>{req.evaluatorName}</td>
                      <td style={{ padding: '12px 16px', maxWidth: '250px' }}>{req.reason}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: req.status === 'Approved' ? '#e6ffe6' : req.status === 'Rejected' ? '#ffe6e6' : '#fff3cd',
                          color: req.status === 'Approved' ? '#008000' : req.status === 'Rejected' ? '#cc0000' : '#856404'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {req.status === 'Pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Admin remarks (optional)"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                              value={remarksMap[req.requestId] || ''}
                              onChange={(e) => setRemarksMap({ ...remarksMap, [req.requestId]: e.target.value })}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#28a745' }}
                                disabled={actionLoadingId === req.requestId}
                                onClick={() => handleProcess(req.requestId, true)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: '#fff' }}
                                disabled={actionLoadingId === req.requestId}
                                onClick={() => handleProcess(req.requestId, false)}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted text-sm">{req.adminRemarks || 'No remarks'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}