import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {topicCard} from '../script.jsx';


export default function Topics() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Topic Review Queue</div>
    <div className="text-muted text-sm">17 submissions awaiting action</div>
  </div>
</div>

<div className="tabs">
  <button className="tab-btn active">Pending (5)</button>
  <button className="tab-btn">Supervisor Review (8)</button>
  <button className="tab-btn">Approved (142)</button>
  <button className="tab-btn">Rejected (12)</button>
</div>

<div className="card">
  {topicCard('Smart Campus Navigation System', 'Safwan Rahman · Group 07', 'IoT, Wayfinding, Indoor Navigation, BLE Beacons', 'Submitted', 'pending')}
  {topicCard('Federated Learning for Privacy-Preserving Healthcare', 'Nadia Akter · Group 12', 'Federated Learning, Privacy, Healthcare AI, Deep Learning', 'Submitted', 'pending')}
  {topicCard('Automated Bangla Text Summarization using Transformer', 'Imran Khan · Group 28', 'NLP, Transformers, Bangla Language, Summarization', 'Submitted', 'pending')}
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