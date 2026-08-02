import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {rubricRow} from '../script.jsx';


export default function examiner_evaluate() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Thesis Evaluation</div>
    <div className="text-muted text-sm">Group 19 — Rakibul Islam · Spring 2026</div>
  </div>
  <button className="btn-primary">Submit Evaluation</button>
</div>

<div className="card" style={{ marginBottom: '16px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
    <div>
      <div style={{ fontWeight: '600', fontSize: '15px' }}>Blockchain for Land Registry in Bangladesh</div>
      <div className="text-muted text-sm">Rakibul Islam & Mitu Begum · Supervisor: Prof. Sadia Islam · 40/40 Weeks</div>
    </div>
    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
      <button className="btn-secondary btn-sm">View Thesis PDF</button>
      <button className="btn-secondary btn-sm">View Attendance</button>
    </div>
  </div>
  <div className="workflow-steps">
    <div className="wf-step done"><div className="wf-dot"></div>In Progress</div>
    <div className="wf-step done"><div className="wf-dot"></div>Completed</div>
    <div className="wf-step active"><div className="wf-dot"></div>Under Examination</div>
    <div className="wf-step"><div className="wf-dot"></div>Archived</div>
  </div>
</div>

<div className="card">
  <div className="section-title" style={{ marginBottom: '16px' }}>Evaluation Rubric</div>
  <div style={{ marginBottom: '16px' }}>
    {rubricRow('Research Topic & Objectives', 15)}
    {rubricRow('Literature Review & Background', 15)}
    {rubricRow('Methodology', 15)}
    {rubricRow('Development & Implementation', 20)}
    {rubricRow('Testing & Validation', 15)}
    {rubricRow('Documentation Quality', 10)}
    {rubricRow('Presentation & Defense', 10)}
  </div>
  <div style={{ borderTop: '2px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div className="form-label">Examiner Remarks</div>
      <textarea className="form-control" style={{ width: '400px', minHeight: '70px' }} placeholder="Overall feedback and suggestions…"></textarea>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div className="text-muted text-sm">Total Score</div>
      <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: 'var(--primary)' }} id="totalScore">— / 100</div>
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