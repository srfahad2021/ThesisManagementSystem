import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {meetRow} from '../script.jsx';


export default function student_meetings() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Meeting Appointments</div>
  </div>
  <button className="btn-primary">+ Request Meeting</button>
</div>
<div className="card">
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Supervisor</th>
          <th>Type</th>
          <th>Agenda</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {meetRow('Jan 18, 2026 · 2:00 PM', 'Prof. Masud Parvez', 'Physical', 'Chapter 3 review and beacon testing plan', 'Approved')}
        {meetRow('Jan 10, 2026 · 11:00 AM', 'Prof. Masud Parvez', 'Online', 'Week 21 discussion', 'Completed')}
        {meetRow('Jan 25, 2026 · 3:00 PM', 'Prof. Masud Parvez', 'Physical', 'Draft thesis feedback', 'Pending')}
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