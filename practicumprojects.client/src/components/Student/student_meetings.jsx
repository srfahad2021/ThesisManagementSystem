import React, { useState, useEffect } from 'react';
import '../style.css';

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

export default function StudentMeetings() {
  const user = getStoredUser();
  const currentStudentId = user?.userId || user?.id || Number(sessionStorage.getItem('userId')) || 1;
  const currentStudentName = user?.fullName || user?.name || user?.username || 'Student';

  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [meetings, setMeetings] = useState([]);
  const [supervisorSlots, setSupervisorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Request form state
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [medium, setMedium] = useState('Offline');
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');

  // Summary form modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [actionItems, setActionItems] = useState('');

  // Summary view modal state
  const [showViewSummaryModal, setShowViewSummaryModal] = useState(false);
  const [viewingSummary, setViewingSummary] = useState(null);

  const currentGroup = studentGroups.find(g => Number(g.groupId || g.id) === Number(selectedGroupId));

  const selectedDayOfWeek = meetingDate 
    ? new Date(meetingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : '';

  useEffect(() => {
    if (currentStudentId) {
      fetchStudentGroups();
    }
  }, [currentStudentId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMeetings(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    const supervisorId = currentGroup?.supervisorId || currentGroup?.supervisor?.userId || currentGroup?.supervisor?.id;
    if (showRequestModal && supervisorId) {
      fetchSupervisorAvailability(supervisorId, meetingDate);
    }
  }, [meetingDate, showRequestModal, selectedGroupId]);

  const fetchStudentGroups = async () => {
    setLoading(true);
    try {
      let res = await authFetch('/api/Group/my-groups');
      if (!res.ok) {
        res = await authFetch(`/api/Groups/student/${currentStudentId}`);
      }

      if (res.ok) {
        const groups = await res.json();
        setStudentGroups(groups);
        if (groups.length > 0) {
          const firstGroupId = groups[0].groupId || groups[0].id;
          setSelectedGroupId(firstGroupId);
        }
      } else {
        console.error('Failed to fetch student groups. Status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch student groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async (groupId) => {
    try {
      let res = await authFetch(`/api/Meetings/group/${groupId}`);

      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      } else {
        console.error('Failed to fetch meetings. Status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    }
  };

  const fetchSupervisorAvailability = async (supervisorId, dateStr) => {
    setLoadingSlots(true);
    try {
      let url = dateStr 
        ? `/api/AvailableTimes/supervisor/${supervisorId}?date=${dateStr}` 
        : `/api/AvailableTimes/user/${supervisorId}`;
      
      let res = await authFetch(url);
      
      if (!res.ok) {
        res = await authFetch(`/api/AvailableTimes/user/${supervisorId}`);
      }

      if (res.ok) {
        const slots = await res.json();
        setSupervisorSlots(slots);
      } else {
        setSupervisorSlots([]);
      }
    } catch (err) {
      console.error('Failed to fetch supervisor availability:', err);
      setSupervisorSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleOpenModal = () => {
    setErrorMessage('');
    const supervisorId = currentGroup?.supervisorId || currentGroup?.supervisor?.userId || currentGroup?.supervisor?.id;

    if (!currentGroup || !supervisorId) {
      setErrorMessage('No supervisor assigned to this group.');
    }
    setShowRequestModal(true);
  };

  const filteredSlots = supervisorSlots.filter(s => {
    if (!selectedDayOfWeek) return true;
    const slotDay = s.dayOfWeek || s.DayOfWeek || '';
    return slotDay.toLowerCase() === selectedDayOfWeek.toLowerCase();
  });

  const handleSelectSlot = (slot) => {
    const sTime = slot.startTime || slot.StartTime || '';
    const eTime = slot.endTime || slot.EndTime || '';
    
    setStartTime(sTime.substring(0, 5));
    setEndTime(eTime.substring(0, 5));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentGroup) {
      setErrorMessage('Please select a valid group.');
      return;
    }

    const supervisorId = currentGroup?.supervisorId || currentGroup?.supervisor?.userId || currentGroup?.supervisor?.id;
    const supervisorName = currentGroup?.supervisorName || currentGroup?.supervisor?.fullName || 'Supervisor';
    const groupName = currentGroup?.groupName || currentGroup?.name || `Group ${currentGroup?.groupId || currentGroup?.id}`;

    const formattedStartTime = startTime.length === 5 ? startTime : startTime.substring(0, 5);
    const formattedEndTime = endTime.length === 5 ? endTime : endTime.substring(0, 5);

    const payload = {
      GroupId: Number(currentGroup.groupId || currentGroup.id),
      GroupName: groupName,
      HostId: supervisorId ? Number(supervisorId) : 0,
      SupervisorName: supervisorName,
      RequestedByUserId: Number(currentStudentId),
      RequestedBy: currentStudentName,
      MeetingDate: meetingDate,
      StartTime: formattedStartTime,
      EndTime: formattedEndTime,
      Medium: medium,
      Title: title.trim(),
      Agenda: agenda.trim(),
      Summary: null,
      RejectionReason: null
    };

    try {
      const res = await authFetch('/api/Meetings/request', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchMeetings(selectedGroupId);
        setShowRequestModal(false);
        setTitle('');
        setAgenda('');
        setMeetingDate('');
        setStartTime('');
        setEndTime('');
      } else {
        const errorData = await res.json().catch(() => null);
        if (errorData && errorData.errors) {
          const messages = Object.values(errorData.errors).flat().join(' ');
          setErrorMessage(messages || 'Validation failed.');
        } else {
          const text = await res.text().catch(() => '');
          setErrorMessage(text || `Request failed with status ${res.status}`);
        }
      }
    } catch (err) {
      setErrorMessage('Network error submitting request.');
    }
  };

  const handleOpenSummaryModal = (meeting) => {
    setSelectedMeetingId(meeting.meetingId || meeting.id);
    if (typeof meeting.summary === 'object' && meeting.summary !== null) {
      setSummaryText(meeting.summary.summaryText || '');
      setActionItems(meeting.summary.actionItems || '');
    } else {
      setSummaryText(meeting.summary || '');
      setActionItems('');
    }
    setShowSummaryModal(true);
  };

  const handleOpenViewSummaryModal = (summary) => {
    setViewingSummary(summary);
    setShowViewSummaryModal(true);
  };

  const handleSaveSummary = async () => {
    try {
      const res = await authFetch(`/api/Meetings/${selectedMeetingId}/summary`, {
        method: 'POST',
        body: JSON.stringify({
          submittedBy: currentStudentId,
          summaryText,
          actionItems
        })
      });

      if (res.ok) {
        fetchMeetings(selectedGroupId);
        setShowSummaryModal(false);
        setSummaryText('');
        setActionItems('');
      } else {
        const errorText = await res.text();
        alert(`Failed to save summary: ${errorText}`);
      }
    } catch (err) {
      console.error('Failed to save summary', err);
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div className="section-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>Group Appointments</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={selectedGroupId} 
                onChange={(e) => setSelectedGroupId(e.target.value)} 
                style={{ padding: '6px' }}
              >
                {studentGroups.map(g => {
                  const id = g.groupId || g.id;
                  return (
                    <option key={id} value={id}>
                      {g.groupName || g.name || `Group ${id}`}
                    </option>
                  );
                })}
              </select>
              <button className="btn-primary" onClick={handleOpenModal} style={{ padding: '8px 14px', cursor: 'pointer' }}>
                + Request Meeting
              </button>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: '20px' }}>Loading appointments...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Supervisor</th>
                    <th>Medium</th>
                    <th>Title & Agenda</th>
                    <th>Status</th>
                    <th>Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        No meeting requests found for this group.
                      </td>
                    </tr>
                  ) : (
                    meetings.map(m => {
                      const mId = m.meetingId || m.id;
                      const supervisorDisplay = m.supervisorName || 
                                                currentGroup?.supervisorName || 
                                                currentGroup?.supervisor?.fullName || 
                                                'N/A';
                      const formattedDate = m.meetingDate || (m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString() : 'N/A');
                      const formattedTime = (m.startTime && m.endTime) 
                        ? `${m.startTime} - ${m.endTime}` 
                        : (m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                      const statusUpper = (m.status || 'Pending').toUpperCase();
                      const isApprovedOrCompleted = statusUpper === 'APPROVED' || statusUpper === 'COMPLETED';
                      const hasSummary = Boolean(m.summary);

                      return (
                        <tr key={mId}>
                          <td>
                            {formattedDate}<br />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{formattedTime}</span>
                          </td>
                          <td>{supervisorDisplay}</td>
                          <td><span className="badge badge-info">{m.medium || 'Offline'}</span></td>
                          <td>
                            <strong>{m.title}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{m.agenda || m.description}</div>
                          </td>
                          <td><span className="badge badge-warning">{m.status || 'Pending'}</span></td>
                          <td>
                            {hasSummary ? (
                              <button 
                                onClick={() => handleOpenViewSummaryModal(m.summary)} 
                                className="btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Show Summary
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>No summary</span>
                            )}
                          </td>
                          <td>
                            {isApprovedOrCompleted ? (
                              <button 
                                onClick={() => handleOpenSummaryModal(m)} 
                                className="btn-primary" 
                                style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                {hasSummary ? 'Edit Summary' : '+ Add Summary'}
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* --- Request Meeting Modal --- */}
      {showRequestModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={{ ...modalContentStyle, width: '500px' }}>
            <h3>Request Meeting with {currentGroup?.supervisorName || currentGroup?.supervisor?.fullName || 'Supervisor'}</h3>
            
            <form onSubmit={handleRequestSubmit}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input 
                  type="date" 
                  value={meetingDate} 
                  onChange={(e) => setMeetingDate(e.target.value)} 
                  style={{ flex: 1, padding: '6px' }} 
                  required 
                />
                <select value={medium} onChange={(e) => setMedium(e.target.value)} style={{ flex: 1, padding: '6px' }}>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '12px' }}>
                  {meetingDate 
                    ? `Supervisor Available Slots for ${selectedDayOfWeek}:` 
                    : 'Supervisor Weekly Available Slots (Select date to filter):'}
                </strong>

                {loadingSlots ? (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Loading supervisor availability...</div>
                ) : (
                  <ul style={{ fontSize: '12px', margin: '5px 0 0 15px', padding: 0 }}>
                    {filteredSlots.length === 0 ? (
                      <li style={{ color: '#ef4444' }}>
                        {meetingDate 
                          ? `No available slots published by supervisor for ${selectedDayOfWeek}s.` 
                          : 'No recurring available times published by supervisor.'}
                      </li>
                    ) : (
                      filteredSlots.map(s => (
                        <li 
                          key={s.availabilityId || s.id || `${s.dayOfWeek}-${s.startTime}`} 
                          style={{ marginBottom: '4px' }}
                        >
                          <strong>{s.dayOfWeek || s.DayOfWeek}:</strong> {s.startTime || s.StartTime} - {s.endTime || s.EndTime}{' '}
                          <button
                            type="button"
                            onClick={() => handleSelectSlot(s)}
                            style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              border: '1px solid #cbd5e1',
                              background: '#fff'
                            }}
                          >
                            Use Time
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {errorMessage && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{errorMessage}</div>}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ flex: 1, padding: '6px' }} required />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ flex: 1, padding: '6px' }} required />
              </div>

              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '10px' }} required />
              <textarea placeholder="Agenda" value={agenda} onChange={(e) => setAgenda(e.target.value)} style={{ width: '100%', height: '60px', padding: '6px' }} required />

              <div style={{ marginTop: '15px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Add / Edit Summary Modal --- */}
      {showSummaryModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <h3>Post Meeting Summary</h3>
            <textarea 
              value={summaryText} 
              onChange={(e) => setSummaryText(e.target.value)} 
              style={{ width: '100%', height: '80px', marginTop: '10px', padding: '8px' }} 
              placeholder="Summary text..." 
            />
            <textarea 
              value={actionItems} 
              onChange={(e) => setActionItems(e.target.value)} 
              style={{ width: '100%', height: '80px', marginTop: '10px', padding: '8px' }} 
              placeholder="Action items..." 
            />
            <div style={{ marginTop: '15px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowSummaryModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveSummary}>Save Summary</button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Summary Popup Modal --- */}
      {showViewSummaryModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={{ ...modalContentStyle, width: '500px' }}>
            <h3 style={{ marginBottom: '15px' }}>Meeting Summary Details</h3>
            
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