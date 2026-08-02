import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import {statCard, coordRow, initCharts} from '../script.jsx';


export default function coordinator_dashboard() {
  const currentPage ='coordinator_dashboard';

  useEffect(() => {
    initCharts(currentPage);
  }, [currentPage]);

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="grid-4" style={{ marginBottom: '20px' }}>
  {statCard('Total Groups', '62', '', 'Spring 2026', '#FFE9E9', '#FF6B6B')}
  {statCard('Reports to Review', '24', 'down', 'This week', '#FEF9C3', '#F59E0B')}
  {statCard('Completed Thesis', '23', 'up', 'Ready to archive', '#DCFCE7', '#22C55E')}
  {statCard('AI Summaries Today', '8', 'up', 'Generated', '#DBEAFE', '#3B82F6')}
</div>
<div className="grid-2">
  <div className="card">
    <div className="section-head">
      <div className="section-title">Groups Requiring Coordinator Review</div>
    </div>
    <table className="data-table">
      <thead>
        <tr>
          <th>Group</th>
          <th>Week</th>
          <th>Supervisor</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {coordRow('Group 07', 'Week 22', 'Prof. Masud', 'Sup. Approved', 'Review')}
        {coordRow('Group 12', 'Week 30', 'Dr. Karim', 'Sup. Approved', 'Review')}
        {coordRow('Group 19', 'Week 38', 'Prof. Sadia', 'Sup. Approved', 'Review')}
      </tbody>
    </table>
  </div>
  <div className="card">
    <div className="section-head">
      <div className="section-title">Thesis Lifecycle Status</div>
    </div>
    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
              <canvas id="lifecycleChart"></canvas>
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