import Chart from 'chart.js/auto';

export function statCard(label, value, dir, sub, bgColor, iconColor) {
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';
  const cls = dir === 'up' ? 'up' : dir === 'down' ? 'down' : '';
  return (
    <div className="card stat-card" style={{ borderTop: `3px solid ${iconColor}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? (
        <div className={`stat-change ${cls}`}>
          {arrow} <span style={{ color: 'var(--text-secondary)' }}>{sub}</span>
        </div>
      ) : null}
    </div>
  );
}

export function miniStat(label, value) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

export function legendItem(color, label) {
  return (
    <div className="legend-item">
      <div className="legend-dot" style={{ background: color }}></div>
      {label}
    </div>
  );
}

export function activityItem(bg, color, initials, text, time) {
  return (
    <div className="activity-item">
      <div className="activity-icon" style={{ background: bg, color: color }}>{initials}</div>
      <div className="activity-body">
        <div className="activity-text">{text}</div>
        <div className="activity-time">{time}</div>
      </div>
    </div>
  );
}

export function groupAttentionRow(group, students, issue, type) {
  const cls = type === 'danger' ? 'badge-danger' : 'badge-warning';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '36px', height: '36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{group.replace('Group ', 'G')}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{group}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{students}</div>
      </div>
      <span className={`badge ${cls}`}>{issue}</span>
    </div>
  );
}

export function userRow(username, name, role, email, status, lastLogin, onEdit, onDisable) {
  const sc = status === 'Active' ? 'badge-success' : 'badge-neutral';
  const rc = role === 'Student' ? 'badge-info' 
           : role === 'Supervisor' ? 'badge-primary' 
           : role === 'Coordinator' ? 'badge-warning' 
           : 'badge-neutral';

  const isDisabled = status === 'Disabled' || status === 'Inactive';

  return (
    <tr key={username}>
      <td>
        <code style={{ fontSize: '11px', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
          {username}
        </code>
      </td>
      <td><strong>{name}</strong></td>
      <td><span className={`badge ${rc}`}>{role}</span></td>
      <td style={{ color: 'var(--text-secondary)' }}>{email}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td style={{ color: 'var(--text-muted)' }}>{lastLogin}</td>
      <td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-secondary btn-sm" onClick={onEdit}>
            Edit
          </button>
          <button 
            className="btn-secondary btn-sm" 
            style={{ 
              color: isDisabled ? 'var(--success, #10B981)' : 'var(--danger)', 
              borderColor: isDisabled ? 'var(--success, #10B981)' : 'var(--danger)' 
            }}
            onClick={onDisable}
          >
            {isDisabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function groupRow(id, members, supervisor, topic, week, pct, status) {
  const sc = status === 'Completed' ? 'badge-success' : status === 'Under Examination' ? 'badge-warning' : 'badge-info';
  return (
    <tr>
      <td><strong>{id}</strong></td>
      <td style={{ fontSize: '12px' }}>{members}</td>
      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{supervisor}</td>
      <td style={{ fontSize: '12px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic}</td>
      <td style={{ fontSize: '12px' }}>{week}</td>
      <td style={{ minWidth: '100px' }}>
        <div className="progress">
          <div className={`progress-bar ${status === 'Completed' ? 'success' : ''}`} style={{ width: `${pct}%` }}></div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{pct}%</div>
      </td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td><button className="btn-ghost btn-sm">View →</button></td>
    </tr>
  );
}

export function topicCard(title, student, keywords, status, type) {
  const sc = type === 'pending' ? 'badge-warning' : type === 'review' ? 'badge-info' : 'badge-success';
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{student}</div>
        </div>
        <span className={`badge ${sc}`}>{status}</span>
      </div>
      <div className="tag-cloud" style={{ marginBottom: '12px' }}>
        {keywords.split(',').map((k, i) => (
          <span key={i} className="tag">{k.trim()}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary btn-sm">Approve</button>
        <button className="btn-secondary btn-sm">Request Revision</button>
        <button className="btn-secondary btn-sm">Reject</button>
        <button className="btn-ghost btn-sm">View Full →</button>
      </div>
    </div>
  );
}

export function weekDot(n, status) {
  const colors = { done: 'var(--success)', active: 'var(--primary)', pending: 'var(--warning)', missing: 'var(--danger)', absent: 'var(--danger)', future: 'var(--border)' };
  return (
    <div title={`Week ${n}`} style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors[status] || colors.future, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>{n}</div>
  );
}

export function wfStep(label, status) {
  const ic = status === 'done' ? '✓' : status === 'active' ? '●' : '○';
  const c = status === 'done' ? 'var(--success)' : status === 'active' ? 'var(--primary)' : 'var(--text-muted)';
  const fw = status === 'active' ? '600' : '400';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: status === 'done' ? '#DCFCE7' : status === 'active' ? '#FFE9E9' : 'var(--bg)', border: `1px solid ${status === 'done' ? '#BBF7D0' : status === 'active' ? '#FFC8C8' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: c }}>{ic}</div>
      <div style={{ fontSize: '13px', fontWeight: fw, color: status === 'future' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{label}</div>
    </div>
  );
}

export function quickAction(label, icon, type) {
  return (
    <button className={`btn-${type}`} style={{ padding: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>{label}</button>
  );
}

export function upcomingItem(title, sub, type) {
  const colors = { warning: 'var(--warning)', info: 'var(--info)', neutral: 'var(--text-muted)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '4px', height: '36px', background: colors[type], borderRadius: '2px' }}></div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sub}</div>
      </div>
    </div>
  );
}

export function fileChip(name, type) {
  const ext = { pdf: '#EF4444', code: '#3B82F6', image: '#22C55E' };
  const bg = { pdf: '#FEE2E2', code: '#DBEAFE', image: '#DCFCE7' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: bg[type] || '#F3F4F6', border: `1px solid ${ext[type] || '#E5E7EB'}33`, borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '12px', color: ext[type] || '#374151' }}>{name}</div>
  );
}

export function attRow(name, group, total, present, absent, pct, status) {
  const sc = status === 'Excellent' || status === 'Good' ? 'badge-success' : status === 'Warning' ? 'badge-warning' : 'badge-danger';
  return (
    <tr>
      <td><strong>{name}</strong></td>
      <td>{group}</td>
      <td>{total}</td>
      <td>{present}</td>
      <td>{absent}</td>
      <td><strong>{pct}</strong></td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function reportCard(title, desc, btn1, btn2) {
  return (
    <div className="card">
      <div style={{ fontWeight: 600, marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>{desc}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary btn-sm">{btn1}</button>
        <button className="btn-secondary btn-sm">{btn2}</button>
      </div>
    </div>
  );
}

export function auditRow(ts, user, role, action, module, ip) {
  return (
    <tr>
      <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{ts}</td>
      <td>{user}</td>
      <td><span className="badge badge-neutral">{role}</span></td>
      <td>{action}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{module}</td>
      <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ip}</td>
    </tr>
  );
}

export function semRow(sem, year, start, end, groups, status) {
  const sc = status === 'Active' ? 'badge-success' : status === 'Completed' ? 'badge-info' : 'badge-neutral';
  return (
    <tr>
      <td><strong>{sem}</strong></td>
      <td>{year}</td>
      <td>{start}</td>
      <td>{end}</td>
      <td>{groups}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td><button className="btn-ghost btn-sm">Edit</button></td>
    </tr>
  );
}

export function rubricRow(label, max) {
  return (
    <div className="rubric-row">
      <div className="rubric-label">{label}</div>
      <input className="form-control" style={{ width: '70px', textAlign: 'center' }} type="number" min="0" max={max} placeholder="0" onInput={calcTotal} />
      <div className="rubric-out">/ {max}</div>
    </div>
  );
}

export function evalRow(label, score, max) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '13px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '80px' }}>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${(score / max) * 100}%` }}></div>
          </div>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>
          {score} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {max}</span>
        </div>
      </div>
    </div>
  );
}

export function docRow(name, type, version, date, status) {
  const sc = status === 'Approved' ? 'badge-success' : status === 'Revision Requested' ? 'badge-danger' : status === 'Under Review' ? 'badge-warning' : 'badge-neutral';
  return (
    <tr>
      <td><strong>{name}</strong></td>
      <td><span className="badge badge-neutral">{type}</span></td>
      <td style={{ fontSize: '12px' }}>{version}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{date}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-secondary btn-sm">Download</button>
          <button className="btn-primary btn-sm">Upload New</button>
        </div>
      </td>
    </tr>
  );
}

export function meetRow(dt, sup, type, agenda, status) {
  const sc = status === 'Approved' ? 'badge-success' : status === 'Completed' ? 'badge-info' : 'badge-warning';
  return (
    <tr>
      <td><strong>{dt}</strong></td>
      <td>{sup}</td>
      <td><span className="badge badge-neutral">{type}</span></td>
      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{agenda}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function attDetailRow(week, submitted, supAp, coordAp, status) {
  const sc = status === 'Present' ? 'badge-success' : status === 'Absent' ? 'badge-danger' : 'badge-warning';
  return (
    <tr>
      <td>{week}</td>
      <td>{submitted}</td>
      <td>{supAp}</td>
      <td>{coordAp}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function supGroupRow(group, students, week, lastReport, status) {
  const sc = status === 'Under Examination' ? 'badge-warning' : 'badge-info';
  return (
    <tr>
      <td><strong>{group}</strong></td>
      <td style={{ fontSize: '12px' }}>{students}</td>
      <td>{week}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{lastReport}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function coordRow(group, week, sup, status, action) {
  return (
    <tr>
      <td><strong>{group}</strong></td>
      <td>{week}</td>
      <td>{sup}</td>
      <td><span className="badge badge-warning">{status}</span></td>
      <td><button className="btn-primary btn-sm">{action}</button></td>
    </tr>
  );
}

export function checkItem(label, checked) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <input type="checkbox" defaultChecked={checked} /> {label}
    </label>
  );
}

export function examRow(group, title, students, supervisor, weeks, status) {
  const sc = status.includes('Evaluated') ? 'badge-success' : status === 'In Evaluation' ? 'badge-warning' : 'badge-info';
  return (
    <tr>
      <td><strong>{group}</strong></td>
      <td style={{ fontSize: '12px' }}>{title}</td>
      <td style={{ fontSize: '12px' }}>{students}</td>
      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{supervisor}</td>
      <td>{weeks}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td><button className="btn-primary btn-sm">Evaluate</button></td>
    </tr>
  );
}

export function univRow(name, code, students, status) {
  return (
    <tr>
      <td><strong>{name}</strong></td>
      <td><code style={{ fontSize: '11px', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>{code}</code></td>
      <td>{students}</td>
      <td><span className="badge badge-success">{status}</span></td>
    </tr>
  );
}

export function supRepRow(student, group, week, submitted, status) {
  return (
    <tr>
      <td>{student}</td>
      <td>{group}</td>
      <td>{week}</td>
      <td style={{ color: 'var(--text-secondary)' }}>{submitted}</td>
      <td><span className="badge badge-warning">{status}</span></td>
      <td><button className="btn-primary btn-sm">Review</button></td>
    </tr>
  );
}

export function meetMgmtRow(student, dt, type, agenda, status) {
  const sc = status === 'Approved' ? 'badge-success' : 'badge-warning';
  return (
    <tr>
      <td>{student}</td>
      <td>{dt}</td>
      <td>{type}</td>
      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{agenda}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-primary btn-sm">Approve</button>
          <button className="btn-secondary btn-sm">Reject</button>
        </div>
      </td>
    </tr>
  );
}

export function assignRow(title, type, assigned, due, sub, status) {
  const sc = status === 'Submitted' ? 'badge-success' : 'badge-warning';
  return (
    <tr>
      <td><strong>{title}</strong></td>
      <td><span className="badge badge-neutral">{type}</span></td>
      <td>{assigned}</td>
      <td>{due}</td>
      <td>{sub}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function coordRepRow(group, week, supApproved, status) {
  const sc = status.includes('Completed') ? 'badge-success' : 'badge-warning';
  return (
    <tr>
      <td><strong>{group}</strong></td>
      <td>{week}</td>
      <td>{supApproved}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-primary btn-sm">Approve</button>
          <button className="btn-secondary btn-sm">Reject</button>
        </div>
      </td>
    </tr>
  );
}

export function examAssignRow(group, title, date, examiner, status) {
  const sc = status === 'Evaluated' ? 'badge-success' : status === 'Assigned' ? 'badge-info' : 'badge-warning';
  return (
    <tr>
      <td><strong>{group}</strong></td>
      <td style={{ fontSize: '12px' }}>{title}</td>
      <td>{date}</td>
      <td>{examiner}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
      <td><button className="btn-secondary btn-sm">Change</button></td>
    </tr>
  );
}

export function univDetailRow(name, code, faculties, depts, students, plan, status) {
  return (
    <tr>
      <td><strong>{name}</strong></td>
      <td><code style={{ fontSize: '11px', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>{code}</code></td>
      <td>{faculties}</td>
      <td>{depts}</td>
      <td>{students}</td>
      <td><span className="badge badge-info">{plan}</span></td>
      <td><span className="badge badge-success">{status}</span></td>
    </tr>
  );
}

export function subRow(name, plan, price, students, renewal, status) {
  const sc = status === 'Active' ? 'badge-success' : 'badge-warning';
  return (
    <tr>
      <td><strong>{name}</strong></td>
      <td><span className="badge badge-info">{plan}</span></td>
      <td>{price}</td>
      <td>{students}</td>
      <td>{renewal}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

export function docMgmtRow(student, group, doc, type, version, status) {
  const sc = status === 'Approved' ? 'badge-success' : status === 'Under Review' ? 'badge-warning' : 'badge-danger';
  return (
    <tr>
      <td>{student}</td>
      <td>{group}</td>
      <td><strong>{doc}</strong></td>
      <td><span className="badge badge-neutral">{type}</span></td>
      <td>{version}</td>
      <td><span className={`badge ${sc}`}>{status}</span></td>
    </tr>
  );
}

// ════════════════════════════════════════
// CHART INITIALIZATION
// ════════════════════════════════════════
export function initCharts(pageId) {
  setTimeout(() => {
    // Universal cleanup for all possible canvas elements to prevent "Canvas is already in use" errors
    const canvasIds = [
      'progressChart', 'statusChart', 'trendChart', 'keywordsChart', 
      'lifecycleChart', 'growthChart', 'aiUsageChart', 'userGrowthChart', 'roleActivityChart'
    ];
    
    canvasIds.forEach(id => {
      const canvas = document.getElementById(id);
      if (canvas) {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
          existingChart.destroy();
        }
      }
    });
    let progressChartInstance = null;
    if (pageId === 'dashboard') {
      const progressCanvas = document.getElementById('progressChart');
      if (progressCanvas) {
        progressChartInstance = new Chart(progressCanvas, {
            type: 'bar',
            data: {
              labels: ['G-03','G-07','G-09','G-12','G-14','G-19','G-22','G-28','G-33'],
              datasets: [{
                label: 'Week Progress',
                data: [40,22,18,30,12,38,35,8,15],
                backgroundColor: '#FF6B6B88',
                borderColor: '#FF6B6B',
                borderWidth: 1.5,
                borderRadius: 4,
              },{
                label: 'Target (40)',
                data: [40,40,40,40,40,40,40,40,40],
                type: 'line',
                borderColor: '#E5E7EB',
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
              }]
            },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 45, grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } } }
          });
      }

      const statusCanvas = document.getElementById('statusChart');
      if (statusCanvas) {
        new Chart(statusCanvas, {
          type: 'doughnut',
          data: {
            labels: ['In Progress','Completed','Under Exam','Archived','Draft'],
            datasets: [{ data: [38,23,11,9,19], backgroundColor: ['#FF6B6B','#22C55E','#F59E0B','#3B82F6','#E5E7EB'], borderWidth: 0, hoverOffset: 4 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }
        });
      }
    } else if (pageId === 'analytics') {
      const trendCanvas = document.getElementById('trendChart');
      if (trendCanvas) {
        new Chart(trendCanvas, {
          type: 'line',
          data: {
            labels: ['Sep','Oct','Nov','Dec','Jan','Feb'],
            datasets: [{
              label: 'Submissions',
              data: [42,58,71,65,88,94],
              borderColor: '#FF6B6B',
              backgroundColor: '#FF6B6B15',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#FF6B6B',
            }]
          },
          options: { maintainAspectRatio: false,responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } } }
        });
      }

      const keywordsCanvas = document.getElementById('keywordsChart');
      if (keywordsCanvas) {
        new Chart(keywordsCanvas, {
          type: 'bar',
          data: {
            labels: ['AI/ML','IoT','NLP','Blockchain','Web','Mobile','Cloud','Security','Data','Health'],
            datasets: [{ data: [28,21,18,14,24,19,11,9,16,13], backgroundColor: '#3B82F688', borderColor: '#3B82F6', borderWidth: 1.5, borderRadius: 4 }]
          },
          options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#F3F4F6' } }, y: { grid: { display: false } } } }
        });
      }
    } else if (pageId === 'coordinator_dashboard') {
      const lifecycleCanvas = document.getElementById('lifecycleChart');
      if (lifecycleCanvas) {
        new Chart(lifecycleCanvas, {
          type: 'pie',
          data: {
            labels: ['In Progress','Under Examination','Completed','Archived','Draft'],
            datasets: [{ data: [38,11,23,9,19], backgroundColor: ['#3B82F6','#F59E0B','#22C55E','#6B7280','#E5E7EB'], borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10 } } } }
        });
      }
    } else if (pageId === 'sa_dashboard') {
      const growthCanvas = document.getElementById('growthChart');
      if (growthCanvas) {
        new Chart(growthCanvas, {
          type: 'line',
          data: {
            labels: ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
            datasets: [{
              label: 'Students',
              data: [3800,3950,4100,4280,4490,4680,4821],
              borderColor: '#FF6B6B',
              backgroundColor: '#FF6B6B15',
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: '#FF6B6B',
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } } }
        });
      }
    } else if (pageId === 'sa_ai') {
      const aiUsageCanvas = document.getElementById('aiUsageChart');
      if (aiUsageCanvas) {
        new Chart(aiUsageCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Summaries','Quick Reviews','Custom Prompts'],
            datasets: [{ data: [12400,4200,1832], backgroundColor: ['#FF6B6B','#3B82F6','#22C55E'], borderWidth: 0, hoverOffset: 4 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }
        });
      }
    } else if (pageId === 'sa_analytics') {
      const userGrowthCanvas = document.getElementById('userGrowthChart');
      if (userGrowthCanvas) {
        new Chart(userGrowthCanvas, {
          type: 'bar',
          data: {
            labels: ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
            datasets: [{ data: [280,310,390,420,380,460,489], backgroundColor: '#FF6B6B88', borderColor: '#FF6B6B', borderWidth: 1.5, borderRadius: 4 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } } }
        });
      }

      const roleActivityCanvas = document.getElementById('roleActivityChart');
      if (roleActivityCanvas) {
        new Chart(roleActivityCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Students','Supervisors','Coordinators','Admins','Examiners'],
            datasets: [{ data: [4821,385,48,62,142], backgroundColor: ['#FF6B6B','#3B82F6','#F59E0B','#22C55E','#8B5CF6'], borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10 } } } }
        });
      }
    }
  }, 100);
}

// Rubric total calculator
export function calcTotal() {
  const inputs = document.querySelectorAll('.rubric-row input');
  let total = 0;
  inputs.forEach(i => total += parseInt(i.value || 0));
  const el = document.getElementById('totalScore');
  if (el) el.textContent = total + ' / 100';
}