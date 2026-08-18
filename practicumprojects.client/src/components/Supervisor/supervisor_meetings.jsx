import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PAGE_SIZE = 10;

const getStoredUser = () => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const authFetch = (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export default function SupervisorMeetings() {
  const user = getStoredUser();
  const currentUserId = user?.userId || Number(sessionStorage.getItem('userId')) || 1;

  const [activeTab, setActiveTab] = useState('requests');
  const [meetings, setMeetings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // View Summary Modal state
  const [showViewSummaryModal, setShowViewSummaryModal] = useState(false);
  const [viewingSummary, setViewingSummary] = useState(null);

  // Forms
  const [newDay, setNewDay] = useState('Saturday');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');

  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId]);

  // Reset to first page when changing tab or typing in search bar
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meetingsRes, slotsRes] = await Promise.all([
        authFetch(`/api/Meetings/host/${currentUserId}`),
        authFetch(`/api/AvailableTimes/user/${currentUserId}`) 
      ]);

      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setAvailableSlots(data);
      } else {
        console.error("Failed to fetch slots:", await slotsRes.text());
      }
    } catch (err) {
      console.error('Error fetching supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (newStartTime >= newEndTime) {
      alert('End time must be strictly after start time.');
      return;
    }

    try {
      const res = await authFetch('/api/AvailableTimes', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUserId,
          dayOfWeek: newDay,
          startTime: newStartTime,
          endTime: newEndTime
        })
      });

      if (res.ok) {
        const created = await res.json();
        setAvailableSlots([...availableSlots, created]);
      } else {
        const errorText = await res.text();
        alert(`Error (${res.status}): ${errorText}`);
      }
    } catch (err) {
      console.error('Failed to add slot', err);
    }
  };

  const handleRemoveSlot = async (id) => {
    try {
      const res = await authFetch(`/api/AvailableTimes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAvailableSlots(availableSlots.filter(s => s.availabilityId !== id));
      }
    } catch (err) {
      console.error('Failed to delete slot', err);
    }
  };

  const handleUpdateStatus = async (meetingId, status, reason = null) => {
    try {
      const res = await authFetch(`/api/Meetings/${meetingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      if (res.ok) {
        fetchData();
        setShowRejectionModal(false);
        setRejectionReason('');
      } else {
        const errorText = await res.text();
        alert(`Failed to update status: ${errorText}`);
      }
    } catch (err) {
      console.error('Failed to update meeting status', err);
    }
  };

  const handleOpenViewSummaryModal = (summary) => {
    setViewingSummary(summary);
    setShowViewSummaryModal(true);
  };

  // Base datasets split by tab
  const pendingMeetings = useMemo(() => meetings.filter(m => m.status === 'PENDING'), [meetings]);
  const approvedMeetings = useMemo(() => meetings.filter(m => m.status === 'APPROVED' || m.status === 'COMPLETED'), [meetings]);

  // Filter dataset by search term (Group name, Requester, Title, Agenda, Date, Medium)
  const filteredMeetings = useMemo(() => {
    const activeList = activeTab === 'requests' ? pendingMeetings : approvedMeetings;
    if (!searchQuery.trim()) return activeList;

    const query = searchQuery.toLowerCase();
    return activeList.filter(m => 
      m.groupName?.toLowerCase().includes(query) ||
      m.requestedBy?.toLowerCase().includes(query) ||
      m.title?.toLowerCase().includes(query) ||
      m.agenda?.toLowerCase().includes(query) ||
      m.meetingDate?.toLowerCase().includes(query) ||
      m.medium?.toLowerCase().includes(query)
    );
  }, [activeTab, pendingMeetings, approvedMeetings, searchQuery]);

  // Calculate pagination boundaries
  const totalPages = Math.ceil(filteredMeetings.length / PAGE_SIZE) || 1;
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeetings.slice(start, start + PAGE_SIZE);
  }, [filteredMeetings, currentPage]);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>Supervisor Meeting Management</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '8px 14px', cursor: 'pointer' }} onClick={() => setShowPreviewModal(true)}>
                Preview Availability
              </button>
              <button className="btn-primary" style={{ padding: '8px 14px', cursor: 'pointer' }} onClick={() => setShowAvailabilityModal(true)}>
                + Set Availability
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setActiveTab('requests')}
                style={{
                  padding: '10px 15px', border: 'none', background: 'none', cursor: 'pointer',
                  fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
                  borderBottom: activeTab === 'requests' ? '3px solid var(--primary)' : 'none',
                  color: activeTab === 'requests' ? 'var(--primary)' : '#64748b'
                }}
              >
                Meeting Requests ({pendingMeetings.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                style={{
                  padding: '10px 15px', border: 'none', background: 'none', cursor: 'pointer',
                  fontWeight: activeTab === 'approved' ? 'bold' : 'normal',
                  borderBottom: activeTab === 'approved' ? '3px solid var(--primary)' : 'none',
                  color: activeTab === 'approved' ? 'var(--primary)' : '#64748b'
                }}
              >
                Approved Meetings ({approvedMeetings.length})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ paddingBottom: '6px' }}>
              <input 
                type="text" 
                placeholder="Search meetings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  width: '220px'
                }}
              />
            </div>
          </div>

          {loading ? (
            <div>Loading meetings...</div>
          ) : (
            <>
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Group / Student</th>
                      <th>Requested Date & Time</th>
                      <th>Medium</th>
                      <th>Title & Agenda</th>
                      <th>Status</th>
                      {activeTab === 'approved' ? <th>Student Summary</th> : <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMeetings.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          {searchQuery ? 'No matching meetings found.' : `No ${activeTab === 'requests' ? 'pending requests' : 'approved meetings'} found.`}
                        </td>
                      </tr>
                    ) : (
                      paginatedMeetings.map(m => (
                        <tr key={m.meetingId}>
                          <td>
                            <strong>{m.groupName}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>By: {m.requestedBy || 'N/A'}</div>
                          </td>
                          <td>{m.meetingDate}<br /><span style={{ fontSize: '12px', color: '#475569' }}>{m.startTime} - {m.endTime}</span></td>
                          <td><span className={`badge ${m.medium === 'Online' ? 'badge-info' : 'badge-secondary'}`}>{m.medium}</span></td>
                          <td>
                            <strong>{m.title}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{m.agenda}</div>
                          </td>
                          <td><span className="badge badge-warning">{m.status}</span></td>
                          <td>
                            {activeTab === 'requests' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleUpdateStatus(m.meetingId, 'APPROVED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => { setSelectedMeetingId(m.meetingId); setShowRejectionModal(true); }} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Reject</button>
                              </div>
                            ) : (
                              <div>
                                {m.summary ? (
                                  <button 
                                    onClick={() => handleOpenViewSummaryModal(m.summary)} 
                                    className="btn-secondary" 
                                    style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                                  >
                                    Show Summary
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>No summary submitted yet</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredMeetings.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredMeetings.length)} of {filteredMeetings.length} results
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className="btn-secondary btn-sm" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      // style={{ padding: '6px 12px', fontSize: '12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.6 : 1 }}
                    >
                      Previous
                    </button>
                    <span style={{ fontSize: '13px', color: '#334155' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      className="btn-primary btn-sm" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      // style={{ padding: '6px 12px', fontSize: '12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.6 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Set Availability Modal --- */}
      {showAvailabilityModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <h3>Set Weekly Availability Slots</h3>
            <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '8px', margin: '15px 0', alignItems: 'center' }}>
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} style={{ padding: '6px' }}>
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} style={{ padding: '6px' }} required />
              <span>to</span>
              <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} style={{ padding: '6px' }} required />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px', cursor: 'pointer' }}>Add</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {availableSlots.map(slot => (
                <li key={slot.availabilityId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span><strong>{slot.dayOfWeek}:</strong> {slot.startTime} - {slot.endTime}</span>
                  <button onClick={() => handleRemoveSlot(slot.availabilityId)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </li>
              ))}
            </ul>
            <button className="btn-primary" onClick={() => setShowAvailabilityModal(false)} style={{ marginTop: '15px' }}>Done</button>
          </div>
        </div>
      )}

      {/* --- Preview Availability Modal --- */}
      {showPreviewModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={{ ...modalContentStyle, width: '500px' }}>
            <h3>Your Weekly Routine</h3>
            <table className="data-table" style={{ marginTop: '15px' }}>
              <thead>
                <tr><th>Day</th><th>Time Slots</th></tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map(day => {
                  const daySlots = availableSlots.filter(s => s.dayOfWeek === day);
                  return (
                    <tr key={day}>
                      <td><strong>{day}</strong></td>
                      <td>{daySlots.length === 0 ? 'Unavailable' : daySlots.map(s => `${s.startTime} - ${s.endTime}`).join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button className="btn-secondary" onClick={() => setShowPreviewModal(false)} style={{ marginTop: '15px' }}>Close</button>
          </div>
        </div>
      )}

      {/* --- Reject Modal --- */}
      {showRejectionModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <h3>Reject Request</h3>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', height: '80px', marginTop: '10px' }} placeholder="Reason..." />
            <div style={{ marginTop: '15px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowRejectionModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleUpdateStatus(selectedMeetingId, 'REJECTED', rejectionReason)}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Summary Popup Modal --- */}
      {showViewSummaryModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={{ ...modalContentStyle, width: '500px' }}>
            <h3 style={{ marginBottom: '15px' }}>Submitted Student Summary</h3>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {typeof viewingSummary === 'object' && viewingSummary !== null ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>Summary Text:</strong>
                    <p style={{ fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap', marginTop: '4px', lineHeight: '1.5' }}>
                      {viewingSummary.summaryText || 'No summary text provided.'}
                    </p>
                  </div>
                  {viewingSummary.actionItems && (
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>Action Items:</strong>
                      <p style={{ fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap', marginTop: '4px', lineHeight: '1.5' }}>
                        {viewingSummary.actionItems}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>
                  {viewingSummary}
                </p>
              )}
            </div>

            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setShowViewSummaryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', padding: '20px', borderRadius: '8px', width: '450px' };