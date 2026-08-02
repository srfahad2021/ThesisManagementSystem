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

// import coordinator_ai from './Coordinator/coordinator_ai.jsx';
// import coordinator_dashboard from './Coordinator/coordinator_dashboard.jsx';
// import coordinator_examiners from './Coordinator/coordinator_examiners.jsx';
// import coordinator_groups from './Coordinator/coordinator_groups.jsx';
// import coordinator_reports from './Coordinator/coordinator_reports.jsx';

// import examiner_dashboard from './Examiner/examiner_dashboard.jsx';
// import examiner_evaluate from './Examiner/examiner_evaluate.jsx';
// import examiner_reports from './Examiner/examiner_reports.jsx';

// import student_attendance from './Student/student_attendance.jsx';
// import student_dashboard from './Student/student_dashboard.jsx';
// import student_documents from './Student/student_documents.jsx';
// import student_evaluation from './Student/student_evaluation.jsx';
// import student_meetings from './Student/student_meetings.jsx';
// import student_progress from './Student/student_progress.jsx';
// import student_topic from './Student/student_topic.jsx';

// import supervisor_assignments from './Supervisor/supervisor_assignments.jsx';
// import supervisor_dashboard from './Supervisor/supervisor_dashboard.jsx';
// import supervisor_docs from './Supervisor/supervisor_docs.jsx';
// import supervisor_meetings from './Supervisor/supervisor_meetings.jsx';
// import supervisor_reports from './Supervisor/supervisor_reports.jsx';
// import supervisor_topics from './Supervisor/supervisor_topics.jsx';

export default function MainPage({ user, currentRole, currentPage }) {
    // Render view components based on currentPage ID sent from LeftNavbar
    const renderPageContent = () => {
        switch (currentPage) {
            case 'users':
                return <Users user={user} role={currentRole} />;
            case 'dashboard':
                return <Dashboard user={user} role={currentRole} />; 
            case 'groups':
                return <Groups user={user} role={currentRole} />;
            case 'semesters':
                return <Semesters user={user} role={currentRole} />; 
            case 'analytics':
                return <Analytics user={user} role={currentRole} />; 
            case 'attendance':
                return <Attendance user={user} role={currentRole} />; 
            case 'audit':
                return <Audit user={user} role={currentRole} />; 
            case 'cms':
                return <Cms user={user} role={currentRole} />; 
            case 'documents':
                return <Documents user={user} role={currentRole} />; 
            case 'progress':
                return <Progress user={user} role={currentRole} />; 
            case 'reports':
                return <Reports user={user} role={currentRole} />; 
            case 'topics':
                return <Topics user={user} role={currentRole} />; 
            
            // case 'roles': // ID corresponding to "User Roles" item
            // case 'users':
            //     return <UserRolesView user={user} role={currentRole} />;

            // case 'settings':
            //     return <SettingsView user={user} />;

            default:
                return (
                    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                        <h2>{currentPage.toUpperCase()} View</h2>
                        <p>Active Role: {currentRole}</p>
                    </div>
                );
        }
    };

    return (
        <div className="page-container">
            {renderPageContent()}
        </div>
    );
}