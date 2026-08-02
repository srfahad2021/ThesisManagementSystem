import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {attRow, statCard} from '../script.jsx';


export default function Attendance() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Attendance Management</div>
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button className="btn-secondary">Export PDF</button>
    <button className="btn-secondary">Export Excel</button>
  </div>
</div>

<div className="grid-3" style={{ marginBottom: '20px' }}>
  {statCard('Average Attendance', '87%', 'up', '+3% vs last sem', '#DCFCE7', '#22C55E')}
  {statCard('Below 75%', '9 students', 'down', 'At risk of failing', '#FEE2E2', '#EF4444')}
  {statCard('Perfect Attendance', '14 students', 'up', '100% record', '#DBEAFE', '#3B82F6')}
</div>

<div className="card">
  <div className="section-head">
    <div className="section-title">Attendance Sheet — Spring 2026</div>
  </div>
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Group</th>
          <th>Total Weeks</th>
          <th>Present</th>
          <th>Absent</th>
          <th>Attendance %</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {attRow('Safwan Rahman', 'G-07', '22', '21', '1', '95.5%', 'Good')}
        {attRow('Nadia Akter', 'G-12', '22', '20', '2', '90.9%', 'Good')}
        {attRow('Rakibul Islam', 'G-19', '22', '17', '5', '77.3%', 'Warning')}
        {attRow('Imran Khan', 'G-28', '22', '15', '7', '68.2%', 'Risk')}
        {attRow('Riya Sharma', 'G-33', '22', '22', '0', '100%', 'Excellent')}
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