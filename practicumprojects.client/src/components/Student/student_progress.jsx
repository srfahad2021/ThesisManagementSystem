import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {weekDot} from '../script.jsx';


export default function student_progress() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Weekly Progress Reports</div>
  </div>
  <button className="btn-primary">+ Submit Week 23</button>
</div>

<div className="card" style={{ marginBottom: '16px' }}>
  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
    {Array.from({ length: 40 }, (_, i) => weekDot(i + 1, i < 20 ? 'done' : i === 21 ? 'active' : i < 22 ? 'pending' : 'future'))}
  </div>
  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
    {['done', 'active', 'pending', 'future'].map((s, i) => (
      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s === 'done' ? 'var(--success)' : s === 'active' ? 'var(--primary)' : s === 'pending' ? 'var(--warning)' : 'var(--border)' }}></div>
        {['Present', 'Current', 'Pending', 'Upcoming'][i]}
      </div>
    ))}
  </div>
</div>

<div className="card">
  <div className="section-head">
    <div className="section-title">Week 22 — Submitted</div>
    <span className="badge badge-warning">Awaiting Supervisor</span>
  </div>
  <div className="grid-2">
    <div>
      <div className="form-label">Work Completed</div>
      <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
        Completed BLE beacon placement for Buildings A & B. Implemented trilateration algorithm. Accuracy achieved: ±2.3m. API integrated with Flutter app.
      </div>
      <div className="form-label">Next Week Plan</div>
      <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '13px', lineHeight: 1.6 }}>
        Implement Kalman filter for RSSI smoothing. Begin user testing with 10 students.
      </div>
    </div>
    <div>
      <div className="form-label">Supervisor Comment</div>
      <div className="comment-box">
        <div className="comment-header">
          <span className="comment-author">Prof. Masud Parvez</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>Jan 14</span>
        </div>
        <div className="comment-text">
          Good progress. The <span className="comment-highlight">±2.3m accuracy</span> is acceptable but try to achieve ±1.5m with Kalman filtering. Also document the beacon hardware specs in Chapter 3.
        </div>
      </div>
    </div>
  </div>
</div>
      </>
    );
  };

  return (
    <>
      <div className="layout">
        <div className="main">
          <div className="content">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}