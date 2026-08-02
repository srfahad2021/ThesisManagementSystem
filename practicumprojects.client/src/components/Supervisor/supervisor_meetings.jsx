import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {meetMgmtRow} from '../script.jsx';


export default function supervisor_meetings() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Meeting Requests</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Student</th>
        <th>Requested Date</th>
        <th>Type</th>
        <th>Agenda</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {meetMgmtRow('Safwan Rahman', 'Jan 18 · 2:00 PM', 'Physical', 'Chapter 3 Review', 'Approved')}
      {meetMgmtRow('Imran Khan', 'Jan 20 · 4:00 PM', 'Online', 'Week 8 Discussion', 'Pending')}
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