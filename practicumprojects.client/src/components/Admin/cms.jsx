import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';


export default function CMS() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Content Manager</div>
    <div className="text-muted text-sm">Edit student-facing content without code changes</div>
  </div>
  <button className="btn-primary">Save Changes</button>
</div>
<div className="grid-2">
  <div className="card">
    <div className="form-label" style={{ marginBottom: '12px' }}>Department Announcement</div>
    <div className="form-group">
      <label className="form-label">Title</label>
      <input className="form-control" defaultValue="Thesis Defense Schedule — Spring 2026" />
    </div>
    <div className="form-group">
      <label className="form-label">Body</label>
      <textarea className="form-control" defaultValue="All groups completing Week 36 by March 15th are eligible for the Spring 2026 defense. Submit your final thesis documents by March 10th." />
    </div>
    <div className="form-group">
      <label className="form-label">Visibility</label>
      <select className="form-control">
        <option>All Students</option>
        <option>In Progress Only</option>
        <option>Under Examination</option>
      </select>
    </div>
    <button className="btn-primary">Publish</button>
  </div>
  <div className="card">
    <div className="form-label" style={{ marginBottom: '12px' }}>Student Homepage Banner</div>
    <div className="form-group">
      <label className="form-label">Hero Title</label>
      <input className="form-control" defaultValue="Welcome to Your Thesis Journey" />
    </div>
    <div className="form-group">
      <label className="form-label">Hero Subtitle</label>
      <textarea className="form-control" style={{ minHeight: '60px' }} defaultValue="Track your research progress, collaborate with your supervisor, and complete your thesis with confidence." />
    </div>
    <div className="form-group">
      <label className="form-label">Notice Text</label>
      <input className="form-control" defaultValue="Weekly reports are due every Sunday by 11:59 PM." />
    </div>
    <button className="btn-primary">Update</button>
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