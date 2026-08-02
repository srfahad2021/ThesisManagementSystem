import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import '../style.css';
import { roles, getPageLabel } from '../../Information/RolesAndConfig.js';
import { icons } from '../../Information/Icons.jsx';
import  {****} from '../script.jsx';


export default function ******() {
  const currentRole ='dept_admin';
  const currentPage ='dashboard';

  useEffect(() => {
    initCharts(currentPage);
  }, [currentPage]);

  // Render active page dynamically
  const renderContent = () => {
      return (
      <>
        
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