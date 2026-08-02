import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {statCard, initCharts} from '../script.jsx';


export default function Analytics() {
  const currentRole ='dept_admin';
    const currentPage ='analytics';
  
    useEffect(() => {
      initCharts(currentPage);
    }, [currentPage]);
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Analytics Dashboard</div>
  </div>
</div>
<div className="grid-4" style={{ marginBottom: '20px' }}>
  {statCard('Completion Rate', '74%', 'up', '+6% vs last sem', '#FFE9E9', '#FF6B6B')}
  {statCard('Avg Weeks Taken', '37.2', 'down', 'Target: 40', '#DCFCE7', '#22C55E')}
  {statCard('AI Summaries', '312', 'up', 'This semester', '#DBEAFE', '#3B82F6')}
  {statCard('Avg Grade', 'B+', 'up', 'Examiner eval avg', '#FEF9C3', '#F59E0B')}
</div>
<div className="grid-2">
  <div className="card">
    <div className="section-title" style={{ marginBottom: '16px' }}>Weekly Submissions Trend</div>
    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
      <canvas id="trendChart"></canvas>
    </div>
  </div>
  <div className="card">
    <div className="section-title" style={{ marginBottom: '16px' }}>Topic Keywords (Top 10)</div>
    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
      <canvas id="keywordsChart"></canvas>
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