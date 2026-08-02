import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {examRow, statCard} from '../script.jsx';


export default function examiner_dashboard() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="grid-3" style={{ marginBottom: '20px' }}>
  {statCard('Assigned Thesis', '4', '', 'For evaluation', '#FFE9E9', '#FF6B6B')}
  {statCard('Evaluated', '2', 'up', 'This semester', '#DCFCE7', '#22C55E')}
  {statCard('Pending', '2', '', 'Awaiting review', '#FEF9C3', '#F59E0B')}
</div>
<div className="card">
  <div className="section-title" style={{ marginBottom: '16px' }}>Assigned Thesis for Evaluation</div>
  <table className="data-table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Title</th>
        <th>Student(s)</th>
        <th>Supervisor</th>
        <th>Weeks</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {examRow('G-19', 'Blockchain for Land Registry in Bangladesh', 'Rakibul Islam, Mitu Begum', 'Prof. Sadia Islam', '40/40', 'Pending')}
      {examRow('G-22', 'AI-Based Diabetic Retinopathy Detection', 'Tahmina Khatun', 'Prof. Masud Parvez', '38/40', 'In Evaluation')}
      {examRow('G-03', 'NLP for Bangla Sentiment Analysis', 'Fatema Khatun', 'Dr. Arif Hossain', '40/40', 'Evaluated — B+')}
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