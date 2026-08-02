import React from 'react';

import Users from './Admin/users.jsx';
import Dashboard from './Admin/dashboard.jsx';
import Groups from './Admin/groups.jsx';
import Semesters from './Admin/semesters.jsx';
import Analytics from './Admin/analytics.jsx';
import Attendance from './Admin/attendance.jsx';
import Audit from './Admin/audit.jsx';
import Cms from './Admin/cms.jsx';
import Documents from './Admin/documents.jsx';
import Progress from './Admin/progress.jsx';
import Reports from './Admin/reports.jsx';
import Topics from './Admin/topics.jsx';

import Coordinator_ai from './Coordinator/coordinator_ai.jsx';
import Coordinator_dashboard from './Coordinator/coordinator_dashboard.jsx';
import Coordinator_examiners from './Coordinator/coordinator_examiners.jsx';
import Coordinator_groups from './Coordinator/coordinator_groups.jsx';
import Coordinator_reports from './Coordinator/coordinator_reports.jsx';

import Examiner_dashboard from './Examiner/examiner_dashboard.jsx';
import Examiner_evaluate from './Examiner/examiner_evaluate.jsx';
import Examiner_reports from './Examiner/examiner_reports.jsx';

import Student_attendance from './Student/student_attendance.jsx';
import Student_dashboard from './Student/student_dashboard.jsx';
import Student_documents from './Student/student_documents.jsx';
import Student_evaluation from './Student/student_evaluation.jsx';
import Student_meetings from './Student/student_meetings.jsx';
import Student_progress from './Student/student_progress.jsx';
import Student_topic from './Student/student_topic.jsx';

import Supervisor_assignments from './Supervisor/supervisor_assignments.jsx';
import Supervisor_dashboard from './Supervisor/supervisor_dashboard.jsx';
import Supervisor_docs from './Supervisor/supervisor_docs.jsx';
import Supervisor_meetings from './Supervisor/supervisor_meetings.jsx';
import Supervisor_reports from './Supervisor/supervisor_reports.jsx';
import Supervisor_topics from './Supervisor/supervisor_topics.jsx';

export default function DynamicPageShower({ user, currentPage }) {
    if(!user){
        return null;
    }
    // Render view components based on currentPage ID sent from LeftNavbar
    const renderPageContent = () => {
        if(user.role === 0){
            switch (currentPage) {
                case 'users':
                    return <Users user={user}/>;
                case 'dashboard':
                    return <Dashboard user={user}/>; 
                case 'groups':
                    return <Groups user={user}/>;
                case 'semesters':
                    return <Semesters user={user}/>; 
                case 'analytics':
                    return <Analytics user={user}/>; 
                case 'attendance':
                    return <Attendance user={user}/>; 
                case 'audit':
                    return <Audit user={user}/>; 
                case 'cms':
                    return <Cms user={user}/>; 
                case 'documents':
                    return <Documents user={user}/>; 
                case 'progress':
                    return <Progress user={user}/>; 
                case 'reports':
                    return <Reports user={user}/>; 
                case 'topics':
                    return <Topics user={user}/>; 

                default:
                    return (
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                            <h2>{currentPage.toUpperCase()} View</h2>
                            <p>Active Role: {currentRole}</p>
                        </div>
                    );
            }
        }
        else if(user.role === 1){
            switch (currentPage) {
                case 'dashboard':
                    return <Coordinator_dashboard user={user}/>;
                case 'coordinator_groups':
                    return <Coordinator_groups user={user}/>; 
                case 'coordinator_reports':
                    return <Coordinator_reports user={user}/>;
                    case 'coordinator_ai':
                    return <Coordinator_ai user={user}/>; 
                case 'coordinator_examiners':
                    return <Coordinator_examiners user={user}/>; 
                    
                default:
                    return (
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                            <h2>{currentPage.toUpperCase()} View</h2>
                            <p>Active Role: {currentRole}</p>
                        </div>
                    );
                }
        }
        else if(user.role == 2){
            // ekn o ready kori nai
        }
        else if(user.role == 3){
            // supervisor
             switch (currentPage) {
                case 'dashboard':
                    return <Supervisor_dashboard user={user}/>;
                case 'supervisor_topics':
                    return <Supervisor_topics user={user}/>; 
                case 'supervisor_reports':
                    return <Supervisor_reports user={user}/>;
                case 'supervisor_docs':
                    return <Supervisor_docs user={user}/>; 
                case 'supervisor_meetings':
                    return <Supervisor_meetings user={user}/>; 
                case 'supervisor_assignments':
                    return <Supervisor_assignments user={user}/>;         
                default:
                    return (
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                            <h2>{currentPage.toUpperCase()} View</h2>
                            <p>Active Role: {currentRole}</p>
                        </div>
                    );
            }
        }
        else if(user.role === 4){
            switch (currentPage) {
                case 'dashboard':
                    return <Student_dashboard user={user}/>;
                case 'student_topic':
                    return <Student_topic user={user}/>; 
                case 'student_progress':
                    return <Student_progress user={user}/>;
                case 'student_documents':
                    return <Student_documents user={user}/>; 
                case 'student_meetings':
                    return <Student_meetings user={user}/>; 
                case 'student_evaluation':
                    return <Student_evaluation user={user}/>; 
                case 'student_attendance':
                    return <Supervisor_meetings user={user}/>; 
                default:
                    return (
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                            <h2>{currentPage.toUpperCase()} View</h2>
                            <p>Active Role: {currentRole}</p>
                        </div>
                    );
            }
        }

        else{
            switch (currentPage) {
                case 'dashboard':
                    return <Examiner_dashboard user={user}/>;
                case 'examiner_evaluate':
                    return <Examiner_evaluate user={user}/>; 
                case 'examiner_reports':
                    return <Examiner_reports user={user}/>;
                default:
                    return (
                        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                            <h2>{currentPage.toUpperCase()} View</h2>
                            <p>Active Role: {currentRole}</p>
                        </div>
                    );
            }
        }

        // switch (currentPage) {
        //     case 'users':
        //         return <Users user={user}/>;
        //     case 'dashboard':
        //         return <Student_progress user={user}/>; 
        //     case 'groups':
        //         return <Student_topic user={user}/>;
        //     case 'semesters':
        //         return <Supervisor_assignments user={user}/>; 
        //     case 'analytics':
        //         return <Supervisor_dashboard user={user}/>; 
        //     case 'attendance':
        //         return <Supervisor_docs user={user}/>; 
        //     case 'audit':
        //         return <Supervisor_meetings user={user}/>; 
        //     case 'cms':
        //         return <Supervisor_reports user={user}/>; 
        //     case 'documents':
        //         return <Supervisor_topics user={user}/>; 
        //     case 'progress':
        //         return <Student_dashboard user={user}/>; 
        //     case 'reports':
        //         return <Student_documents user={user}/>; 
        //     case 'topics':
        //         return <Student_evaluation user={user}/>; 

        //     default:
        //         return (
        //             <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
        //                 <h2>{currentPage.toUpperCase()} View</h2>
        //                 <p>Active Role: {currentRole}</p>
        //             </div>
        //         );
        // }
    };

    return (
        <div className="page-container">
            {renderPageContent()}
        </div>
    );
}