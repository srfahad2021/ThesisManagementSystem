import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {topicCard} from '../script.jsx';


export default function supervisor_topics() {
  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Topic Review</div>
  </div>
</div>
<div className="card">
  {topicCard('Smart Campus Navigation System Using BLE Beacons', 'Safwan Rahman · Group 07', 'IoT, BLE, Indoor Positioning, Trilateration, Flutter, Campus', 'Awaiting Your Review', 'review')}
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