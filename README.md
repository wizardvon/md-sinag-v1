# Project SINAG

Project SINAG means **School Integrated Network for Analytics and Governance**. This Version 1 build is a static HTML, CSS, and JavaScript Progressive Web App for school governance monitoring, role-based workflows, analytics, and printable/exportable reports.

## Features

- Firebase Authentication with pending account approval
- Principal-managed user approval and role assignment
- Role-based dashboards for Principal, Master Teacher, Head Teacher, Teacher, Registrar, Administrative Officer, and Administrative Assistant
- Report Assignment Module
- Learner Monitoring Module
- Classroom Observation Scheduling Module
- Enrollment and student registry with SF1 import and learner status tracking
- Link-based Document Repository
- Financial Report module with manual records, Excel/CSV import preview, summaries, filters, exports, and print-ready reporting
- Centralized DLL request workflow with request-based teacher submissions, workload compliance, reviews, notifications, audit logs, and legacy DLL visibility
- Notifications and recent activity feed
- Dashboard cards connected to Firestore data where the role has access
- Dashboard Most Urgent Task card with monthly task/activity calendar
- PPA Monitoring and Evaluation for DepEd mandated Access, Quality, and Governance PPAs
- Visual summaries for report status, learner risk, concern type, enrollment, observations, transfers/dropouts, and documents
- CSV export, basic Excel-compatible `.xls` export, and print/PDF-friendly layouts
- Responsive PWA layout with manifest and service worker

## Roles

- **Principal**: approves users, monitors school-wide analytics, reports, learner risk, observations, enrollment, and documents.
- **Master Teacher / Head Teacher**: assigns and reviews reports, monitors learner records, and manages observation schedules.
- **Teacher**: submits assigned reports, monitors own learner-at-risk records, and views scheduled observations.
- **Registrar**: manages enrollment, transfer, dropout, and class profile records.
- **Administrative Officer**: monitors assigned governance/operations reports and visible operations documents.
- **Administrative Assistant**: manages document repository records and visible compliance records.

## Firebase Setup

1. Create a Firebase project at <https://console.firebase.google.com/>.
2. Add a Web App to the Firebase project.
3. Enable **Authentication > Email/Password**.
4. Create a Firestore Database.
5. Put the Firebase web app configuration in `firebase-config.js`.
6. Copy `firestore.rules` into **Firestore Database > Rules** and publish.
7. Add the deployed domain to Firebase Authentication authorized domains.

`firebase-config.js` is committed for this static GitHub Pages deployment because the browser imports it directly. Firebase web config is not a server secret; keep private values in `.env` or `.env.local`, and protect data with Firebase Authentication, Firestore rules, and authorized domains.

The first Principal account must be approved manually in Firestore:

```js
role: "Principal"
status: "approved"
```

If the Principal login shows `auth/invalid-credential`, Firebase Authentication rejected the email/password before Firestore rules or role checks ran. In Firebase Console, confirm the Principal email exists under **Authentication > Users**, is not disabled, and reset the password if needed. Then confirm the matching `users/{uid}` Firestore document uses the same Auth UID and has `role: "Principal"` and `status: "approved"`.

## Firestore Collections

- `users`
- `reportAssignments`
- `learnerMonitoring`
- `classroomObservations`
- `enrollmentRecords`
- `transferRecords`
- `dropoutRecords`
- `classProfiles`
- `documents`
- `financialReports`
- `ppaMonitoring`
- `classes`
- `students`
- `teacherWorkloads`
- `gradeSubmissions`
- `dllRequests`
- `lessonPlans`
- `notifications`
- `auditLogs`

### DLL Requests and Lesson Plans

The `dllRequests` collection is the source of current DLL requirements. A Principal, Master Teacher, or Head Teacher creates one request for a school year, term, and week; the request automatically applies to every matching teaching workload. Request documents use these fields:

- `title`, `schoolYear`, `term`, `weekLabel`
- `weekStart`, `weekEnd`, `dueDate`, `instructions`, `status`
- `createdByUid`, `createdByName`, `createdByRole`, `createdAt`, `updatedAt`

New `lessonPlans` documents include `requestId` and use one deterministic record per `requestId + workloadId + teacherId`. Soft copies use HTTP/HTTPS share links only. Hard copies store the required receiving person or office in `submittedTo`. Request-linked submissions preserve the existing `Submitted`, `Noted`, `Confirmed`, and `Returned for Revision` review workflow.

Lesson-plan documents without `requestId` are treated as legacy records. They remain visible in the Lesson Plans module but do not affect current compliance, dashboard counters, urgent tasks, or DLL exports. The legacy `systemSettings/taskVisibility.lessonPlanWeeks` field may remain in Firestore, but the application no longer uses it to create DLL requirements.

## Local Development

Run the static app from a local server because it uses JavaScript modules and a service worker:

```bash
npm run dev
```

The server starts at `http://localhost:8000/` and prints that URL in the terminal. Keep the terminal open while testing. If SINAG is already running on port 8000, the command reports the existing URL instead of starting a duplicate server. If another application owns the port, choose a different one:

```bash
npm run dev -- --port 5173
```

On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd run dev`.

Then open the URL printed in the terminal:

```text
http://localhost:8000/
```

## GitHub Pages Deployment

1. Commit the project files.
2. In GitHub, open **Settings > Pages**.
3. Deploy from the main branch root folder.
4. Confirm the app opens from the repository subfolder URL.
5. Confirm Firebase Authentication authorized domains include the GitHub Pages domain.
6. After each release, hard refresh once so the new service worker cache is installed.

For the DLL request release, deploy the updated `firestore.rules` before testing request creation or request-linked submissions, then deploy the static hosting files so clients receive the new service-worker cache.

The app uses relative paths for `index.html`, `app.js`, `styles.css`, `manifest.json`, `firebase-config.js`, and `service-worker.js`, so it is suitable for GitHub Pages subfolder deployment.

## Testing Checklist

- Login, registration, logout, pending approval, and approved role routing
- Principal user approval flow
- Sidebar navigation per role
- Dashboard counters and dashboard analytics
- Most Urgent Task card and monthly calendar navigation
- PPA Monitoring table, checklist indicators, MOV links, exports, print report, and dashboard counters
- Financial Report add/edit/delete, Excel/CSV import preview, status workflow, filters, summary cards, exports, and print report
- Filters, empty states, loading states, and mobile table scrolling
- CSV export, Excel export, print, and browser Save as PDF
- Soft-copy/report/document URL validation
- Required fields and duplicate-submit prevention
- Principal, Master Teacher, and Head Teacher DLL request creation and request management
- Request-linked DLL submission for teacher workloads, including multi-role Master/Head Teachers
- Soft-copy link and hard-copy `submittedTo` validation
- Closed-request submission blocking and returned-for-revision resubmission
- Request-based DLL compliance, dashboard counters, urgent tasks, and legacy record isolation
- Firestore Rules authorization tests for request ownership, workload ownership, active-request enforcement, and reviewer-only updates
- Notification dropdown on desktop and mobile
- PWA manifest and service worker refresh after deployment

## Version 1 Limitations

- Document Repository uses links only.
- Direct Firebase Storage file uploads are reserved for a later phase.
- Advanced AI features are not included.
- SMS features are not included.
- Parent portal is not included.
- Excel export uses a basic Excel-compatible `.xls` table fallback; no external spreadsheet library is bundled yet.
