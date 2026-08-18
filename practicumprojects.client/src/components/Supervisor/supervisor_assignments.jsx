import React, { useState, useEffect, useMemo } from 'react';
import '../style.css';
import { icons } from '../../Information/Icons.jsx';

const PAGE_SIZE = 10;

export default function SupervisorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [supervisedGroups, setSupervisedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form states
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  };

  useEffect(() => {
    fetchAssignments();
    fetchSupervisedGroups();
  }, []);

  // Reset pagination to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/Assignment/supervisor-assignments', {
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

  const fetchSupervisedGroups = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/Assignment/supervised-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSupervisedGroups(data);
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].groupId);
        }
      }
    } catch (error) {
      console.error('Error fetching supervised groups:', error);
    }
  };

  const fetchAssignmentFiles = async (assignmentId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/Assignment/${assignmentId}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExistingFiles(data);
      }
    } catch (error) {
      console.error('Error fetching assignment files:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAssignmentId(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setExistingFiles([]);
    setSelectedFiles([]);
    if (supervisedGroups.length > 0) {
      setSelectedGroupId(supervisedGroups[0].groupId);
    }
    setShowModal(true);
  };

  const handleOpenEditModal = async (item) => {
    setEditingAssignmentId(item.assignmentId);
    setTitle(item.title);
    setDescription(item.description || '');
    const formattedDate = item.deadline ? new Date(item.deadline).toISOString().slice(0, 16) : '';
    setDeadline(formattedDate);
    setSelectedGroupId(item.groupId);
    setSelectedFiles([]);
    
    await fetchAssignmentFiles(item.assignmentId);
    setShowModal(true);
  };

  const handleFileSelectionChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...chosenFiles]);
    e.target.value = null;
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteExistingFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/Assignment/file/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setExistingFiles(existingFiles.filter(f => f.fileId !== fileId));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete file.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !title || !deadline) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('groupId', selectedGroupId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('deadline', new Date(deadline).toISOString());
    
    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
    }

    try {
      const token = getAuthToken();
      const url = editingAssignmentId ? `/api/Assignment/${editingAssignmentId}` : '/api/Assignment';
      const method = editingAssignmentId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setShowModal(false);
        fetchAssignments();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to save assignment.');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/Assignment/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAssignments();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete assignment.');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  // Filtered Assignments calculation based on Search Query
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const query = searchTerm.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(query);
      const groupMatch = item.groupName?.toLowerCase().includes(query);
      return titleMatch || groupMatch;
    });
  }, [assignments, searchTerm]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE);

  // Current page sliced items
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAssignments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAssignments, currentPage]);

  return (
    <div className="layout">
      <div className="main">
        <div className="content">
          <div className="section-head" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-title" style={{ fontSize: '16px' }}>Assignments</div>
            </div>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              + Create Assignment
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or group name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px', padding: '8px' }}
            />
          </div>

          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned Group</th>
                  <th>Due Date</th>
                  <th>Submissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Loading assignments...</td>
                  </tr>
                ) : paginatedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      {searchTerm ? 'No matching assignments found.' : 'No assignments created yet.'}
                    </td>
                  </tr>
                ) : (
                  paginatedAssignments.map((item) => (
                    <tr key={item.assignmentId}>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.groupName}</td>
                      <td>{new Date(item.deadline).toLocaleDateString()}</td>
                      <td>{item.totalSubmissions} / 1</td>
                      <td>
                        <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={() => handleOpenEditModal(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-primary btn-sm" 
                            onClick={() => handleDeleteAssignment(item.assignmentId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination & Status Footer */}
            {!loading && filteredAssignments.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredAssignments.length)} of {filteredAssignments.length} Assignemnts
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Popup for Create / Edit Assignment */}
          {showModal && (
            <div className="modal-backdrop" style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div className="modal-content card" style={{ background: 'white', padding: '24px', width: '480px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>{editingAssignmentId ? 'Edit Assignment' : 'Create New Assignment'}</h3>
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Select Group *</label>
                    <select 
                      className="form-control" 
                      value={selectedGroupId} 
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    >
                      {supervisedGroups.map((g) => (
                        <option key={g.groupId} value={g.groupId}>
                          {g.groupName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Assignment Title *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. Chapter 3 Draft" 
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                    <textarea 
                      className="form-control" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Detailed instructions..." 
                      rows="3"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Deadline *</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      value={deadline} 
                      onChange={(e) => setDeadline(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>

                  {/* Existing Files List */}
                  {editingAssignmentId && existingFiles.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Existing Attachments</label>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {existingFiles.map((file) => (
                          <li key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '6px 10px', borderRadius: '4px', fontSize: '13px' }}>
                            <a href={`/${file.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', wordBreak: 'break-all', maxWidth: '75%' }}>
                              {file.fileName}
                            </a>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteExistingFile(file.fileId)}
                              className='btn-primary btn-sm'
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Newly Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Selected Files to Upload</label>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedFiles.map((file, index) => (
                          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e9ecef', padding: '6px 10px', borderRadius: '4px', fontSize: '13px' }}>
                            <span style={{ wordBreak: 'break-all', maxWidth: '75%' }}>{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSelectedFile(index)}
                              className="btn-primary btn-sm"
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
                      {editingAssignmentId ? 'Add New Files' : 'Attachment Files (Multiple allowed)'}
                    </label>
                    <input 
                      type="file" 
                      multiple
                      onChange={handleFileSelectionChange} 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '8px 16px' }}>
                      {submitting ? 'Saving...' : (editingAssignmentId ? 'Update' : 'Create')}
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