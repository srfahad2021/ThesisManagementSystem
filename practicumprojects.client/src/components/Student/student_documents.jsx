import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {docRow} from '../script.jsx';


export default function student_documents() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Document Management</div>
  </div>
  <button className="btn-primary">+ Upload Document</button>
</div>
<div className="card">
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Document</th>
          <th>Type</th>
          <th>Version</th>
          <th>Uploaded</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {docRow('Research Proposal', 'Proposal', 'v1.0', 'Dec 10, 2025', 'Approved')}
        {docRow('Chapter 1 — Introduction', 'Chapter', 'v2.1', 'Jan 5, 2026', 'Revision Requested')}
        {docRow('Chapter 2 — Literature Review', 'Chapter', 'v1.3', 'Jan 12, 2026', 'Under Review')}
        {docRow('Chapter 3 — Methodology', 'Chapter', 'v1.0', 'Jan 14, 2026', 'Draft')}
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