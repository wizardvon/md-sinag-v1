// Application constants - extracted from app.js for better organization

// User roles
export const roles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];

// Collections that can be reset
export const resettableCollections = [
  "reportAssignments",
  "learnerMonitoring",
  "classroomObservations",
  "enrollmentRecords",
  "transferRecords",
  "dropoutRecords",
  "classProfiles",
  "documents",
  "ppaMonitoring",
  "classes",
  "students",
  "studentAttendance",
  "teacherAttendance",
  "calendarEvents",
  "schoolSubjects",
  "teacherWorkloads",
  "ancillaryAssignments",
  "gradeSubmissions",
  "lessonPlans",
  "systemSettings",
  "inventoryFacilities",
  "financialReports",
  "assessments",
  "auditLogs",
  "notifications",
];

// Report Assignment constants
export const reportAssignmentTypes = [
  "DLL / Lesson Plan",
  "Exam / Test Questions",
  "Table of Specifications (TOS)",
  "Accomplishment Report",
  "Intervention Report",
  "DRRM Report",
  "IPCRF Submission",
  "201 Files Submission",
  "LAC Report",
  "Research Report",
  "Brigada Eskwela Report",
  "SIP / AIP Report",
  "Compliance Report",
  "Memorandum Compliance",
  "Training / Seminar Report",
  "School Forms Submission",
  "Ancillary Assignment Report",
  "Other",
];

export const reportAssignmentStatuses = [
  "Assigned",
  "Submitted",
  "Received",
  "Checked",
  "Returned for Revision",
  "Approved",
  "Late",
  "Not Submitted",
];

export const submissionTypes = ["Hard Copy", "Soft Copy"];
export const assignmentCreatorRoles = ["Principal", "Master Teacher", "Head Teacher"];
export const complianceRoles = [
  "Teacher",
  "Master Teacher",
  "Head Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];
export const reviewerStatuses = [
  "Received",
  "Checked",
  "Returned for Revision",
  "Approved",
  "Late",
  "Not Submitted",
];

// Learner Monitoring constants
export const learnerConcernTypes = [
  "Academic Performance",
  "Attendance",
  "Reading",
  "Numeracy",
  "Behavior",
  "Violence Incident",
  "Incomplete Requirements",
  "Health/Welfare",
  "Parent Communication",
  "Home Visitation",
  "Dropout Risk",
  "Transfer Concern",
  "Other",
];

export const learnerRiskLevels = ["Stable", "Needs Monitoring", "High Risk"];
export const learnerInterventionStatuses = [
  "Not Started",
  "Ongoing",
  "Improved",
  "Referred",
  "Resolved",
  "Unresolved",
];
export const learnerStatuses = [
  "Active Monitoring",
  "For Intervention",
  "Under Intervention",
  "Resolved",
  "Referred",
  "Closed",
];
export const learnerCreatorRoles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Administrative Assistant",
];
export const learnerMonitorRoles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];
export const registrarConcernTypes = ["Dropout Risk", "Transfer Concern", "Incomplete Requirements", "Other"];
export const administrativeOfficerConcernTypes = ["Attendance", "Health/Welfare", "Violence Incident", "Behavior"];

// Classroom Observation constants
export const observationTypes = [
  "Formal Observation",
  "Informal Observation",
  "Coaching/Mentoring",
  "Follow-up Observation",
  "Other",
];
export const observationStatuses = ["Scheduled", "Confirmed", "Completed", "Rescheduled", "Cancelled"];
export const observationCreatorRoles = ["Principal", "Master Teacher", "Head Teacher"];
export const observationRoles = ["Principal", "Master Teacher", "Head Teacher", "Teacher"];

// Enrollment constants
export const enrollmentStatuses = ["Enrolled", "Dropout", "Transferred Out", "Transferred In", "Completed", "Archived"];
export const transferTypes = ["Transfer In", "Transfer Out"];
export const dropoutRiskLevels = ["Low", "Moderate", "High"];
export const dropoutStatuses = ["At Risk", "Under Monitoring", "Returned", "Confirmed Dropout", "Resolved"];
export const enrollmentViews = [
  { id: "enrollment", label: "Enrollment Records" },
];
export const enrollmentMonitorRoles = ["Principal", "Master Teacher", "Head Teacher", "Teacher", "Registrar"];

// Document Repository constants
export const documentCategories = [
  "Memoranda",
  "Templates",
  "Reports",
  "Certificates",
  "MOVs",
  "School Forms",
  "Classroom Observation Reports",
  "Instructional Materials",
  "Governance Documents",
  "Financial Documents",
  "Enrollment Documents",
  "Other",
];
export const documentViews = [
  { id: "all", label: "All Documents", category: "" },
  { id: "memoranda", label: "Memoranda", category: "Memoranda" },
  { id: "templates", label: "Templates", category: "Templates" },
  { id: "reports", label: "Reports", category: "Reports" },
  { id: "certificates", label: "Certificates", category: "Certificates" },
  { id: "movs", label: "MOVs", category: "MOVs" },
];
export const documentRoles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];

// PPA Monitoring constants
export const ppaCategories = ["Access", "Quality", "Governance"];
export const ppaStatuses = [
  "Not Started",
  "Ongoing",
  "Completed",
  "For Improvement",
  "Needs Technical Assistance",
];
export const ppaQuarters = ["1st Term", "2nd Term", "3rd Term"];
export const ppaRoles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];
// Academic Management constants
export const academicManagerRoles = ["Principal", "Registrar"];
export const academicViewerRoles = ["Principal", "Master Teacher", "Head Teacher", "Registrar"];
export const academicMonitorRoles = ["Principal", "Master Teacher", "Head Teacher", "Registrar", "Teacher"];
export const teacherAttendanceViewerRoles = ["Principal", "Registrar", "Administrative Officer", "Administrative Assistant"];
export const teacherWorkloadRoles = ["Principal", "Master Teacher", "Head Teacher", "Teacher"];
export const gradeSubmissionRoles = ["Principal", "Master Teacher", "Head Teacher", "Teacher"];
export const lessonPlanRoles = ["Principal", "Master Teacher", "Head Teacher", "Teacher"];
export const inventoryFacilityRoles = ["Principal", "Head Teacher", "Administrative Assistant"];
export const inventoryFacilityManagerRoles = ["Principal", "Administrative Assistant"];
export const attendanceStatuses = ["Present", "Absent", "Late", "Excused"];
export const teacherAttendanceStatuses = ["Present", "Absent", "Late", "On Leave"];
export const calendarEventCategories = [
  "Class Schedule",
  "Meeting",
  "School Activity",
  "Deadline",
  "Observation",
  "Intervention",
  "Personal Task",
  "Other",
];
export const calendarEventVisibilities = ["Visible to Supervisors", "Private"];
export const calendarEventStatuses = ["Scheduled", "Completed", "Cancelled"];
export const ancillaryDutyOptions = [
  "ICT Coordinator",
  "Research Coordinator",
  "Reading Coordinator",
  "Numeracy Coordinator",
  "School Paper Adviser",
  "YES-O Adviser",
  "BKD Adviser",
  "Clinic Coordinator",
  "Library Coordinator",
  "Lab Custodian",
  "Registrar Support",
  "Others",
];
export const inventoryCategories = [
  "Classroom Furniture",
  "ICT Equipment",
  "Learning Materials",
  "Laboratory Equipment",
  "Sports Equipment",
  "Clinic Supplies",
  "Library Resources",
  "Office Equipment",
  "Facilities",
  "Other",
];
export const inventoryConditions = ["New", "Good", "Fair", "Needs Repair", "Unserviceable", "Missing"];
export const inventoryStatuses = ["Available", "In Use", "For Repair", "Condemned", "Lost", "Disposed"];
export const financialReportTypes = ["MOOE Utilization", "Project Expense", "Procurement", "Donation", "Maintenance", "Other"];
export const financialQuarters = ["Q1", "Q2", "Q3", "Q4"];
export const financialFundSources = ["MOOE", "Donation", "LGU", "PTA", "Other"];
export const financialCategories = ["Supplies", "Equipment", "Repairs", "Utilities", "Training", "Program Expense", "Other"];
export const financialStatuses = ["Draft", "Submitted", "Reviewed", "Approved"];
export const financialReportRoles = [
  "Principal",
  "Master Teacher",
  "Head Teacher",
  "Teacher",
  "Registrar",
  "Administrative Officer",
  "Administrative Assistant",
];
export const financialReportManagerRoles = ["Principal", "Administrative Officer", "Administrative Assistant"];
export const financialReportReviewerRoles = ["Principal", "Master Teacher", "Head Teacher"];
export const studentStatuses = ["Enrolled", "Dropout", "Transferred Out", "Transferred In", "Completed", "Archived"];
export const classStatuses = ["active", "archived"];
export const gradeLevels = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];
export const termOptions = ["Term 1", "Term 2", "Term 3"];
export const assessmentScoreTypes = [
  { value: "pre", label: "Diagnostic Test" },
  { value: "post", label: "Term Exam" },
];

// PPA Checklist Indicators
export const ppaChecklistIndicators = [
  "1. Provides evidence on the implementation of programs, projects, and activities.",
  "1.1 Provides clear action plan.",
  "1.2 Has concurrent time with actual and planned activities.",
  "1.3 Has accomplishment report.",
  "2. Provides constant feedback in achieving school goals.",
  "2.1 Stakeholders collaborate with the program, project, or activity.",
  "2.2 Stakeholders benefit from the program, project, or activity.",
  "3. Identifies project development or areas for improvement.",
  "3.1 Identifies milestones or bottlenecks.",
  "3.2 Celebrates milestones or solves bottlenecks.",
  "4. Addresses gaps and issues in the progress of the PPA.",
  "4.1 The PPA meets its objective.",
  "5. Monitors the effectiveness of the PPA implemented.",
  "5.1 Provides significant effect to the recipients.",
  "6. Encompasses DepEd mandate to achieve desired outcome and quality education.",
  "6.1 Supports the school SIP and BE-LCP.",
  "7. Provides guidelines for future plan.",
  "7.1 Provides next steps of the PPA.",
];

// Dashboard configurations
export const dashboardByRole = {
  Principal: "principalDashboard",
  "Master Teacher": "masterTeacherDashboard",
  "Head Teacher": "headTeacherDashboard",
  Teacher: "teacherDashboard",
  Registrar: "registrarDashboard",
  "Administrative Officer": "administrativeOfficerDashboard",
  "Administrative Assistant": "administrativeAssistantDashboard",
};

// Module access by role
export const modulesByRole = {
  Principal: [
    "Dashboard",
    "School Setup",
    "Enrollment",
    "Student Attendance",
    "Teacher Attendance",
    "Classroom Observation",
    "Learner Monitoring",
    "Diagnostic Test & Exam",
    "Grade Submission Tracker",
    "Lesson Plans",
    "Teacher Workload",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Inventory & Facilities",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
  "Master Teacher": [
    "Dashboard",
    "Enrollment",
    "Student Attendance",
    "Teacher Attendance",
    "Classroom Observation",
    "Learner Monitoring",
    "Diagnostic Test & Exam",
    "Grade Submission Tracker",
    "Lesson Plans",
    "Classes / Sections",
    "Teacher Workload",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
  "Head Teacher": [
    "Dashboard",
    "Enrollment",
    "Student Attendance",
    "Teacher Attendance",
    "Classroom Observation",
    "Learner Monitoring",
    "Diagnostic Test & Exam",
    "Grade Submission Tracker",
    "Lesson Plans",
    "Classes / Sections",
    "Teacher Workload",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Inventory & Facilities",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
  Teacher: [
    "Dashboard",
    "Enrollment",
    "Student Attendance",
    "Learner Monitoring",
    "Diagnostic Test & Exam",
    "Grade Submission Tracker",
    "Lesson Plans",
    "Classes / Sections",
    "Teacher Workload",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Document Repository",
    "Settings",
  ],
  Registrar: [
    "Dashboard",
    "School Setup",
    "Enrollment",
    "Student Attendance",
    "Teacher Attendance",
    "Learner Monitoring",
    "Diagnostic Test & Exam",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
  "Administrative Officer": [
    "Dashboard",
    "Teacher Attendance",
    "Learner Monitoring",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
  "Administrative Assistant": [
    "Dashboard",
    "Teacher Attendance",
    "Learner Monitoring",
    "Report Assignment",
    "Financial Report",
    "PPA Monitoring and Evaluation",
    "Inventory & Facilities",
    "Document Repository",
    "Downloadable Reports",
    "Settings",
  ],
};

// Dashboard cards configuration
export const dashboardCards = {
  principalDashboard: [
    ["Users & Approvals", "0/0", "Total accounts / pending approval"],
    ["Classes & Students", "0/0", "Active sections / active learners"],
    ["Student Attendance", "0%", "Present or late records"],
    ["Teacher Attendance", "0%/0", "Current teacher attendance / absences"],
    ["Academic Performance", "0%/0%", "Diagnostic / exam MPS"],
    ["Grade Submission", "0%/0%", "Submitted / pending grades"],
    ["Lesson Plans", "0/0", "Submitted / pending DLLs"],
    ["Report Assignment", "0/0", "Total assignments / pending compliance"],
    ["Financial Report", "0/0", "Spent / pending reports"],
    ["Learner Monitoring", "0/0", "Active / high risk cases"],
    ["Enrollment & Mobility", "0/0/0", "Enrolled / transfer out / dropout"],
    ["Classroom Observation", "0/0", "Pending / completed observations"],
    ["Teacher Workload", "0/0", "Overloaded / underloaded teachers"],
    ["PPA Monitoring", "0/0", "Total PPAs / needing TA"],
    ["Inventory & Facilities", "0/0", "Tracked / action-needed items"],
    ["Document Repository", "0/0", "Visible files / recent uploads"],
  ],
  masterTeacherDashboard: [
    ["Report Assignment", "0/0", "Assigned / for review reports"],
    ["Financial Report", "0/0", "Reviewed / submitted reports"],
    ["Classes & Students", "0/0", "Visible sections / learners"],
    ["Student Attendance", "0%", "Visible attendance"],
    ["Academic Performance", "0%/0%", "Diagnostic / exam MPS"],
    ["Grade Submission", "0%/0%", "Submitted / pending grades"],
    ["Lesson Plans", "0/0", "Submitted / pending DLLs"],
    ["Learner Monitoring", "0/0", "Active / high risk cases"],
    ["Classroom Observation", "0/0", "Pending / completed observations"],
    ["Enrollment & Mobility", "0/0/0", "Enrollment and learner movement"],
    ["Teacher Workload", "0/0", "Overloaded / underloaded teachers"],
    ["PPA Monitoring", "0/0", "Total PPAs / needing TA"],
    ["Document Repository", "0/0", "Instructional and observation files"],
  ],
  headTeacherDashboard: [
    ["Report Assignment", "0/0", "Assigned / for review reports"],
    ["Financial Report", "0/0", "Reviewed / submitted reports"],
    ["Classes & Students", "0/0", "Visible sections / learners"],
    ["Student Attendance", "0%", "Visible attendance"],
    ["Academic Performance", "0%/0%", "Diagnostic / exam MPS"],
    ["Grade Submission", "0%/0%", "Submitted / pending grades"],
    ["Lesson Plans", "0/0", "Submitted / pending DLLs"],
    ["Learner Monitoring", "0/0", "Active / high risk cases"],
    ["Classroom Observation", "0/0", "Pending / completed observations"],
    ["Enrollment & Mobility", "0/0/0", "Enrollment and learner movement"],
    ["Teacher Workload", "0/0", "Overloaded / underloaded teachers"],
    ["Inventory & Facilities", "0/0", "Tracked / action-needed items"],
    ["PPA Monitoring", "0/0", "Total PPAs / needing TA"],
    ["Document Repository", "0/0", "Instructional and observation files"],
  ],
  teacherDashboard: [
    ["My Report Assignment", "0/0", "Assigned / pending reports"],
    ["Financial Report", "0/0", "Visible / approved reports"],
    ["My Classes & Students", "0/0", "Advisory sections / learners"],
    ["My Attendance", "0%", "Assigned section attendance"],
    ["My Academic Performance", "0%/0%", "Diagnostic / exam MPS"],
    ["Grade Submission", "0%/0%", "Submitted / pending grades"],
    ["Lesson Plans", "0/0", "Submitted / pending DLLs"],
    ["My Learner Monitoring", "0/0", "Active / high risk cases"],
    ["My Classroom Observation", "0/0", "Pending / completed observations"],
    ["My Teacher Workload", "0", "Current workload score"],
    ["PPA Monitoring", "0/0", "Assigned or proponent PPAs"],
    ["Document Repository", "0/0", "Memoranda and templates"],
  ],
  registrarDashboard: [
    ["My Report Assignment", "0/0", "Assigned / pending reports"],
    ["Financial Report", "0/0", "Visible / approved reports"],
    ["Classes & Students", "0/0", "Active sections / learners"],
    ["Student Attendance", "0%", "School attendance records"],
    ["Academic Performance", "0%/0%", "Diagnostic / exam MPS"],
    ["Enrollment & Mobility", "0/0/0", "Enrolled / transfer out / dropout"],
    ["Learner Monitoring", "0/0", "Dropout and transfer concerns"],
  ],
  administrativeOfficerDashboard: [
    ["Report Assignment", "0/0", "Assigned / pending reports"],
    ["Financial Report", "0/0", "Spent / pending reports"],
    ["Teacher Attendance", "0%/0", "Current period / absences"],
    ["Learner Monitoring", "0/0", "Attendance and welfare concerns"],
    ["PPA Monitoring", "0/0", "Own PPAs / needing TA"],
    ["Document Repository", "0/0", "Operations documents"],
  ],
  administrativeAssistantDashboard: [
    ["My Report Assignment", "0/0", "Assigned / pending reports"],
    ["Financial Report", "0/0", "Spent / pending reports"],
    ["Inventory & Facilities", "0/0", "Tracked / action-needed items"],
    ["Document Repository", "0/0", "Visible files / recent uploads"],
    ["Learner Monitoring", "0/0", "Active learner cases"],
    ["Teacher Attendance", "0%/0", "Current period / absences"],
    ["PPA Monitoring", "0/0", "Own PPAs / needing TA"],
  ],
};
