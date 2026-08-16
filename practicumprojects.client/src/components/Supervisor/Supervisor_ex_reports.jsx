import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';


export default function examiner_reports() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Evaluation Reports</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Thesis</th>
        <th>Score</th>
        <th>Grade</th>
        <th>Date</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Group 03</td>
        <td>NLP for Bangla Sentiment Analysis</td>
        <td>76/100</td>
        <td><span className="badge badge-info">B+</span></td>
        <td>Jan 10, 2026</td>
        <td><button className="btn-secondary btn-sm">Download</button></td>
      </tr>
      <tr>
        <td>Group 22</td>
        <td>AI Diabetic Retinopathy Detection</td>
        <td>82/100</td>
        <td><span className="badge badge-success">A-</span></td>
        <td>Jan 12, 2026</td>
        <td><button className="btn-secondary btn-sm">Download</button></td>
      </tr>
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