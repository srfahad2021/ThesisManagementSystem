import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {examAssignRow} from '../script.jsx';


export default function coordinator_examiners() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Assign Examiners</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Thesis Title</th>
        <th>Completion Date</th>
        <th>Assigned Examiner</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {examAssignRow('Group 19', 'Blockchain for Land Registry', 'Jan 10, 2026', 'Dr. Rafiq Hossain', 'Assigned')}
      {examAssignRow('Group 03', 'NLP for Bangla Sentiment', 'Dec 30, 2025', 'Dr. Rafiq Hossain', 'Evaluated')}
      {examAssignRow('Group 22', 'AI Diabetic Retinopathy', 'Jan 5, 2026', '— Unassigned —', 'Pending Assignment')}
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