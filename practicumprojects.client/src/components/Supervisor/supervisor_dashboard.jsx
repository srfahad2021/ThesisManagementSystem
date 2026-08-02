import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {supGroupRow, statCard} from '../script.jsx';


export default function supervisor_dashboard() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="grid-4" style={{ marginBottom: '20px' }}>
  {statCard('My Groups', '8', '', 'Active groups', '#FFE9E9', '#FF6B6B')}
  {statCard('Pending Reports', '12', '', 'Awaiting review', '#FEF9C3', '#F59E0B')}
  {statCard('Topic Reviews', '3', '', 'Need decision', '#DBEAFE', '#3B82F6')}
  {statCard('Meetings Today', '2', '', 'Scheduled', '#DCFCE7', '#22C55E')}
</div>

<div className="grid-21">
  <div className="card">
    <div className="section-head">
      <div className="section-title">My Supervised Groups</div>
    </div>
    <table className="data-table">
      <thead>
        <tr>
          <th>Group</th>
          <th>Students</th>
          <th>Week</th>
          <th>Last Report</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {supGroupRow('Group 07', 'Safwan Rahman, Tanvir A', '22/40', 'Jan 14', 'In Progress')}
        {supGroupRow('Group 09', 'Moshiur Rahman', '18/40', 'Jan 12', 'In Progress')}
        {supGroupRow('Group 22', 'Tahmina Khatun', '35/40', 'Jan 13', 'Under Examination')}
        {supGroupRow('Group 28', 'Imran Khan', '8/40', 'Jan 10', 'In Progress')}
      </tbody>
    </table>
  </div>

  <div className="card">
    <div className="section-head">
      <div className="section-title">Pending Actions</div>
    </div>
    <div className="timeline">
      <div className="timeline-item active">
        <div className="timeline-meta">Urgent</div>
        <div className="timeline-title">Review Week 22 — Group 07</div>
        <div className="timeline-desc">Submitted Jan 14, 2026</div>
      </div>
      <div className="timeline-item active">
        <div className="timeline-meta">Today</div>
        <div className="timeline-title">Meeting at 2:00 PM — Safwan Rahman</div>
        <div className="timeline-desc">Chapter 3 discussion</div>
      </div>
      <div className="timeline-item">
        <div className="timeline-meta">Tomorrow</div>
        <div className="timeline-title">Chapter 2 Review — Group 09</div>
        <div className="timeline-desc">3 comments pending</div>
      </div>
      <div className="timeline-item">
        <div className="timeline-meta">Jan 20</div>
        <div className="timeline-title">Topic Review — New submission</div>
        <div className="timeline-desc">Imran Khan</div>
      </div>
    </div>
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