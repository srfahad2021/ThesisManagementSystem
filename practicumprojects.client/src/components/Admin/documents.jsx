import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {docMgmtRow} from '../script.jsx';


export default function Documents() {

  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Document Management</div>
  </div>
</div>
<div className="card">
  <table className="data-table">
    <thead>
      <tr>
        <th>Student</th>
        <th>Group</th>
        <th>Document</th>
        <th>Type</th>
        <th>Version</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {docMgmtRow('Safwan Rahman', 'G-07', 'Chapter 2 - Literature Review', 'Chapter', 'v1.3', 'Under Review')}
      {docMgmtRow('Nadia Akter', 'G-12', 'Research Proposal', 'Proposal', 'v2.0', 'Approved')}
      {docMgmtRow('Rakibul Islam', 'G-19', 'Final Thesis Draft', 'Final Thesis', 'v1.0', 'Approved')}
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