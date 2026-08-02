import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {checkItem} from '../script.jsx';


export default function coordinator_ai() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>AI Summary Generator</div>
    <div className="text-muted text-sm">Powered by OpenAI GPT-4</div>
  </div>
</div>
<div className="grid-2" style={{ marginBottom: '16px' }}>
  <div className="card">
    <div className="section-title" style={{ marginBottom: '16px' }}>AI Settings</div>
    <div className="form-group">
      <label className="form-label">Summary Length</label>
      <select className="form-control">
        <option>Concise (2-3 sentences)</option>
        <option selected>Standard (1 paragraph)</option>
        <option>Detailed (3-4 paragraphs)</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Technical Depth</label>
      <select className="form-control">
        <option>Layperson</option>
        <option selected>Academic</option>
        <option>Technical Expert</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Focus Emphasis</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        {checkItem('Research methodology', 'checked')}
        {checkItem('Mathematical models', '')}
        {checkItem('Diagrams & visuals', 'checked')}
        {checkItem('Citations & references', '')}
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Custom Prompt Instruction</label>
      <textarea className="form-control" placeholder="e.g. Summarize for department chairman. Focus on practical impact." defaultValue="Summarize for academic committee. Emphasize originality and contribution." />
    </div>
    <button className="btn-primary">Save Preferences</button>
  </div>
  <div className="card">
    <div className="section-title" style={{ marginBottom: '16px' }}>Generate Summary</div>
    <div className="form-group">
      <label className="form-label">Select Group</label>
      <select className="form-control">
        <option>Group 07 — Safwan Rahman</option>
        <option>Group 12 — Nadia Akter</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Week Range</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input className="form-control" defaultValue="18" placeholder="From week" />
        <input className="form-control" defaultValue="22" placeholder="To week" />
      </div>
    </div>
    <button className="btn-primary" style={{ marginBottom: '16px', width: '100%' }}>✨ Generate AI Summary</button>
    <div className="ai-msg bot">
      <div className="ai-label bot">AI Summary · Group 07 · Weeks 18–22</div>
      Over the past five weeks, the student has made consistent progress on the Smart Campus Navigation System. Beacon hardware deployment was completed across two buildings, achieving an indoor positioning accuracy of ±2.3 meters. The trilateration algorithm has been implemented and integrated with the Flutter mobile frontend. The primary outstanding challenge involves RSSI signal instability in corridor environments, which the student plans to address using Kalman filtering in the coming week. Overall trajectory is on schedule for completion by Week 40.
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn-secondary btn-sm">Copy</button>
      <button className="btn-secondary btn-sm">Export PDF</button>
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