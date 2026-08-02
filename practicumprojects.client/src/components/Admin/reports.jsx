import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {reportCard} from '../script.jsx';


export default function Reports() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Reports & Export</div>
  </div>
</div>
<div className="grid-3" style={{ marginBottom: '20px' }}>
  {reportCard('Student Progress Report', 'Individual student thesis progress summary', 'Export PDF', 'Excel')}
  {reportCard('Supervisor Activity Report', 'Supervisor feedback and approval statistics', 'Export PDF', 'Excel')}
  {reportCard('Department Summary', 'Full departmental overview for semester', 'Export PDF', 'Excel')}
  {reportCard('Attendance Report', 'Automated attendance from weekly approvals', 'Export PDF', 'Excel')}
  {reportCard('Evaluation Report', 'Rubric-based marks and evaluator summary', 'Export PDF', 'Excel')}
  {reportCard('Coordinator Summary', 'Weekly reviews and completion status', 'Export PDF', 'Excel')}
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