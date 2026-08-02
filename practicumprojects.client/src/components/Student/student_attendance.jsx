import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {statCard, weekDot, attDetailRow} from '../script.jsx';


export default function student_attendance() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>My Attendance</div>
  </div>
  <button className="btn-secondary">Download PDF</button>
</div>

<div className="grid-3" style={{ marginBottom: '20px' }}>
  {statCard('Total Weeks', '22', '', 'Spring 2026', '#DBEAFE', '#3B82F6')}
  {statCard('Present', '21', 'up', 'Approved weeks', '#DCFCE7', '#22C55E')}
  {statCard('Attendance', '95.5%', 'up', 'Above threshold', '#FFE9E9', '#FF6B6B')}
</div>

<div className="card">
  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
    {Array.from({ length: 40 }, (_, i) => weekDot(i + 1, i < 20 ? 'done' : i === 3 ? 'absent' : i < 22 ? 'done' : 'future'))}
  </div>
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Week</th>
          <th>Report Submitted</th>
          <th>Supervisor Approval</th>
          <th>Coordinator Approval</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {attDetailRow('Week 22', 'Jan 14, 2026', 'Pending', '—', 'Pending')}
        {attDetailRow('Week 21', 'Jan 7, 2026', 'Jan 9, 2026', 'Jan 10, 2026', 'Present')}
        {attDetailRow('Week 20', 'Dec 31, 2025', 'Jan 2, 2026', 'Jan 3, 2026', 'Present')}
        {attDetailRow('Week 4', 'Oct 5, 2025', '—', '—', 'Absent')}
      </tbody>
    </table>
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