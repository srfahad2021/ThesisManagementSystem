import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {miniStat, fileChip, weekDot} from '../script.jsx';


export default function Progress() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Weekly Progress Tracker</div>
    <div className="text-muted text-sm">Monitor 36–40 week thesis cycles</div>
  </div>
  <button className="btn-primary">Generate Attendance</button>
</div>

<div className="card" style={{ marginBottom: '16px' }}>
  <div className="section-head">
    <div className="section-title">Group 07 — Safwan Rahman</div>
    <span className="badge badge-info">Week 22 / 40</span>
  </div>
  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
    {Array.from({ length: 40 }, (_, i) => weekDot(i + 1, i < 20 ? 'done' : i === 21 ? 'active' : i < 22 ? 'missing' : 'future'))}
  </div>
  <div className="grid-3">
    {miniStat('Present', '20')} {miniStat('Absent', '1')} {miniStat('Attendance', '95%')}
  </div>
</div>

<div className="card">
  <div className="section-head">
    <div className="section-title">Week 22 Submission</div>
    <span className="badge badge-warning">Awaiting Supervisor</span>
  </div>
  <div className="grid-2" style={{ marginBottom: '16px' }}>
    <div>
      <div className="form-label">Work Completed This Week</div>
      <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '13px', lineHeight: '1.6' }}>
        Completed BLE beacon placement mapping for Building A and B. Implemented trilateration algorithm in Python. Achieved indoor positioning accuracy of ±2.3m. Integrated backend API with Flutter mobile app.
      </div>
    </div>
    <div>
      <div className="form-label">Problems Faced</div>
      <div style={{ background: '#FFF5F5', border: '1px solid #FFC8C8', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '13px', lineHeight: '1.6' }}>
        RSSI signal fluctuation causing inconsistent readings in hallways. Need to investigate Kalman filter implementation to smooth readings.
      </div>
    </div>
  </div>
  <div className="form-label">Attachments</div>
  <div style={{ display: 'flex', gap: '8px' }}>
    {fileChip('trilateration_algo.py', 'code')}
    {fileChip('beacon_map_v3.png', 'image')}
    {fileChip('week22_report.pdf', 'pdf')}
  </div>
  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
    <button className="btn-primary">Approve</button>
    <button className="btn-secondary">Request Revision</button>
    <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Reject</button>
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