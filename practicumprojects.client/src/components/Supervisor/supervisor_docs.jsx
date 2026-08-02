import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';


export default function supervisor_docs() {

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        <div className="section-head" style={{ marginBottom: '20px' }}>
  <div>
    <div className="section-title" style={{ fontSize: '16px' }}>Document Review System</div>
    <div className="text-muted text-sm">Google Docs-style inline commenting</div>
  </div>
</div>

<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
  <div className="card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <div style={{ fontWeight: 600 }}>Chapter 2 — Literature Review</div>
        <div className="text-muted text-sm">Safwan Rahman · v1.3 · Jan 12, 2026</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <span className="badge badge-warning">5 Changes Requested</span>
        <button className="btn-secondary btn-sm">← Prev</button>
        <button className="btn-secondary btn-sm">Next →</button>
      </div>
    </div>
    <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '20px', fontSize: '14px', lineHeight: 1.9, maxHeight: '360px', overflowY: 'auto' }}>
      <p style={{ marginBottom: '12px' }}>2.1 Indoor Positioning Technologies</p>
      <p style={{ marginBottom: '12px' }}>
        Various technologies have been employed for indoor positioning systems (IPS), each presenting unique trade-offs between accuracy, cost, and infrastructure requirements.{' '}
        <span style={{ background: '#FEF3C7', borderBottom: '2px solid #F59E0B', padding: '1px 2px' }} title="Comment 1">
          GPS is widely used for outdoor navigation but is ineffective indoors due to signal attenuation through building materials
        </span>
        , making alternative solutions necessary.
      </p>
      <p style={{ marginBottom: '12px' }}>
        Bluetooth Low Energy (BLE) beacons have emerged as a prominent solution for IPS.{' '}
        <span style={{ background: '#DCFCE7', borderBottom: '2px solid #22C55E', padding: '1px 2px' }}>
          Studies by Wang et al. (2022) demonstrated sub-2m accuracy using trilateration with 4+ beacons in line-of-sight conditions.
        </span>
      </p>
      <p>
        <span style={{ background: '#FEE2E2', borderBottom: '2px solid #EF4444', padding: '1px 2px' }} title="Comment 2">
          WiFi fingerprinting, though infrastructure-independent, suffers from environmental changes affecting accuracy significantly over time.
        </span>{' '}
        Recent work by Ahmad (2023) addresses this through dynamic recalibration.
      </p>
    </div>
  </div>

  <div>
    <div className="card" style={{ marginBottom: '12px' }}>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Comments (5)</div>
      <div className="comment-box">
        <div className="comment-header">
          <span className="comment-author" style={{ color: 'var(--warning)' }}>⚠ Revision #1</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>Jan 14</span>
        </div>
        <div className="comment-text">This statement needs a citation. Please add reference to a peer-reviewed study on GPS indoor limitations.</div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <button className="btn-secondary btn-sm" style={{ fontSize: '11px' }}>Resolve</button>
          <button className="btn-ghost btn-sm" style={{ fontSize: '11px' }}>Reply</button>
        </div>
      </div>
      <div className="comment-box" style={{ background: '#FFF0F0', borderColor: '#FFC8C8' }}>
        <div className="comment-header">
          <span className="comment-author" style={{ color: 'var(--danger)' }}>✗ Revision #2</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>Jan 14</span>
        </div>
        <div className="comment-text">Needs more detail. How much accuracy loss? Quantify with specific data.</div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <button className="btn-secondary btn-sm" style={{ fontSize: '11px' }}>Resolve</button>
          <button className="btn-ghost btn-sm" style={{ fontSize: '11px' }}>Reply</button>
        </div>
      </div>
    </div>
    <div className="card">
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Add Comment</div>
      <textarea className="form-control" placeholder="Highlight text then add your comment…" style={{ minHeight: '70px', marginBottom: '8px' }}></textarea>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="btn-primary btn-sm">Request Revision</button>
        <button className="btn-secondary btn-sm">Approve Section</button>
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