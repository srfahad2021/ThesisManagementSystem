import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {evalRow, } from '../script.jsx';


export default function student_evaluation() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Evaluation Results</div>
    <div className="text-muted text-sm">Examiner: Dr. Rafiq Hossain</div>
  </div>
</div>

<div style={{ background: '#FFF5F5', border: '1px solid #FFC8C8', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
  <div style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: 'var(--primary)' }}>B+</div>
  <div>
    <div style={{ fontSize: '18px', fontWeight: 600 }}>76 / 100</div>
    <div className="text-muted text-sm">Spring 2026 · Thesis Evaluation</div>
  </div>
</div>

<div className="card">
  <div className="section-title" style={{ marginBottom: '16px' }}>Rubric Breakdown</div>
  {evalRow('Research Topic & Objectives', '14', '15')}
  {evalRow('Literature Review', '11', '15')}
  {evalRow('Methodology', '13', '15')}
  {evalRow('Development & Implementation', '16', '20')}
  {evalRow('Testing & Results', '10', '15')}
  {evalRow('Documentation Quality', '7', '10')}
  {evalRow('Presentation', '5', '10')}
  <div style={{ borderTop: '2px solid var(--border)', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontWeight: 700 }}>Total Score</div>
    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>76 / 100</div>
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