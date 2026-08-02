import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {miniStat, userRow} from '../script.jsx';


export default function Users() {
  const currentRole ='dept_admin';
  const currentPage ='dashboard';

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>User Accounts</div>
    <div className="text-muted text-sm">Manage all system users for IUBAT CSE Department</div>
  </div>
  <button className="btn-primary">+ Create Account</button>
</div>

<div className="grid-4" style={{ marginBottom: '20px' }}>
  {miniStat('Students', '148')} {miniStat('Supervisors', '22')} {miniStat('Coordinators', '4')} {miniStat('Examiners', '11')}
</div>

<div className="card" style={{ marginBottom: '16px' }}>
  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
    <div className="search-bar">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input className="form-control" placeholder="Search by name or ID…" style={{ width: '240px' }} />
    </div>
    <select className="form-control" style={{ width: '160px' }}>
      <option>All Roles</option>
      <option>Student</option>
      <option>Supervisor</option>
      <option>Coordinator</option>
      <option>Examiner</option>
    </select>
    <select className="form-control" style={{ width: '160px' }}>
      <option>Spring 2026</option>
      <option>Fall 2025</option>
      <option>Summer 2025</option>
    </select>
  </div>

  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Full Name</th>
          <th>Role</th>
          <th>Email</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {userRow('IUBAT22103125', 'Safwan Rahman', 'Student', 'safwan@iubat.edu', 'Active', '2 hrs ago')}
        {userRow('IUBAT22103126', 'Nadia Akter', 'Student', 'nadia@iubat.edu', 'Active', '1 day ago')}
        {userRow('IUBAT21103044', 'Rakibul Islam', 'Student', 'rakibul@iubat.edu', 'Active', '3 days ago')}
        {userRow('IUBAT22103089', 'Mitu Begum', 'Student', 'mitu@iubat.edu', 'Inactive', '1 week ago')}
        {userRow('SUP_PM_007', 'Prof. Masud Parvez', 'Supervisor', 'masud@iubat.edu', 'Active', 'Today')}
        {userRow('COORD_NK_001', 'Dr. Nasreen Karim', 'Coordinator', 'nasreen@iubat.edu', 'Active', 'Today')}
        {userRow('EXM_RH_003', 'Dr. Rafiq Hossain', 'Examiner', 'rafiq@iubat.edu', 'Active', '2 days ago')}
      </tbody>
    </table>
  </div>

  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
    <div className="text-muted text-sm">Showing 1–7 of 185 users</div>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button className="btn-secondary btn-sm">Previous</button>
      <button className="btn-primary btn-sm">Next</button>
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