import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {groupAttentionRow, statCard, legendItem, activityItem, initCharts} from '../script.jsx';


export default function Dashboard() {
  const currentRole ='dept_admin';
  const currentPage ='dashboard';

  useEffect(() => {
    initCharts(currentPage);
  }, [currentPage]);

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          {statCard('Total Students', '148', 'up', '+12 this semester', '#FFE9E9', '#FF6B6B')}
          {statCard('Active Groups', '62', 'up', '+5 new groups', '#DCFCE7', '#22C55E')}
          {statCard('Pending Reviews', '17', 'down', 'Topics & reports', '#FEF9C3', '#F59E0B')}
          {statCard('Completions', '23', 'up', 'This semester', '#DBEAFE', '#3B82F6')}
        </div>
        <div className="grid-21" style={{ marginBottom: '20px' }}>
          <div className="card">
            <div className="section-head">
              <div>
                <div className="section-title">Thesis Progress Overview</div>
                <div className="section-sub">Spring 2026 — All Groups</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary btn-sm">Export</button>
                <button className="btn-primary btn-sm">+ New Group</button>
              </div>
            </div>
            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
              <canvas id="progressChart"></canvas>
            </div>
          </div>
          <div className="card">
            <div className="section-head">
              <div className="section-title">Status Distribution</div>
            </div>
            <div style={{ position: 'relative', height: '160px', width: '100%' }}>
              <canvas id="statusChart"></canvas>
            </div>
            <div style={{ marginTop: '16px' }}>
              {legendItem('#FF6B6B', 'In Progress — 38')}
              {legendItem('#22C55E', 'Completed — 23')}
              {legendItem('#F59E0B', 'Under Examination — 11')}
              {legendItem('#3B82F6', 'Archived — 9')}
              {legendItem('#E5E7EB', 'Draft — 19')}
            </div>
          </div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="section-head">
              <div className="section-title">Recent Activities</div>
            </div>
            {activityItem('#FFE9E9', '#FF6B6B', 'SR', 'Safwan Rahman submitted Week 22 report', '2 min ago')}
            {activityItem('#DCFCE7', '#22C55E', 'TH', 'Topic approved: Smart Campus Navigation', '15 min ago')}
            {activityItem('#FEF9C3', '#F59E0B', 'NA', 'Nadia Akter requested revision on Chapter 2', '1 hr ago')}
            {activityItem('#DBEAFE', '#3B82F6', 'MP', 'Prof. Masud scheduled meeting with Group 07', '2 hrs ago')}
            {activityItem('#FFE9E9', '#FF6B6B', 'RK', 'Rahul Khan uploaded Final Thesis draft', '3 hrs ago')}
          </div>
          <div className="card">
            <div className="section-head">
              <div className="section-title">Groups Needing Attention</div>
              <button className="btn-ghost">View all</button>
            </div>
            {groupAttentionRow('Group 14', 'Rakibul & Mitu', 'Week 18 overdue', 'danger')}
            {groupAttentionRow('Group 31', 'Tanvir Ahmed', 'No supervisor assigned', 'warning')}
            {groupAttentionRow('Group 07', 'Safwan Rahman', 'Topic revision requested', 'warning')}
            {groupAttentionRow('Group 45', 'Nusrat Islam', '3 consecutive absences', 'danger')}
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