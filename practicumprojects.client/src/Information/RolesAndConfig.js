import { icons } from './Icons.jsx';

export const roles = {
  ADMIN: {
    label: 'Administrator',
    initials: 'DA',
    name: 'Dr. Ahmed Reza',
    org: 'IUBAT · CSE Department',
    nav: [
      { section: 'Dashboard & Insights', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'analytics', icon: icons.chartIcon, label: 'Academic Analytics' },
      ]},
      { section: 'Administration', items: [
        { id: 'users', icon: icons.userIcon, label: 'User Accounts', badge: '3' },
        { id: 'groups', icon: icons.groupIcon, label: 'Thesis Groups' },
        { id: 'semesters', icon: icons.calIcon, label: 'Semesters' },
        { id: 'boards', icon: icons.boardIcon, label: 'Examination Boards' },
        { id: 'board_assign_group', icon: icons.groupIcon, label: 'Board-Group Assignment' },
        { id: 'admin_eval_request', icon: icons.evalIcon, label: 'Re-evaluation Requests' },
      ]},
      { section: 'Monitoring', items: [
        { id: 'topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'progress', icon: icons.progressIcon, label: 'Progress Monitoring' },
        { id: 'documents', icon: icons.docIcon, label: 'Thesis Documents' },
      ]},
      
      { section: 'Reports & Records', items: [
        { id: 'reports', icon: icons.reportIcon, label: 'Reports & Exports' },
      ]},
      { section: 'Announcements', items: [
        { id: 'admin_notice', icon: icons.noticeIcon, label: 'Notices' },
      ]},
    ],
  },

  STUDENT: {
    label: 'Student',
    initials: 'SR',
    name: 'Safwan Rahman',
    org: 'IUBAT22103125 · Group 07',
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
      ]},
      { section: 'Thesis Activities', items: [
        { id: 'student_topic', icon: icons.topicIcon, label: 'Topic Submission' },
        { id: 'student_progress', icon: icons.progressIcon, label: 'Weekly Reports', badge: '2' },
        { id: 'student_documents', icon: icons.docIcon, label: 'Thesis Documents' },
        { id: 'student_meetings', icon: icons.meetingIcon, label: 'Supervision Meetings' },
        { id: 'student_assignment', icon: icons.assignIcon, label: 'Assignments' },
      ]},
      
      { section: 'Announcements', items: [
        { id: 'student_notice', icon: icons.noticeIcon, label: 'Notices' },
      ]},
      { section: 'Academic Results', items: [
        { id: 'student_evaluation', icon: icons.evalIcon, label: 'Marks & Grades' },
      ]},
      { section: 'Reports & Attendance', items: [
        { id: 'attendance_report', icon: icons.reportIcon, label: 'Attendance Report' },
      ]},
    ],
  },

  SUPERVISOR: {
    label: 'Supervisor',
    initials: 'PM',
    name: 'Prof. Masud Parvez',
    org: 'IUBAT · Thesis Supervisor',
    nav: [
      { section: 'Dashboard & Evaluation', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'supervisor_ex_dashboard', icon: icons.homeIcon, label: 'Evaluation Dashboard' },
      ]},
      { section: 'Thesis Supervision', items: [
        { id: 'supervisor_topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'supervisor_reports', icon: icons.progressIcon, label: 'Progress Reports', badge: '5' },
        { id: 'supervisor_docs', icon: icons.docIcon, label: 'Document Review' },
        { id: 'supervisor_meetings', icon: icons.meetingIcon, label: 'Supervision Meetings' },
        { id: 'supervisor_assignments', icon: icons.assignIcon, label: 'Assignments' },
      ]},
      { section: 'Thesis Examination', items: [
        { id: 'supervisor_ex_evaluate', icon: icons.evalIcon, label: 'Thesis Evaluation' },
        { id: 'supervisor_eval_edit', icon: icons.evalIcon, label: 'Evaluation Revisions' },
        { id: 'supervisor_eval_request', icon: icons.evalIcon, label: 'Re-evaluation Requests' },
      ]},
      { section: 'Announcements', items: [
        { id: 'supervisor_notice', icon: icons.noticeIcon, label: 'Notices' },
      ]},
      { section: 'Reports & Records', items: [
        { id: 'attendance_report', icon: icons.reportIcon, label: 'Attendance Report' },
        { id: 'supervisor_ex_reports', icon: icons.reportIcon, label: 'Evaluation Reports' },
      ]},
    ],
  },

  COORDINATOR: {
    label: 'Coordinator',
    initials: 'NK',
    name: 'Dr. Nasreen Karim',
    org: 'IUBAT · Thesis Coordinator',
    nav: [
      { section: 'Dashboard & Evaluation', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'coordinator_ex_dashboard', icon: icons.homeIcon, label: 'Evaluation Dashboard' },
      ]},
      { section: 'Thesis Coordination', items: [
        // { id: 'coordinator_groups', icon: icons.groupIcon, label: 'Thesis Groups' },
        { id: 'coordinator_reports', icon: icons.progressIcon, label: 'Progress Review' },
        { id: 'coordinator_ai', icon: icons.aiIcon, label: 'AI-Powered Summaries' },
        { id: 'coordinator_examiners', icon: icons.userIcon, label: 'Examiner Assignment' },
      ]},
      { section: 'Thesis Supervision', items: [
        { id: 'supervisor_topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'supervisor_reports', icon: icons.progressIcon, label: 'Progress Reports', badge: '5' },
        { id: 'supervisor_docs', icon: icons.docIcon, label: 'Document Review' },
        { id: 'supervisor_meetings', icon: icons.meetingIcon, label: 'Supervision Meetings' },
        { id: 'supervisor_assignments', icon: icons.assignIcon, label: 'Assignments' },
      ]},
      { section: 'Monitoring', items: [
        { id: 'topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'progress', icon: icons.progressIcon, label: 'Progress Monitoring' },
        { id: 'documents', icon: icons.docIcon, label: 'Thesis Documents' },
      ]},
      { section: 'Thesis Examination', items: [
        { id: 'coordinator_ex_evaluate', icon: icons.evalIcon, label: 'Thesis Evaluation' },
        { id: 'supervisor_eval_edit', icon: icons.evalIcon, label: 'Evaluation Revisions' },
        { id: 'supervisor_eval_request', icon: icons.evalIcon, label: 'Re-evaluation Requests' },
      ]},
      { section: 'Announcements', items: [
        { id: 'coordinator_notice', icon: icons.noticeIcon, label: 'Notices' },
      ]},
      { section: 'Reports & Records', items: [
        { id: 'coordinator_ex_reports', icon: icons.reportIcon, label: 'Evaluation Reports' },
      ]},
    ],
  },

  EXAMINER: {
    label: 'Examiner',
    initials: 'RH',
    name: 'Dr. Rafiq Hossain',
    org: 'IUBAT · External Examiner',
    nav: [
      { section: 'Examination', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'examiner_evaluate', icon: icons.evalIcon, label: 'Thesis Evaluation' },
        { id: 'examiner_reports', icon: icons.reportIcon, label: 'Evaluation Reports' },
      ]},
    ],
  },
};

export const getPageLabel = (roleKey, pageId) => {
  const roleData = roles[roleKey];
  if (!roleData) return 'Dashboard';

  for (const section of roleData.nav) {
    const foundItem = section.items.find((item) => item.id === pageId);
    if (foundItem) return foundItem.label;
  }

  return 'Dashboard';
};