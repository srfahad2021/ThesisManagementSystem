import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import { groupRow } from '../script.jsx';


export default function CoordinatorGroups() {
  // Render active page dynamically
  const renderContent = () => {
    return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
          <div>
            <div className="section-title" style={{ fontSize: '16px' }}>All Groups Overview</div>
          </div>
        </div>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Members</th>
                <th>Supervisor</th>
                <th>Week</th>
                <th>Progress</th>
                <th>Last Activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {groupRow('Group 07', 'Safwan R, Tanvir A', 'Prof. Masud Parvez', '22/40', '50', 'In Progress')}
              {groupRow('Group 12', 'Nadia Akter', 'Dr. Karim Uddin', '30/40', '75', 'In Progress')}
              {groupRow('Group 19', 'Rakibul I, Mitu B', 'Prof. Sadia Islam', '38/40', '95', 'Under Examination')}
              {groupRow('Group 03', 'Fatema Khatun', 'Dr. Arif Hossain', '40/40', '100', 'Completed')}
            </tbody>
          </table>
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