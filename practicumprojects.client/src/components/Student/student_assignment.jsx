import React, { useState, useEffect } from 'react';
import '../style.css';

export default function StudentAssignments() {
  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [viewModalAssignment, setViewModalAssignment] = useState(null);
  const [submitModalAssignment, setSubmitModalAssignment] = useState(null);

  // Submission Form States
  const [submissionComment, setSubmissionComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // New files to upload
  const [existingSubmissionFiles, setExistingSubmissionFiles] = useState([]); // Previously uploaded files
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  };

  useEffect(() => {
    fetchStudentGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchAssignmentsForGroup(selectedGroupId);
    } else {
      setAssignments([]);
    }
  }, [selectedGroupId]);

  const fetchStudentGroups = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/ThesisGroup/my-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentGroups(data);
        if (data.length > 0) {
          setSelectedGroupId(data[0].groupId);
        }
      }
    } catch (error) {
      console.error('Error fetching student groups:', error);
    }
  };

  const fetchAssignmentsForGroup = async (groupId) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/Assignment/group/${groupId}/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelectionChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...chosenFiles]);
    e.target.value = null;
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/SubmissionFile/download/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to download file.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert(error.message);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitModalAssignment) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('assignmentId', submitModalAssignment.assignmentId);
    formData.append('comment', submissionComment);

    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/Assignment/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitModalAssignment(null);
        setSubmissionComment('');
        setSelectedFiles([]);
        setExistingSubmissionFiles([]);
        fetchAssignmentsForGroup(selectedGroupId);
        alert(result.message || 'Operation successful.');
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to submit assignment.');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-title" style={{ fontSize: '16px' }}>My Group Assignments</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '500', fontSize: '14px' }}>Select Group:</label>
              <select 
                className="form-control" 
                value={selectedGroupId} 
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{ padding: '6px 12px', minWidth: '200px' }}
              >
                {studentGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Submission Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Loading assignments...</td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No assignments found for this group.</td>
                  </tr>
                ) : (
                  assignments.map((item) => {
                    const isSubmitted = item.submissionStatus && item.submissionStatus !== 'Not Submitted';
                    const isDeadlinePassed = new Date() > new Date(item.deadline);

                    return (
                      <tr key={item.assignmentId}>
                        <td><strong>{item.title}</strong></td>
                        <td>{new Date(item.deadline).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.submissionStatus === 'Graded' ? 'badge-success' : 
                            item.submissionStatus?.includes('Late') ? 'badge-danger' : 
                            item.submissionStatus?.includes('Submitted') || item.submissionStatus?.includes('Resubmitted') ? 'badge-info' : 'badge-warning'
                          }`}>
                            {item.submissionStatus || 'Not Submitted'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '12px' }} 
                              onClick={() => setViewModalAssignment(item)}
                            >
                              View Details
                            </button>

                            {!isSubmitted ? (
                              isDeadlinePassed ? (
                                <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: '500', alignSelf: 'center' }}>Deadline Passed</span>
                              ) : (
                                <button 
                                  className="btn-primary" 
                                  style={{ padding: '4px 8px', fontSize: '12px' }} 
                                  onClick={() => {
                                    setSubmitModalAssignment(item);
                                    setSubmissionComment('');
                                    setSelectedFiles([]);
                                    setExistingSubmissionFiles([]);
                                  }}
                                >
                                  Submit
                                </button>
                              )
                            ) : (
                              isDeadlinePassed ? (
                                <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic', alignSelf: 'center' }}>Locked (Closed)</span>
                              ) : (
                                <button 
                                  className="btn-warning" 
                                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
                                  onClick={async () => {
                                    setSubmitModalAssignment(item);
                                    setSubmissionComment('');
                                    setSelectedFiles([]);
                                    setExistingSubmissionFiles([]);

                                    try {
                                      const token = getAuthToken();
                                      const res = await fetch(`/api/Assignment/submission/${item.assignmentId}`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      if (res.ok) {
                                        const subData = await res.json();
                                        if (subData.hasSubmitted) {
                                          setSubmissionComment(subData.comment || '');
                                          setExistingSubmissionFiles(subData.files || []);
                                        }
                                      }
                                    } catch (err) {
                                      console.error('Error fetching submission details:', err);
                                    }
                                  }}
                                >
                                  Resubmit
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* View Details Modal */}
          {viewModalAssignment && (
            <div className="modal-backdrop" style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div className="modal-content card" style={{ background: 'white', padding: '24px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>Assignment Details</h3>
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#555' }}>Title:</strong>
                    <span>{viewModalAssignment.title}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#555' }}>Description:</strong>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewModalAssignment.description || 'No description provided.'}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#555' }}>Deadline:</strong>
                    <span>{new Date(viewModalAssignment.deadline).toLocaleString()}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#555' }}>Supervisor Attachment Files:</strong>
                    {viewModalAssignment.files && viewModalAssignment.files.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {viewModalAssignment.files.map((file) => (
                          <li key={file.fileId} style={{ background: '#f8f9fa', padding: '6px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', wordBreak: 'break-all' }}>{file.fileName}</span>
                            <button 
                              type="button"
                              onClick={() => handleDownloadFile(file.fileId, file.fileName)}
                              className="btn-primary"
                              style={{ padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#777' }}>No files attached.</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setViewModalAssignment(null)} style={{ padding: '8px 16px' }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit / Resubmit Assignment Modal */}
          {submitModalAssignment && (
            <div className="modal-backdrop" style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div className="modal-content card" style={{ background: 'white', padding: '24px', width: '480px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>
                  {submitModalAssignment.submissionStatus && submitModalAssignment.submissionStatus !== 'Not Submitted' ? 'Resubmit Assignment: ' : 'Submit Assignment: '} 
                  {submitModalAssignment.title}
                </h3>
                <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Comments / Notes</label>
                    <textarea 
                      className="form-control" 
                      value={submissionComment} 
                      onChange={(e) => setSubmissionComment(e.target.value)} 
                      placeholder="Add any comments for your supervisor..." 
                      rows="3"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>

                  {/* Previously Uploaded Files */}
                  {existingSubmissionFiles.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Previously Submitted Files</label>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {existingSubmissionFiles.map((file) => (
                          <li key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f3f5', padding: '6px 10px', borderRadius: '4px', fontSize: '13px' }}>
                            <span style={{ wordBreak: 'break-all', maxWidth: '70%' }}>{file.fileName}</span>
                            <button 
                              type="button" 
                              onClick={() => handleDownloadFile(file.fileId, file.fileName)}
                              className="btn-secondary"
                              style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Newly Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>New Files to Add</label>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedFiles.map((file, index) => (
                          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e9ecef', padding: '6px 10px', borderRadius: '4px', fontSize: '13px' }}>
                            <span style={{ wordBreak: 'break-all', maxWidth: '75%' }}>{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSelectedFile(index)}
                              style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      {existingSubmissionFiles.length > 0 ? 'Upload Additional Files' : 'Upload Submission Files *'}
                    </label>
                    <input 
                      type="file" 
                      multiple
                      required={existingSubmissionFiles.length === 0 && selectedFiles.length === 0}
                      onChange={handleFileSelectionChange} 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setSubmitModalAssignment(null)} style={{ padding: '8px 16px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '8px 16px' }}>
                      {submitting ? 'Submitting...' : (submitModalAssignment.submissionStatus && submitModalAssignment.submissionStatus !== 'Not Submitted' ? 'Save Resubmission' : 'Submit Assignment')}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}