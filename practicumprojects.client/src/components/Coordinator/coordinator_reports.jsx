import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {coordRepRow} from '../script.jsx';


export default function coordinator_reports() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Coordinator Report Review</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Week</th>
        <th>Supervisor Approved</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {coordRepRow('Group 07', '22', 'Jan 15, 2026', 'Awaiting Coordinator')}
      {coordRepRow('Group 12', '30', 'Jan 14, 2026', 'Awaiting Coordinator')}
      {coordRepRow('Group 19', '38', 'Jan 13, 2026', 'Completed')}
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