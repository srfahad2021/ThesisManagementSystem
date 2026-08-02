import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {upcomingItem, quickAction, wfStep} from '../script.jsx';


export default function student_dashboard() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E72)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px', color: '#fff' }}>
  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</div>
  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700 }}>Safwan Rahman</div>
  <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>IUBAT22103125 · Group 07 · Spring 2026</div>
  <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>22</div>
      <div style={{ fontSize: '11px', opacity: 0.85 }}>Current Week</div>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>95%</div>
      <div style={{ fontSize: '11px', opacity: 0.85 }}>Attendance</div>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>55%</div>
      <div style={{ fontSize: '11px', opacity: 0.85 }}>Overall Progress</div>
    </div>
  </div>
</div>

<div className="grid-2" style={{ marginBottom: '20px' }}>
  <div className="card">
    <div className="section-head">
      <div className="section-title">My Thesis Topic</div>
      <span className="badge badge-success">Approved</span>
    </div>
    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Smart Campus Navigation System Using BLE Beacons</div>
    <div className="tag-cloud">
      {['IoT', 'BLE', 'Indoor Positioning', 'Trilateration', 'Flutter', 'Campus'].map(t => (
        <span key={t} className="tag">{t}</span>
      ))}
    </div>
    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
      A mobile application enabling real-time indoor navigation within IUBAT campus using Bluetooth Low Energy beacons and trilateration algorithms.
    </div>
  </div>

  <div className="card">
    <div className="section-head">
      <div className="section-title">Thesis Workflow</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {wfStep('Topic Approved', 'done')}
      {wfStep('Weekly Progress (Ongoing)', 'active')}
      {wfStep('Document Submission', 'pending')}
      {wfStep('Final Defense', 'pending')}
      {wfStep('Archived', 'pending')}
    </div>
  </div>
</div>

<div className="grid-2">
  <div className="card">
    <div className="section-head">
      <div className="section-title">Quick Actions</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {quickAction('Submit Week 23', 'progressIcon', 'primary')}
      {quickAction('Upload Document', 'docIcon', 'secondary')}
      {quickAction('Request Meeting', 'meetingIcon', 'secondary')}
      {quickAction('View Comments', 'commentIcon', 'secondary')}
    </div>
  </div>

  <div className="card">
    <div className="section-head">
      <div className="section-title">Upcoming</div>
    </div>
    {upcomingItem('Week 23 Report Due', 'Sunday, Jan 22 · 11:59 PM', 'warning')}
    {upcomingItem('Supervisor Meeting', 'Wednesday, Jan 18 · 2:00 PM', 'info')}
    {upcomingItem('Chapter 3 Submission', 'Friday, Jan 27', 'neutral')}
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