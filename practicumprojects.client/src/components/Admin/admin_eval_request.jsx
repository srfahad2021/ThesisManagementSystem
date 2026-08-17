import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

const API_BASE_URL = 'http://localhost:64580/api/EvaluationEditRequest';

export default function Admin_eval_request() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const query = searchTerm.toLowerCase();
      const groupNameStr = (req.groupName || '').toLowerCase();
      const evaluatorNameStr = (req.evaluatorName || '').toLowerCase();
      const reasonStr = (req.reason || '').toLowerCase();
      const statusStr = (req.status || '').toLowerCase();

      return (
        groupNameStr.includes(query) ||
        evaluatorNameStr.includes(query) ||
        reasonStr.includes(query) ||
        statusStr.includes(query)
      );
    });
  }, [requests, searchTerm]);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate slice range for current page
  const totalEntries = filteredRequests.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-title" style={{ fontSize: '18px' }}>Evaluation Edit Requests</div>
              <div className="text-muted text-sm">Approve or reject requests from supervisors seeking to update marks.</div>
            </div>
            {/* Searchbar */}
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Search requests by Group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px', padding: '6px 12px' }}
              />
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
          ) : (
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ overflowX: 'auto' }}>
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
                    {currentRequests.length > 0 ? (
                      currentRequests.map((req) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                          No matching edit requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #eee'
                }}
              >
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Showing {totalEntries > 0 ? startIndex + 1 : 0}–{endIndex} of {totalEntries} entries
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    disabled={currentPage === totalPages || totalEntries === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}