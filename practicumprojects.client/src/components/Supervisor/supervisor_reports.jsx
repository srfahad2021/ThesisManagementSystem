import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {supRepRow} from '../script.jsx';


export default function supervisor_reports() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Weekly Report Reviews</div>
    <div className="text-muted text-sm">12 pending reviews across your groups</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Student</th>
        <th>Group</th>
        <th>Week</th>
        <th>Submitted</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {supRepRow('Safwan Rahman', 'G-07', '22', 'Jan 14, 2026', 'Pending Review')}
      {supRepRow('Moshiur Rahman', 'G-09', '18', 'Jan 12, 2026', 'Pending Review')}
      {supRepRow('Imran Khan', 'G-28', '8', 'Jan 10, 2026', 'Pending Review')}
    </tbody>
  </table>
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