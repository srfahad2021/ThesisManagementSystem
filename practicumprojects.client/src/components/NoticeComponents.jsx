// File: NoticeComponents.jsx
import React from 'react';

export function NoticeCard({ notice, currentUserId, userRole, onEdit, onDelete, onDownloadAttachment }) {
  const isPublic = notice.noticeType === 'Public';
  const canModify =
    userRole === 'ADMIN' ||
    userRole === 'COORDINATOR' ||
    (userRole === 'SUPERVISOR' && notice.authorId === currentUserId);

  return (
    <div className="card" style={{ marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            marginRight: '8px',
            backgroundColor: isPublic ? '#e6f4ea' : '#feefe3',
            color: isPublic ? '#137333' : '#b06000'
          }}>
            {notice.noticeType}
          </span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px' }}>{notice.title}</h3>
          <div className="text-muted text-sm">
            By <strong>{notice.authorName}</strong> • {new Date(notice.createdAt).toLocaleString()}
          </div>
        </div>

        {canModify && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => onEdit(notice)}
              >
                Edit
              </button>
            )}
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#dc3545', color: '#fff', border: 'none' }}
              onClick={() => onDelete(notice.noticeId)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p style={{ whiteSpace: 'pre-line', margin: '12px 0', color: '#333', fontSize: '14px', lineHeight: '1.5' }}>
        {notice.content}
      </p>

      {!isPublic && notice.targetGroupNames && notice.targetGroupNames.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px' }} className="text-muted">
          <strong>Assigned Groups:</strong> {notice.targetGroupNames.join(', ')}
        </div>
      )}

      {notice.attachments && notice.attachments.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Attached Files:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {notice.attachments.map((file) => (
              <button
                key={file.fileId}
                type="button"
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => onDownloadAttachment(file.fileId, file.fileName)}
              >
                📎 {file.fileName} ({Math.round(file.fileSize / 1024)} KB)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NoticeModal({ isOpen, onClose, onSave, assignableGroups, initialNotice, isSupervisor }) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [noticeType, setNoticeType] = React.useState(isSupervisor ? 'Private' : 'Public');
  const [selectedGroupIds, setSelectedGroupIds] = React.useState([]);
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    if (initialNotice) {
      setTitle(initialNotice.title || '');
      setContent(initialNotice.content || '');
      setNoticeType(isSupervisor ? 'Private' : initialNotice.noticeType || 'Public');
      setSelectedGroupIds(initialNotice.targetGroupIds || []);
    } else {
      setTitle('');
      setContent('');
      setNoticeType(isSupervisor ? 'Private' : 'Public');
      setSelectedGroupIds([]);
    }
    setFiles([]);
  }, [initialNotice, isOpen, isSupervisor]);

  if (!isOpen) return null;

  const handleGroupToggle = (groupId) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('noticeType', isSupervisor ? 'Private' : noticeType);

    if (noticeType === 'Private' || isSupervisor) {
      selectedGroupIds.forEach((id) => formData.append('targetGroupIds', id));
    }

    if (files && files.length > 0) {
      Array.from(files).forEach((f) => formData.append('files', f));
    }

    onSave(formData, initialNotice?.noticeId);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{initialNotice ? 'Edit Notice' : 'Create Notice'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Notice Title:</label>
            <input
              type="text"
              className="form-control"
              style={{ width: '100%' }}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {!isSupervisor && (
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Notice Type:</label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
              >
                <option value="Public">Public (All Users)</option>
                <option value="Private">Private (Specific Groups)</option>
              </select>
            </div>
          )}

          {(noticeType === 'Private' || isSupervisor) && (
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Select Target Groups:</label>
              <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {assignableGroups.length === 0 ? (
                  <div className="text-muted text-sm">No groups available.</div>
                ) : (
                  assignableGroups.map((g) => (
                    <label key={g.groupId} style={{ display: 'block', fontSize: '13px', cursor: 'pointer', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(g.groupId)}
                        onChange={() => handleGroupToggle(g.groupId)}
                        style={{ marginRight: '8px' }}
                      />
                      {g.groupName} ({g.semesterName})
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Notice Content:</label>
            <textarea
              className="form-control"
              style={{ width: '100%', minHeight: '100px' }}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Attach Files (Optional):</label>
            <input
              type="file"
              multiple
              className="form-control"
              style={{ width: '100%' }}
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Notice</button>
          </div>
        </form>
      </div>
    </div>
  );
}