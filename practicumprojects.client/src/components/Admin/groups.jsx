import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {groupRow} from '../script.jsx';


export default function Groups() {
  const renderContent = () => {
      return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Thesis Groups</div>
    <div className="text-muted text-sm">Spring 2026 — 62 active groups</div>
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button className="btn-secondary">Export</button>
    <button className="btn-primary">+ Create Group</button>
  </div>
</div>
<div className="card">
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Group</th>
          <th>Members</th>
          <th>Supervisor</th>
          <th>Topic</th>
          <th>Week</th>
          <th>Progress</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {groupRow('Group 07', 'Safwan R, Tanvir A', 'Prof. Masud Parvez', 'Smart Campus Navigation System', '22/40', '55', 'In Progress')}
        {groupRow('Group 12', 'Nadia Akter', 'Dr. Karim Uddin', 'AI-Based Crop Disease Detection', '30/40', '75', 'In Progress')}
        {groupRow('Group 19', 'Rakibul I, Mitu B', 'Prof. Sadia Islam', 'Blockchain for Land Registry', '38/40', '95', 'Under Examination')}
        {groupRow('Group 03', 'Fatema Khatun', 'Dr. Arif Hossain', 'NLP for Bangla Sentiment Analysis', '40/40', '100', 'Completed')}
        {groupRow('Group 28', 'Imran Khan', 'Prof. Masud Parvez', 'IoT Smart Home Automation', '8/40', '20', 'In Progress')}
        {groupRow('Group 33', 'Riya Sharma, Sumon Das', 'Dr. Nasreen Karim', 'E-Health Platform for Rural BD', '15/40', '38', 'In Progress')}
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