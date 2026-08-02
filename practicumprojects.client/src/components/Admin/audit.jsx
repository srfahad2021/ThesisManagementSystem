import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {auditRow} from '../script.jsx';


export default function Audit() {
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Audit Logs</div>
    <div className="text-muted text-sm">Complete action trail for compliance</div>
  </div>
</div>
<div className="card">
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Role</th>
          <th>Action</th>
          <th>Module</th>
          <th>IP Address</th>
        </tr>
      </thead>
      <tbody>
        {auditRow('2026-01-15 14:32:11', 'Safwan Rahman', 'Student', 'Weekly Report Submitted', 'Progress', '+88.100.21.45')}
        {auditRow('2026-01-15 14:18:44', 'Prof. Masud Parvez', 'Supervisor', 'Comment Added', 'Document Review', '+88.100.21.90')}
        {auditRow('2026-01-15 13:55:02', 'Dr. Nasreen Karim', 'Coordinator', 'AI Summary Generated', 'Weekly Reports', '+88.100.21.12')}
        {auditRow('2026-01-15 13:22:17', 'Dr. Ahmed Reza', 'Dept Admin', 'User Account Created', 'User Management', '+88.100.21.5')}
        {auditRow('2026-01-15 12:44:33', 'Nadia Akter', 'Student', 'Topic Submitted', 'Topic Management', '+88.100.21.71')}
        {auditRow('2026-01-15 11:30:00', 'Dr. Rafiq Hossain', 'Examiner', 'Evaluation Submitted', 'Examiner', '+88.100.21.88')}
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