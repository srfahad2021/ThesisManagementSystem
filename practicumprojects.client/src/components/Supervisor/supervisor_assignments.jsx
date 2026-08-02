import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import {assignRow} from '../script.jsx';


export default function supervisor_assignments() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Assignments</div>
  </div>
  <button className="btn-primary">+ Create Assignment</button>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Type</th>
        <th>Assigned To</th>
        <th>Due Date</th>
        <th>Submissions</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {assignRow('System Architecture Diagram', 'Diagram Submission', 'Group 07', 'Jan 20, 2026', '1/1', 'Submitted')}
      {assignRow('Chapter 3 Draft', 'Documentation', 'Group 07', 'Jan 25, 2026', '0/1', 'Pending')}
      {assignRow('Project Proposal Presentation', 'Presentation', 'Group 09', 'Jan 22, 2026', '0/1', 'Pending')}
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