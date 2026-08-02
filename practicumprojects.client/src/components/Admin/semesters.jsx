import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {semRow, } from '../script.jsx';


export default function Semesters() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Semester Management</div>
  </div>
  <button className="btn-primary">+ New Semester</button>
</div>

<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Semester</th>
        <th>Year</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Groups</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {semRow('Spring', '2026', 'Jan 15, 2026', 'Jun 30, 2026', '62', 'Active')}
      {semRow('Fall', '2025', 'Aug 1, 2025', 'Dec 31, 2025', '58', 'Completed')}
      {semRow('Summer', '2025', 'May 15, 2025', 'Aug 1, 2025', '23', 'Completed')}
      {semRow('Spring', '2025', 'Jan 15, 2025', 'Jun 30, 2025', '55', 'Archived')}
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