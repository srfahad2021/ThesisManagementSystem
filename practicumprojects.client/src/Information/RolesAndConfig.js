import { icons } from './icons.jsx';

export const roles = {
  ADMIN: {
    label: 'Admin',
    initials: 'DA',
    name: 'Dr. Ahmed Reza',
    org: 'IUBAT · CSE Dept',
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'analytics', icon: icons.chartIcon, label: 'Analytics' },
      ]},
      { section: 'Management', items: [
        { id: 'users', icon: icons.userIcon, label: 'User Accounts', badge: '3' },
        { id: 'groups', icon: icons.groupIcon, label: 'Thesis Groups' },
        { id: 'semesters', icon: icons.calIcon, label: 'Semesters' },
      ]},
      { section: 'Academic', items: [
        { id: 'topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'progress', icon: icons.progressIcon, label: 'Weekly Progress' },
        { id: 'documents', icon: icons.docIcon, label: 'Documents' },
        { id: 'attendance', icon: icons.attendIcon, label: 'Attendance' },
      ]},
      { section: 'Reports', items: [
        { id: 'reports', icon: icons.reportIcon, label: 'Reports & Export' },
        { id: 'audit', icon: icons.auditIcon, label: 'Audit Logs' },
      ]},
      { section: 'CMS', items: [
        { id: 'cms', icon: icons.cmsIcon, label: 'Content Manager' },
      ]},
    ]
  },
  STUDENT: {
    label: 'Student',
    initials: 'SR',
    name: 'Safwan Rahman',
    org: 'IUBAT22103125 · Group 07',
    nav: [
      { section: 'My Thesis', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'student_topic', icon: icons.topicIcon, label: 'Topic Submission' },
        { id: 'student_progress', icon: icons.progressIcon, label: 'Weekly Reports', badge: '2' },
        { id: 'student_documents', icon: icons.docIcon, label: 'Documents' },
        { id: 'student_meetings', icon: icons.meetingIcon, label: 'Meetings' },
      ]},
      { section: 'Evaluation', items: [
        { id: 'student_evaluation', icon: icons.evalIcon, label: 'Evaluation' },
        { id: 'student_attendance', icon: icons.attendIcon, label: 'Attendance' },
      ]},
    ]
  },
  SUPERVISOR: {
    label: 'Supervisor',
    initials: 'PM',
    name: 'Prof. Masud Parvez',
    org: 'IUBAT · Supervisor',
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
      ]},
      { section: 'Supervision', items: [
        { id: 'supervisor_topics', icon: icons.topicIcon, label: 'Topic Review' },
        { id: 'supervisor_reports', icon: icons.progressIcon, label: 'Weekly Reports', badge: '5' },
        { id: 'supervisor_docs', icon: icons.docIcon, label: 'Document Review' },
        { id: 'supervisor_meetings', icon: icons.meetingIcon, label: 'Meetings' },
        { id: 'supervisor_assignments', icon: icons.assignIcon, label: 'Assignments' },
      ]},
    ]
  },
  COORDINATOR: {
    label: 'Coordinator',
    initials: 'NK',
    name: 'Dr. Nasreen Karim',
    org: 'IUBAT · Coordinator',
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
      ]},
      { section: 'Coordination', items: [
        { id: 'coordinator_groups', icon: icons.groupIcon, label: 'All Groups' },
        { id: 'coordinator_reports', icon: icons.progressIcon, label: 'Review Reports' },
        { id: 'coordinator_ai', icon: icons.aiIcon, label: 'AI Summaries' },
        { id: 'coordinator_examiners', icon: icons.userIcon, label: 'Assign Examiners' },
      ]},
    ]
  },
  EXAMINER: {
    label: 'Examiner',
    initials: 'RH',
    name: 'Dr. Rafiq Hossain',
    org: 'IUBAT · External Examiner',
    nav: [
      { section: 'Examination', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'examiner_evaluate', icon: icons.evalIcon, label: 'Evaluate Thesis' },
        { id: 'examiner_reports', icon: icons.reportIcon, label: 'Evaluation Reports' },
      ]},
    ]
  },
  SUPERADMIN: {
    label: 'Super Admin',
    initials: 'SA',
    name: 'System Admin',
    org: 'Platform Administration',
    nav: [
      { section: 'Platform', items: [
        { id: 'dashboard', icon: icons.homeIcon, label: 'Dashboard' },
        { id: 'sa_universities', icon: icons.univIcon, label: 'Universities' },
        { id: 'sa_ai', icon: icons.aiIcon, label: 'AI Settings' },
        { id: 'sa_subscriptions', icon: icons.reportIcon, label: 'Subscriptions' },
        { id: 'sa_analytics', icon: icons.chartIcon, label: 'System Analytics' },
      ]},
      { section: 'CMS', items: [
        { id: 'sa_cms', icon: icons.cmsIcon, label: 'Homepage CMS' },
      ]},
    ]
  }
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