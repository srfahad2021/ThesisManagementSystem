import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';


export default function student_topic() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Topic Submission</div>
  </div>
  <span className="badge badge-success" style={{ fontSize: '13px', padding: '6px 14px' }}>Approved</span>
</div>

<div className="workflow-steps" style={{ marginBottom: '20px' }}>
  <div className="wf-step done"><div className="wf-dot"></div>Draft</div>
  <div className="wf-step done"><div className="wf-dot"></div>Submitted</div>
  <div className="wf-step done"><div className="wf-dot"></div>Supervisor Review</div>
  <div className="wf-step active"><div className="wf-dot"></div>Approved</div>
</div>

<div className="card">
  <div className="grid-2" style={{ gap: '20px' }}>
    <div>
      <div className="form-group">
        <label className="form-label">Thesis Title *</label>
        <input className="form-control" defaultValue="Smart Campus Navigation System Using BLE Beacons" />
      </div>
      <div className="form-group">
        <label className="form-label">Abstract *</label>
        <textarea className="form-control" style={{ minHeight: '120px' }} defaultValue="This research proposes a mobile application enabling real-time indoor navigation within IUBAT campus using Bluetooth Low Energy (BLE) beacons and trilateration algorithms. The system aims to assist new students and visitors in navigating complex campus layouts." />
      </div>
      <div className="form-group">
        <label className="form-label">Keywords</label>
        <input className="form-control" defaultValue="IoT, BLE Beacons, Indoor Positioning, Trilateration, Flutter, Campus Navigation" />
      </div>
    </div>
    <div>
      <div className="form-group">
        <label className="form-label">Problem Statement *</label>
        <textarea className="form-control" defaultValue="Students and visitors at IUBAT face difficulty navigating complex multi-building campus layouts, leading to time loss and confusion especially during first days." />
      </div>
      <div className="form-group">
        <label className="form-label">Objectives *</label>
        <textarea className="form-control" defaultValue={`1. Design beacon placement strategy for complete campus coverage.&#10;2. Implement trilateration algorithm for ≤3m accuracy.&#10;3. Build cross-platform mobile app with real-time positioning.`} />
      </div>
      <div className="form-group">
        <label className="form-label">Methodology</label>
        <textarea className="form-control" defaultValue="Quantitative research with experimental system development. BLE RSSI measurements, Kalman filtering, trilateration, user testing with 50 participants." />
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