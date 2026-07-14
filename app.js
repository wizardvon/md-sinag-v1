import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteField,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let firebaseConfig = null;

import {
  roles,
  resettableCollections,
  reportAssignmentTypes,
  reportAssignmentStatuses,
  submissionTypes,
  assignmentCreatorRoles,
  complianceRoles,
  reviewerStatuses,
  learnerConcernTypes,
  learnerRiskLevels,
  learnerInterventionStatuses,
  learnerStatuses,
  learnerCreatorRoles,
  learnerMonitorRoles,
  registrarConcernTypes,
  administrativeOfficerConcernTypes,
  observationTypes,
  observationStatuses,
  observationCreatorRoles,
  observationRoles,
  enrollmentStatuses,
  transferTypes,
  dropoutRiskLevels,
  dropoutStatuses,
  enrollmentViews,
  enrollmentMonitorRoles,
  documentCategories,
  documentViews,
  documentRoles,
  ppaCategories,
  ppaStatuses,
  ppaQuarters,
  ppaRoles,
  academicManagerRoles,
  academicViewerRoles,
  academicMonitorRoles,
  teacherAttendanceViewerRoles,
  teacherWorkloadRoles,
  gradeSubmissionRoles,
  lessonPlanRoles,
  inventoryFacilityRoles,
  inventoryFacilityManagerRoles,
  attendanceStatuses,
  teacherAttendanceStatuses,
  calendarEventCategories,
  calendarEventVisibilities,
  calendarEventStatuses,
  ancillaryDutyOptions,
  inventoryCategories,
  inventoryConditions,
  inventoryStatuses,
  financialReportTypes,
  financialQuarters,
  financialFundSources,
  financialCategories,
  financialStatuses,
  financialReportRoles,
  financialReportManagerRoles,
  financialReportReviewerRoles,
  studentStatuses,
  classStatuses,
  gradeLevels,
  termOptions,
  assessmentScoreTypes,
  ppaChecklistIndicators,
  dashboardByRole,
  modulesByRole,
  dashboardCards,
} from "./constants.js?v=20260524-2";

const els = {
  authView: document.querySelector("#authView"),
  pendingView: document.querySelector("#pendingView"),
  dashboardView: document.querySelector("#dashboardView"),
  authMessage: document.querySelector("#authMessage"),
  loginTab: document.querySelector("#loginTab"),
  registerTab: document.querySelector("#registerTab"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  forgotPasswordButton: document.querySelector("#forgotPasswordButton"),
  requestedRole: document.querySelector("#requestedRole"),
  approvalRole: document.querySelector("#approvalRole"),
  logoutButton: document.querySelector("#logoutButton"),
  pendingLogoutButton: document.querySelector("#pendingLogoutButton"),
  sidebar: document.querySelector("#sidebar"),
  sidebarNav: document.querySelector("#sidebarNav"),
  menuToggle: document.querySelector("#menuToggle"),
  globalSearch: document.querySelector("#globalSearch"),
  notificationBell: document.querySelector("#notificationBell"),
  notificationBadge: document.querySelector("#notificationBadge"),
  notificationDropdown: document.querySelector("#notificationDropdown"),
  notificationList: document.querySelector("#notificationList"),
  markAllNotificationsRead: document.querySelector("#markAllNotificationsRead"),
  userInitials: document.querySelector("#userInitials"),
  userFullName: document.querySelector("#userFullName"),
  userRoleName: document.querySelector("#userRoleName"),
  roleLabel: document.querySelector("#roleLabel"),
  dashboardTitle: document.querySelector("#dashboardTitle"),
  dashboardContent: document.querySelector("#dashboardContent"),
  approvalModal: document.querySelector("#approvalModal"),
  approvalForm: document.querySelector("#approvalForm"),
  approvalUserName: document.querySelector("#approvalUserName"),
  approvalMessage: document.querySelector("#approvalMessage"),
  closeApprovalModal: document.querySelector("#closeApprovalModal"),
  cancelApproval: document.querySelector("#cancelApproval"),
};

const WORKLOAD_RULES = {
  defaultCoreSubjectHours: 4,
  defaultElectiveHours: 2,
  advisoryClassHours: 5,
  extraPreparationPoint: 1,
  normalPreparationAllowance: 3,
  statusThresholds: [
    { max: 15.99, label: "Light Load", category: "Light" },
    { max: 30.99, label: "Normal Load", category: "Balanced" },
    { max: 40.99, label: "Heavy Load", category: "Heavy" },
    { max: Infinity, label: "Overloaded", category: "Critical" },
  ],
};

const DELETE_VERIFICATION_CODE = "lupinthestalker";
const gradeSubmissionStatusOptions = ["Not Started", "Draft", "Submitted", "Returned", "Approved"];
const gradeSubmissionCompliedStatuses = ["Submitted", "Approved"];

let auth;
let db;
let authProfileWriteInProgress = false;
let currentApprovalDocId = null;
let currentUserProfile = null;
let complianceRecordsCache = [];
let filteredComplianceRecords = [];
let filteredComplianceGroups = [];
const expandedComplianceGroups = new Set();
let assignableUsersCache = [];
let learnerRecordsCache = [];
let filteredLearnerRecords = [];
let editingLearnerId = null;
let observationRecordsCache = [];
let filteredObservationRecords = [];
let observationTeachersCache = [];
let editingObservationId = null;
let enrollmentRecordsCache = [];
let transferRecordsCache = [];
let dropoutRecordsCache = [];
let classProfilesCache = [];
let filteredEnrollmentModuleRecords = [];
let activeEnrollmentView = "enrollment";
let editingEnrollmentRecordId = null;
let documentRecordsCache = [];
let filteredDocumentRecords = [];
let activeDocumentView = "all";
let editingDocumentId = null;
let ppaRecordsCache = [];
let filteredPpaRecords = [];
let editingPpaId = null;
let classRecordsCache = [];
let filteredClassRecords = [];
let studentRecordsCache = [];
let filteredStudentRecords = [];
let studentAttendanceRecordsCache = [];
let filteredStudentAttendanceRecords = [];
const expandedStudentAttendanceSections = new Set();
let teacherAttendanceRecordsCache = [];
let filteredTeacherAttendanceRecords = [];
let schoolSubjectRecordsCache = [];
let teacherWorkloadRecordsCache = [];
let ancillaryAssignmentRecordsCache = [];
let teacherWorkloadSummariesCache = [];
let filteredTeacherWorkloadSummaries = [];
let gradeSubmissionRecordsCache = [];
let filteredGradeSubmissionRows = [];
let filteredGradeSubmissionGroups = [];
let editingGradeSubmissionId = null;
let editingGradeSubmissionRowKey = "";
let lessonPlanRecordsCache = [];
let filteredLessonPlans = [];
let taskVisibilitySettingsCache = null;
let inventoryFacilityRecordsCache = [];
let filteredInventoryFacilityRecords = [];
let financialReportRecordsCache = [];
let filteredFinancialReportRecords = [];
let editingFinancialReportId = null;
let pendingFinancialImportRows = [];
let downloadableReportRecordsCache = [];
let filteredDownloadableReportRows = [];
let activeDownloadableReportId = "";
let assessmentRecordsCache = [];
let filteredAssessmentRecords = [];
let filteredAssessmentGroups = [];
let academicTeachersCache = [];
let editingClassId = null;
let editingClassReturnModule = "Classes / Sections";
let editingSubjectId = null;
let editingStudentId = null;
let editingStudentAttendanceId = null;
let editingTeacherAttendanceId = null;
let editingAssessmentId = null;
let pendingSf1ImportRows = [];
let notificationRecordsCache = [];
let notificationUnsubscribers = [];
let settingsUsersCache = [];
let dashboardCalendarItemsCache = [];
let calendarPersonnelCache = [];
let calendarPersonalEventsCache = [];
let calendarAttendanceRecordsCache = [];
let calendarViewMonth = new Date().getMonth();
let calendarViewYear = new Date().getFullYear();
let selectedCalendarDate = todayIso();
let selectedCalendarOwnerUid = "";
let calendarViewMode = "month";
let calendarCategoryFilter = "";
let calendarAttendanceFilter = "";
let calendarSearchTerm = "";

async function loadFirebaseConfig() {
  const configCandidates = [
    "./firebase-config.js?v=20260523-2",
    "./firebase-config.js",
    "./firebase-config.example.js",
  ];

  for (const path of configCandidates) {
    try {
      const module = await import(path);
      if (module?.firebaseConfig) {
        firebaseConfig = module.firebaseConfig;
        return;
      }
    } catch (error) {
      // ignore missing fallback files until we find a valid config
    }
  }

  throw new Error("Firebase configuration file not found.");
}

function isFirebaseConfigured() {
  return (
    firebaseConfig &&
    !Object.values(firebaseConfig).some((value) => value.startsWith("YOUR_"))
  );
}

async function initializeFirebase() {
  try {
    await loadFirebaseConfig();
  } catch (error) {
    showAuthMessage(
      "Firebase configuration file is missing. Copy firebase-config.example.js to firebase-config.js and add your Firebase values.",
      true
    );
    return;
  }
  if (!isFirebaseConfigured()) {
    showAuthMessage(
      "Add your Firebase web app values in firebase-config.js before using login or registration.",
      true
    );
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, handleAuthState);
}

function populateRoleOptions() {
  const options = roles.map((role) => `<option value="${role}">${role}</option>`).join("");
  els.requestedRole.innerHTML = `<option value="">Select requested role</option>${options}`;
  els.approvalRole.innerHTML = roles
    .map((role) => `
      <label class="checkbox-row role-option-row">
        <input type="checkbox" name="approvalRoles" value="${escapeHtml(role)}" />
        <span>${escapeHtml(role)}</span>
      </label>
    `)
    .join("");
}

function normalizeRoleName(role = "") {
  const normalized = String(role).trim().toLowerCase();
  const aliases = {
    principal: "Principal",
    mt: "Master Teacher",
    "master teacher": "Master Teacher",
    ht: "Head Teacher",
    "head teacher": "Head Teacher",
    teacher: "Teacher",
    registrar: "Registrar",
    ao: "Administrative Officer",
    "admin officer": "Administrative Officer",
    "administrative officer": "Administrative Officer",
    aa: "Administrative Assistant",
    "admin assistant": "Administrative Assistant",
    "administrative assistant": "Administrative Assistant",
  };
  return aliases[normalized] || roles.find((knownRole) => knownRole.toLowerCase() === normalized) || "";
}

function normalizeRoleList(roleSource = currentUserProfile) {
  const source = roleSource && typeof roleSource === "object" && !Array.isArray(roleSource)
    ? [roleSource.roles, roleSource.role]
    : [roleSource];
  const rawRoles = source
    .flatMap((value) => Array.isArray(value) ? value : String(value || "").split(/\s*(?:,|\/|\+|&|-)\s*/))
    .map(normalizeRoleName)
    .filter(Boolean);
  return roles.filter((role) => rawRoles.includes(role));
}

function primaryRole(roleSource = currentUserProfile) {
  return normalizeRoleList(roleSource)[0] || "";
}

function formatRoleList(roleSource = currentUserProfile) {
  const roleList = normalizeRoleList(roleSource);
  return roleList.length ? roleList.join(" / ") : "User";
}

function hasRole(roleSource, role) {
  return normalizeRoleList(roleSource).includes(role);
}

function hasAnyRole(roleSource, roleList) {
  return normalizeRoleList(roleSource).some((role) => roleList.includes(role));
}

function getModulesForRoles(roleSource = currentUserProfile) {
  const moduleSet = new Set();
  normalizeRoleList(roleSource).forEach((role) => {
    (modulesByRole[role] || []).forEach((moduleName) => moduleSet.add(moduleName));
  });
  return [...moduleSet];
}

function getDashboardCardsForRoles(roleSource = currentUserProfile) {
  const cardMap = new Map();
  normalizeRoleList(roleSource).forEach((role) => {
    const dashboardId = dashboardByRole[role];
    (dashboardCards[dashboardId] || []).forEach((card) => {
      if (!cardMap.has(card[0])) cardMap.set(card[0], card);
    });
  });
  return [...cardMap.values()];
}

function showAuthMessage(message, isError = false) {
  els.authMessage.textContent = message;
  els.authMessage.classList.toggle("error", isError);
  els.authMessage.classList.remove("hidden");
}

function clearAuthMessage() {
  els.authMessage.textContent = "";
  els.authMessage.classList.add("hidden");
  els.authMessage.classList.remove("error");
}

function formatFirebaseAuthError(error) {
  const code = error?.code || "";
  const host = window.location.hostname || "this domain";
  const messages = {
    "auth/invalid-credential": "Login failed. Check the email and password, then try again. If this is the Principal account, confirm the account exists in Firebase Authentication and is not disabled.",
    "auth/wrong-password": "Login failed. Check the email and password, then try again. If this is the Principal account, use Forgot password to reset it.",
    "auth/user-not-found": "No account exists for that email address.",
    "auth/user-disabled": "This Firebase Auth account is disabled.",
    "auth/operation-not-allowed": "Email/Password sign-in is disabled in Firebase Authentication.",
    "auth/unauthorized-domain": `This domain (${host}) is not authorized in Firebase Authentication. Add it in Firebase Console > Authentication > Settings > Authorized domains.`,
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "The Firebase API key in firebase-config.js is not valid for this project.",
    "auth/network-request-failed": "Firebase could not be reached. Check your internet connection and try again.",
    "auth/too-many-requests": "Firebase temporarily blocked login attempts. Wait a few minutes, then try again.",
  };

  return messages[code] || error?.message || "Firebase login failed.";
}

function showDashboardMessage(message, isError = false) {
  let messageBox = document.querySelector("#dashboardMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "dashboardMessage";
    messageBox.className = "message dashboard-message";
    els.dashboardContent.prepend(messageBox);
  }

  messageBox.textContent = message;
  messageBox.classList.toggle("error", isError);
  messageBox.classList.remove("hidden");
}

function showAppUpdateMessage(message) {
  let messageBox = document.querySelector("#appUpdateMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "appUpdateMessage";
    messageBox.className = "message app-update-message";
    document.body.append(messageBox);
  }

  messageBox.textContent = message;
  messageBox.classList.remove("hidden");
}

function showView(viewName) {
  els.authView.classList.toggle("hidden", viewName !== "auth");
  els.pendingView.classList.toggle("hidden", viewName !== "pending");
  els.dashboardView.classList.toggle("hidden", viewName !== "dashboard");
}

function switchAuthTab(tabName) {
  const isLogin = tabName === "login";
  els.loginTab.classList.toggle("active", isLogin);
  els.registerTab.classList.toggle("active", !isLogin);
  els.loginForm.classList.toggle("hidden", !isLogin);
  els.registerForm.classList.toggle("hidden", isLogin);
  setProfileCompletionMode(false);
  clearAuthMessage();
}

function setProfileCompletionMode(isCompleting, user = null) {
  const emailInput = document.querySelector("#registerEmail");
  const passwordInput = document.querySelector("#registerPassword");
  const confirmPasswordInput = document.querySelector("#registerConfirmPassword");
  const registerButton = els.registerForm.querySelector("button[type='submit']");
  const helperText = els.registerForm.querySelector(".helper-text");

  els.registerForm.dataset.profileCompletion = isCompleting ? "true" : "false";
  if (emailInput) {
    emailInput.disabled = isCompleting;
    if (isCompleting && user?.email) emailInput.value = user.email;
  }
  [passwordInput, confirmPasswordInput].forEach((input) => {
    if (!input) return;
    input.disabled = isCompleting;
    input.required = !isCompleting;
    if (isCompleting) input.value = "";
  });
  if (registerButton) {
    registerButton.textContent = isCompleting ? "Submit profile for approval" : "Register";
  }
  if (helperText) {
    helperText.textContent = isCompleting
      ? "This authenticated account is missing its Firestore profile. Submit your details so the Principal can approve access."
      : "New accounts are created with pending status until approved by the Principal.";
  }
}

async function createPendingUserProfile(user, { fullName, requestedRole }) {
  const profile = {
    uid: user.uid,
    fullName,
    email: user.email,
    requestedRole,
    role: null,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", user.uid), profile);
  await createRoleNotification("Principal", {
    senderName: fullName,
    senderRole: requestedRole,
    notificationType: "pending_user_approval",
    title: "New user pending approval",
    message: `${fullName} requested access as ${requestedRole}.`,
    relatedModule: "Dashboard",
    relatedRecordId: user.uid,
    actionUrl: "#Dashboard",
  });

  return profile;
}

async function handleRegister(event) {
  event.preventDefault();
  if (!auth || !db) {
    showAuthMessage("Firebase is not configured yet.", true);
    return;
  }

  const fullName = document.querySelector("#registerFullName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim();
  const password = document.querySelector("#registerPassword").value;
  const confirmPassword = document.querySelector("#registerConfirmPassword").value;
  const requestedRole = els.requestedRole.value;
  const isCompletingProfile = els.registerForm.dataset.profileCompletion === "true";

  try {
    if (isCompletingProfile) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Sign in again before submitting your profile.");
      }
      const profile = await createPendingUserProfile(user, { fullName, requestedRole });
      currentUserProfile = profile;
      els.registerForm.reset();
      setProfileCompletionMode(false);
      stopNotificationListeners();
      showView("pending");
      return;
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please re-enter your password.");
    }

    authProfileWriteInProgress = true;
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Every new account starts pending and has no active role until approved.
    const profile = await createPendingUserProfile(credential.user, { fullName, requestedRole });

    currentUserProfile = profile;
    els.registerForm.reset();
    stopNotificationListeners();
    showView("pending");
  } catch (error) {
    showAuthMessage(formatFirebaseAuthError(error), true);
  } finally {
    authProfileWriteInProgress = false;
  }
}

async function handleForgotPassword() {
  if (!auth) {
    showAuthMessage("Firebase is not configured yet.", true);
    return;
  }

  const email = document.querySelector("#loginEmail").value.trim();
  if (!email) {
    showAuthMessage("Enter your email address first, then click Forgot password.", true);
    document.querySelector("#loginEmail")?.focus();
    return;
  }

  els.forgotPasswordButton.disabled = true;
  try {
    await sendPasswordResetEmail(auth, email);
    showAuthMessage(`Password reset email sent to ${email}.`);
  } catch (error) {
    showAuthMessage(formatFirebaseAuthError(error), true);
  } finally {
    els.forgotPasswordButton.disabled = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!auth) {
    showAuthMessage("Firebase is not configured yet.", true);
    return;
  }

  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    clearAuthMessage();
  } catch (error) {
    console.warn("Firebase login failed:", error);
    showAuthMessage(formatFirebaseAuthError(error), true);
  }
}

async function handleLogout() {
  if (auth) {
    await signOut(auth);
  }
  stopNotificationListeners();
  currentUserProfile = null;
  showView("auth");
}

async function handleAuthState(user) {
  if (authProfileWriteInProgress) {
    return;
  }

  if (!user) {
    stopNotificationListeners();
    currentUserProfile = null;
    showView("auth");
    return;
  }

  let userSnap;
  try {
    userSnap = await getDoc(doc(db, "users", user.uid));
  } catch (error) {
    console.warn("Unable to load user profile:", error);
    showAuthMessage("Signed in, but Firestore blocked your user profile. Check that the Principal user document exists and Firestore rules are deployed.", true);
    await signOut(auth);
    return;
  }
  if (!userSnap.exists()) {
    stopNotificationListeners();
    currentUserProfile = null;
    showView("auth");
    switchAuthTab("register");
    setProfileCompletionMode(true, user);
    showAuthMessage("This account exists in Firebase Authentication but is missing its Firestore user profile. Complete the form to submit it for Principal approval.", true);
    return;
  }

  currentUserProfile = userSnap.data();
  const activeRoles = normalizeRoleList(currentUserProfile);
  if (!currentUserProfile.role && activeRoles.length) {
    currentUserProfile.role = activeRoles[0];
  }
  if (!Array.isArray(currentUserProfile.roles) && activeRoles.length) {
    currentUserProfile.roles = activeRoles;
  }

  if (currentUserProfile.status === "pending") {
    stopNotificationListeners();
    showView("pending");
    return;
  }

  if (currentUserProfile.status === "approved" && activeRoles.length) {
    renderDashboard(currentUserProfile);
    startNotificationListeners();
    showView("dashboard");
    return;
  }

  showAuthMessage(
    `Your account is not ready yet. Expected status "approved" and at least one role, but found status "${currentUserProfile.status || "missing"}" and roles "${formatRoleList(currentUserProfile)}".`,
    true
  );
  await signOut(auth);
}

function renderDashboard(profile) {
  const dashboardId = dashboardByRole[primaryRole(profile)] || "teacherDashboard";
  const modules = getModulesForRoles(profile);
  const roleLabel = formatRoleList(profile);

  els.roleLabel.textContent = roleLabel;
  els.dashboardTitle.textContent = dashboardIdToTitle(dashboardId);
  updateTopbarProfile(profile);
  els.sidebarNav.innerHTML = modules
    .map(
      (module, index) =>
        `<button class="nav-button ${index === 0 ? "active" : ""}" type="button" data-module="${escapeAttribute(module)}"><span class="nav-icon" aria-hidden="true">${getModuleIcon(module)}</span><span>${escapeHtml(module)}</span></button>`
    )
    .join("");

  renderDashboardHome(dashboardId, profile);
}

function updateTopbarProfile(profile) {
  const displayName = profile?.fullName || auth?.currentUser?.email || "Project SINAG";
  if (els.userFullName) els.userFullName.textContent = displayName;
  if (els.userRoleName) els.userRoleName.textContent = formatRoleList(profile);
  if (els.userInitials) els.userInitials.textContent = getInitials(displayName);
}

function getInitials(value = "") {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PS";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}

function getModuleIcon(moduleName = "") {
  const normalized = moduleName.toLowerCase();
  if (normalized.includes("dashboard")) return "⌂";
  if (normalized.includes("setup") || normalized.includes("classes")) return "▦";
  if (normalized.includes("enrollment")) return "◉";
  if (normalized.includes("attendance")) return "✓";
  if (normalized.includes("observation")) return "◌";
  if (normalized.includes("learner")) return "◍";
  if (normalized.includes("diagnostic") || normalized.includes("grade")) return "▥";
  if (normalized.includes("lesson")) return "▤";
  if (normalized.includes("workload")) return "◇";
  if (normalized.includes("report")) return "▣";
  if (normalized.includes("financial")) return "₱";
  if (normalized.includes("ppa")) return "⬟";
  if (normalized.includes("inventory")) return "◫";
  if (normalized.includes("document")) return "▧";
  if (normalized.includes("settings")) return "⚙";
  return "•";
}

function dashboardIdToTitle(dashboardId) {
  return dashboardId
    .replace("Dashboard", " Dashboard")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function escapeHtml(value = "") {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function displayValue(value, fallback) {
  return value ? escapeHtml(value) : `<span class="missing-field">${fallback}</span>`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoDateOnly(value) {
  const [year, month, day] = String(value || todayIso()).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function dateToIsoOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function attendanceDateColumns(startDate) {
  return [startDate || todayIso()];
}

function shortDateLabel(value) {
  const date = parseIsoDateOnly(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isValidUrl(value = "") {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
}

function isGoogleDriveFolderUrl(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      && url.hostname === "drive.google.com"
      && url.pathname.includes("/folders/");
  } catch (error) {
    return false;
  }
}

const lessonPlanWeekOptions = termOptions.flatMap((term) =>
  Array.from({ length: 10 }, (_, index) => ({
    key: `${term}:Week ${index + 1}`,
    label: `${term} - Week ${index + 1}`,
    term,
    weekNumber: index + 1,
  }))
);

const assessmentScopeOptions = termOptions.flatMap((term) =>
  assessmentScoreTypes.map((scoreType) => ({
    key: `${term}:${scoreType.value}`,
    label: `${term} - ${scoreType.label}`,
    term,
    scoreType: scoreType.value,
  }))
);

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function buildExportMetadata(reportName, recordCount = 0) {
  const filters = [...document.querySelectorAll(".filter-grid input, .filter-grid select")]
    .map((field) => {
      const label = field.closest("label")?.childNodes?.[0]?.textContent?.trim() || field.id;
      return field.value ? `${label}: ${field.value}` : "";
    })
    .filter(Boolean)
    .join(" | ");

  return [
    ["Project SINAG"],
    ["School Integrated Network for Analytics and Governance"],
    [reportName],
    [`Generated date: ${new Date().toLocaleString()}`],
    [`Generated by: ${currentUserProfile?.fullName || "System"} (${currentUserProfile?.role || "User"})`],
    [`Active filters: ${filters || "None"}`],
    [`Record count: ${recordCount}`],
    [],
  ];
}

function downloadCsvReport({ filename, reportName, headers, rows }) {
  const metadata = buildExportMetadata(reportName, rows.length);
  const csv = [...metadata, headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

function downloadExcelReport({ filename, reportName, headers, rows }) {
  const metadata = buildExportMetadata(reportName, rows.length);
  const tableRows = [...metadata, headers, ...rows]
    .map(
      (row) =>
        `<tr>${row.map((value) => `<td>${escapeHtml(value ?? "")}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${tableRows}</table></body></html>`;
  downloadBlob(html, filename, "application/vnd.ms-excel;charset=utf-8");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatExportValue(value) {
  if (value?.toDate) return formatDate(value);
  if (Array.isArray(value)) return value.join(" / ");
  return value ?? "";
}

function formatPeso(value) {
  return `PHP ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toSafeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toDateOnly(value) {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function printCurrentReport(reportName) {
  document.body.dataset.printTitle = reportName;
  let header = document.querySelector("#activePrintHeader");
  if (!header) {
    header = document.createElement("section");
    header.id = "activePrintHeader";
    header.className = "print-report-header";
    els.dashboardContent.prepend(header);
  }
  header.innerHTML = `
    <p class="eyebrow">Project SINAG</p>
    <h2>${escapeHtml(reportName)}</h2>
    <p>Generated ${escapeHtml(new Date().toLocaleString())} by ${escapeHtml(currentUserProfile?.fullName || "User")} (${escapeHtml(currentUserProfile?.role || "User")})</p>
  `;
  window.print();
}

function showApprovalMessage(message, isError = false) {
  els.approvalMessage.textContent = message;
  els.approvalMessage.classList.toggle("error", isError);
  els.approvalMessage.classList.remove("hidden");
}

function clearApprovalMessage() {
  els.approvalMessage.textContent = "";
  els.approvalMessage.classList.add("hidden");
  els.approvalMessage.classList.remove("error");
}

function renderDashboardHome(dashboardId, role) {
  const cards = getDashboardCardsForRoles(role);
  const availableModules = getModulesForRoles(role);
  els.dashboardContent.innerHTML = `
    <section class="print-report-header dashboard-overview">
      <div>
        <p class="eyebrow">Project SINAG</p>
        <h2>${escapeHtml(dashboardIdToTitle(dashboardId))}</h2>
        <p>${escapeHtml(formatRoleList(role))} view for ${escapeHtml(currentUserProfile?.fullName || "User")}</p>
      </div>
      <div class="dashboard-stamp">
        <span>Updated</span>
        <strong>${escapeHtml(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</strong>
        <small>${escapeHtml(new Date().toLocaleDateString())}</small>
      </div>
    </section>
    <div class="dashboard-section-title">
      <div>
        <p class="eyebrow">At a glance</p>
        <h2>Priority modules</h2>
      </div>
      <p>Grouped by the module they open.</p>
    </div>
    <section class="card-grid">
      ${renderUrgentTaskCard(null)}
      ${cards
        .map(([label, value]) => renderDashboardStatCard(label, value, availableModules))
        .join("")}
    </section>
    <section id="dashboardAnalytics" class="chart-grid">
      <p class="empty-state">Loading dashboard analytics...</p>
    </section>
    <section class="table-card recent-activity-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Live feed</p>
          <h2>Recent Activity</h2>
        </div>
      </div>
      <div id="recentActivityList" class="activity-list">
        <p class="empty-state">Loading recent activity...</p>
      </div>
    </section>
  `;

  refreshComplianceCounters(role);
  refreshLearnerCounters(role);
  refreshObservationCounters(role);
  refreshEnrollmentCounters(role);
  refreshDocumentCounters(role);
  refreshInventoryFacilityCounters(role);
  refreshFinancialReportCounters(role);
  refreshPpaCounters(role);
  refreshUserCounters(role);
  refreshAcademicCounters(role);
  refreshTeacherAttendanceCounters(role);
  refreshTeacherWorkloadCounters(role);
  refreshGradeSubmissionCounters(role);
  refreshLessonPlanCounters(role);
  refreshDashboardAnalytics(role);
  refreshDashboardCalendar(role);
  renderRecentActivityPanel();
}

function renderDashboardStatCard(label, value, availableModules) {
  const moduleName = getDashboardCardModule(label, availableModules);
  const canOpenModule = moduleName && availableModules.includes(moduleName);
  const metricParts = getDashboardMetricParts(label, value);
  const cardTone = getDashboardCardTone(label, moduleName);
  return `
    <article
      class="stat-card stat-card-${cardTone} ${canOpenModule ? "dashboard-module-card" : ""}"
      data-card-label="${escapeHtml(label)}"
      ${canOpenModule ? `role="button" tabindex="0" data-module="${escapeHtml(moduleName)}" aria-label="Open ${escapeHtml(moduleName)}"` : ""}
    >
      <div class="stat-card-top">
        <div class="stat-card-label">
          <span class="stat-icon" aria-hidden="true">${getModuleIcon(moduleName || label)}</span>
          <span>${escapeHtml(label)}</span>
        </div>
      </div>
      <div class="stat-card-metrics">${renderDashboardMetricMarkup(label, value, metricParts)}</div>
    </article>
  `;
}

function renderDashboardMetricMarkup(label, value, metricParts = getDashboardMetricParts(label, value)) {
  if (metricParts.length > 1) {
    return `
      <div class="stat-metric-parts">
        ${metricParts.map((part) => `
          <div>
            <strong>${escapeHtml(part.value)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }
  return `<strong>${escapeHtml(value)}</strong>`;
}

function getDashboardCardTone(label = "", moduleName = "") {
  const normalized = `${label} ${moduleName}`.toLowerCase();
  if (/(learner|ppa|approved|completed|success)/.test(normalized)) return "green";
  if (/(urgent|pending|late|warning|workload|inventory|attendance)/.test(normalized)) return "amber";
  if (/(financial|document|grade|academic|diagnostic)/.test(normalized)) return "blue";
  return "navy";
}

function getDashboardMetricParts(label = "", value = "") {
  const normalized = label.toLowerCase();
  const parts = String(value).split("/").map((part) => part.trim()).filter(Boolean);
  const labelsByCard = [
    [/users & approvals/, ["Accounts", "Pending"]],
    [/classes & students|my classes & students/, ["Sections", "Learners"]],
    [/academic performance|my academic performance/, ["Diagnostic", "Exam"]],
    [/grade submission/, ["Submitted", "Pending"]],
    [/lesson plans/, ["Submitted", "Pending"]],
    [/report assignment|my report assignment/, ["Total", "Pending"]],
    [/learner monitoring|my learner monitoring/, ["Active", "High risk"]],
    [/enrollment & mobility/, ["Enrolled", "Transfer out", "Dropouts"]],
    [/classroom observation|my classroom observation/, ["Pending", "Completed"]],
    [/teacher workload/, ["Overloaded", "Light load"]],
    [/teacher attendance/, ["Rate", "Absent"]],
    [/ppa monitoring/, ["Total", "Needs TA"]],
    [/inventory & facilities/, ["Tracked", "Action needed"]],
    [/document repository/, ["Files", "Recent"]],
  ];
  const match = labelsByCard.find(([pattern]) => pattern.test(normalized));
  if (!match || parts.length < 2) return [];
  return parts.map((part, index) => ({
    value: part,
    label: match[1][index] || `Metric ${index + 1}`,
  }));
}

function getDashboardCardModule(label = "", availableModules = []) {
  const normalized = label.toLowerCase();
  if (/(report assignment|assigned reports|assigned report|pending compliance|pending submissions|submitted|approved reports|returned reports|late reports|compliance reports|governance\/operations reports)/.test(normalized)) {
    return "Report Assignment";
  }
  if (/(learner monitoring|learner|risk|intervention|incomplete requirements|dropout\/transfer concerns|dropout summary|transfer summary|dropout risk records|transfer concern records|class profile concerns|resolved cases|attendance concerns)/.test(normalized)) {
    return "Learner Monitoring";
  }
  if (/(classroom observation|observation|scheduled observation|completed observation|rescheduled observation|pending observation)/.test(normalized)) {
    return "Classroom Observation";
  }
  if (/(enrollment|mobility|transfer-in|transfer-out|dropout count|dropout trend|transfer trend|completion rate|retention|class profiles updated|school-wide enrollment|enrollment by grade)/.test(normalized)) {
    return "Enrollment";
  }
  if (/(classes & students|my classes & students|total classes|sections needing intervention)/.test(normalized)) {
    if (availableModules.includes("School Setup")) return "School Setup";
    return "Classes / Sections";
  }
  if (/total students/.test(normalized)) {
    return availableModules.includes("Enrollment") ? "Enrollment" : "Students";
  }
  if (/(student attendance|my attendance|attendance rate|attendance summary)/.test(normalized)) {
    return "Student Attendance";
  }
  if (/teacher attendance|leave monitoring/.test(normalized)) {
    return "Teacher Attendance";
  }
  if (/(teacher workload|teachers overloaded|teachers underloaded|ancillary assignments|my workload status)/.test(normalized)) {
    return "Teacher Workload";
  }
  if (/(grade submission|grades submitted|grades pending|subject grades)/.test(normalized)) {
    return "Grade Submission";
  }
  if (/(lesson plans|dll|lesson plan)/.test(normalized)) {
    return "Lesson Plans";
  }
  if (/(academic performance|diagnostic test|term exam|improvement percentage)/.test(normalized)) {
    return "Diagnostic Test & Exam";
  }
  if (/(document|memoranda|templates|reports count|certificates|mov repository|instructional materials|operations documents|recent uploads|pending updates|repository files)/.test(normalized)) {
    return "Document Repository";
  }
  if (/(inventory|facility|facilities|repair|missing inventory)/.test(normalized)) {
    return "Inventory & Facilities";
  }
  if (/(financial report|financial reports|spent|pending financial|approved financial|reviewed financial)/.test(normalized)) {
    return "Financial Report";
  }
  if (/(ppa|technical assistance|access ppas|quality ppas|governance ppas)/.test(normalized)) {
    return "PPA Monitoring and Evaluation";
  }
  if (/users & approvals/.test(normalized)) {
    return "Settings";
  }
  return "";
}

async function refreshDashboardCalendar(role) {
  const card = document.querySelector("#urgentTaskCard");
  if (!card || !db || !auth || !currentUserProfile) return;

  try {
    dashboardCalendarItemsCache = await getUserCalendarItems(currentUserProfile);
    const task = getMostUrgentTask(dashboardCalendarItemsCache);
    card.outerHTML = renderUrgentTaskCard(task);
  } catch (error) {
    console.warn("Unable to load calendar tasks:", error);
    card.outerHTML = renderUrgentTaskCard(null, "Unable to load urgent tasks right now.");
  }
}

async function getUserCalendarItems(user) {
  if (!user || !auth) return [];

  const canUseReports = hasRole(user, "Principal") || hasAnyRole(user, complianceRoles);
  const [reports, observations, learners, approvalItems, personalItems] = await Promise.all([
    canUseReports ? getVisibleReportAssignments() : Promise.resolve([]),
    hasAnyRole(user, observationRoles) ? getVisibleClassroomObservations() : Promise.resolve([]),
    hasAnyRole(user, learnerMonitorRoles) ? getVisibleLearnerRecords() : Promise.resolve([]),
    hasRole(user, "Principal") ? getPendingApprovalCalendarItems() : Promise.resolve([]),
    getCalendarEventsForUser(auth.currentUser.uid).catch(() => []),
  ]);

  const reportItems = reports
    .filter((record) => record.dueDate)
    .map((record) => ({
      id: `report-${record.id}`,
      recordId: record.id,
      type: "Report Assignment",
      typeClass: "report",
      title: record.title || "Report assignment",
      date: record.dueDate,
      status: record.status || "Assigned",
      assignedBy: record.assignedByName || "Not recorded",
      submitTo: record.assignedByName || "Not recorded",
      assignedTo: record.assignedToName || "Not recorded",
      description: record.description || formatReportAssignmentType(record.reportType) || "Report compliance task",
      module: "Report Assignment",
    }));

  const observationItems = observations
    .filter((record) => record.observationDate)
    .map((record) => ({
      id: `observation-${record.id}`,
      recordId: record.id,
      type: "Observation",
      typeClass: "observation",
      title: record.subject ? `${record.subject} Observation` : "Classroom observation",
      date: record.observationDate,
      time: record.observationTime || "",
      status: record.status || "Scheduled",
      assignedBy: record.observerName || record.createdByName || "Not recorded",
      submitTo: record.observerName || "Not recorded",
      assignedTo: record.teacherName || "Not recorded",
      description: `${record.teacherName || "Teacher"}${record.gradeLevel ? ` - ${record.gradeLevel}` : ""}${record.section ? ` ${record.section}` : ""}`,
      module: "Classroom Observation",
    }));

  const learnerItems = learners
    .filter((record) => record.interventionDate)
    .map((record) => ({
      id: `learner-${record.id}`,
      recordId: record.id,
      type: "Learner Intervention",
      typeClass: "learner",
      title: record.learnerName || "Learner intervention",
      date: record.interventionDate,
      status: record.interventionStatus || record.status || "Ongoing",
      assignedBy: record.createdByName || record.adviserName || "Not recorded",
      submitTo: record.adviserName || record.createdByName || "Not recorded",
      assignedTo: record.adviserName || "Not recorded",
      description: record.interventionProvided || record.concernType || "Learner monitoring activity",
      module: "Learner Monitoring",
    }));

  const notificationItems = notificationRecordsCache
    .filter((record) => !record.isRead && /urgent|late|overdue|approval/i.test(`${record.title || ""} ${record.message || ""}`))
    .map((record) => ({
      id: `notification-${record.id}`,
      recordId: record.relatedRecordId || record.id,
      type: "Notification",
      typeClass: "notification",
      title: record.title || "Urgent notification",
      date: toDateOnly(record.createdAt) || todayIso(),
      status: "Unread",
      assignedBy: record.senderName || "System",
      submitTo: user.fullName || "You",
      assignedTo: user.fullName || "You",
      description: record.message || "Unread urgent notification",
      module: record.relatedModule || "Dashboard",
    }));

  const scheduleItems = personalItems.map(calendarEventToItem);

  return [...scheduleItems, ...reportItems, ...observationItems, ...learnerItems, ...approvalItems, ...notificationItems]
    .filter((item) => item.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function getPendingApprovalCalendarItems() {
  const pendingQuery = query(collection(db, "users"), where("status", "==", "pending"));
  const snapshot = await getDocs(pendingQuery);
  return snapshot.docs.map((pendingDoc) => {
    const user = pendingDoc.data();
    return {
      id: `approval-${pendingDoc.id}`,
      recordId: pendingDoc.id,
      type: "User Approval",
      typeClass: "approval",
      title: `Approve ${user.fullName || user.email || "user"}`,
      date: toDateOnly(user.createdAt) || todayIso(),
      status: "Pending",
      assignedBy: user.fullName || user.email || "New user",
      submitTo: "Principal",
      assignedTo: "Principal",
      description: `Requested role: ${user.requestedRole || "Not recorded"}`,
      module: "Dashboard",
    };
  });
}

function getMostUrgentTask(calendarItems) {
  const actionable = calendarItems
    .filter((item) => item.date && !isCalendarItemClosed(item))
    .map((item) => ({
      ...item,
      daysFromToday: getDaysFromToday(item.date),
    }));

  if (!actionable.length) return null;

  return actionable.sort((a, b) => {
    const aOverdue = a.daysFromToday < 0 ? 0 : 1;
    const bOverdue = b.daysFromToday < 0 ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return a.daysFromToday - b.daysFromToday;
  })[0];
}

function renderUrgentTaskCard(task, message = "No urgent task at the moment.") {
  if (!task) {
    return `
      <article id="urgentTaskCard" class="stat-card urgent-task-card empty" role="button" tabindex="0">
        <span>Most Urgent Task</span>
        <strong>${escapeHtml(message)}</strong>
        <small>Open calendar</small>
      </article>
    `;
  }

  const urgency = getUrgencyLabel(task.date, task.status);
  return `
    <article id="urgentTaskCard" class="stat-card urgent-task-card ${urgency.className}" role="button" tabindex="0">
      <span>Most Urgent Task</span>
      <strong>${escapeHtml(task.title)}</strong>
      <small>${escapeHtml(formatDueDate(task.date))}</small>
      <div class="urgent-task-meta">
        <p><b>Submit to:</b> ${escapeHtml(task.submitTo || task.assignedBy || "Not recorded")}</p>
        <p><b>Assigned by:</b> ${escapeHtml(task.assignedBy || "Not recorded")}</p>
        <p><b>Status:</b> <em>${escapeHtml(task.status || "Pending")}</em></p>
        <p>${escapeHtml(task.description || "No description")}</p>
      </div>
      <small class="urgent-priority">${escapeHtml(urgency.label)}</small>
    </article>
  `;
}

async function openCalendarModal() {
  if (!document.querySelector("#calendarModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div id="calendarModal" class="modal-backdrop calendar-backdrop" role="dialog" aria-modal="true">
          <section class="modal calendar-modal">
            <div class="modal-header">
              <div>
                <p class="eyebrow">Dashboard calendar</p>
                <h2>Tasks and Activities</h2>
              </div>
              <button id="closeCalendarModal" class="icon-button" type="button" aria-label="Close">x</button>
            </div>
            <div id="calendarModalContent"></div>
          </section>
        </div>
      `
    );
  }

  const host = document.querySelector("#calendarModalContent");
  if (host) host.innerHTML = `<p class="empty-state">Loading calendar...</p>`;
  try {
    await loadCalendarModalData();
    renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems());
  } catch (error) {
    if (host) host.innerHTML = `<p class="empty-state">Unable to load calendar: ${escapeHtml(error.message)}</p>`;
  }
}

function renderCalendar(month, year, items) {
  calendarViewMonth = month;
  calendarViewYear = year;
  const host = document.querySelector("#calendarModalContent");
  if (!host) return;

  const displayItems = filterCalendarDisplayItems(items);
  const monthItems = filterCalendarItemsByMonth(displayItems, month, year);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(`<div class="calendar-cell muted"></div>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayItems = getTasksForDate(dateKey, displayItems);
    const attendance = getCalendarAttendanceForDate(dateKey);
    const absentClass = attendance.status === "Absent" ? " attendance-absent" : "";
    cells.push(`
      <button class="calendar-cell${absentClass} ${dateKey === selectedCalendarDate ? "selected" : ""} ${dateKey === todayIso() ? "today" : ""}" type="button" data-date="${dateKey}">
        <span>${day}</span>
        ${renderCalendarAttendanceBadge(attendance)}
        <div class="calendar-cell-items">
          ${dayItems.slice(0, 3).map(renderCalendarChip).join("")}
          ${dayItems.length > 3 ? `<small>+${dayItems.length - 3} more</small>` : ""}
        </div>
      </button>
    `);
  }

  host.innerHTML = `
    <div class="calendar-controls">
      <button id="calendarPrevMonth" class="secondary-button" type="button">Previous</button>
      <label>Month<select id="calendarMonthSelect">${monthNames().map((name, index) => `<option value="${index}" ${index === month ? "selected" : ""}>${name}</option>`).join("")}</select></label>
      <label>Year<select id="calendarYearSelect">${calendarYearOptions(year).map((itemYear) => `<option value="${itemYear}" ${itemYear === year ? "selected" : ""}>${itemYear}</option>`).join("")}</select></label>
      <button id="calendarToday" class="secondary-button" type="button">Today</button>
      <button id="calendarNextMonth" class="secondary-button" type="button">Next</button>
      <button id="newCalendarEventButton" class="primary-button" type="button">Add Schedule</button>
      ${canSelectCalendarOwner() ? `<label>View Calendar Of<select id="calendarOwnerSelect">${calendarPersonnelCache.map((person) => `<option value="${escapeHtml(person.uid || person.id)}" ${(person.uid || person.id) === selectedCalendarOwnerUid ? "selected" : ""}>${escapeHtml(person.fullName || person.email || person.uid || person.id)} (${escapeHtml(person.role || "Personnel")})</option>`).join("")}</select></label>` : ""}
    </div>
    <div class="calendar-controls calendar-filter-controls">
      <label>View<select id="calendarViewMode">
        <option value="month" ${calendarViewMode === "month" ? "selected" : ""}>Month View</option>
        <option value="agenda" ${calendarViewMode === "agenda" ? "selected" : ""}>Agenda/List View</option>
      </select></label>
      <label>Category<select id="calendarCategoryFilter">${optionList(calendarEventCategories, calendarCategoryFilter, "All categories")}</select></label>
      <label>Attendance<select id="calendarAttendanceFilter">${optionList(["Present", "Absent", "Late", "On Leave"], calendarAttendanceFilter, "All attendance")}</select></label>
      <label>Search<input id="calendarSearch" type="search" value="${escapeHtml(calendarSearchTerm)}" placeholder="Search schedule title" /></label>
    </div>
    <div class="calendar-month-summary">
      ${renderCalendarSummary(monthItems)}
    </div>
    ${calendarViewMode === "agenda" ? renderCalendarAgenda(monthItems) : `
      <div class="calendar-weekdays">
        ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">${cells.join("")}</div>
    `}
    <section class="calendar-day-panel">
      <h3>${escapeHtml(formatDueDate(selectedCalendarDate))}</h3>
      ${renderCalendarAttendanceDetail(selectedCalendarDate)}
      <div id="calendarDateTasks">
        ${renderCalendarDateTasks(selectedCalendarDate, displayItems)}
      </div>
    </section>
  `;
}

async function loadCalendarModalData() {
  if (!auth?.currentUser || !currentUserProfile) return;
  calendarPersonnelCache = await getCalendarPersonnelOptions();
  if (!selectedCalendarOwnerUid || !calendarPersonnelCache.some((person) => (person.uid || person.id) === selectedCalendarOwnerUid)) {
    selectedCalendarOwnerUid = auth.currentUser.uid;
  }
  await loadSelectedCalendarData();
}

async function loadSelectedCalendarData() {
  if (!selectedCalendarOwnerUid) return;
  const [events, attendance] = await Promise.all([
    getCalendarEventsForUser(selectedCalendarOwnerUid),
    getCalendarAttendanceForUser(selectedCalendarOwnerUid),
  ]);
  calendarPersonalEventsCache = events;
  calendarAttendanceRecordsCache = attendance;
}

function getCalendarDisplayItems() {
  const scheduleItems = calendarPersonalEventsCache.map(calendarEventToItem);
  if (selectedCalendarOwnerUid === auth.currentUser?.uid) {
    const existingScheduleIds = new Set(scheduleItems.map((item) => item.id));
    return [
      ...scheduleItems,
      ...dashboardCalendarItemsCache.filter((item) => !existingScheduleIds.has(item.id)),
    ];
  }
  return scheduleItems;
}

async function getCalendarEventsForUser(ownerUid) {
  if (!ownerUid || !db) return [];
  const snapshot = await getDocs(query(collection(db, "calendarEvents"), where("ownerUid", "==", ownerUid)));
  return snapshot.docs.map(normalizeRecord);
}

async function getCalendarAttendanceForUser(ownerUid) {
  if (!ownerUid || !db) return [];
  try {
    const snapshot = await getDocs(query(collection(db, "teacherAttendance"), where("teacherId", "==", ownerUid)));
    return snapshot.docs.map(normalizeRecord);
  } catch (error) {
    console.warn("Unable to load calendar attendance:", error);
    return [];
  }
}

async function getCalendarPersonnelOptions() {
  const self = {
    id: auth.currentUser.uid,
    uid: auth.currentUser.uid,
    fullName: currentUserProfile.fullName || auth.currentUser.email,
    email: currentUserProfile.email || auth.currentUser.email,
    role: formatRoleList(currentUserProfile),
    roles: normalizeRoleList(currentUserProfile),
  };
  if (!canSelectCalendarOwner()) return [self];

  const snapshot = await getDocs(query(collection(db, "users"), where("status", "==", "approved")));
  const users = snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }));
  const visibleUsers = users.filter(canViewCalendarUser).sort((a, b) => (a.fullName || a.email || "").localeCompare(b.fullName || b.email || ""));
  return [...new Map([self, ...visibleUsers].map((user) => [user.uid || user.id, user])).values()];
}

function canSelectCalendarOwner(role = currentUserProfile) {
  return hasAnyRole(role, ["Principal", "Admin", "SuperAdmin", "Master Teacher", "Head Teacher"]);
}

function canViewCalendarUser(user) {
  if (!user || (user.uid || user.id) === auth.currentUser?.uid) return true;
  if (hasAnyRole(currentUserProfile, ["Principal", "Admin", "SuperAdmin"])) return true;
  if (hasAnyRole(currentUserProfile, ["Master Teacher", "Head Teacher"])) return hasRole(user, "Teacher");
  return false;
}

function calendarEventToItem(record) {
  return {
    id: `schedule-${record.id}`,
    recordId: record.id,
    source: "calendarEvent",
    type: "Schedule",
    typeClass: "schedule",
    title: calendarEventDisplayValue(record, "title"),
    date: record.date,
    time: formatCalendarTimeRange(record),
    status: record.status || "Scheduled",
    category: record.category || "Other",
    location: calendarEventDisplayValue(record, "location"),
    assignedBy: record.createdByName || record.ownerName || "Not recorded",
    submitTo: record.ownerName || "Not recorded",
    assignedTo: record.ownerName || "Not recorded",
    ownerUid: record.ownerUid,
    ownerName: record.ownerName,
    createdByName: record.createdByName,
    description: calendarEventDisplayValue(record, "description"),
    visibility: record.visibility || "Visible to Supervisors",
    module: "Calendar",
    rawRecord: record,
  };
}

function canViewCalendarEventDetails(record) {
  return !record || record.visibility !== "Private" || record.ownerUid === auth.currentUser?.uid;
}

function calendarEventDisplayValue(record, field) {
  if (!canViewCalendarEventDetails(record)) return field === "title" ? "Busy" : "";
  return record[field] || (field === "title" ? "Untitled schedule" : "");
}

function isMaskedCalendarItem(item) {
  return item?.source === "calendarEvent"
    && item.rawRecord?.visibility === "Private"
    && item.ownerUid !== auth.currentUser?.uid;
}

function formatCalendarTimeRange(record) {
  const start = record.startTime || "";
  const end = record.endTime || "";
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

function filterCalendarDisplayItems(items) {
  return items.filter((item) => {
    const titleText = `${item.title || ""} ${item.description || ""}`.toLowerCase();
    const attendance = getCalendarAttendanceForDate(item.date);
    return (!calendarCategoryFilter || item.category === calendarCategoryFilter || item.type !== "Schedule")
      && (!calendarAttendanceFilter || attendance.status === calendarAttendanceFilter)
      && (!calendarSearchTerm || titleText.includes(calendarSearchTerm.toLowerCase()));
  });
}

function renderCalendarSummary(monthItems) {
  const owner = calendarPersonnelCache.find((person) => (person.uid || person.id) === selectedCalendarOwnerUid);
  const scheduleCount = monthItems.filter((item) => item.type === "Schedule").length;
  const absenceCount = calendarAttendanceRecordsCache.filter((record) => {
    const date = parseDateOnly(record.attendanceDate);
    return record.status === "Absent" && date && date.getMonth() === calendarViewMonth && date.getFullYear() === calendarViewYear;
  }).length;
  return `${owner?.fullName || owner?.email || "Selected personnel"}: ${scheduleCount} schedule${scheduleCount === 1 ? "" : "s"} this month, ${absenceCount} absence${absenceCount === 1 ? "" : "s"}`;
}

function filterCalendarItemsByMonth(items, month, year) {
  return items.filter((item) => {
    const date = parseDateOnly(item.date);
    return date && date.getMonth() === month && date.getFullYear() === year;
  });
}

function getTasksForDate(date, items) {
  return items.filter((item) => item.date === date).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

function getCalendarAttendanceForDate(date) {
  const record = calendarAttendanceRecordsCache.find((item) => item.attendanceDate === date);
  return {
    status: record?.status || "",
    remarks: record?.remarks || "",
    record,
  };
}

function calendarAttendanceClass(status = "") {
  return `attendance-${status.toLowerCase().replaceAll(" ", "-")}`;
}

function renderCalendarAttendanceBadge(attendance) {
  if (!attendance.status) return "";
  return `<small class="calendar-attendance-badge ${calendarAttendanceClass(attendance.status)}">Attendance: ${escapeHtml(attendance.status)}</small>`;
}

function renderCalendarAttendanceDetail(date) {
  const attendance = getCalendarAttendanceForDate(date);
  if (!attendance.status) return "";
  return `
    <div class="calendar-attendance-detail">
      ${renderCalendarAttendanceBadge(attendance)}
      ${attendance.remarks ? `<small>${escapeHtml(attendance.remarks)}</small>` : ""}
    </div>
  `;
}

function renderCalendarAgenda(items) {
  const rows = items
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
    .map((item) => {
      const urgency = getUrgencyLabel(item.date, item.status);
      if (isMaskedCalendarItem(item)) {
        return `
          <article class="calendar-task-item ${item.typeClass}">
            <div>
              <span class="badge calendar-type">Schedule</span>
              <h4>Busy</h4>
              <small>${escapeHtml(formatDueDate(item.date))}${item.time ? ` | ${escapeHtml(item.time)}` : ""}</small>
            </div>
          </article>
        `;
      }
      return `
        <article class="calendar-task-item ${item.typeClass}">
          <div>
            <span class="badge calendar-type">${escapeHtml(item.type)}</span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(formatDueDate(item.date))}${item.time ? ` | ${escapeHtml(item.time)}` : ""}</p>
            <small>${escapeHtml(item.category || item.description || "Calendar item")}</small>
          </div>
          <div>
            <span class="badge status-${statusClass(item.status)}">${escapeHtml(item.status || "Pending")}</span>
            <strong class="${urgency.className}">${escapeHtml(urgency.label)}</strong>
          </div>
        </article>
      `;
    })
    .join("");
  return `<div class="calendar-agenda">${rows || `<p class="empty-state">No schedules match the current filters.</p>`}</div>`;
}

function formatDueDate(date) {
  const parsed = parseDateOnly(date);
  return parsed ? parsed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "No date";
}

function getUrgencyLabel(date, status) {
  if (isCalendarItemClosed({ status })) return { label: "Completed", className: "complete" };
  const days = getDaysFromToday(date);
  if (days < 0) return { label: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`, className: "overdue" };
  if (days === 0) return { label: "Due Today", className: "today" };
  if (days === 1) return { label: "Due Tomorrow", className: "soon" };
  if (days <= 7) return { label: `Due in ${days} days`, className: "soon" };
  return { label: "Upcoming", className: "upcoming" };
}

function getDaysFromToday(date) {
  const target = parseDateOnly(date);
  const today = parseDateOnly(todayIso());
  if (!target || !today) return 9999;
  return Math.round((target - today) / 86400000);
}

function isCalendarItemClosed(item) {
  return ["Approved", "Completed", "Resolved", "Closed", "Cancelled"].includes(item.status);
}

function renderCalendarChip(item) {
  const urgency = getUrgencyLabel(item.date, item.status);
  return `<span class="calendar-chip ${item.typeClass} ${urgency.className}">${escapeHtml(item.title)}</span>`;
}

function renderCalendarDateTasks(date, items) {
  const tasks = getTasksForDate(date, items);
  if (!tasks.length) return `<p class="empty-state">No tasks or activities for this date.</p>`;

  return tasks
    .map((item) => {
      const urgency = getUrgencyLabel(item.date, item.status);
      if (isMaskedCalendarItem(item)) {
        return `
          <article class="calendar-task-item ${item.typeClass}">
            <div>
              <span class="badge calendar-type">Schedule</span>
              <h4>Busy</h4>
              <small>${escapeHtml(formatDueDate(item.date))}${item.time ? ` | ${escapeHtml(item.time)}` : ""}</small>
            </div>
          </article>
        `;
      }
      return `
        <article class="calendar-task-item ${item.typeClass}">
          <div>
            <span class="badge calendar-type">${escapeHtml(item.type)}</span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.description || "No description")}</p>
            <small>${escapeHtml(item.time ? `${item.time} | ` : "")}${escapeHtml(item.location ? `${item.location} | ` : "")}${escapeHtml(item.assignedBy || "Not recorded")}</small>
            ${item.type === "Schedule" ? `<small>Owner: ${escapeHtml(item.ownerName || "Not recorded")} | Category: ${escapeHtml(item.category || "Other")}</small>` : ""}
          </div>
          <div>
            <span class="badge status-${statusClass(item.status)}">${escapeHtml(item.status || "Pending")}</span>
            <strong class="${urgency.className}">${escapeHtml(urgency.label)}</strong>
            ${item.source === "calendarEvent" && item.ownerUid === auth.currentUser?.uid ? `
              <button class="secondary-button edit-calendar-event" type="button" data-id="${escapeHtml(item.recordId)}">Edit</button>
              <button class="danger-button delete-calendar-event" type="button" data-id="${escapeHtml(item.recordId)}">Delete</button>
            ` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function openCalendarEventForm(record = null) {
  document.querySelector("#calendarEventModal")?.remove();
  const selectedDate = record?.date || selectedCalendarDate || todayIso();
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="calendarEventModal" class="modal-backdrop" role="dialog" aria-modal="true">
        <form id="calendarEventForm" class="modal wide-modal">
          <div class="modal-header">
            <div><p class="eyebrow">Calendar schedule</p><h2>${record ? "Edit Schedule" : "Add Schedule"}</h2></div>
            <button id="closeCalendarEventModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <div class="form-grid">
            <label>Title<input id="calendarEventTitle" required value="${escapeHtml(record?.title || "")}" /></label>
            <label>Category<select id="calendarEventCategory" required>${optionList(calendarEventCategories, record?.category || "Meeting", "Select category")}</select></label>
            <label>Date<input id="calendarEventDate" type="date" required value="${escapeHtml(selectedDate)}" /></label>
            <label>Start Time<input id="calendarEventStartTime" type="time" value="${escapeHtml(record?.startTime || "")}" /></label>
            <label>End Time<input id="calendarEventEndTime" type="time" value="${escapeHtml(record?.endTime || "")}" /></label>
            <label>Status<select id="calendarEventStatus" required>${optionList(calendarEventStatuses, record?.status || "Scheduled", "Select status")}</select></label>
            <label>Visibility<select id="calendarEventVisibility" required>${optionList(calendarEventVisibilities, record?.visibility || "Visible to Supervisors", "Select visibility")}</select></label>
            <label>Location<input id="calendarEventLocation" value="${escapeHtml(record?.location || "")}" /></label>
          </div>
          <label class="modal-field">Description<textarea id="calendarEventDescription" rows="4">${escapeHtml(record?.description || "")}</textarea></label>
          <div id="calendarEventMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelCalendarEventForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit" data-id="${escapeHtml(record?.id || "")}">${record ? "Save Changes" : "Add Schedule"}</button>
          </div>
        </form>
      </div>
    `
  );
}

function getCalendarEventFormData() {
  return {
    title: document.querySelector("#calendarEventTitle").value.trim(),
    description: document.querySelector("#calendarEventDescription").value.trim(),
    date: document.querySelector("#calendarEventDate").value,
    startTime: document.querySelector("#calendarEventStartTime").value,
    endTime: document.querySelector("#calendarEventEndTime").value,
    category: document.querySelector("#calendarEventCategory").value,
    location: document.querySelector("#calendarEventLocation").value.trim(),
    visibility: document.querySelector("#calendarEventVisibility").value,
    status: document.querySelector("#calendarEventStatus").value,
  };
}

async function handleCalendarEventFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#calendarEventMessage");
  const submitButton = event.target.querySelector(".primary-button");
  submitButton.disabled = true;
  try {
    const recordId = submitButton.dataset.id;
    const data = getCalendarEventFormData();
    if (!data.title) throw new Error("Title is required.");
    if (!calendarEventCategories.includes(data.category)) throw new Error("Select a valid category.");
    if (!calendarEventVisibilities.includes(data.visibility)) throw new Error("Select a valid visibility.");
    if (!calendarEventStatuses.includes(data.status)) throw new Error("Select a valid status.");
    if (data.startTime && data.endTime && data.endTime < data.startTime) throw new Error("End time cannot be earlier than start time.");

    if (recordId) {
      const before = calendarPersonalEventsCache.find((item) => item.id === recordId);
      await updateDoc(doc(db, "calendarEvents", recordId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Calendar", recordId, before, data);
    } else {
      const payload = {
        ...data,
        ownerUid: auth.currentUser.uid,
        ownerName: currentUserProfile.fullName || auth.currentUser.email,
        createdBy: auth.currentUser.uid,
        createdByName: currentUserProfile.fullName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const created = await addDoc(collection(db, "calendarEvents"), payload);
      await createAuditLog("create", "Calendar", created.id, null, payload);
    }
    document.querySelector("#calendarEventModal")?.remove();
    selectedCalendarOwnerUid = auth.currentUser.uid;
    await loadCalendarModalData();
    dashboardCalendarItemsCache = await getUserCalendarItems(currentUserProfile);
    renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems());
    showDashboardMessage(recordId ? "Schedule updated." : "Schedule added.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function monthNames() {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
}

function calendarYearOptions(year) {
  const years = new Set();
  for (let offset = -5; offset <= 5; offset += 1) years.add(year + offset);
  getCalendarDisplayItems().forEach((item) => {
    const date = parseDateOnly(item.date);
    if (date) years.add(date.getFullYear());
  });
  return [...years].sort((a, b) => a - b);
}

async function loadPendingUsers() {
  const tableHost = document.querySelector("#pendingUsersTable");
  if (!tableHost || !db) return;

  if (!settingsUsersCache.length) {
    await loadSettingsUsers({ renderPending: false });
  }
  const pendingUsers = settingsUsersCache
    .filter((user) => normalizeUserStatus(user) === "pending")
    .map((user) => ({
      ...user,
      docId: user.id,
      uid: user.uid || user.id || "",
      fullName: user.fullName || "",
      email: user.email || "",
      requestedRole: user.requestedRole || "",
    }));

  updatePendingApprovalCard(pendingUsers.length);

  if (!pendingUsers.length) {
    tableHost.innerHTML = `<p class="empty-state">No pending user registrations.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Requested Role</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${pendingUsers
          .map(
            (user) => `
              <tr>
                <td>
                  ${displayValue(user.fullName, "Missing full name")}
                  <small class="row-note">Document ID: ${escapeHtml(user.docId)}</small>
                  ${user.uid ? `<small class="row-note">Auth UID: ${escapeHtml(user.uid)}</small>` : `<small class="row-note warning-text">Missing uid field</small>`}
                </td>
                <td>${displayValue(user.email, "Missing email")}</td>
                <td>${displayValue(user.requestedRole, "Missing requested role")}</td>
                <td><span class="badge">Pending</span></td>
                <td>
                  <button class="primary-button approve-button" type="button" data-doc-id="${escapeHtml(user.docId)}" data-name="${escapeHtml(user.fullName || user.email || user.docId)}">
                    Approve
                  </button>
                </td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function updatePendingApprovalCard(count) {
  const cards = [...document.querySelectorAll(".stat-card")];
  const pendingCard = cards.find((card) => card.textContent.includes("Pending User Approvals"));
  if (pendingCard) {
    pendingCard.querySelector("strong").textContent = String(count);
  }
}

function openApprovalModal(docId, name) {
  currentApprovalDocId = docId;
  els.approvalUserName.textContent = name;
  els.approvalRole.querySelectorAll("input[name='approvalRoles']").forEach((input) => {
    input.checked = false;
  });
  clearApprovalMessage();
  els.approvalModal.classList.remove("hidden");
}

function closeApprovalModal() {
  currentApprovalDocId = null;
  els.approvalModal.classList.add("hidden");
}

async function handleApproval(event) {
  event.preventDefault();
  const selectedRoles = [...els.approvalRole.querySelectorAll("input[name='approvalRoles']:checked")]
    .map((input) => input.value)
    .filter((role) => roles.includes(role));
  const selectedRole = selectedRoles[0] || "";
  const selectedRoleLabel = selectedRoles.join(" / ");
  clearApprovalMessage();

  if (!currentApprovalDocId || !selectedRoles.length) {
    showApprovalMessage("Select at least one final role before approving.", true);
    return;
  }

  const submitButton = els.approvalForm.querySelector(".primary-button");
  submitButton.disabled = true;
  submitButton.textContent = "Approving...";

  try {
    const approvedUserSnap = await getDoc(doc(db, "users", currentApprovalDocId));
    const approvedUser = approvedUserSnap.exists()
      ? { uid: currentApprovalDocId, ...approvedUserSnap.data(), role: selectedRole, roles: selectedRoles }
      : null;
    // Approval assigns the final role and unlocks dashboard access.
    await updateDoc(doc(db, "users", currentApprovalDocId), {
      role: selectedRole,
      roles: selectedRoles,
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: auth.currentUser.uid,
    });
    await createDirectNotification(approvedUser, {
      notificationType: "user_approved",
      title: "Account approved",
      message: `Your Project SINAG account was approved as ${selectedRoleLabel}.`,
      relatedModule: "Dashboard",
      relatedRecordId: currentApprovalDocId,
      actionUrl: "#Dashboard",
    });

    closeApprovalModal();
    showDashboardMessage("User approved successfully.");
    await loadSettingsUsers();
  } catch (error) {
    showApprovalMessage(`Approval failed: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Approve account";
  }
}

function renderModulePlaceholder(moduleName) {
  els.dashboardTitle.textContent = moduleName;
  els.dashboardContent.innerHTML = `
    <section class="module-panel">
      <h2>${moduleName}</h2>
      <p>
        ${moduleName} is available as a Phase 1 navigation placeholder for
        ${formatRoleList(currentUserProfile)}. Its detailed records,
        forms, analytics, and workflows are reserved for future phases.
      </p>
    </section>
  `;
}

function getDownloadableReportDefinitions() {
  const role = currentUserProfile || "";
  const definitions = [];

  if (hasRole(role, "Principal") || hasAnyRole(role, complianceRoles)) {
    definitions.push({
      id: "reportAssignments",
      label: "Report Assignment",
      description: "Assignments, submission status, due dates, and review remarks.",
      dateField: "dueDate",
      statusField: "status",
      categoryField: "reportType",
      loader: getVisibleReportAssignments,
      headers: [
        "Title",
        "Report Type",
        "Assigned By",
        "Assigned To",
        "Due Date",
        "Submission Type",
        "Status",
        "Submitted At",
        "Reviewed At",
      ],
      row: (record) => [
        record.title,
        formatReportAssignmentType(record.reportType),
        record.assignedByName,
        record.assignedToName,
        record.dueDate,
        record.submissionType,
        normalizeStudentStatus(record.status),
        formatDate(record.submittedAt),
        formatDate(record.reviewedAt),
      ],
    });
  }

  if (hasAnyRole(role, learnerMonitorRoles)) {
    definitions.push({
      id: "learnerMonitoring",
      label: "Learner Monitoring",
      description: "Learner risk, concerns, interventions, and case status.",
      dateField: "interventionDate",
      statusField: "status",
      categoryField: "concernType",
      loader: getVisibleLearnerRecords,
      headers: ["Learner", "LRN", "Grade", "Section", "Concern", "Risk", "Intervention Status", "Status", "Intervention Date"],
      row: (record) => [
        record.learnerName,
        record.lrn,
        record.gradeLevel,
        record.section,
        record.concernType,
        record.riskLevel,
        record.interventionStatus,
        record.status,
        record.interventionDate,
      ],
    });
  }

  if (hasAnyRole(role, observationRoles)) {
    definitions.push({
      id: "classroomObservations",
      label: "Classroom Observation",
      description: "Teacher observations, schedule status, observers, and report links.",
      dateField: "observationDate",
      statusField: "status",
      categoryField: "observationType",
      loader: getVisibleClassroomObservations,
      headers: ["Teacher", "Observer", "Class", "Type", "Date", "Time", "Status", "Report Link"],
      row: (record) => [
        record.teacherName,
        record.observerName,
        subjectGradeSectionClassLabel(record),
        record.observationType,
        record.observationDate,
        record.observationTime,
        record.status,
        record.observationReportLink,
      ],
    });
  }

  if (hasAnyRole(role, ["Principal", "Master Teacher", "Head Teacher", "Registrar"])) {
    definitions.push({
      id: "enrollmentRecords",
      label: "Enrollment Records",
      description: "Student registry records with enrollment, transfer, and dropout status.",
      dateField: "updatedAt",
      statusField: "status",
      categoryField: "gradeLevel",
      loader: async () => {
        await loadEnrollmentCollections();
        return enrollmentRecordsCache;
      },
      headers: ["LRN", "Learner", "Sex", "Grade", "Section", "School Year", "Status", "Remarks"],
      row: (record) => [
        record.lrn,
        [record.lastName, record.firstName, record.middleName].filter(Boolean).join(", "),
        record.sex,
        record.gradeLevel,
        record.sectionName,
        record.schoolYear,
        record.status,
        record.remarks,
      ],
    });
  }

  if (hasAnyRole(role, documentRoles)) {
    definitions.push({
      id: "documents",
      label: "Document Repository",
      description: "Visible document files, categories, school year, tags, and links.",
      dateField: "createdAt",
      statusField: "documentCategory",
      categoryField: "schoolYear",
      loader: getVisibleDocuments,
      headers: ["Title", "Category", "School Year", "Uploaded By", "Role", "Visibility", "Tags", "Link", "Created At"],
      row: (record) => [
        record.documentTitle,
        record.documentCategory,
        record.schoolYear,
        record.uploadedByName,
        record.uploadedByRole,
        (record.visibilityRoles || []).join(" / "),
        record.tags,
        record.documentLink,
        formatDate(record.createdAt),
      ],
    });
  }

  if (hasAnyRole(role, inventoryFacilityRoles)) {
    definitions.push({
      id: "inventoryFacilities",
      label: "Inventory & Facilities",
      description: "School property, quantity, condition, status, and assigned location.",
      dateField: "lastCheckedDate",
      statusField: "status",
      categoryField: "category",
      loader: getVisibleInventoryFacilities,
      headers: ["Item", "Property Number", "Category", "Location", "Facility Area", "Quantity", "Condition", "Status", "Last Checked"],
      row: (record) => [
        record.itemName,
        record.propertyNumber,
        record.category,
        record.location,
        record.facilityArea,
        record.quantity,
        record.condition,
        record.status,
        record.lastCheckedDate,
      ],
    });
  }

  if (hasAnyRole(role, financialReportRoles)) {
    definitions.push({
      id: "financialReports",
      label: "Financial Report",
      description: "Financial report tracking by fund source, category, quarter, and status.",
      dateField: "date",
      statusField: "status",
      categoryField: "reportType",
      loader: getVisibleFinancialReports,
      headers: [
        "Date",
        "Report Title",
        "Report Type",
        "Quarter",
        "School Year",
        "Fund Source",
        "Category",
        "Amount Allocated",
        "Amount Spent",
        "Remaining Balance",
        "Status",
        "Encoded By",
        "Remarks",
      ],
      row: (record) => [
        record.date,
        record.reportTitle,
        record.reportType,
        record.quarter,
        record.schoolYear,
        record.fundSource,
        record.category,
        record.amountAllocated,
        record.amountSpent,
        record.remainingBalance,
        record.status,
        record.encodedBy,
        record.remarks,
      ],
    });
  }

  if (hasAnyRole(role, ppaRoles)) {
    definitions.push({
      id: "ppaMonitoring",
      label: "PPA Monitoring and Evaluation",
      description: "PPA status, term, category, proponent, findings, and TA needs.",
      dateField: "monitoringDate",
      statusField: "implementationStatus",
      categoryField: "ppaCategory",
      loader: getVisiblePpaRecords,
      headers: ["PPA Title", "Category", "Term", "Date", "School Year", "Proponent", "Beneficiaries", "Status", "Needs TA"],
      row: (record) => [
        record.ppaTitle,
        record.ppaCategory,
        ppaTermLabel(record.monitoringQuarter),
        record.monitoringDate,
        record.schoolYear,
        record.programProponent,
        record.targetBeneficiaries,
        record.implementationStatus,
        ["Needs Technical Assistance", "For Improvement"].includes(record.implementationStatus) ? "Yes" : "No",
      ],
    });
  }

  if (canViewAcademicModule(role)) {
    definitions.push(
      {
        id: "classes",
        label: "Classes / Sections",
        description: "Class sections, advisers, school year, and active student totals.",
        dateField: "updatedAt",
        statusField: "status",
        categoryField: "gradeLevel",
        loader: getVisibleClasses,
        headers: ["Grade", "Section", "Adviser", "School Year", "Students", "Status", "Updated At"],
        row: (record) => [
          record.gradeLevel,
          record.sectionName,
          record.adviserName,
          record.schoolYear,
          record.totalStudents,
          record.status,
          formatDate(record.updatedAt),
        ],
      },
      {
        id: "students",
        label: "Students",
        description: "Learner masterlist records visible to the current role.",
        dateField: "updatedAt",
        statusField: "status",
        categoryField: "gradeLevel",
        loader: async () => {
          classRecordsCache = await getVisibleClasses();
          return getVisibleStudents();
        },
        headers: ["LRN", "Last Name", "First Name", "Sex", "Grade", "Section", "Adviser", "School Year", "Status"],
        row: (record) => [
          record.lrn,
          record.lastName,
          record.firstName,
          record.sex,
          record.gradeLevel,
          record.sectionName,
          record.adviserName,
          record.schoolYear,
          record.status,
        ],
      },
      {
        id: "studentAttendance",
        label: "Student Attendance",
        description: "Daily learner attendance records by section and status.",
        dateField: "attendanceDate",
        statusField: "status",
        categoryField: "sectionName",
        loader: async () => {
          classRecordsCache = await getVisibleClasses();
          return getVisibleStudentAttendance();
        },
        headers: ["Date", "Student", "Section", "Adviser", "Status", "Encoded By", "Remarks"],
        row: (record) => [
          record.attendanceDate,
          record.studentName,
          record.sectionName,
          record.adviserName,
          record.status,
          record.encodedByName || record.encodedBy,
          record.remarks,
        ],
      },
      {
        id: "assessments",
        label: "Diagnostic Test & Exam",
        description: "Diagnostic and exam scores, improvement, and term monitoring.",
        dateField: "updatedAt",
        statusField: "term",
        categoryField: "sectionName",
        loader: async () => {
          classRecordsCache = await getVisibleClasses();
          return getVisibleAssessments();
        },
        headers: ["Student", "Class", "School Year", "Term", "Diagnostic", "Diagnostic High", "Diagnostic %", "Exam", "Exam High", "Exam %", "Improvement %"],
        row: (record) => [
          record.studentName,
          subjectGradeSectionClassLabel(record, "No section"),
          record.schoolYear,
          record.term,
          record.preTestScore,
          getAssessmentHighScore(record, "pre"),
          record.preTestPercentage ?? calculateAssessmentValues(record.preTestScore, record.postTestScore, getAssessmentHighScore(record, "pre"), getAssessmentHighScore(record, "post")).preTestPercentage,
          record.postTestScore,
          getAssessmentHighScore(record, "post"),
          record.postTestPercentage ?? calculateAssessmentValues(record.preTestScore, record.postTestScore, getAssessmentHighScore(record, "pre"), getAssessmentHighScore(record, "post")).postTestPercentage,
          calculateAssessmentValues(record.preTestScore, record.postTestScore, getAssessmentHighScore(record, "pre"), getAssessmentHighScore(record, "post")).improvementPercentage,
        ],
      }
    );
  }

  if (hasAnyRole(role, teacherAttendanceViewerRoles)) {
    definitions.push({
      id: "teacherAttendance",
      label: "Teacher Attendance",
      description: "Teacher attendance status, date, encoder, and remarks.",
      dateField: "attendanceDate",
      statusField: "status",
      categoryField: "teacherName",
      loader: getVisibleTeacherAttendance,
      headers: ["Date", "Teacher", "Status", "Encoded By", "Remarks"],
      row: (record) => [
        record.attendanceDate,
        record.teacherName,
        record.status,
        record.encodedByName || record.encodedBy,
        record.remarks,
      ],
    });
  }

  if (canViewTeacherWorkload(role)) {
    definitions.push({
      id: "teacherWorkload",
      label: "Teacher Workload",
      description: "Teaching load, ancillary duties, and workload status summary.",
      dateField: "",
      statusField: "workloadStatus",
      categoryField: "department",
      loader: async () => {
        await loadTeacherWorkloadTeachers();
        [classRecordsCache, studentRecordsCache, teacherWorkloadRecordsCache, ancillaryAssignmentRecordsCache] = await Promise.all([
          getVisibleClasses(),
          getVisibleStudents(),
          getVisibleTeacherWorkloadRecords(),
          getVisibleAncillaryAssignments(),
        ]);
        return buildTeacherWorkloadSummaries();
      },
      headers: ["Teacher", "Department", "Teaching Hours", "Preparations", "Ancillary Hours", "Score", "Status", "Classes"],
      row: (record) => [
        record.teacherName,
        record.department,
        record.teachingHours,
        record.preparations,
        record.ancillaryScore,
        record.workloadScore,
        record.workloadStatus,
        (record.sections || []).join(" / "),
      ],
    });
  }

  if (canViewGradeSubmissionModule(role)) {
    definitions.push({
      id: "gradeSubmissions",
      label: "Grade Submission",
      description: "Subject-based grade submission tracking by section, teacher, term, and status.",
      dateField: "updatedAt",
      statusField: "submissionStatus",
      categoryField: "subjectName",
      loader: async () => {
        await loadTeacherWorkloadTeachers();
        [classRecordsCache, teacherWorkloadRecordsCache, schoolSubjectRecordsCache] = await Promise.all([
          getVisibleClasses(),
          getVisibleTeacherWorkloadRecords(),
          getVisibleSchoolSubjects(),
        ]);
        classRecordsCache = mergeClassesWithWorkloadSections(classRecordsCache, teacherWorkloadRecordsCache);
        studentRecordsCache = await getAssessmentVisibleStudents(classRecordsCache);
        gradeSubmissionRecordsCache = await getVisibleGradeSubmissions();
        return buildGradeSubmissionRows();
      },
      headers: ["School Year", "Term / Quarter", "Class", "Subject Teacher", "Encoded Students", "Date Submitted", "Status", "Remarks", "Legacy"],
      row: (record) => [
        record.schoolYear,
        record.term,
        subjectGradeSectionClassLabel(record, "No section"),
        record.teacherName,
        `${Number(record.encodedStudents || 0)} / ${Number(record.totalStudents || 0)}`,
        record.dateSubmitted,
        record.submissionStatus,
        record.remarks,
        record.isLegacy ? "Yes" : "No",
      ],
    });
  }

  return definitions;
}

function getActiveDownloadableReportDefinition() {
  const definitions = getDownloadableReportDefinitions();
  return definitions.find((definition) => definition.id === activeDownloadableReportId) || definitions[0] || null;
}

async function renderDownloadableReportsModule() {
  els.dashboardTitle.textContent = "Downloadable Reports";
  const definitions = getDownloadableReportDefinitions();
  activeDownloadableReportId = activeDownloadableReportId && definitions.some((definition) => definition.id === activeDownloadableReportId)
    ? activeDownloadableReportId
    : definitions[0]?.id || "";

  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Exports and print-ready files</p>
        <h2>Downloadable Reports</h2>
        <p>Generate CSV, Excel-compatible, or print-ready reports from the records available to your role.</p>
      </div>
      <div class="toolbar-actions">
        <button id="downloadReportCsv" class="secondary-button" type="button" ${definitions.length ? "" : "disabled"}>Export CSV</button>
        <button id="downloadReportExcel" class="secondary-button" type="button" ${definitions.length ? "" : "disabled"}>Export Excel</button>
        <button id="printDownloadableReport" class="secondary-button" type="button" ${definitions.length ? "" : "disabled"}>Print Report</button>
      </div>
    </section>
    ${definitions.length ? `
      <section class="table-card">
        <div class="section-header">
          <div>
            <p class="eyebrow">Report builder</p>
            <h2>Select and filter records</h2>
          </div>
        </div>
        <div id="downloadReportFilters" class="filter-grid downloadable-report-filters">
          <label>Report
            <select id="downloadReportSelect">
              ${definitions.map((definition) => `<option value="${escapeHtml(definition.id)}" ${definition.id === activeDownloadableReportId ? "selected" : ""}>${escapeHtml(definition.label)}</option>`).join("")}
            </select>
          </label>
          <label>Search<input id="downloadReportSearch" type="search" placeholder="Search visible fields" /></label>
          <label>Status<select id="downloadReportStatusFilter"><option value="">All statuses</option></select></label>
          <label>Category<select id="downloadReportCategoryFilter"><option value="">All categories</option></select></label>
          <label>Date From<input id="downloadReportDateFrom" type="date" /></label>
          <label>Date To<input id="downloadReportDateTo" type="date" /></label>
        </div>
      </section>
      <section id="downloadReportSummary" class="attendance-analytics">
        <p class="empty-state">Loading report summary...</p>
      </section>
      <section class="table-card">
        <div class="section-header">
          <div>
            <p class="eyebrow">Preview</p>
            <h2 id="downloadReportPreviewTitle">Report Preview</h2>
          </div>
          <span id="downloadReportCount" class="badge">0 records</span>
        </div>
        <div id="downloadReportTableHost" class="table-wrap"><p class="empty-state">Loading report records...</p></div>
      </section>
    ` : `
      <section class="module-panel">
        <h2>No downloadable reports available</h2>
        <p>Your current role does not have access to report exports yet.</p>
      </section>
    `}
  `;

  if (definitions.length) {
    await loadActiveDownloadableReport();
  }
}

async function loadActiveDownloadableReport() {
  const definition = getActiveDownloadableReportDefinition();
  const host = document.querySelector("#downloadReportTableHost");
  if (!definition || !host) return;

  host.innerHTML = `<p class="empty-state">Loading ${escapeHtml(definition.label)}...</p>`;
  document.querySelector("#downloadReportPreviewTitle").textContent = definition.label;

  try {
    downloadableReportRecordsCache = await definition.loader();
    syncDownloadableReportFilterOptions();
    applyDownloadableReportFilters();
  } catch (error) {
    downloadableReportRecordsCache = [];
    filteredDownloadableReportRows = [];
    host.innerHTML = `<p class="empty-state">Unable to load report: ${escapeHtml(error.message)}</p>`;
    renderDownloadableReportSummary(definition, []);
  }
}

function syncDownloadableReportFilterOptions() {
  const definition = getActiveDownloadableReportDefinition();
  if (!definition) return;

  const statusFilter = document.querySelector("#downloadReportStatusFilter");
  const categoryFilter = document.querySelector("#downloadReportCategoryFilter");
  if (statusFilter) {
    statusFilter.innerHTML = optionList(uniqueOptions(downloadableReportRecordsCache, definition.statusField), "", "All statuses");
  }
  if (categoryFilter) {
    categoryFilter.innerHTML = definition.id === "reportAssignments"
      ? labeledOptionList(reportAssignmentTypeFilterOptions(downloadableReportRecordsCache), "", "All categories")
      : optionList(uniqueOptions(downloadableReportRecordsCache, definition.categoryField), "", "All categories");
  }
}

function applyDownloadableReportFilters() {
  const definition = getActiveDownloadableReportDefinition();
  const host = document.querySelector("#downloadReportTableHost");
  if (!definition || !host) return;

  const search = (document.querySelector("#downloadReportSearch")?.value || "").trim().toLowerCase();
  const status = document.querySelector("#downloadReportStatusFilter")?.value || "";
  const category = document.querySelector("#downloadReportCategoryFilter")?.value || "";
  const dateFrom = document.querySelector("#downloadReportDateFrom")?.value || "";
  const dateTo = document.querySelector("#downloadReportDateTo")?.value || "";

  const records = downloadableReportRecordsCache.filter((record) => {
    const rowText = definition.row(record).join(" ").toLowerCase();
    const recordDate = definition.dateField ? toDateOnly(record[definition.dateField]) : "";
    return (!search || rowText.includes(search))
      && (!status || record[definition.statusField] === status)
      && (!category || record[definition.categoryField] === category)
      && (!dateFrom || !definition.dateField || (recordDate && recordDate >= dateFrom))
      && (!dateTo || !definition.dateField || (recordDate && recordDate <= dateTo));
  });

  filteredDownloadableReportRows = records.map((record) => definition.row(record));
  renderDownloadableReportSummary(definition, records);
  renderDownloadableReportPreview(definition, records);
}

function renderDownloadableReportSummary(definition, records) {
  const host = document.querySelector("#downloadReportSummary");
  if (!host) return;
  const statusCounts = definition.statusField
    ? Object.entries(records.reduce((counts, record) => {
      const key = record[definition.statusField] || "Unspecified";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4)
    : [];
  const categoryCounts = definition.categoryField
    ? new Set(records.map((record) => record[definition.categoryField]).filter(Boolean)).size
    : 0;

  host.innerHTML = `
    <article class="attendance-kpi-card">
      <span>Total Records</span>
      <strong>${records.length}</strong>
      <small>${escapeHtml(definition.description)}</small>
    </article>
    <article class="attendance-kpi-card">
      <span>Categories</span>
      <strong>${categoryCounts}</strong>
      <small>Based on the current report grouping.</small>
    </article>
    <article class="attendance-kpi-card report-status-summary">
      <span>Status Summary</span>
      <div>
        ${statusCounts.length
          ? statusCounts.map(([label, count]) => `<p><b>${escapeHtml(label)}</b><strong>${count}</strong></p>`).join("")
          : `<small>No status field for this report.</small>`}
      </div>
    </article>
  `;
}

function renderDownloadableReportPreview(definition, records) {
  const host = document.querySelector("#downloadReportTableHost");
  const count = document.querySelector("#downloadReportCount");
  if (!host) return;
  if (count) count.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;

  if (!records.length) {
    host.innerHTML = `<p class="empty-state">No records match the current filters.</p>`;
    return;
  }

  const previewRows = records.slice(0, 50).map((record) => definition.row(record));
  host.innerHTML = `
    <table class="academic-table downloadable-report-table">
      <thead><tr>${definition.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${previewRows.map((row) => `
          <tr>${row.map((value) => `<td>${escapeHtml(formatExportValue(value))}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    </table>
    ${records.length > previewRows.length ? `<p class="helper-text">Showing first ${previewRows.length} records. Exports include all ${records.length} matching records.</p>` : ""}
  `;
}

function getDownloadableReportExportData() {
  const definition = getActiveDownloadableReportDefinition();
  if (!definition) {
    return { reportName: "Downloadable Reports", headers: ["No report"], rows: [] };
  }
  return {
    reportName: definition.label,
    headers: definition.headers,
    rows: filteredDownloadableReportRows,
  };
}

function downloadActiveReportCsv() {
  const definition = getActiveDownloadableReportDefinition();
  const exportData = getDownloadableReportExportData();
  downloadCsvReport({ ...exportData, filename: `${slugify(definition?.label || "report")}.csv` });
}

function downloadActiveReportExcel() {
  const definition = getActiveDownloadableReportDefinition();
  const exportData = getDownloadableReportExportData();
  downloadExcelReport({ ...exportData, filename: `${slugify(definition?.label || "report")}.xls` });
}

function handleDownloadableReportAction(event) {
  if (event.target.closest("#downloadReportCsv")) {
    downloadActiveReportCsv();
    return;
  }
  if (event.target.closest("#downloadReportExcel")) {
    downloadActiveReportExcel();
    return;
  }
  if (event.target.closest("#printDownloadableReport")) {
    const definition = getActiveDownloadableReportDefinition();
    printCurrentReport(definition?.label || "Downloadable Reports");
  }
}

function handleDownloadableReportInput(event) {
  if (event.target.id === "downloadReportSelect") {
    activeDownloadableReportId = event.target.value;
    document.querySelector("#downloadReportSearch").value = "";
    document.querySelector("#downloadReportDateFrom").value = "";
    document.querySelector("#downloadReportDateTo").value = "";
    loadActiveDownloadableReport();
    return;
  }
  if (event.target.closest("#downloadReportFilters")) {
    applyDownloadableReportFilters();
  }
}

function slugify(value = "report") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
}

function optionList(options, selected = "", placeholder = "All") {
  return `<option value="">${placeholder}</option>${options
    .map(
      (option) =>
        `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`
    )
    .join("")}`;
}

function labeledOptionList(options, selected = "", placeholder = "All") {
  return `<option value="">${placeholder}</option>${options
    .map(
      (option) =>
        `<option value="${escapeHtml(option.value)}" ${option.value === selected ? "selected" : ""}>${escapeHtml(option.label)}</option>`
    )
    .join("")}`;
}

function isCurrentReportAssignmentType(reportType = "") {
  return reportAssignmentTypes.includes(reportType);
}

function formatReportAssignmentType(reportType = "") {
  if (!reportType) return "No report type";
  return isCurrentReportAssignmentType(reportType) ? reportType : `${reportType} (Legacy)`;
}

function reportAssignmentTypeFilterOptions(records = []) {
  const legacyTypes = uniqueOptions(records, "reportType")
    .filter((reportType) => !isCurrentReportAssignmentType(reportType));
  return [...reportAssignmentTypes, ...legacyTypes].map((reportType) => ({
    value: reportType,
    label: formatReportAssignmentType(reportType),
  }));
}

function uniqueOptions(records, field) {
  return [...new Set(records.map((record) => record[field]).filter(Boolean))].sort();
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleString();
}

function normalizeRecord(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

function notificationRecipientKey(role) {
  return `role:${role}`;
}

function buildNotificationPayload({
  recipientUid,
  recipientName,
  recipientRole,
  senderName,
  senderRole,
  notificationType,
  title,
  message,
  relatedModule,
  relatedRecordId = "",
  actionUrl = "",
}) {
  return {
    recipientUid,
    recipientName,
    recipientRole,
    senderUid: auth.currentUser.uid,
    senderName: senderName || currentUserProfile?.fullName || auth.currentUser.email || "System user",
    senderRole: senderRole || primaryRole(currentUserProfile) || currentUserProfile?.requestedRole || "Pending User",
    notificationType,
    title,
    message,
    relatedModule,
    relatedRecordId,
    actionUrl,
    isRead: false,
    createdAt: serverTimestamp(),
  };
}

async function createNotification(notification) {
  if (!db || !auth?.currentUser) return null;
  try {
    return await addDoc(collection(db, "notifications"), buildNotificationPayload(notification));
  } catch (error) {
    console.warn("Notification was not created:", error);
    return null;
  }
}

async function createRoleNotification(role, notification) {
  return createNotification({
    ...notification,
    recipientUid: notificationRecipientKey(role),
    recipientName: role,
    recipientRole: role,
  });
}

async function createRoleNotifications(rolesToNotify, notification) {
  const uniqueRoles = [...new Set(rolesToNotify.filter(Boolean))];
  return Promise.all(uniqueRoles.map((role) => createRoleNotification(role, notification)));
}

async function createDirectNotification(user, notification) {
  if (!user?.uid || !normalizeRoleList(user).length) return null;
  return createNotification({
    ...notification,
    recipientUid: user.uid,
    recipientName: user.fullName || user.email || "SINAG user",
    recipientRole: primaryRole(user),
  });
}

function stopNotificationListeners() {
  notificationUnsubscribers.forEach((unsubscribe) => unsubscribe());
  notificationUnsubscribers = [];
  notificationRecordsCache = [];
}

function startNotificationListeners() {
  stopNotificationListeners();
  if (!db || !auth?.currentUser || !normalizeRoleList(currentUserProfile).length) return;

  const buckets = new Map();
  const syncNotifications = (key, snapshot) => {
    buckets.set(key, snapshot.docs.map(normalizeRecord));
    notificationRecordsCache = [...new Map([...buckets.values()].flat().map((record) => [record.id, record])).values()]
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    renderNotificationDropdown();
    renderRecentActivityPanel();
    if (document.querySelector("#urgentTaskCard")) {
      refreshDashboardCalendar(currentUserProfile.role);
    }
  };
  const handleNotificationError = (label) => (error) => {
    if (error?.code === "permission-denied") {
      console.warn(`Unable to load ${label} notifications. The dashboard can still be used, but Firestore rules may need to be deployed.`, error);
      return;
    }
    console.warn(`Unable to load ${label} notifications:`, error);
  };

  notificationUnsubscribers = [
    onSnapshot(
      query(collection(db, "notifications"), where("recipientUid", "==", auth.currentUser.uid)),
      (snapshot) => syncNotifications("direct", snapshot),
      handleNotificationError("direct")
    ),
    ...normalizeRoleList(currentUserProfile).map((role) =>
      onSnapshot(
        query(collection(db, "notifications"), where("recipientUid", "==", notificationRecipientKey(role))),
        (snapshot) => syncNotifications(`role:${role}`, snapshot),
        handleNotificationError(`role ${role}`)
      )
    ),
  ];
}

function renderNotificationDropdown() {
  if (!els.notificationBadge || !els.notificationList) return;
  const unreadCount = notificationRecordsCache.filter((record) => !record.isRead).length;
  els.notificationBadge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
  els.notificationBadge.classList.toggle("hidden", unreadCount === 0);

  if (!notificationRecordsCache.length) {
    els.notificationList.innerHTML = `<p class="empty-state">No notifications yet.</p>`;
    return;
  }

  els.notificationList.innerHTML = notificationRecordsCache.slice(0, 20).map(renderNotificationItem).join("");
}

function renderNotificationItem(record) {
  return `
    <button class="notification-item ${record.isRead ? "" : "unread"}" type="button" data-id="${escapeHtml(record.id)}">
      <span class="notification-dot" aria-hidden="true"></span>
      <span class="notification-copy">
        <strong>${escapeHtml(record.title || "Notification")}</strong>
        <small>${escapeHtml(record.message || "")}</small>
        <em>${escapeHtml(record.senderName || "System")} - ${escapeHtml(formatDate(record.createdAt))}</em>
      </span>
    </button>
  `;
}

function renderRecentActivityPanel() {
  const host = document.querySelector("#recentActivityList");
  if (!host) return;
  const recent = notificationRecordsCache.slice(0, 6);
  host.innerHTML = recent.length
    ? recent.map((record) => `
        <button class="activity-item ${record.isRead ? "" : "unread"}" type="button" data-id="${escapeHtml(record.id)}">
          <strong>${escapeHtml(record.title || "Activity update")}</strong>
          <span>${escapeHtml(record.senderName || "System")} - ${escapeHtml(record.message || "")}</span>
          <small>${escapeHtml(formatDate(record.createdAt))}</small>
        </button>
      `).join("")
    : `<p class="empty-state">Recent system activity will appear here.</p>`;
}

async function markNotificationRead(recordId) {
  const record = notificationRecordsCache.find((item) => item.id === recordId);
  if (!record || record.isRead) return;
  await updateDoc(doc(db, "notifications", recordId), { isRead: true });
}

async function markAllNotificationsRead() {
  const unread = notificationRecordsCache.filter((record) => !record.isRead);
  await Promise.all(unread.map((record) => updateDoc(doc(db, "notifications", record.id), { isRead: true })));
}

function navigateFromNotification(record) {
  const moduleName = record.relatedModule || record.actionUrl?.replace(/^#/, "");
  if (!moduleName || moduleName === "Dashboard") return;
  navigateToModule(moduleName);
}

function navigateToModule(moduleName) {
  const button = [...document.querySelectorAll(".nav-button")].find((navButton) => navButton.dataset.module === moduleName);
  button?.click();
}

function canCreateAssignments(role = currentUserProfile) {
  return hasAnyRole(role, assignmentCreatorRoles);
}

function canUserBeAssigned(user) {
  if (!user || user.status !== "approved") return false;
  if (hasRole(currentUserProfile, "Principal")) return hasAnyRole(user, roles);
  return hasAnyRole(user, complianceRoles.filter((role) => role !== "Master Teacher" && role !== "Head Teacher"));
}

function assignmentGroupOptions() {
  return [
    { value: "all", label: "All Personnel", roles },
    { value: "teachers", label: "All Teachers", roles: ["Teacher"] },
    { value: "admin", label: "All Admin", roles: ["Registrar", "Administrative Officer", "Administrative Assistant"] },
    { value: "mt-ht", label: "All MT / HT", roles: ["Master Teacher", "Head Teacher"] },
    { value: "academic-leads", label: "All Academic Leads", roles: ["Master Teacher", "Head Teacher", "Registrar"] },
    { value: "operations", label: "All Operations Staff", roles: ["Administrative Officer", "Administrative Assistant"] },
  ];
}

function assigneeUidsForGroup(groupValue) {
  const group = assignmentGroupOptions().find((option) => option.value === groupValue);
  if (!group) return [];
  return assignableUsersCache
    .filter((user) => hasAnyRole(user, group.roles))
    .map((user) => user.uid);
}

function applyAssignmentGroupSelection(groupValue) {
  const selectedUids = new Set(assigneeUidsForGroup(groupValue));
  document.querySelectorAll('input[name="assignedUsers"]').forEach((input) => {
    input.checked = selectedUids.has(input.value);
  });
}

function canSubmitAssignment(record) {
  return (
    record.assignedToUid === auth.currentUser.uid &&
    ["Assigned", "Returned for Revision", "Late", "Not Submitted"].includes(record.status)
  );
}

function canReviewAssignment(record) {
  return (
    record.assignedByUid === auth.currentUser.uid ||
    hasRole(currentUserProfile, "Principal")
  );
}

async function getApprovedUsers() {
  const usersQuery = query(collection(db, "users"), where("status", "==", "approved"));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs
    .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
    .filter((user) => user.uid !== auth.currentUser.uid && canUserBeAssigned(user))
    .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
}

async function createReportAssignments(record) {
  const selectedUsers = assignableUsersCache.filter((user) => record.assignedToUids.includes(user.uid));
  const assignmentGroupId = `assignment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const assignedToType = record.assignedToType || (selectedUsers.length > 1 ? `${selectedUsers.length} Personnel` : "Selected Users");
  const assignedUserIds = selectedUsers.map((user) => user.uid);
  const assignedUserNames = selectedUsers.map((user) => user.fullName || user.email || "SINAG user");
  return Promise.all(
    selectedUsers.map(async (user) => {
      try {
        const docRef = await addDoc(collection(db, "reportAssignments"), {
          assignmentGroupId,
          title: record.title,
          reportType: record.reportType,
          description: record.description,
          assignedToType,
          assignedUserIds,
          assignedUserNames,
          totalAssignedCount: selectedUsers.length,
          assignedByUid: auth.currentUser.uid,
          assignedByName: currentUserProfile.fullName,
          assignedByRole: primaryRole(currentUserProfile),
          assignedToUid: user.uid,
          assignedToName: user.fullName,
          assignedToRole: primaryRole(user),
          dueDate: record.dueDate,
          allowedSubmissionTypes: record.allowedSubmissionTypes,
          status: "Assigned",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await createDirectNotification(user, {
          notificationType: "report_assigned",
          title: "New report assigned",
          message: `${currentUserProfile.fullName} assigned ${record.title}.`,
          relatedModule: "Report Assignment",
          relatedRecordId: docRef.id,
          actionUrl: "#Report Assignment",
        });
        return docRef;
      } catch (error) {
        console.error("Failed to create report assignment for user:", user.fullName, error);
        throw error;
      }
    })
  );
}

async function getMyAssignedReports() {
  const recordsQuery = query(
    collection(db, "reportAssignments"),
    where("assignedToUid", "==", auth.currentUser.uid)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getReportsIAssigned() {
  const recordsQuery = query(
    collection(db, "reportAssignments"),
    where("assignedByUid", "==", auth.currentUser.uid)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getAllReportAssignments() {
  const snapshot = await getDocs(collection(db, "reportAssignments"));
  return snapshot.docs.map(normalizeRecord);
}

async function getVisibleReportAssignments() {
  if (hasRole(currentUserProfile, "Principal")) {
    return getAllReportAssignments();
  }

  if (canCreateAssignments()) {
    const [assignedToMe, assignedByMe] = await Promise.all([
      getMyAssignedReports(),
      getReportsIAssigned(),
    ]);
    return [...new Map([...assignedToMe, ...assignedByMe].map((record) => [record.id, record])).values()];
  }

  return getMyAssignedReports();
}

async function submitReportCompliance(recordId, record) {
  const payload = {
    submissionType: record.submissionType,
    fileLink: record.submissionType === "Soft Copy" ? record.fileLink : "",
    submissionRemarks: record.submissionRemarks,
    status: "Submitted",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "reportAssignments", recordId), payload);
  const assignmentSnap = await getDoc(doc(db, "reportAssignments", recordId));
  const assignment = assignmentSnap.data();
  if (assignment) {
    await createNotification({
      recipientUid: assignment.assignedByUid,
      recipientName: assignment.assignedByName,
      recipientRole: assignment.assignedByRole,
      notificationType: "report_submitted",
      title: "Report submitted",
      message: `${assignment.assignedToName} submitted ${assignment.title}.`,
      relatedModule: "Report Assignment",
      relatedRecordId: recordId,
      actionUrl: "#Report Assignment",
    });
    if (assignment.assignedByRole !== "Principal") {
      await createRoleNotification("Principal", {
        notificationType: "report_submitted",
        title: "Report submitted",
        message: `${assignment.assignedToName} submitted ${assignment.title}.`,
        relatedModule: "Report Assignment",
        relatedRecordId: recordId,
        actionUrl: "#Report Assignment",
      });
    }
  }
}

async function updateReportAssignmentStatus(recordId, status, reviewRemarks) {
  const assignmentSnap = await getDoc(doc(db, "reportAssignments", recordId));
  const assignment = assignmentSnap.data();
  await updateDoc(doc(db, "reportAssignments", recordId), {
    status,
    reviewRemarks,
    reviewedAt: serverTimestamp(),
    reviewedByUid: auth.currentUser.uid,
    reviewedByName: currentUserProfile.fullName,
    updatedAt: serverTimestamp(),
  });
  if (assignment && ["Returned for Revision", "Approved", "Late"].includes(status)) {
    await createNotification({
      recipientUid: assignment.assignedToUid,
      recipientName: assignment.assignedToName,
      recipientRole: assignment.assignedToRole,
      notificationType: status === "Approved" ? "report_approved" : status === "Late" ? "late_submission" : "report_returned",
      title: status === "Approved" ? "Report approved" : status === "Late" ? "Report marked late" : "Report returned",
      message: `${assignment.title} was marked ${status}.`,
      relatedModule: "Report Assignment",
      relatedRecordId: recordId,
      actionUrl: "#Report Assignment",
    });
  }
}

async function refreshComplianceCounters(role) {
  if (!db || !auth || !role || !hasAnyRole(role, complianceRoles)) return;

  try {
    const records = await getVisibleReportAssignments();
    const mine = records.filter((record) => record.assignedToUid === auth.currentUser.uid);
    const assignedByMe = records.filter((record) => record.assignedByUid === auth.currentUser.uid);
    const countByStatus = (items, status) => items.filter((record) => record.status === status).length;
    const pendingStatuses = ["Assigned", "Returned for Revision", "Late", "Not Submitted"];

    if (hasRole(role, "Principal")) {
      const pending = records.filter((record) => pendingStatuses.includes(record.status)).length;
      updateCardValue("Report Assignment", `${records.length}/${pending}`);
      updateCardValue("Total Assigned Reports", records.length);
      updateCardValue("Pending Compliance", pending);
      updateCardValue("Submitted Reports", countByStatus(records, "Submitted"));
      updateCardValue("Approved Reports", countByStatus(records, "Approved"));
      updateCardValue("Late Reports", countByStatus(records, "Late"));
    } else if (hasAnyRole(role, assignmentCreatorRoles)) {
      const pending = assignedByMe.filter((record) => pendingStatuses.includes(record.status)).length;
      const submitted = countByStatus(assignedByMe, "Submitted");
      updateCardValue("Report Assignment", `${submitted}/${pending}`);
      updateCardValue("Reports I Assigned", assignedByMe.length);
      updateCardValue("Pending Submissions", pending);
      updateCardValue("Submitted for Review", submitted);
      updateCardValue("Approved Reports", countByStatus(assignedByMe, "Approved"));
      updateCardValue("Returned Reports", countByStatus(assignedByMe, "Returned for Revision"));
    }

    const myPending = mine.filter((record) => pendingStatuses.includes(record.status)).length;
    updateCardValue("My Report Assignment", `${mine.length}/${myPending}`);
    if (hasRole(role, "Administrative Officer")) {
      updateCardValue("Report Assignment", `${mine.length}/${myPending}`);
    }
    updateCardValue("My Assigned Reports", mine.length);
    updateCardValue("My Pending Reports", myPending);
    updateCardValue("My Submitted Reports", countByStatus(mine, "Submitted"));
    updateCardValue("My Returned Reports", countByStatus(mine, "Returned for Revision"));
    updateCardValue("My Approved Reports", countByStatus(mine, "Approved"));
    updateCardValue("Assigned Reports", mine.length);
    updateCardValue("Pending Compliance", mine.filter((record) => pendingStatuses.includes(record.status)).length);
    updateCardValue("Approved Reports", countByStatus(mine, "Approved"));
    updateCardValue("Governance/Operations Reports", mine.filter((record) =>
      [
        "Accomplishment Report",
        "DRRM Report",
        "Compliance Report",
        "Memorandum Compliance",
        "School Forms Submission",
        "Ancillary Assignment Report",
        "Other",
      ].includes(record.reportType)
    ).length);
  } catch (error) {
    console.warn("Unable to load report assignment counters:", error);
  }
}

function canCreateLearnerRecord(role = currentUserProfile) {
  return hasAnyRole(role, learnerCreatorRoles);
}

function canEditLearnerRecord(record) {
  return (
    record.createdByUid === auth.currentUser.uid ||
    hasRole(currentUserProfile, "Administrative Assistant")
  );
}

function canUpdateLearnerIntervention(record) {
  return (
    canEditLearnerRecord(record) ||
    hasAnyRole(currentUserProfile, ["Principal", "Master Teacher", "Head Teacher", "Registrar"])
  );
}

async function createLearnerMonitoringRecord(record) {
  try {
    return await addDoc(collection(db, "learnerMonitoring"), {
      ...record,
      adviserUid: record.adviserUid || auth.currentUser.uid,
      adviserName: record.adviserName || currentUserProfile.fullName,
      createdByUid: auth.currentUser.uid,
      createdByName: currentUserProfile.fullName,
      createdByRole: primaryRole(currentUserProfile),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create learner monitoring record:", error);
    throw error;
  }
}

async function updateLearnerMonitoringRecord(recordId, record) {
  return updateDoc(doc(db, "learnerMonitoring", recordId), {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

async function updateLearnerIntervention(recordId, record) {
  return updateDoc(doc(db, "learnerMonitoring", recordId), {
    interventionProvided: record.interventionProvided,
    interventionDate: record.interventionDate,
    interventionStatus: record.interventionStatus,
    status: record.status,
    remarks: record.remarks,
    updatedAt: serverTimestamp(),
  });
}

async function getMyLearnerRecords() {
  const recordsQuery = query(
    collection(db, "learnerMonitoring"),
    where("createdByUid", "==", auth.currentUser.uid)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getLearnerRecordsByConcernTypes(concernTypes) {
  const recordsQuery = query(
    collection(db, "learnerMonitoring"),
    where("concernType", "in", concernTypes)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getAllLearnerRecords() {
  const snapshot = await getDocs(collection(db, "learnerMonitoring"));
  return snapshot.docs.map(normalizeRecord);
}

async function getVisibleLearnerRecords() {
  if (hasAnyRole(currentUserProfile, ["Principal", "Master Teacher", "Head Teacher", "Administrative Assistant"])) {
    return getAllLearnerRecords();
  }

  if (hasRole(currentUserProfile, "Teacher")) {
    return getMyLearnerRecords();
  }

  if (hasRole(currentUserProfile, "Registrar")) {
    return getLearnerRecordsByConcernTypes(registrarConcernTypes);
  }

  if (hasRole(currentUserProfile, "Administrative Officer")) {
    return getLearnerRecordsByConcernTypes(administrativeOfficerConcernTypes);
  }

  return [];
}

async function refreshLearnerCounters(role) {
  if (!db || !auth || !hasAnyRole(role, learnerMonitorRoles)) return;

  try {
    const records = await getVisibleLearnerRecords();
    const active = records.filter((record) => !["Resolved", "Closed"].includes(record.status));
    const highRisk = records.filter((record) => record.riskLevel === "High Risk");
    const ongoing = records.filter((record) => record.interventionStatus === "Ongoing");
    const resolved = records.filter((record) => record.status === "Resolved" || record.interventionStatus === "Resolved");
    const concernCount = (concerns) => records.filter((record) => concerns.includes(record.concernType)).length;

    if (hasRole(role, "Teacher")) {
      updateCardValue("My Learner Monitoring", `${active.length}/${highRisk.length}`);
      updateCardValue("My Learners-at-Risk", active.length);
      updateCardValue("My Red Risk Learners", highRisk.length);
      updateCardValue("Pending Interventions", records.filter((record) => !["Resolved", "Closed"].includes(record.status) && record.interventionStatus !== "Resolved").length);
      updateCardValue("Resolved Cases", resolved.length);
      updateCardValue("Learners-at-Risk", active.length);
      updateCardValue("Incomplete Requirements", concernCount(["Incomplete Requirements"]));
    } else if (hasAnyRole(role, ["Master Teacher", "Head Teacher"])) {
      updateCardValue("Learner Monitoring", `${active.length}/${highRisk.length}`);
      updateCardValue("Learners Under Monitoring", active.length);
      updateCardValue("Red Risk Learners", highRisk.length);
      updateCardValue("Ongoing Interventions", ongoing.length);
      updateCardValue("Resolved Cases", resolved.length);
      updateCardValue("Learners-at-Risk", active.length);
    } else if (hasRole(role, "Principal")) {
      updateCardValue("Learner Monitoring", `${active.length}/${highRisk.length}`);
      updateCardValue("Total Learners-at-Risk", active.length);
      updateCardValue("Red Risk Learners", highRisk.length);
      updateCardValue("Attendance Concerns", concernCount(["Attendance"]));
      updateCardValue("Dropout/Transfer Concerns", concernCount(["Dropout Risk", "Transfer Concern"]));
      updateCardValue("Resolved Interventions", resolved.length);
      updateCardValue("Learners-at-Risk", active.length);
      updateCardValue("Dropout Summary", concernCount(["Dropout Risk"]));
      updateCardValue("Transfer Summary", concernCount(["Transfer Concern"]));
    } else if (hasRole(role, "Registrar")) {
      updateCardValue("Learner Monitoring", `${concernCount(["Dropout Risk", "Transfer Concern"])}/${concernCount(["Incomplete Requirements", "Other"])}`);
      updateCardValue("Dropout Risk Records", concernCount(["Dropout Risk"]));
      updateCardValue("Transfer Concern Records", concernCount(["Transfer Concern"]));
      updateCardValue("Class Profile Concerns", concernCount(["Incomplete Requirements", "Other"]));
      updateCardValue("Dropout Count", concernCount(["Dropout Risk"]));
    } else if (hasAnyRole(role, ["Administrative Officer", "Administrative Assistant"])) {
      updateCardValue("Learner Monitoring", `${active.length}/${highRisk.length}`);
    }
  } catch (error) {
    console.warn("Unable to load learner monitoring counters:", error);
  }
}

function canCreateObservation(role = currentUserProfile) {
  return hasAnyRole(role, observationCreatorRoles);
}

function canEditObservation(record) {
  return hasRole(currentUserProfile, "Principal") || record.createdByUid === auth.currentUser.uid;
}

function canUpdateObservation(record) {
  return hasRole(currentUserProfile, "Principal") || record.observerUid === auth.currentUser.uid;
}

function canAddPreObservationNotes(record) {
  return record.teacherUid === auth.currentUser.uid;
}

async function getObservationTeacherOptions() {
  const observableRoles = hasRole(currentUserProfile, "Principal")
    ? ["Master Teacher", "Head Teacher", "Teacher"]
    : ["Teacher"];
  const usersQuery = query(collection(db, "users"), where("status", "==", "approved"));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs
    .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
    .filter((user) => hasAnyRole(user, observableRoles) && (user.uid || user.id) !== auth.currentUser.uid)
    .sort((a, b) =>
      (a.role || "").localeCompare(b.role || "") ||
      (a.fullName || a.email || "").localeCompare(b.fullName || b.email || "")
    );
}

async function createClassroomObservation(record) {
  try {
    return await addDoc(collection(db, "classroomObservations"), {
      ...record,
      observerUid: auth.currentUser.uid,
      observerName: currentUserProfile.fullName,
      observerRole: primaryRole(currentUserProfile),
      createdByUid: auth.currentUser.uid,
      createdByName: currentUserProfile.fullName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create classroom observation:", error);
    throw error;
  }
}

async function updateClassroomObservation(recordId, record) {
  return updateDoc(doc(db, "classroomObservations", recordId), {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

async function updateObservationStatus(recordId, record) {
  return updateDoc(doc(db, "classroomObservations", recordId), {
    status: record.status,
    postObservationNotes: record.postObservationNotes,
    observationReportLink: record.observationReportLink,
    remarks: record.remarks,
    updatedAt: serverTimestamp(),
  });
}

async function updateObservationPreNotes(recordId, preObservationNotes) {
  return updateDoc(doc(db, "classroomObservations", recordId), {
    preObservationNotes,
    updatedAt: serverTimestamp(),
  });
}

async function getMyObservationSchedules() {
  const recordsQuery = query(
    collection(db, "classroomObservations"),
    where("teacherUid", "==", auth.currentUser.uid)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getObservationsICreated() {
  const recordsQuery = query(
    collection(db, "classroomObservations"),
    where("createdByUid", "==", auth.currentUser.uid)
  );
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getAllClassroomObservations() {
  const snapshot = await getDocs(collection(db, "classroomObservations"));
  return snapshot.docs.map(normalizeRecord);
}

async function getVisibleClassroomObservations() {
  if (hasRole(currentUserProfile, "Principal")) {
    return getAllClassroomObservations();
  }

  if (canCreateObservation()) {
    const [createdByMe, scheduledForMe] = await Promise.all([
      getObservationsICreated(),
      getMyObservationSchedules(),
    ]);
    return [...new Map([...createdByMe, ...scheduledForMe].map((record) => [record.id, record])).values()];
  }

  if (hasRole(currentUserProfile, "Teacher")) {
    return getMyObservationSchedules();
  }

  return [];
}

async function refreshObservationCounters(role) {
  if (!db || !auth || !hasAnyRole(role, observationRoles)) return;

  try {
    const records = await getVisibleClassroomObservations();
    const countByStatus = (status) => records.filter((record) => record.status === status).length;
    const pending = records.filter((record) => ["Scheduled", "Confirmed"].includes(record.status)).length;
    const completed = countByStatus("Completed");

    updateCardValue("Classroom Observation", `${pending}/${completed}`);
    updateCardValue("My Classroom Observation", `${pending}/${completed}`);
    updateCardValue("Scheduled Observations", countByStatus("Scheduled"));
    updateCardValue("Completed Observations", completed);
    updateCardValue("Rescheduled Observations", countByStatus("Rescheduled"));
    updateCardValue("Pending Observations", pending);
    updateCardValue("Classroom Observation Status", records.length);
    updateCardValue("Scheduled Observation", pending);
  } catch (error) {
    console.warn("Unable to load classroom observation counters:", error);
  }
}

function canManageEnrollmentRecords() {
  return canManageStudents();
}

function canViewEnrollmentModule(role = currentUserProfile) {
  return hasAnyRole(role, enrollmentMonitorRoles);
}

function availableEnrollmentViews() {
  return enrollmentViews;
}

async function getCollectionRecords(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(normalizeRecord);
}

async function loadEnrollmentCollections() {
  if (!canViewEnrollmentModule()) return;
  classRecordsCache = await getVisibleClasses();
  studentRecordsCache = await getVisibleStudents();
  enrollmentRecordsCache = studentRecordsCache;
  transferRecordsCache = [];
  dropoutRecordsCache = [];
  classProfilesCache = [];
}

async function createEnrollmentModuleRecord(view, record) {
  const collectionName = enrollmentCollectionName(view);
  try {
    return await addDoc(collection(db, collectionName), {
      ...record,
      createdByUid: auth.currentUser.uid,
      createdByName: currentUserProfile.fullName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Failed to create ${view} record:`, error);
    throw error;
  }
}

async function updateEnrollmentModuleRecord(view, recordId, record) {
  return updateDoc(doc(db, enrollmentCollectionName(view), recordId), {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

function enrollmentCollectionName(view) {
  return {
    enrollment: "enrollmentRecords",
    transfers: "transferRecords",
    dropouts: "dropoutRecords",
    profiles: "classProfiles",
  }[view];
}

function enrollmentRecordsForView(view = activeEnrollmentView) {
  return {
    enrollment: enrollmentRecordsCache,
  }[view] || [];
}

function isEnrolledStudentStatus(status = "") {
  return ["active", "Enrolled", "Transferred In", "Completed"].includes(status || "Enrolled");
}

function normalizeStudentStatus(status = "") {
  return {
    active: "Enrolled",
    transferred: "Transferred Out",
    dropped: "Dropout",
    archived: "Archived",
  }[status] || status || "Enrolled";
}

async function refreshEnrollmentCounters(role) {
  if (!db || !auth || !canViewEnrollmentModule(role)) return;

  try {
    await loadEnrollmentCollections();
    const totalEnrolled = enrollmentRecordsCache.filter((record) => isEnrolledStudentStatus(record.status)).length;
    const completed = enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Completed").length;
    const transferIn = enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Transferred In").length;
    const transferOut = enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Transferred Out").length;
    const dropouts = enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Dropout").length;
    const activeDropoutConcerns = dropouts;
    const completionRate = enrollmentRecordsCache.length
      ? `${Math.round((completed / enrollmentRecordsCache.length) * 100)}%`
      : "0%";

    updateCardValue("Enrollment & Mobility", `${totalEnrolled}/${transferOut}/${dropouts}`);
    updateCardValue("Total Enrollment", totalEnrolled);
    updateCardValue("School-wide Enrollment", totalEnrolled);
    updateCardValue("Enrollment by Grade Level", uniqueOptions(enrollmentRecordsCache, "gradeLevel").length);
    updateCardValue("Transfer-In Count", transferIn);
    updateCardValue("Transfer-Out Count", transferOut);
    updateCardValue("Dropout Count", dropouts);
    updateCardValue("Class Profiles Updated", uniqueOptions(enrollmentRecordsCache, "sectionId").length);
    updateCardValue("Retention Summary", completionRate);
    updateCardValue("Dropout Trend", dropouts);
    updateCardValue("Transfer Trend", transferIn + transferOut);
    updateCardValue("Completion Rate", completionRate);
    updateCardValue("Learners At Risk", activeDropoutConcerns);
    updateCardValue("Dropout Concerns", activeDropoutConcerns);
    updateCardValue("Transfer Concerns", transferIn + transferOut);
  } catch (error) {
    console.warn("Unable to load enrollment counters:", error);
  }
}

function canViewDocumentRepository(role = currentUserProfile) {
  return hasAnyRole(role, documentRoles);
}

function canManageDocument(record = null) {
  if (!currentUserProfile) return false;
  if (hasAnyRole(currentUserProfile, ["Principal", "Administrative Assistant"])) return true;
  return record ? record.uploadedByUid === auth.currentUser.uid : hasAnyRole(currentUserProfile, documentRoles);
}

function canDeleteDocument(record) {
  return hasAnyRole(currentUserProfile, ["Principal", "Administrative Assistant"]) || record.uploadedByUid === auth.currentUser.uid;
}

function canSeeDocument(record) {
  return (
    hasRole(currentUserProfile, "Principal") ||
    record.uploadedByUid === auth.currentUser.uid ||
    normalizeRoleList(currentUserProfile).some((role) => (record.visibilityRoles || []).includes(role))
  );
}

async function getVisibleDocuments() {
  const documentsRef = collection(db, "documents");
  const documentsQuery =
    hasRole(currentUserProfile, "Principal")
      ? documentsRef
      : query(documentsRef, where("visibilityRoles", "array-contains-any", normalizeRoleList(currentUserProfile)));
  const snapshot = await getDocs(documentsQuery);
  return snapshot.docs.map(normalizeRecord).filter(canSeeDocument);
}

async function createDocumentRecord(record) {
  try {
    return await addDoc(collection(db, "documents"), {
      ...record,
      uploadedByUid: auth.currentUser.uid,
      uploadedByName: currentUserProfile.fullName,
      uploadedByRole: primaryRole(currentUserProfile),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create document record:", error);
    throw error;
  }
}

async function updateDocumentRecord(recordId, record) {
  return updateDoc(doc(db, "documents", recordId), {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

async function deleteDocumentRecord(recordId) {
  return deleteDoc(doc(db, "documents", recordId));
}

async function refreshDocumentCounters(role) {
  if (!db || !auth || !canViewDocumentRepository(role)) return;

  try {
    const records = await getVisibleDocuments();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countCategory = (category) => records.filter((record) => record.documentCategory === category).length;
    const recent = records.filter((record) => {
      const created = record.createdAt?.toDate?.();
      if (!created) return false;
      return `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}` === currentMonth;
    }).length;
    const pendingUpdates = records.filter((record) => !record.remarks).length;

    updateCardValue("Document Repository", `${records.length}/${recent}`);
    updateCardValue("Total Documents", records.length);
    updateCardValue("Recent Uploads", recent);
    updateCardValue("Memoranda Count", countCategory("Memoranda"));
    updateCardValue("Reports Count", countCategory("Reports"));
    updateCardValue("Certificates Count", countCategory("Certificates"));
    updateCardValue("MOV Repository Count", countCategory("MOVs"));
    updateCardValue("Total Repository Files", records.length);
    updateCardValue("Recently Uploaded Documents", recent);
    updateCardValue("Pending Updates", pendingUpdates);
    updateCardValue("Instructional Materials Count", countCategory("Instructional Materials"));
    updateCardValue("Observation Reports Count", countCategory("Classroom Observation Reports"));
    updateCardValue("Available Memoranda", countCategory("Memoranda"));
    updateCardValue("Available Templates", countCategory("Templates"));
    updateCardValue("Operations Documents", records.filter((record) =>
      ["Governance Documents", "Financial Documents", "Reports"].includes(record.documentCategory)
    ).length);
  } catch (error) {
    console.warn("Unable to load document counters:", error);
  }
}

function canViewInventoryFacilities(role = currentUserProfile) {
  return hasAnyRole(role, inventoryFacilityRoles);
}

function canManageInventoryFacilities(role = currentUserProfile) {
  return hasAnyRole(role, inventoryFacilityManagerRoles);
}

async function getVisibleInventoryFacilities() {
  if (!canViewInventoryFacilities()) return [];
  const snapshot = await getDocs(collection(db, "inventoryFacilities"));
  return snapshot.docs.map(normalizeRecord);
}

async function refreshInventoryFacilityCounters(role) {
  if (!db || !auth || !hasAnyRole(role, inventoryFacilityRoles)) return;

  try {
    const records = await getVisibleInventoryFacilities();
    const needsRepair = records.filter((record) =>
      record.condition === "Needs Repair" ||
      record.condition === "Unserviceable" ||
      record.status === "For Repair"
    ).length;
    const missing = records.filter((record) => record.condition === "Missing" || record.status === "Lost").length;
    const serviceable = records.filter((record) => ["New", "Good", "Fair"].includes(record.condition) && !["Lost", "Disposed", "Condemned"].includes(record.status)).length;

    updateCardValue("Inventory & Facilities", `${records.length}/${needsRepair + missing}`);
    updateCardValue("Inventory Summary", records.length);
    updateCardValue("Needs Repair", needsRepair);
    updateCardValue("Missing Inventory", missing);
    updateCardValue("Serviceable Inventory", serviceable);
  } catch (error) {
    console.warn("Unable to load inventory/facilities counters:", error);
  }
}

function canViewFinancialReports(role = currentUserProfile) {
  return hasAnyRole(role, financialReportRoles);
}

function canManageFinancialReports(role = currentUserProfile) {
  return hasAnyRole(role, financialReportManagerRoles);
}

function canReviewFinancialReports(role = currentUserProfile) {
  return hasAnyRole(role, financialReportReviewerRoles);
}

function canEditFinancialReport(record) {
  return canManageFinancialReports() || record?.createdBy === auth.currentUser?.uid;
}

function canDeleteFinancialReport() {
  return canManageFinancialReports();
}

async function getVisibleFinancialReports() {
  if (!canViewFinancialReports()) return [];
  const snapshot = await getDocs(collection(db, "financialReports"));
  return snapshot.docs.map(normalizeRecord);
}

function normalizeFinancialRecord(data) {
  const amountAllocated = toSafeNumber(data.amountAllocated);
  const amountSpent = toSafeNumber(data.amountSpent);
  return {
    reportTitle: data.reportTitle,
    reportType: data.reportType,
    quarter: data.quarter,
    schoolYear: data.schoolYear,
    date: data.date,
    fundSource: data.fundSource,
    category: data.category,
    description: data.description,
    amountAllocated,
    amountSpent,
    remainingBalance: amountAllocated - amountSpent,
    status: data.status,
    remarks: data.remarks,
  };
}

async function createFinancialReport(record) {
  return addDoc(collection(db, "financialReports"), {
    ...normalizeFinancialRecord(record),
    encodedBy: auth.currentUser.uid,
    encodedAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
    createdByName: currentUserProfile.fullName || auth.currentUser.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    source: record.source || "manual",
    importedBatchId: record.importedBatchId || "",
  });
}

async function updateFinancialReport(recordId, record) {
  return updateDoc(doc(db, "financialReports", recordId), {
    ...normalizeFinancialRecord(record),
    updatedAt: serverTimestamp(),
  });
}

async function updateFinancialReportStatus(recordId, status) {
  return updateDoc(doc(db, "financialReports", recordId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

async function deleteFinancialReport(recordId) {
  return deleteDoc(doc(db, "financialReports", recordId));
}

async function refreshFinancialReportCounters(role) {
  if (!db || !auth || !canViewFinancialReports(role)) return;

  try {
    const records = await getVisibleFinancialReports();
    const spent = records.reduce((sum, record) => sum + Number(record.amountSpent || 0), 0);
    const pending = records.filter((record) => ["Draft", "Submitted"].includes(record.status)).length;
    const reviewed = records.filter((record) => record.status === "Reviewed").length;
    const approved = records.filter((record) => record.status === "Approved").length;

    updateCardValue("Financial Report", canManageFinancialReports(role)
      ? `${formatPeso(spent)}/${pending}`
      : `${records.length}/${approved}`);
    updateCardValue("Total Financial Reports", records.length);
    updateCardValue("Pending Financial Reports", pending);
    updateCardValue("Reviewed Financial Reports", reviewed);
    updateCardValue("Approved Financial Reports", approved);
  } catch (error) {
    console.warn("Unable to load financial report counters:", error);
  }
}

function canViewPpaModule(role = currentUserProfile) {
  return hasAnyRole(role, ppaRoles);
}

function canCreatePpaRecord(role = currentUserProfile) {
  return hasAnyRole(role, ppaRoles);
}

function canEditPpaRecord(record) {
  if (!currentUserProfile || !record) return false;
  return (
    hasRole(currentUserProfile, "Principal") ||
    record.createdByUid === auth.currentUser.uid
  );
}

function canDeletePpaRecord() {
  return hasRole(currentUserProfile, "Principal");
}

function canSeePpaRecord(record) {
  if (!currentUserProfile || !record) return false;
  return hasRole(currentUserProfile, "Principal") || record.createdByUid === auth.currentUser.uid;
}

function ppaTermLabel(value = "") {
  return {
    Q1: "1st Term",
    Q2: "2nd Term",
    Q3: "3rd Term",
  }[value] || value;
}

async function getVisiblePpaRecords() {
  if (!canViewPpaModule()) return [];
  const source = collection(db, "ppaMonitoring");
  const snapshot = hasRole(currentUserProfile, "Principal")
    ? await getDocs(source)
    : await getDocs(query(source, where("createdByUid", "==", auth.currentUser.uid)));
  return snapshot.docs.map(normalizeRecord).filter(canSeePpaRecord);
}

async function createPpaRecord(record) {
  try {
    return await addDoc(collection(db, "ppaMonitoring"), {
      ...record,
      createdByUid: auth.currentUser.uid,
      createdByName: currentUserProfile.fullName,
      createdByRole: primaryRole(currentUserProfile),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create PPA record:", error);
    throw error;
  }
}

async function updatePpaRecord(recordId, record) {
  return updateDoc(doc(db, "ppaMonitoring", recordId), {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

async function deletePpaRecord(recordId) {
  return deleteDoc(doc(db, "ppaMonitoring", recordId));
}

async function refreshPpaCounters(role) {
  if (!db || !auth || !canViewPpaModule(role)) return;

  try {
    const records = await getVisiblePpaRecords();
    const countCategory = (category) => records.filter((record) => record.ppaCategory === category).length;
    const needsTA = records.filter((record) =>
      ["Needs Technical Assistance", "For Improvement"].includes(record.implementationStatus)
    ).length;

    updateCardValue("PPA Monitoring", `${records.length}/${needsTA}`);
    updateCardValue("Total PPAs Monitored", records.length);
    updateCardValue("Access PPAs", countCategory("Access"));
    updateCardValue("Quality PPAs", countCategory("Quality"));
    updateCardValue("Governance PPAs", countCategory("Governance"));
    updateCardValue("PPAs Needing Technical Assistance", needsTA);
  } catch (error) {
    console.warn("Unable to load PPA counters:", error);
  }
}

async function refreshUserCounters(role) {
  if (!db || !hasRole(role, "Principal")) return;

  try {
    const snapshot = await getDocs(collection(db, "users"));
    const users = snapshot.docs.map((userDoc) => userDoc.data());
    const pending = users.filter((user) => user.status === "pending").length;
    updateCardValue("Users & Approvals", `${users.length}/${pending}`);
    updateCardValue("Total Users", users.length);
    updateCardValue("Total Teachers", users.filter((user) => hasRole(user, "Teacher") && user.status === "approved").length);
    updateCardValue("Pending User Approvals", pending);
  } catch (error) {
    console.warn("Unable to load user counters:", error);
  }
}

function canManageClasses(role = currentUserProfile) {
  return hasAnyRole(role, academicManagerRoles);
}

function canManageStudents(role = currentUserProfile) {
  return hasAnyRole(role, ["Registrar", "Principal"]);
}

function canViewAcademicModule(role = currentUserProfile) {
  return hasAnyRole(role, academicMonitorRoles);
}

function canViewAllAcademic(role = currentUserProfile) {
  return hasAnyRole(role, academicViewerRoles);
}

function canEncodeAssessmentScores() {
  return Boolean(auth?.currentUser?.uid && hasAnyRole(currentUserProfile, ["Teacher", "Master Teacher", "Head Teacher"]));
}

function canEditSectionRecords(sectionId) {
  return Boolean(sectionId && auth?.currentUser?.uid && classRecordsCache.some((record) => record.id === sectionId && record.adviserId === auth.currentUser.uid));
}

function canEditAssessmentRecord(record = {}) {
  if (!auth?.currentUser?.uid) return false;
  const ownerUid = record.teacherUid || record.teacherId || "";
  return ownerUid
    ? ownerUid === auth.currentUser.uid
    : record.encodedBy === auth.currentUser.uid || record.createdBy === auth.currentUser.uid;
}

async function getVisibleSectionScopedRecords(collectionName) {
  if (!hasRole(currentUserProfile, "Teacher") || canViewAllAcademic()) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(normalizeRecord);
  }
  const assignedClasses = classRecordsCache.length
    ? classRecordsCache.filter((record) => record.adviserId === auth.currentUser.uid)
    : await getVisibleClasses();
  const snapshots = await Promise.all(
    assignedClasses.map((section) => getDocs(query(collection(db, collectionName), where("sectionId", "==", section.id))))
  );
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalizeRecord));
}

async function getVisibleClasses() {
  const classQuery = hasRole(currentUserProfile, "Teacher") && !canViewAllAcademic()
    ? query(collection(db, "classes"), where("adviserId", "==", auth.currentUser.uid))
    : collection(db, "classes");
  const snapshot = await getDocs(classQuery);
  return snapshot.docs.map(normalizeRecord);
}

async function getVisibleStudents() {
  return getVisibleSectionScopedRecords("students");
}

async function getVisibleStudentAttendance() {
  return getVisibleSectionScopedRecords("studentAttendance");
}

async function getVisibleAssessments() {
  if (!hasRole(currentUserProfile, "Teacher") || canViewAllAcademic()) {
    const snapshot = await getDocs(collection(db, "assessments"));
    return snapshot.docs.map(normalizeRecord);
  }
  const [ownRecords, adviserRecords] = await Promise.all([
    getDocs(query(collection(db, "assessments"), where("teacherUid", "==", auth.currentUser.uid))),
    getVisibleSectionScopedRecords("assessments").then((records) => ({ docs: records.map((record) => ({ id: record.id, data: () => record })) })),
  ]);
  const mapped = [
    ...ownRecords.docs.map(normalizeRecord),
    ...adviserRecords.docs.map(normalizeRecord),
  ];
  return [...new Map(mapped.map((record) => [record.id, record])).values()];
}

async function getAssessmentVisibleClasses() {
  if (!hasRole(currentUserProfile, "Teacher") || canViewAllAcademic()) return getVisibleClasses();
  const [adviserClasses, workloads] = await Promise.all([
    getVisibleClasses(),
    getVisibleTeacherWorkloadRecords(),
  ]);
  const workloadClasses = workloads
    .filter((record) => record.teacherId === auth.currentUser.uid && record.sectionId)
    .map((record) => ({
      id: record.sectionId,
      gradeLevel: record.gradeLevel || "",
      sectionName: record.sectionName || "Assigned section",
      schoolYear: record.schoolYear || "",
      adviserId: "",
      adviserName: "",
      status: "active",
    }));
  return [...new Map([...adviserClasses, ...workloadClasses].map((record) => [record.id, record])).values()];
}

async function getAssessmentVisibleStudents(classes = classRecordsCache) {
  if (!hasRole(currentUserProfile, "Teacher") || canViewAllAcademic()) return getVisibleStudents();
  const sectionIds = new Set(classes.map((record) => record.id));
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map(normalizeRecord).filter((record) => sectionIds.has(record.sectionId));
}

async function getVisibleTeacherAttendance() {
  if (!hasAnyRole(currentUserProfile, teacherAttendanceViewerRoles)) return [];
  const snapshot = await getDocs(collection(db, "teacherAttendance"));
  return snapshot.docs.map(normalizeRecord);
}

function canManageTeacherAttendance(role = currentUserProfile) {
  return hasAnyRole(role, ["Principal", "Administrative Officer", "Administrative Assistant"]);
}

async function refreshTeacherAttendanceCounters(role) {
  if (!db || !auth || !hasAnyRole(role, teacherAttendanceViewerRoles)) return;
  try {
    const records = (await getVisibleTeacherAttendance()).filter((record) => teacherAttendanceStatuses.includes(record.status));
    const present = records.filter((record) => record.status === "Present").length;
    const attendanceRate = records.length ? Math.round((present / records.length) * 100) : 0;
    const absent = records.filter((record) => record.status === "Absent").length;
    updateCardValue("Teacher Attendance", `${attendanceRate}%/${absent}`);
    updateCardValue("Leave Monitoring", absent);
  } catch (error) {
    console.warn("Unable to load teacher attendance counters:", error);
  }
}

function canViewTeacherWorkload(role = currentUserProfile) {
  return hasAnyRole(role, teacherWorkloadRoles);
}

function canManageTeacherWorkload(role = currentUserProfile) {
  return hasRole(role, "Principal");
}

function canManageSchoolSubjects(role = currentUserProfile) {
  return hasRole(role, "Principal");
}

async function getVisibleSchoolSubjects() {
  const snapshot = await getDocs(collection(db, "schoolSubjects"));
  return snapshot.docs.map(normalizeRecord);
}

async function loadTeacherWorkloadTeachers() {
  if (hasRole(currentUserProfile, "Teacher") && !canManageTeacherWorkload()) {
    academicTeachersCache = [{
      id: auth.currentUser.uid,
      uid: auth.currentUser.uid,
      fullName: currentUserProfile.fullName || auth.currentUser.email,
      email: currentUserProfile.email || auth.currentUser.email,
      role: formatRoleList(currentUserProfile),
      department: currentUserProfile.department || "",
    }];
    return;
  }
  await loadAcademicTeachers();
}

async function getVisibleTeacherWorkloadRecords() {
  if (!canViewTeacherWorkload()) return [];
  const source = collection(db, "teacherWorkloads");
  if (!hasRole(currentUserProfile, "Teacher") || canManageTeacherWorkload()) {
    const snapshot = await getDocs(source);
    return snapshot.docs.map(normalizeRecord);
  }

  const records = new Map();
  const ownSnapshot = await getDocs(query(source, where("teacherId", "==", auth.currentUser.uid)));
  ownSnapshot.docs.forEach((record) => records.set(record.id, normalizeRecord(record)));
  const advisoryClasses = classRecordsCache.filter((section) => section.adviserId === auth.currentUser.uid);
  const advisorySnapshots = await Promise.all(
    advisoryClasses.map((section) => getDocs(query(source, where("sectionId", "==", section.id))))
  );
  advisorySnapshots.flatMap((snapshot) => snapshot.docs).forEach((record) => records.set(record.id, normalizeRecord(record)));
  return [...records.values()];
}

async function getVisibleAncillaryAssignments() {
  if (!canViewTeacherWorkload()) return [];
  const source = collection(db, "ancillaryAssignments");
  const assignmentQuery = hasRole(currentUserProfile, "Teacher") && !canManageTeacherWorkload()
    ? query(source, where("teacherId", "==", auth.currentUser.uid))
    : source;
  const snapshot = await getDocs(assignmentQuery);
  return snapshot.docs.map(normalizeRecord);
}

function canViewGradeSubmissionModule(role = currentUserProfile) {
  return hasAnyRole(role, gradeSubmissionRoles);
}

function canMonitorAllGradeSubmissions(role = currentUserProfile) {
  return hasAnyRole(role, ["Principal", "Admin", "SuperAdmin", "Master Teacher", "Head Teacher"]);
}

function canViewLessonPlanModule(role = currentUserProfile) {
  return hasAnyRole(role, lessonPlanRoles);
}

function canSubmitLessonPlanForWorkload(workload) {
  return Boolean(workload?.teacherId && workload.teacherId === auth.currentUser.uid && !hasRole(currentUserProfile, "Principal"));
}

function canReviewLessonPlan() {
  return hasAnyRole(currentUserProfile, ["Principal", "Master Teacher", "Head Teacher"]);
}

async function getVisibleLessonPlans() {
  if (!canViewLessonPlanModule()) return [];
  if (canReviewLessonPlan()) {
    const snapshot = await getDocs(collection(db, "lessonPlans"));
    return snapshot.docs.map(normalizeRecord);
  }
  const mine = await getDocs(query(collection(db, "lessonPlans"), where("teacherId", "==", auth.currentUser.uid)));
  return mine.docs.map(normalizeRecord);
}

function findLessonPlanRecord(workloadId, term, weekNumber) {
  return lessonPlanRecordsCache.find((record) =>
    record.workloadId === workloadId
    && record.term === term
    && Number(record.weekNumber || 0) === Number(weekNumber || 0)
  );
}

function defaultTaskVisibilitySettings() {
  return {
    gradeTerms: [...termOptions],
    assessmentScopes: assessmentScopeOptions.map((item) => item.key),
    lessonPlanWeeks: lessonPlanWeekOptions.map((item) => item.key),
  };
}

async function getTaskVisibilitySettings(force = false) {
  if (taskVisibilitySettingsCache && !force) return taskVisibilitySettingsCache;
  if (!db || !auth?.currentUser) {
    taskVisibilitySettingsCache = defaultTaskVisibilitySettings();
    return taskVisibilitySettingsCache;
  }
  try {
    const snapshot = await getDoc(doc(db, "systemSettings", "taskVisibility"));
    taskVisibilitySettingsCache = {
      ...defaultTaskVisibilitySettings(),
      ...(snapshot.exists() ? snapshot.data() : {}),
    };
  } catch (error) {
    console.warn("Unable to load task visibility settings:", error);
    taskVisibilitySettingsCache = defaultTaskVisibilitySettings();
  }
  return taskVisibilitySettingsCache;
}

async function saveTaskVisibilitySettings(settings) {
  await setDoc(doc(db, "systemSettings", "taskVisibility"), {
    ...defaultTaskVisibilitySettings(),
    ...settings,
    updatedByUid: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  taskVisibilitySettingsCache = null;
  await getTaskVisibilitySettings(true);
}

function selectedTaskCheckboxValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function activeGradeTerms(settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings()) {
  return settings.gradeTerms?.length ? settings.gradeTerms : termOptions;
}

function activeAssessmentScopes(settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings()) {
  return settings.assessmentScopes?.length ? settings.assessmentScopes : assessmentScopeOptions.map((item) => item.key);
}

function activeLessonPlanWeeks(settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings()) {
  return settings.lessonPlanWeeks?.length ? settings.lessonPlanWeeks : lessonPlanWeekOptions.map((item) => item.key);
}

function lessonPlanScopeKey(record) {
  if (record.term && record.weekNumber) return `${record.term}:Week ${record.weekNumber}`;
  return "";
}

function assessmentScopeMatches(record, scoreType, settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings()) {
  return activeAssessmentScopes(settings).includes(`${record.term}:${scoreType}`);
}

async function getVisibleGradeSubmissions() {
  if (!canViewGradeSubmissionModule()) return [];
  if (canMonitorAllGradeSubmissions()) {
    const snapshot = await getDocs(collection(db, "gradeSubmissions"));
    return snapshot.docs.map(normalizeRecord);
  }

  const records = new Map();
  const [mineByTeacherId, mineByTeacherUid] = await Promise.all([
    getDocs(query(collection(db, "gradeSubmissions"), where("teacherId", "==", auth.currentUser.uid))),
    getDocs(query(collection(db, "gradeSubmissions"), where("teacherUid", "==", auth.currentUser.uid))).catch(() => ({ docs: [] })),
  ]);
  [...mineByTeacherId.docs, ...mineByTeacherUid.docs].forEach((record) => records.set(record.id, normalizeRecord(record)));

  const advisoryClasses = classRecordsCache.length
    ? classRecordsCache.filter((section) => section.adviserId === auth.currentUser.uid)
    : await getVisibleClasses();
  const advisorySnapshots = await Promise.all(
    advisoryClasses.map((section) => getDocs(query(collection(db, "gradeSubmissions"), where("sectionId", "==", section.id))))
  );
  advisorySnapshots.flatMap((snapshot) => snapshot.docs).forEach((record) => records.set(record.id, normalizeRecord(record)));
  return [...records.values()];
}

function mergeClassesWithWorkloadSections(classes = [], workloads = []) {
  const merged = new Map(classes.map((record) => [record.id, record]));
  workloads.forEach((workload) => {
    if (!workload.sectionId || merged.has(workload.sectionId)) return;
    merged.set(workload.sectionId, {
      id: workload.sectionId,
      gradeLevel: workload.gradeLevel || "",
      sectionName: assessmentSectionOnlyLabel(workload.sectionName || "Assigned section"),
      schoolYear: workload.schoolYear || "",
      adviserId: workload.adviserId || "",
      adviserName: workload.adviserName || "",
      status: "active",
    });
  });
  return [...merged.values()];
}

function gradeWorkloadLabel(workload) {
  return subjectGradeSectionClassLabel(workload);
}

function gradeSubmissionSubjectName(record = {}) {
  return record.subjectName || "Unspecified Subject";
}

function gradeSubmissionSubjectCategory(record = {}) {
  return record.subjectCategory || record.subjectArea || "";
}

function gradeSubmissionTeacherUid(record = {}) {
  return record.teacherUid || record.teacherId || "";
}

function gradeSubmissionTeacherName(record = {}) {
  return record.teacherName || record.adviserName || record.encodedByName || record.createdByName || "Unspecified Teacher";
}

function gradeSubmissionStatus(record = {}) {
  if (gradeSubmissionStatusOptions.includes(record.submissionStatus)) return record.submissionStatus;
  if (record.submissionStatus === "Not Submitted") return "Not Started";
  if (["Late", "Reviewed"].includes(record.submissionStatus)) return "Submitted";
  if (record.studentId || record.grade !== undefined) return "Submitted";
  return "Not Started";
}

function isLegacyGradeSubmissionRecord(record = {}) {
  return Boolean((record.studentId || record.grade !== undefined) && !record.submissionStatus);
}

function gradeSubmissionRecordKey(record = {}) {
  return [
    record.workloadId || "",
    record.schoolYear || "",
    record.term || record.quarter || "",
    record.gradeLevel || "",
    record.sectionId || record.sectionName || "",
    record.subjectId || gradeSubmissionSubjectName(record),
    gradeSubmissionTeacherUid(record) || gradeSubmissionTeacherName(record),
  ].join("|");
}

function gradeSubmissionWorkloadKey(workload = {}, term = "") {
  const section = getSelectedClass(workload.sectionId);
  return [
    workload.id || "",
    section?.schoolYear || workload.schoolYear || "",
    term,
    workload.gradeLevel || section?.gradeLevel || "",
    workload.sectionId || workload.sectionName || "",
    workload.subjectId || workload.subjectName || "",
    workload.teacherId || workload.teacherName || "",
  ].join("|");
}

function gradeSubmissionRowKey(row = {}) {
  return [
    row.workloadId || "",
    row.schoolYear || "",
    row.term || "",
    row.gradeLevel || "",
    row.sectionId || row.sectionName || "",
    row.subjectId || row.subjectName || "",
    row.teacherUid || row.teacherName || "",
  ].join("|");
}

function normalizeGradeSubmissionRecordRow(record = {}, groupedRecords = [record]) {
  const first = groupedRecords[0] || record || {};
  const status = gradeSubmissionStatus(first);
  const teacherUid = gradeSubmissionTeacherUid(first);
  const subjectName = gradeSubmissionSubjectName(first);
  const grades = gradeSubmissionGradesMap(first, groupedRecords);
  const encodedStudents = gradeSubmissionEncodedCount({ grades, isLegacy: groupedRecords.some(isLegacyGradeSubmissionRecord), legacyCount: groupedRecords.length });
  const totalStudents = gradeSubmissionTotalStudents(first.sectionId);
  const row = {
    id: first.id || gradeSubmissionRecordKey(first),
    recordId: first.submissionStatus ? first.id : "",
    recordIds: groupedRecords.map((item) => item.id).filter(Boolean),
    batchId: first.batchId || "",
    workloadId: first.workloadId || "",
    schoolYear: first.schoolYear || "",
    term: first.term || first.quarter || "",
    quarter: first.quarter || first.term || "",
    gradeLevel: first.gradeLevel || "",
    sectionId: first.sectionId || "",
    sectionName: first.sectionName || "",
    subjectId: first.subjectId || "",
    subjectName,
    subjectCategory: gradeSubmissionSubjectCategory(first),
    teacherUid,
    teacherId: teacherUid,
    teacherName: gradeSubmissionTeacherName(first),
    adviserId: first.adviserId || "",
    dueDate: first.dueDate || "",
    dateSubmitted: first.dateSubmitted || first.submittedAt || "",
    submissionStatus: status,
    grades,
    encodedStudents,
    totalStudents,
    remarks: first.remarks || (isLegacyGradeSubmissionRecord(first) ? `${groupedRecords.length} legacy student grade entr${groupedRecords.length === 1 ? "y" : "ies"}` : ""),
    createdBy: first.createdBy || first.encodedBy || "",
    createdByName: first.createdByName || first.encodedByName || "",
    createdAt: first.createdAt || null,
    updatedAt: first.updatedAt || first.createdAt || null,
    isLegacy: groupedRecords.some(isLegacyGradeSubmissionRecord),
    isVirtual: false,
  };
  row.key = gradeSubmissionRowKey(row);
  return row;
}

function gradeSubmissionExpectedWorkloads() {
  return teacherWorkloadRecordsCache.filter((workload) => workload.sectionId);
}

function buildGradeSubmissionRows(records = gradeSubmissionRecordsCache, workloads = gradeSubmissionExpectedWorkloads()) {
  const rowsByKey = new Map();
  const legacyBuckets = new Map();
  records.forEach((record) => {
    if (isLegacyGradeSubmissionRecord(record)) {
      const key = gradeSubmissionRecordKey(record);
      if (!legacyBuckets.has(key)) legacyBuckets.set(key, []);
      legacyBuckets.get(key).push(record);
      return;
    }
    const row = normalizeGradeSubmissionRecordRow(record);
    rowsByKey.set(row.key, row);
  });
  legacyBuckets.forEach((groupedRecords) => {
    const row = normalizeGradeSubmissionRecordRow(groupedRecords[0], groupedRecords);
    if (!rowsByKey.has(row.key)) rowsByKey.set(row.key, row);
  });

  activeGradeTerms().forEach((term) => {
    workloads.forEach((workload) => {
      const section = getSelectedClass(workload.sectionId);
      const row = {
        id: `expected:${gradeSubmissionWorkloadKey(workload, term)}`,
        recordId: "",
        recordIds: [],
        batchId: "",
        workloadId: workload.id || "",
        schoolYear: section?.schoolYear || workload.schoolYear || "",
        term,
        quarter: term,
        gradeLevel: workload.gradeLevel || section?.gradeLevel || "",
        sectionId: workload.sectionId || "",
        sectionName: workload.sectionName || (section ? classLabel(section) : ""),
        subjectId: workload.subjectId || "",
        subjectName: workload.subjectName || "Unspecified Subject",
        subjectCategory: workload.subjectArea || "",
        teacherUid: workload.teacherId || "",
        teacherId: workload.teacherId || "",
        teacherName: workload.teacherName || "Unspecified Teacher",
        adviserId: section?.adviserId || "",
        dueDate: "",
        dateSubmitted: "",
        submissionStatus: "Not Started",
        grades: {},
        encodedStudents: 0,
        totalStudents: gradeSubmissionTotalStudents(workload.sectionId),
        remarks: "",
        createdBy: "",
        createdByName: "",
        createdAt: null,
        updatedAt: null,
        isLegacy: false,
        isVirtual: true,
      };
      row.key = gradeSubmissionRowKey(row);
      if (!rowsByKey.has(row.key)) rowsByKey.set(row.key, row);
    });
  });

  return [...rowsByKey.values()].sort((a, b) =>
    String(b.updatedAt || b.dateSubmitted || "").localeCompare(String(a.updatedAt || a.dateSubmitted || ""))
    || a.schoolYear.localeCompare(b.schoolYear)
    || a.term.localeCompare(b.term)
    || a.gradeLevel.localeCompare(b.gradeLevel)
    || a.sectionName.localeCompare(b.sectionName)
    || a.subjectName.localeCompare(b.subjectName)
  );
}

function isGradeSubmissionComplied(status = "") {
  return gradeSubmissionCompliedStatuses.includes(status);
}

function gradeSubmissionGradesMap(record = {}, groupedRecords = [record]) {
  if (record.grades && typeof record.grades === "object" && !Array.isArray(record.grades)) return record.grades;
  if (!groupedRecords.some(isLegacyGradeSubmissionRecord)) return {};
  return groupedRecords.reduce((grades, item) => {
    const studentId = item.studentId || item.lrn || item.id;
    if (!studentId) return grades;
    grades[studentId] = {
      studentId,
      lrn: item.lrn || "",
      studentName: item.studentName || item.learnerName || "",
      grade: item.grade ?? "",
      remarks: item.remarks || "",
    };
    return grades;
  }, {});
}

function gradeSubmissionTotalStudents(sectionId = "") {
  return studentRecordsCache.filter((student) => student.sectionId === sectionId && isEnrolledStudentStatus(student.status)).length;
}

function gradeSubmissionEncodedCount(row = {}) {
  if (row.isLegacy) return Number(row.legacyCount || Object.keys(row.grades || {}).length || 0);
  return Object.values(row.grades || {}).filter((entry) => entry?.grade !== "" && entry?.grade !== null && entry?.grade !== undefined).length;
}

function gradeSubmissionDocId(workloadId = "", term = "") {
  return [workloadId, term].map((part) => String(part || "").replace(/[^A-Za-z0-9_-]/g, "_")).join("__");
}

function gradeAverage(values) {
  const numeric = values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : 0;
}

function formatGradeSubmissionPercent(value, total) {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(0)}%`;
}

async function refreshGradeSubmissionCounters(role) {
  if (!db || !auth || !canViewGradeSubmissionModule(role)) return;
  try {
    const visibility = await getTaskVisibilitySettings();
    const visibleTerms = activeGradeTerms(visibility);
    await loadTeacherWorkloadTeachers();
    await getTaskVisibilitySettings();
    classRecordsCache = await getVisibleClasses();
    teacherWorkloadRecordsCache = await getVisibleTeacherWorkloadRecords();
    classRecordsCache = mergeClassesWithWorkloadSections(classRecordsCache, teacherWorkloadRecordsCache);
    studentRecordsCache = await getAssessmentVisibleStudents(classRecordsCache);
    gradeSubmissionRecordsCache = await getVisibleGradeSubmissions();
    const rows = buildGradeSubmissionRows(gradeSubmissionRecordsCache, gradeSubmissionExpectedWorkloads())
      .filter((row) => visibleTerms.includes(row.term));
    const expected = rows.length;
    const submitted = rows.filter((row) => isGradeSubmissionComplied(row.submissionStatus)).length;
    const pending = Math.max(expected - submitted, 0);
    updateCardValue("Grade Submission", `${formatGradeSubmissionPercent(submitted, expected)}/${formatGradeSubmissionPercent(pending, expected)}`);
    updateCardValue("Grades Submitted", formatGradeSubmissionPercent(submitted, expected));
    updateCardValue("Grades Pending", formatGradeSubmissionPercent(pending, expected));
  } catch (error) {
    console.warn("Unable to load grade submission counters:", error);
  }
}

async function refreshLessonPlanCounters(role) {
  if (!db || !auth || !canViewLessonPlanModule(role)) return;
  try {
    const visibility = await getTaskVisibilitySettings();
    const visibleWeeks = activeLessonPlanWeeks(visibility);
    await loadTeacherWorkloadTeachers();
    classRecordsCache = await getVisibleClasses();
    teacherWorkloadRecordsCache = await getVisibleTeacherWorkloadRecords();
    lessonPlanRecordsCache = await getVisibleLessonPlans();
    const workloads = teacherWorkloadRecordsCache.filter((workload) =>
      workload.sectionId
      && (hasAnyRole(role, ["Principal", "Master Teacher", "Head Teacher"]) || workload.teacherId === auth.currentUser.uid)
    );
    const expected = workloads.length * visibleWeeks.length;
    const submitted = new Set(lessonPlanRecordsCache
      .filter((record) => visibleWeeks.includes(lessonPlanScopeKey(record)))
      .map((record) => `${record.workloadId}:${lessonPlanScopeKey(record)}`)).size;
    const pending = Math.max(expected - submitted, 0);
    updateCardValue("Lesson Plans", `${submitted}/${pending}`);
  } catch (error) {
    console.warn("Unable to load lesson plan counters:", error);
  }
}

function getWorkloadStatus(score) {
  return WORKLOAD_RULES.statusThresholds.find((threshold) => score <= threshold.max) || WORKLOAD_RULES.statusThresholds.at(-1);
}

function getDefaultSubjectHours(subjectName = "", subjectArea = "") {
  const normalized = `${subjectName} ${subjectArea}`.toLowerCase();
  const corePattern = /(english|filipino|math|mathematics|science|araling panlipunan|social studies|mapeh|tle|esp)/;
  return corePattern.test(normalized) ? WORKLOAD_RULES.defaultCoreSubjectHours : WORKLOAD_RULES.defaultElectiveHours;
}

function teacherDisplayName(teacher) {
  return teacher?.fullName || teacher?.email || teacher?.id || "Unnamed teacher";
}

function buildTeacherWorkloadSummaries() {
  const visibleTeacherIds = new Set(academicTeachersCache.map((teacher) => teacher.id));
  teacherWorkloadRecordsCache.forEach((record) => {
    if (record.teacherId && !visibleTeacherIds.has(record.teacherId)) {
      academicTeachersCache.push({
        id: record.teacherId,
        fullName: record.teacherName || record.teacherId,
        role: "Teacher",
        department: record.department || "",
      });
      visibleTeacherIds.add(record.teacherId);
    }
  });
  ancillaryAssignmentRecordsCache.forEach((record) => {
    if (record.teacherId && !visibleTeacherIds.has(record.teacherId)) {
      academicTeachersCache.push({
        id: record.teacherId,
        fullName: record.teacherName || record.teacherId,
        role: "Teacher",
        department: record.department || "",
      });
      visibleTeacherIds.add(record.teacherId);
    }
  });
  classRecordsCache.forEach((section) => {
    if (section.adviserId && !visibleTeacherIds.has(section.adviserId)) {
      academicTeachersCache.push({
        id: section.adviserId,
        fullName: section.adviserName || section.adviserId,
        role: "Teacher",
        department: "",
      });
      visibleTeacherIds.add(section.adviserId);
    }
  });

  return academicTeachersCache.map((teacher) => {
    const teachingAssignments = teacherWorkloadRecordsCache.filter((record) => record.teacherId === teacher.id);
    const duties = ancillaryAssignmentRecordsCache.filter((record) => record.teacherId === teacher.id);
    const advisoryClasses = classRecordsCache.filter((section) => section.adviserId === teacher.id);
    const sections = [
      ...teachingAssignments.map((record) => subjectGradeSectionClassLabel(record, "No section")).filter(Boolean),
      ...advisoryClasses.map(classLabel),
    ];
    const subjects = [...new Set(teachingAssignments.map((record) => record.subjectName).filter(Boolean))];
    const teachingHours = teachingAssignments.reduce((sum, record) => sum + Number(record.weeklyHours || 0), 0);
    const preparations = teachingAssignments.reduce((sum, record) => sum + Number(record.preparations || 0), 0);
    const advisoryScore = advisoryClasses.length * WORKLOAD_RULES.advisoryClassHours;
    const preparationScore = Math.max(0, preparations - WORKLOAD_RULES.normalPreparationAllowance) * WORKLOAD_RULES.extraPreparationPoint;
    const ancillaryScore = duties.reduce((sum, record) => sum + Number(record.equivalentHours || record.workloadPoints || 0), 0);
    const teachingLoadScore = teachingHours + advisoryScore + preparationScore;
    const workloadScore = teachingLoadScore + ancillaryScore;
    const status = getWorkloadStatus(workloadScore);
    const studentCount = [...new Set([
      ...studentRecordsCache.filter((student) => advisoryClasses.some((section) => section.id === student.sectionId)).map((student) => student.id),
      ...studentRecordsCache.filter((student) => teachingAssignments.some((assignment) => assignment.sectionId === student.sectionId)).map((student) => student.id),
    ])].length;

    return {
      teacher,
      teacherId: teacher.id,
      teacherName: teacherDisplayName(teacher),
      department: teacher.department || teacher.subjectArea || "",
      role: teacher.role || "Teacher",
      teachingAssignments,
      duties,
      advisoryClasses,
      subjects,
      sections: [...new Set(sections)],
      gradeLevels: [...new Set([
        ...teachingAssignments.map((record) => record.gradeLevel).filter(Boolean),
        ...advisoryClasses.map((section) => section.gradeLevel).filter(Boolean),
      ])],
      subjectAreas: [...new Set(teachingAssignments.map((record) => record.subjectArea).filter(Boolean))],
      teachingHours,
      preparations,
      advisoryScore,
      ancillaryScore,
      teachingLoadScore,
      workloadScore,
      workloadStatus: status.label,
      workloadCategory: status.category,
      studentCount,
      suggestions: buildWorkloadSuggestions({
        teachingHours,
        duties,
        sections,
        workloadStatus: status.label,
        workloadScore,
      }),
    };
  }).sort((a, b) => b.workloadScore - a.workloadScore || a.teacherName.localeCompare(b.teacherName));
}

function buildWorkloadSuggestions(summary) {
  const suggestions = [];
  if (summary.workloadStatus === "Overloaded") suggestions.push("Teacher may be overloaded.");
  if (summary.teachingHours >= 28) suggestions.push("Consider redistributing sections.");
  if (summary.duties.length >= 3) suggestions.push("Teacher has multiple ancillary duties.");
  if (summary.workloadScore < 16) suggestions.push("Teacher has very low load.");
  return suggestions.length ? suggestions : ["Workload appears balanced."];
}

function workloadStatusBadge(status) {
  return `<span class="badge workload-status-${statusClass(status)}">${escapeHtml(status)}</span>`;
}

async function refreshTeacherWorkloadCounters(role) {
  if (!db || !auth || !canViewTeacherWorkload(role)) return;
  try {
    await loadTeacherWorkloadTeachers();
    [classRecordsCache, studentRecordsCache, schoolSubjectRecordsCache, teacherWorkloadRecordsCache, ancillaryAssignmentRecordsCache] = await Promise.all([
      getVisibleClasses(),
      getVisibleStudents(),
      getVisibleSchoolSubjects(),
      getVisibleTeacherWorkloadRecords(),
      getVisibleAncillaryAssignments(),
    ]);
    const summaries = buildTeacherWorkloadSummaries();
    const overloaded = summaries.filter((summary) => summary.workloadStatus === "Overloaded").length;
    const underloaded = summaries.filter((summary) => summary.workloadStatus === "Light Load").length;
    const ancillaryCount = summaries.reduce((sum, summary) => sum + summary.duties.length, 0);
    updateCardValue("Teacher Workload", `${overloaded}/${underloaded}`);
    updateCardValue("Teachers Overloaded", overloaded);
    updateCardValue("Teachers Underloaded", underloaded);
    updateCardValue("Ancillary Assignments", ancillaryCount);
    const mine = summaries.find((summary) => summary.teacherId === auth.currentUser.uid);
    if (mine) {
      const mySummary = `${mine.workloadScore.toFixed(1)} (${mine.workloadStatus})`;
      updateCardValue("My Workload Status", mySummary);
      updateCardValue("My Teacher Workload", mySummary);
    }
  } catch (error) {
    console.warn("Unable to load teacher workload counters:", error);
  }
}

async function loadAcademicTeachers() {
  const snapshot = await getDocs(query(collection(db, "users"), where("status", "==", "approved")));
  academicTeachersCache = snapshot.docs
    .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
    .filter((user) => hasAnyRole(user, ["Teacher", "Master Teacher", "Head Teacher", "Principal"]))
    .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
}

async function loadTeacherAttendancePersonnel() {
  const snapshot = await getDocs(query(collection(db, "users"), where("status", "==", "approved")));
  academicTeachersCache = snapshot.docs
    .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
    .filter((user) => hasAnyRole(user, ["Principal", "Master Teacher", "Head Teacher", "Teacher", "Registrar", "Administrative Officer", "Administrative Assistant"]))
    .sort((a, b) => (a.fullName || a.email || "").localeCompare(b.fullName || b.email || ""));
}

function classLabel(record) {
  return `${record.gradeLevel || "Grade"} - ${record.sectionName || "Section"}`;
}

function gradeLevelShortLabel(gradeLevel = "") {
  const value = String(gradeLevel || "").trim();
  return value ? value.replace(/^Grade\s*/i, "").trim() || value : "Grade";
}

function subjectGradeSectionClassLabel(record = {}, fallbackSectionName = "Class") {
  const section = record.sectionId ? getSelectedClass(record.sectionId) : null;
  const subject = record.subjectName || record.subject || "Subject";
  const grade = gradeLevelShortLabel(record.gradeLevel || section?.gradeLevel || "");
  const sectionName = assessmentSectionOnlyLabel(record.sectionName || section?.sectionName || fallbackSectionName);
  return `${subject} ${grade} - ${sectionName}`;
}

function activeClassOptions(selected = "", placeholder = "Select section") {
  const options = classRecordsCache
    .filter((record) => record.status !== "archived")
    .map((record) => `<option value="${escapeHtml(record.id)}" ${record.id === selected ? "selected" : ""}>${escapeHtml(classLabel(record))}</option>`)
    .join("");
  return `<option value="">${placeholder}</option>${options}`;
}

function teacherOptions(selected = "", placeholder = "Select adviser") {
  const options = academicTeachersCache
    .map((teacher) => `<option value="${escapeHtml(teacher.id)}" ${teacher.id === selected ? "selected" : ""}>${escapeHtml(teacher.fullName || teacher.email || teacher.id)} (${escapeHtml(teacher.role || "Teacher")})</option>`)
    .join("");
  return `<option value="">${placeholder}</option>${options}`;
}

function getSelectedClass(sectionId) {
  return classRecordsCache.find((record) => record.id === sectionId) || null;
}

function academicFilterMatch(record, search = "", filters = {}) {
  const haystack = Object.values(record).join(" ").toLowerCase();
  const queryText = search.trim().toLowerCase();
  return (!queryText || haystack.includes(queryText))
    && (!filters.schoolYear || record.schoolYear === filters.schoolYear)
    && (!filters.term || record.term === filters.term)
    && (!filters.gradeLevel || record.gradeLevel === filters.gradeLevel)
    && (!filters.sectionId || record.sectionId === filters.sectionId || record.id === filters.sectionId);
}

function computeAssessmentStats(records = assessmentRecordsCache, attendance = studentAttendanceRecordsCache, students = studentRecordsCache, classes = classRecordsCache) {
  const preScored = records.filter((record) => getAssessmentHighScore(record, "pre") > 0);
  const postScored = records.filter((record) => getAssessmentHighScore(record, "post") > 0);
  const totalPrePossibleScore = preScored.reduce((sum, record) => sum + getAssessmentHighScore(record, "pre"), 0);
  const totalPostPossibleScore = postScored.reduce((sum, record) => sum + getAssessmentHighScore(record, "post"), 0);
  const preMps = totalPrePossibleScore ? (preScored.reduce((sum, record) => sum + Number(record.preTestScore || 0), 0) / totalPrePossibleScore) * 100 : 0;
  const postMps = totalPostPossibleScore ? (postScored.reduce((sum, record) => sum + Number(record.postTestScore || 0), 0) / totalPostPossibleScore) * 100 : 0;
  const compared = records.filter((record) => getAssessmentHighScore(record, "pre") > 0 && getAssessmentHighScore(record, "post") > 0);
  const improvement = compared.length ? compared.reduce((sum, record) => sum + Number(record.improvementPercentage || 0), 0) / compared.length : 0;
  const presentish = attendance.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const attendanceRate = attendance.length ? (presentish / attendance.length) * 100 : 0;
  const absentCounts = attendance.reduce((totals, record) => {
    if (record.status === "Absent") totals[record.studentId] = (totals[record.studentId] || 0) + 1;
    return totals;
  }, {});
  const frequentAbsences = Object.values(absentCounts).filter((count) => count >= 3).length;
  const sectionsNeedingIntervention = classes.filter((section) => {
    const sectionAttendance = attendance.filter((record) => record.sectionId === section.id);
    const sectionPresent = sectionAttendance.filter((record) => ["Present", "Late"].includes(record.status)).length;
    const sectionRate = sectionAttendance.length ? (sectionPresent / sectionAttendance.length) * 100 : 100;
    const sectionScores = compared.filter((record) => record.sectionId === section.id);
    const sectionGain = sectionScores.length ? sectionScores.reduce((sum, record) => sum + Number(record.improvementPercentage || 0), 0) / sectionScores.length : 100;
    return sectionRate < 85 || sectionGain < 10;
  }).length;
  return {
    preMps,
    postMps,
    improvement,
    attendanceRate,
    frequentAbsences,
    sectionsNeedingIntervention,
    students: students.filter((record) => isEnrolledStudentStatus(record.status)).length,
    classes: classes.filter((record) => record.status === "active").length,
  };
}

function countAssessmentCompletion(records, classes, students, scoreType, settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings()) {
  const visibleTerms = [...new Set(activeAssessmentScopes(settings)
    .map((key) => assessmentScopeOptions.find((item) => item.key === key))
    .filter((item) => item?.scoreType === scoreType)
    .map((item) => item.term))];
  const activeClasses = classes.filter((section) => (section.status || "active") === "active");
  const expected = activeClasses.reduce((sum, section) =>
    sum + students.filter((student) => student.sectionId === section.id && isEnrolledStudentStatus(student.status)).length * visibleTerms.length, 0);
  const submitted = new Set(records
    .filter((record) => visibleTerms.includes(record.term) && Number(record[scoreType === "pre" ? "preHighestPossibleScore" : "postHighestPossibleScore"] || 0) > 0)
    .map((record) => `${record.sectionId}:${record.studentId}:${record.term}:${scoreType}`)).size;
  return { expected, submitted, pending: Math.max(expected - submitted, 0) };
}

function getAssessmentHighScore(record, scoreType) {
  if (!record) return 0;
  const field = scoreType === "post" ? "postHighestPossibleScore" : "preHighestPossibleScore";
  return Number(record[field] ?? record.highestPossibleScore ?? 0);
}

function calculateAssessmentValues(preTestScore, postTestScore, preHighestPossibleScore, postHighestPossibleScore = preHighestPossibleScore) {
  const pre = Number(preTestScore || 0);
  const post = Number(postTestScore || 0);
  const preHighest = Number(preHighestPossibleScore || 0);
  const postHighest = Number(postHighestPossibleScore || 0);
  const preTestPercentage = preHighest > 0 ? (pre / preHighest) * 100 : 0;
  const postTestPercentage = postHighest > 0 ? (post / postHighest) * 100 : 0;
  const improvementPercentage = preHighest > 0 && postHighest > 0 ? postTestPercentage - preTestPercentage : 0;
  return {
    preTestPercentage: Number(preTestPercentage.toFixed(2)),
    postTestPercentage: Number(postTestPercentage.toFixed(2)),
    improvement: Number(improvementPercentage.toFixed(2)),
    improvementPercentage: Number(improvementPercentage.toFixed(2)),
  };
}

function formatAssessmentComparison(recordOrValues) {
  const preHighest = getAssessmentHighScore(recordOrValues, "pre");
  const postHighest = getAssessmentHighScore(recordOrValues, "post");
  const computed = calculateAssessmentValues(
    recordOrValues?.preTestScore,
    recordOrValues?.postTestScore,
    preHighest,
    postHighest
  );
  if (preHighest > 0 && postHighest > 0) {
    return `${computed.preTestPercentage.toFixed(1)}% to ${computed.postTestPercentage.toFixed(1)}% (${computed.improvementPercentage.toFixed(1)} pp)`;
  }
  if (preHighest > 0) return `Diagnostic: ${computed.preTestPercentage.toFixed(1)}%`;
  if (postHighest > 0) return `Term Exam: ${computed.postTestPercentage.toFixed(1)}%`;
  return "Not computed";
}

function countComparableAssessments(records = []) {
  return records.filter((record) => getAssessmentHighScore(record, "pre") > 0 && getAssessmentHighScore(record, "post") > 0).length;
}

async function createAuditLog(action, moduleName, targetRecord, beforeData = null, afterData = null) {
  if (!db || !auth?.currentUser) return;
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId: auth.currentUser.uid,
      userName: currentUserProfile?.fullName || auth.currentUser.email || "User",
      role: formatRoleList(currentUserProfile),
      action,
      targetModule: moduleName,
      targetRecord,
      beforeData: beforeData ? JSON.stringify(beforeData).slice(0, 4000) : "",
      afterData: afterData ? JSON.stringify(afterData).slice(0, 4000) : "",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Audit log was not recorded:", error);
  }
}

async function refreshClassStudentTotal(sectionId) {
  if (!sectionId || !canManageClasses()) return;
  const count = studentRecordsCache.filter((student) => student.sectionId === sectionId && isEnrolledStudentStatus(student.status)).length;
  await updateDoc(doc(db, "classes", sectionId), { totalStudents: count, updatedAt: serverTimestamp() });
}

async function refreshAcademicCounters(role) {
  if (!db || !canViewAcademicModule(role)) return;
  try {
    const visibility = await getTaskVisibilitySettings();
    const [classes, students, attendance, assessments] = await Promise.all([
      getVisibleClasses(),
      getVisibleStudents(),
      hasRole(role, "Teacher") || canViewAllAcademic(role) ? getVisibleStudentAttendance() : Promise.resolve([]),
      hasRole(role, "Teacher") || canViewAllAcademic(role) ? getVisibleAssessments() : Promise.resolve([]),
    ]);
    const scopedAssessments = assessments.filter((record) =>
      assessmentScopeMatches(record, "pre", visibility) || assessmentScopeMatches(record, "post", visibility)
    );
    const stats = computeAssessmentStats(scopedAssessments, attendance, students, classes);
    updateCardValue("Classes & Students", `${stats.classes}/${stats.students}`);
    updateCardValue("My Classes & Students", `${stats.classes}/${stats.students}`);
    updateCardValue("Student Attendance", `${stats.attendanceRate.toFixed(0)}%`);
    updateCardValue("My Attendance", `${stats.attendanceRate.toFixed(0)}%`);
    updateCardValue("Academic Performance", `${stats.preMps.toFixed(1)}%/${stats.postMps.toFixed(1)}%`);
    updateCardValue("My Academic Performance", `${stats.preMps.toFixed(1)}%/${stats.postMps.toFixed(1)}%`);
    updateCardValue("Total Classes", stats.classes);
    updateCardValue("Total Students", stats.students);
    updateCardValue("Student Attendance Rate", `${stats.attendanceRate.toFixed(0)}%`);
    updateCardValue("Diagnostic Test MPS", `${stats.preMps.toFixed(1)}%`);
    updateCardValue("Term Exam MPS", `${stats.postMps.toFixed(1)}%`);
    updateCardValue("Improvement Percentage", `${stats.improvement.toFixed(1)}%`);
    updateCardValue("Sections Needing Intervention", stats.sectionsNeedingIntervention);
    updateCardValue("Diagnostic Completion", `${countAssessmentCompletion(scopedAssessments, classes, students, "pre", visibility).submitted}/${countAssessmentCompletion(scopedAssessments, classes, students, "pre", visibility).pending}`);
    updateCardValue("Term Exam Completion", `${countAssessmentCompletion(scopedAssessments, classes, students, "post", visibility).submitted}/${countAssessmentCompletion(scopedAssessments, classes, students, "post", visibility).pending}`);
  } catch (error) {
    console.warn("Unable to load academic counters:", error);
  }
}

async function renderClassesModule() {
  els.dashboardTitle.textContent = "Classes / Sections";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Academic structure</p>
        <h2>Section Management</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageClasses() ? `<button id="newClassButton" class="primary-button" type="button">Create Section</button>` : ""}
      </div>
    </section>
    <section id="lessonPlanAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading lesson plan analytics...</p>
    </section>
    ${hasAnyRole(currentUserProfile, ["Principal", "Master Teacher", "Head Teacher", "Teacher"]) ? `
      <section class="table-card">
        <div class="section-header">
          <div><p class="eyebrow">${canReviewLessonPlan() ? "Reviewer monitoring" : "My pending DLLs"}</p><h2>Missing Lesson Plans</h2></div>
        </div>
        <div id="missingLessonPlansHost" class="table-wrap"><p class="empty-state">Loading missing lesson plans...</p></div>
      </section>
    ` : ""}
    ${canReviewLessonPlan() ? `
      <section class="table-card">
        <div class="section-header">
          <div><p class="eyebrow">Reviewer monitoring</p><h2>Submitted, Not Yet Checked</h2></div>
        </div>
        <div id="uncheckedLessonPlansHost" class="table-wrap"><p class="empty-state">Loading unchecked submissions...</p></div>
      </section>
    ` : ""}
    <section class="table-card">
      <div class="section-header"><h2>Sections</h2></div>
      <div class="filter-grid">
        <label>Search<input id="classSearch" type="search" placeholder="Grade, section, adviser" /></label>
        <label>School Year<select id="classSchoolYearFilter"></select></label>
        <label>Grade Level<select id="classGradeFilter"></select></label>
      </div>
      <div id="classesTableHost" class="table-wrap"><p class="empty-state">Loading sections...</p></div>
    </section>
  `;
  try {
    await loadAcademicTeachers();
    classRecordsCache = await getVisibleClasses();
    renderClassesTable();
  } catch (error) {
    document.querySelector("#classesTableHost").innerHTML = `<p class="empty-state">Unable to load classes: ${escapeHtml(error.message)}</p>`;
  }
}

async function renderSchoolSetupModule() {
  els.dashboardTitle.textContent = "School Setup";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">School configuration</p>
        <h2>Academic Setup</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageClasses() ? `<button id="setupNewClassButton" class="primary-button" type="button">Create Section</button>` : ""}
        ${canManageTeacherWorkload() ? `<button class="secondary-button setup-open-module" type="button" data-module="Teacher Workload">Manage Subjects</button>` : ""}
      </div>
    </section>
    <section id="schoolSetupSummary" class="attendance-analytics">
      <p class="empty-state">Loading setup summary...</p>
    </section>
    <section class="setup-grid">
      <article class="table-card">
        <div class="section-header">
          <div><p class="eyebrow">Section creation</p><h2>Sections by School Year</h2></div>
          ${canManageClasses() ? `<button class="secondary-button" id="setupCreateSectionButton" type="button">Add Section</button>` : ""}
        </div>
        <div id="setupSchoolYearsHost" class="table-wrap"><p class="empty-state">Loading sections...</p></div>
      </article>
      <article class="table-card">
        <div class="section-header">
          <div><p class="eyebrow">Grade level settings</p><h2>Grade Levels</h2></div>
        </div>
        <div id="setupGradeLevelsHost"></div>
      </article>
      <article class="table-card setup-wide-card">
        <div class="section-header">
          <div><p class="eyebrow">Subjects per grade / section</p><h2>Subject Mapping</h2></div>
          ${canManageSchoolSubjects() ? `<button class="secondary-button" id="setupNewSubjectButton" type="button">Add Subject</button>` : ""}
        </div>
        <div id="setupSubjectMappingHost" class="table-wrap"><p class="empty-state">Loading subject mapping...</p></div>
      </article>
      <article class="table-card setup-wide-card">
        <div class="section-header">
          <div><p class="eyebrow">Dashboard completion scope</p><h2>Task Visibility</h2></div>
        </div>
        <div id="taskVisibilitySetupHost"><p class="empty-state">Loading task visibility...</p></div>
      </article>
      <article class="table-card setup-wide-card">
        <div class="section-header">
          <div><p class="eyebrow">Adviser assignments</p><h2>Advisory Sections</h2></div>
        </div>
        <div id="setupAdvisersHost" class="table-wrap"><p class="empty-state">Loading advisers...</p></div>
      </article>
    </section>
  `;

  try {
    await loadAcademicTeachers();
    [classRecordsCache, schoolSubjectRecordsCache, teacherWorkloadRecordsCache] = await Promise.all([
      getVisibleClasses(),
      getVisibleSchoolSubjects(),
      canViewTeacherWorkload() ? getVisibleTeacherWorkloadRecords() : Promise.resolve([]),
    ]);
    await getTaskVisibilitySettings(true);
    renderSchoolSetupSummary();
    renderSchoolYearSetupTable();
    renderGradeLevelSettings();
    renderSubjectMappingSetup();
    renderTaskVisibilitySetup();
    renderAdviserSetupTable();
  } catch (error) {
    document.querySelector("#schoolSetupSummary").innerHTML = `<p class="empty-state">Unable to load school setup: ${escapeHtml(error.message)}</p>`;
  }
}

function renderSchoolSetupSummary() {
  const activeClasses = classRecordsCache.filter((record) => (record.status || "active") === "active");
  const schoolYears = uniqueOptions(classRecordsCache, "schoolYear");
  const advisers = new Set(classRecordsCache.map((record) => record.adviserId).filter(Boolean));
  const subjects = new Set(schoolSubjectRecordsCache.filter((record) => (record.status || "active") === "active").map((record) => record.subjectName).filter(Boolean));
  document.querySelector("#schoolSetupSummary").innerHTML = renderAttendanceKpiGrid([
    ["Active Sections", String(activeClasses.length), "Section records"],
    ["School Years", String(schoolYears.length), schoolYears[0] || "No school year recorded"],
    ["Advisers Assigned", String(advisers.size), "Sections with assigned advisers"],
    ["Configured Subjects", String(subjects.size), canManageSchoolSubjects() ? "Available for workload setup" : "Managed by Principal"],
  ]);
}

function renderSchoolYearSetupTable() {
  const host = document.querySelector("#setupSchoolYearsHost");
  if (!host) return;
  const years = uniqueOptions(classRecordsCache, "schoolYear");
  if (!years.length) {
    host.innerHTML = `<p class="empty-state">No school years yet. Create a class or section to start a school year.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table compact-table">
      <thead><tr><th>School Year</th><th>Active Sections</th><th>Archived</th><th>Learners</th></tr></thead>
      <tbody>
        ${years.map((year) => {
          const rows = classRecordsCache.filter((record) => record.schoolYear === year);
          const active = rows.filter((record) => (record.status || "active") === "active");
          const archived = rows.filter((record) => record.status === "archived");
          const learners = rows.reduce((sum, record) => sum + Number(record.totalStudents || 0), 0);
          return `<tr><td><strong>${escapeHtml(year)}</strong></td><td>${active.length}</td><td>${archived.length}</td><td>${learners}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

function renderGradeLevelSettings() {
  const host = document.querySelector("#setupGradeLevelsHost");
  if (!host) return;
  host.innerHTML = `
    <div class="setup-chip-list">
      ${gradeLevels.map((grade) => {
        const sections = classRecordsCache.filter((record) => record.gradeLevel === grade && (record.status || "active") === "active");
        return `<span class="workload-chip">${escapeHtml(grade)} <small>${sections.length} section${sections.length === 1 ? "" : "s"}</small></span>`;
      }).join("")}
    </div>
  `;
}

function renderSubjectMappingSetup() {
  const host = document.querySelector("#setupSubjectMappingHost");
  if (!host) return;
  const rows = [...schoolSubjectRecordsCache].sort((a, b) => {
    return subjectLabel(a).localeCompare(subjectLabel(b));
  });
  if (!rows.length) {
    host.innerHTML = `<p class="empty-state">${canManageSchoolSubjects() ? "No subjects yet. Add subjects here before creating teacher workloads." : "Subject mapping is managed by the Principal."}</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table compact-table">
      <thead><tr><th>Class</th><th>Hours</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td><strong>${escapeHtml(subjectLabel(row))}</strong><small class="row-note">${escapeHtml(row.subjectArea || "")}</small></td>
            <td>${Number(row.weeklyHours || 0).toFixed(1)}</td>
            <td><span class="badge status-${statusClass(row.status || "active")}">${escapeHtml(row.status || "active")}</span></td>
            <td class="row-actions">
              ${canManageSchoolSubjects() ? `<button class="secondary-button setup-edit-subject" type="button" data-id="${escapeHtml(row.id)}">Edit</button>` : ""}
              ${canManageSchoolSubjects() ? `<button class="danger-button setup-delete-subject" type="button" data-id="${escapeHtml(row.id)}">Delete</button>` : ""}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderTaskVisibilitySetup() {
  const host = document.querySelector("#taskVisibilitySetupHost");
  if (!host) return;
  if (!hasRole(currentUserProfile, "Principal")) {
    host.innerHTML = `<p class="empty-state">Task visibility is managed by the Principal.</p>`;
    return;
  }
  const settings = taskVisibilitySettingsCache || defaultTaskVisibilitySettings();
  const checkbox = (name, value, label, checked) => `
    <label class="checkbox-row">
      <input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
  host.innerHTML = `
    <form id="taskVisibilityForm" class="task-visibility-form">
      <fieldset class="checkbox-group">
        <legend>Grade Submission Terms</legend>
        <div class="assignee-list">
          ${termOptions.map((term) => checkbox("visibleGradeTerms", term, term, activeGradeTerms(settings).includes(term))).join("")}
        </div>
      </fieldset>
      <fieldset class="checkbox-group">
        <legend>Diagnostic Test and Term Exam</legend>
        <div class="assignee-list">
          ${assessmentScopeOptions.map((item) => checkbox("visibleAssessmentScopes", item.key, item.label, activeAssessmentScopes(settings).includes(item.key))).join("")}
        </div>
      </fieldset>
      <fieldset class="checkbox-group">
        <legend>Lesson Plan Weeks</legend>
        <div class="assignee-list task-week-list">
          ${lessonPlanWeekOptions.map((item) => checkbox("visibleLessonPlanWeeks", item.key, item.label, activeLessonPlanWeeks(settings).includes(item.key))).join("")}
        </div>
      </fieldset>
      <div id="taskVisibilityMessage" class="message hidden" role="status"></div>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Save Visibility</button>
      </div>
    </form>
  `;
}

async function handleTaskVisibilitySubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#taskVisibilityMessage");
  try {
    const settings = {
      gradeTerms: selectedTaskCheckboxValues("visibleGradeTerms"),
      assessmentScopes: selectedTaskCheckboxValues("visibleAssessmentScopes"),
      lessonPlanWeeks: selectedTaskCheckboxValues("visibleLessonPlanWeeks"),
    };
    if (!settings.gradeTerms.length || !settings.assessmentScopes.length || !settings.lessonPlanWeeks.length) {
      throw new Error("Select at least one item in every task visibility group.");
    }
    await saveTaskVisibilitySettings(settings);
    message.textContent = "Task visibility saved.";
    message.classList.remove("hidden", "error");
    await refreshGradeSubmissionCounters(currentUserProfile.role);
    await refreshLessonPlanCounters(currentUserProfile.role);
    await refreshAcademicCounters(currentUserProfile.role);
    await refreshDashboardAnalytics(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

function renderAdviserSetupTable() {
  const host = document.querySelector("#setupAdvisersHost");
  if (!host) return;
  const advisoryRows = classRecordsCache
    .filter((record) => (record.status || "active") === "active")
    .sort((a, b) => classLabel(a).localeCompare(classLabel(b)));
  if (!advisoryRows.length) {
    host.innerHTML = `<p class="empty-state">No active advisory sections yet.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table compact-table">
      <thead><tr><th>Section</th><th>School Year</th><th>Adviser</th><th>Learners</th><th></th></tr></thead>
      <tbody>
        ${advisoryRows.map((record) => `
          <tr>
            <td><strong>${escapeHtml(classLabel(record))}</strong></td>
            <td>${escapeHtml(record.schoolYear || "")}</td>
            <td>${escapeHtml(record.adviserName || "Unassigned")}</td>
            <td>${Number(record.totalStudents || 0)}</td>
            <td class="row-actions">${canManageClasses() ? `<button class="secondary-button setup-edit-class" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function subjectLabel(record) {
  return subjectGradeSectionClassLabel(record, "All sections");
}

function openSchoolSubjectForm(record = null) {
  editingSubjectId = record?.id || null;
  const sectionOptions = classRecordsCache
    .filter((section) => section.status !== "archived")
    .map((section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(classLabel(section))}</option>`)
    .join("");
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="schoolSubjectForm" class="modal">
        <div class="modal-header">
          <div><p class="eyebrow">School Setup</p><h2>${record ? "Edit Subject" : "Add Subject"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Subject Name<input id="setupSubjectName" required value="${escapeHtml(record?.subjectName || "")}" placeholder="English, Mathematics, Science" /></label>
          <label>Subject Area<input id="setupSubjectArea" value="${escapeHtml(record?.subjectArea || "")}" placeholder="Core, Science, Elective" /></label>
          <label>Grade Level<select id="setupSubjectGradeLevel" required>${optionList(gradeLevels, record?.gradeLevel || "", "Select grade")}</select></label>
          <label>Section<select id="setupSubjectSectionId"><option value="">All sections in grade level</option>${sectionOptions}</select></label>
          <label>Weekly Hours<input id="setupSubjectWeeklyHours" type="number" min="0" step="0.5" value="${escapeHtml(String(record?.weeklyHours ?? ""))}" placeholder="4" /></label>
          <label>Status<select id="setupSubjectStatus">${optionList(classStatuses, record?.status || "active", "Select status")}</select></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Subject" : "Add Subject"}</button>
        </div>
      </form>
    </div>
  `);
  const sectionField = document.querySelector("#setupSubjectSectionId");
  if (sectionField) sectionField.value = record?.sectionId || "";
  if (sectionField) {
    sectionField.addEventListener("change", () => {
      const section = getSelectedClass(sectionField.value);
      if (section) document.querySelector("#setupSubjectGradeLevel").value = section.gradeLevel || "";
    });
  }
}

async function handleSchoolSubjectFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const section = getSelectedClass(document.querySelector("#setupSubjectSectionId").value);
  const subjectName = document.querySelector("#setupSubjectName").value.trim();
  const gradeLevel = section?.gradeLevel || document.querySelector("#setupSubjectGradeLevel").value;
  const subjectArea = document.querySelector("#setupSubjectArea").value.trim();
  const weeklyHoursInput = document.querySelector("#setupSubjectWeeklyHours").value;
  const data = {
    subjectName,
    subjectArea,
    gradeLevel,
    sectionId: section?.id || "",
    sectionName: section ? classLabel(section) : "",
    weeklyHours: weeklyHoursInput === "" ? getDefaultSubjectHours(subjectName, subjectArea) : Number(weeklyHoursInput),
    status: document.querySelector("#setupSubjectStatus").value || "active",
  };
  if (!data.subjectName || !data.gradeLevel) {
    message.textContent = "Complete the required subject fields.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  try {
    if (editingSubjectId) {
      const before = schoolSubjectRecordsCache.find((item) => item.id === editingSubjectId);
      await updateDoc(doc(db, "schoolSubjects", editingSubjectId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "School Setup", editingSubjectId, before, data);
      showDashboardMessage("Subject updated successfully.");
    } else {
      const created = await addDoc(collection(db, "schoolSubjects"), {
        ...data,
        createdByUid: auth.currentUser.uid,
        createdByName: currentUserProfile.fullName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await createAuditLog("create", "School Setup", created.id, null, data);
      showDashboardMessage("Subject added successfully.");
    }
    document.querySelector("#academicModal")?.remove();
    await renderSchoolSetupModule();
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

function renderClassesTable() {
  const host = document.querySelector("#classesTableHost");
  if (!host) return;
  document.querySelector("#classSchoolYearFilter").innerHTML = optionList(uniqueOptions(classRecordsCache, "schoolYear"), "", "All years");
  document.querySelector("#classGradeFilter").innerHTML = optionList(uniqueOptions(classRecordsCache, "gradeLevel"), "", "All grades");
  applyClassFilters();
}

function applyClassFilters() {
  const host = document.querySelector("#classesTableHost");
  if (!host) return;
  filteredClassRecords = classRecordsCache.filter((record) => academicFilterMatch(record, document.querySelector("#classSearch")?.value || "", {
    schoolYear: document.querySelector("#classSchoolYearFilter")?.value || "",
    gradeLevel: document.querySelector("#classGradeFilter")?.value || "",
  }));
  if (!filteredClassRecords.length) {
    host.innerHTML = `<p class="empty-state">No sections match the current filters.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table">
      <thead><tr><th>Section</th><th>School Year</th><th>Adviser</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${filteredClassRecords.map((record) => `
          <tr>
            <td><strong>${escapeHtml(classLabel(record))}</strong></td>
            <td>${escapeHtml(record.schoolYear || "")}</td>
            <td>${escapeHtml(record.adviserName || "Unassigned")}</td>
            <td>${Number(record.totalStudents || 0)}</td>
          <td><span class="badge status-${statusClass(normalizeStudentStatus(record.status))}">${escapeHtml(normalizeStudentStatus(record.status))}</span></td>
            <td class="row-actions">
              ${canManageClasses() ? `<button class="secondary-button edit-class" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
              ${canManageClasses() && record.status !== "archived" ? `<button class="danger-button archive-class" type="button" data-id="${escapeHtml(record.id)}">Archive</button>` : ""}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openClassForm(record = null) {
  editingClassId = record?.id || null;
  editingClassReturnModule = ["School Setup", "Teacher Workload"].includes(els.dashboardTitle.textContent)
    ? els.dashboardTitle.textContent
    : "Classes / Sections";
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="classForm" class="modal">
        <div class="modal-header">
          <div><p class="eyebrow">Sections</p><h2>${record ? "Edit Section" : "Create Section"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>School Year<input id="classSchoolYear" required value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" /></label>
          <label>Grade Level<select id="classGradeLevel" required>${optionList(gradeLevels, record?.gradeLevel || "", "Select grade")}</select></label>
          <label>Section Name<input id="classSectionName" required value="${escapeHtml(record?.sectionName || "")}" /></label>
          <label>Adviser<select id="classAdviser">${teacherOptions(record?.adviserId || "", "Unassigned")}</select></label>
          <label>Status<select id="classStatus">${optionList(classStatuses, record?.status || "active", "Select status")}</select></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Changes" : "Create Section"}</button>
        </div>
      </form>
    </div>
  `);
}

async function handleClassFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const adviserId = document.querySelector("#classAdviser").value;
  const adviser = academicTeachersCache.find((teacher) => teacher.id === adviserId);
  const data = {
    schoolYear: document.querySelector("#classSchoolYear").value.trim(),
    gradeLevel: document.querySelector("#classGradeLevel").value,
    sectionName: document.querySelector("#classSectionName").value.trim(),
    adviserId,
    adviserName: adviser ? adviser.fullName || adviser.email || adviser.id : "",
    status: document.querySelector("#classStatus").value || "active",
  };
  if (!data.schoolYear || !data.gradeLevel || !data.sectionName) {
    message.textContent = "Complete the required class fields.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  try {
    if (editingClassId) {
      const before = classRecordsCache.find((record) => record.id === editingClassId);
      await updateDoc(doc(db, "classes", editingClassId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Classes / Sections", editingClassId, before, data);
      showDashboardMessage("Class updated successfully.");
    } else {
      const created = await addDoc(collection(db, "classes"), {
        ...data,
        totalStudents: 0,
        createdByUid: auth.currentUser.uid,
        createdByName: currentUserProfile.fullName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await createAuditLog("create", "Classes / Sections", created.id, null, data);
      showDashboardMessage("Class created successfully.");
    }
    document.querySelector("#academicModal")?.remove();
    if (editingClassReturnModule === "School Setup") {
      await renderSchoolSetupModule();
    } else if (editingClassReturnModule === "Teacher Workload") {
      await renderTeacherWorkloadModule();
    } else {
      await renderClassesModule();
    }
    await refreshAcademicCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function renderStudentsModule() {
  els.dashboardTitle.textContent = "Students";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div><p class="eyebrow">Learner registry</p><h2>Student Management</h2></div>
      <div class="toolbar-actions">
        ${canManageStudents() ? `<button id="newStudentButton" class="primary-button" type="button">Add Student</button><button id="importStudentsButton" class="secondary-button" type="button">Import SF1 Data</button>` : ""}
      </div>
    </section>
    <section class="table-card">
      <div class="section-header"><h2>Student List</h2></div>
      <div class="filter-grid">
        <label>Search<input id="studentSearch" type="search" placeholder="LRN or name" /></label>
        <label>School Year<select id="studentSchoolYearFilter"></select></label>
        <label>Grade Level<select id="studentGradeFilter"></select></label>
        <label>Section<select id="studentSectionFilter"></select></label>
      </div>
      <div id="studentsTableHost" class="table-wrap"><p class="empty-state">Loading students...</p></div>
    </section>
  `;
  try {
    classRecordsCache = await getVisibleClasses();
    studentRecordsCache = await getVisibleStudents();
    renderStudentsTable();
  } catch (error) {
    document.querySelector("#studentsTableHost").innerHTML = `<p class="empty-state">Unable to load students: ${escapeHtml(error.message)}</p>`;
  }
}

function renderStudentsTable() {
  document.querySelector("#studentSchoolYearFilter").innerHTML = optionList(uniqueOptions(studentRecordsCache, "schoolYear"), "", "All years");
  document.querySelector("#studentGradeFilter").innerHTML = optionList(uniqueOptions(studentRecordsCache, "gradeLevel"), "", "All grades");
  document.querySelector("#studentSectionFilter").innerHTML = activeClassOptions("", "All sections");
  applyStudentFilters();
}

function applyStudentFilters() {
  const host = document.querySelector("#studentsTableHost");
  if (!host) return;
  filteredStudentRecords = sortStudentsSf1Order(studentRecordsCache.filter((record) => academicFilterMatch(record, document.querySelector("#studentSearch")?.value || "", {
    schoolYear: document.querySelector("#studentSchoolYearFilter")?.value || "",
    gradeLevel: document.querySelector("#studentGradeFilter")?.value || "",
    sectionId: document.querySelector("#studentSectionFilter")?.value || "",
  })));
  if (!filteredStudentRecords.length) {
    host.innerHTML = `<p class="empty-state">No student records match the current filters.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table">
      <thead><tr><th>LRN</th><th>Name</th><th>Sex</th><th>Birth Date / Age</th><th>Address</th><th>Parent / Guardian</th><th>Modality</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${filteredStudentRecords.map((record) => `
          <tr>
            <td>${escapeHtml(record.lrn || "")}</td>
            <td><strong>${escapeHtml([record.lastName, record.firstName, record.middleName].filter(Boolean).join(", "))}</strong></td>
            <td>${escapeHtml(record.sex || "")}</td>
            <td>${escapeHtml(record.birthDate || "")}<small class="row-note">${escapeHtml(record.ageAsOfFirstFridayJune || "")}</small></td>
            <td>${escapeHtml([record.houseStreet, record.barangay, record.municipalityCity, record.province].filter(Boolean).join(", "))}</td>
            <td>${escapeHtml(record.fatherName || record.motherName || record.guardianName || "")}<small class="row-note">${escapeHtml(record.contactNumber || "")}</small></td>
            <td>${escapeHtml(record.learningModality || "")}<small class="row-note">${escapeHtml(record.remarks || "")}</small></td>
            <td><span class="badge status-${statusClass(record.status || "active")}">${escapeHtml(record.status || "active")}</span></td>
            <td class="row-actions">${canManageStudents() ? `<button class="secondary-button edit-student" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function normalizeSex(value = "") {
  const sex = String(value).trim().toUpperCase();
  if (sex === "MALE") return "M";
  if (sex === "FEMALE") return "F";
  return sex;
}

function parseSf1Name(value = "") {
  const parts = String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    lastName: parts[0] || "",
    firstName: parts[1] || "",
    middleName: parts.slice(2).join(" ") || "",
  };
}

function sf1Cell(row, index) {
  return String(row?.[index] ?? "").trim();
}

function parseSf1ArrayRow(row = [], section) {
  const lrn = sf1Cell(row, 0);
  if (!/^[0-9]{12}$/.test(lrn)) return null;
  return {
    lrn,
    ...parseSf1Name(sf1Cell(row, 2)),
    sex: normalizeSex(sf1Cell(row, 6)),
    birthDate: sf1Cell(row, 7),
    ageAsOfFirstFridayJune: sf1Cell(row, 9),
    motherTongue: sf1Cell(row, 11),
    ipEthnicGroup: sf1Cell(row, 13),
    religion: sf1Cell(row, 14),
    houseStreet: sf1Cell(row, 15),
    barangay: sf1Cell(row, 17),
    municipalityCity: sf1Cell(row, 20),
    province: sf1Cell(row, 22),
    fatherName: sf1Cell(row, 27),
    motherName: sf1Cell(row, 31),
    guardianName: sf1Cell(row, 36),
    guardianRelationship: sf1Cell(row, 40),
    contactNumber: sf1Cell(row, 41),
    learningModality: sf1Cell(row, 43),
    remarks: sf1Cell(row, 44),
    gradeLevel: section.gradeLevel,
    sectionId: section.id,
    sectionName: classLabel(section),
    adviserId: section.adviserId || "",
    schoolYear: section.schoolYear,
    term: "",
    status: "Enrolled",
  };
}

function parseSf1Row(row, section) {
  if (Array.isArray(row)) return parseSf1ArrayRow(row, section);
  const cells = row.includes("\t")
    ? row.split("\t").map((cell) => cell.trim())
    : row.split(",").map((cell) => cell.trim());
  const lrn = cells[0] || "";
  if (!/^[0-9]{12}$/.test(lrn)) return null;
  const name = row.includes("\t")
    ? parseSf1Name(cells[2] || "")
    : { lastName: cells[1] || "", firstName: cells[2] || "", middleName: cells[3] || "" };
  return {
    lrn,
    ...name,
    sex: normalizeSex(row.includes("\t") ? cells[6] : cells[4]),
    birthDate: row.includes("\t") ? cells[7] || "" : cells[5] || "",
    ageAsOfFirstFridayJune: row.includes("\t") ? cells[9] || "" : cells[6] || "",
    motherTongue: row.includes("\t") ? cells[11] || "" : cells[7] || "",
    ipEthnicGroup: row.includes("\t") ? cells[13] || "" : cells[8] || "",
    religion: row.includes("\t") ? cells[14] || "" : cells[9] || "",
    houseStreet: row.includes("\t") ? cells[15] || "" : cells[10] || "",
    barangay: row.includes("\t") ? cells[17] || "" : cells[11] || "",
    municipalityCity: row.includes("\t") ? cells[20] || "" : cells[12] || "",
    province: row.includes("\t") ? cells[22] || "" : cells[13] || "",
    fatherName: row.includes("\t") ? cells[27] || "" : cells[14] || "",
    motherName: row.includes("\t") ? cells[31] || "" : cells[15] || "",
    guardianName: row.includes("\t") ? cells[36] || "" : cells[16] || "",
    guardianRelationship: row.includes("\t") ? cells[40] || "" : cells[17] || "",
    contactNumber: row.includes("\t") ? cells[41] || "" : cells[18] || "",
    learningModality: row.includes("\t") ? cells[43] || "" : cells[19] || "",
    remarks: row.includes("\t") ? cells[44] || "" : cells[20] || "",
    gradeLevel: section.gradeLevel,
    sectionId: section.id,
    sectionName: classLabel(section),
    adviserId: section.adviserId || "",
    schoolYear: section.schoolYear,
    term: "",
    status: "Enrolled",
  };
}

function studentSortKey(student = {}) {
  const sex = normalizeSex(student.sex);
  const sexRank = sex === "M" ? 0 : sex === "F" ? 1 : 2;
  return [
    sexRank,
    student.lastName || "",
    student.firstName || "",
    student.middleName || "",
    student.lrn || "",
  ];
}

function sortStudentsSf1Order(students = []) {
  return [...students].sort((a, b) => {
    const left = studentSortKey(a);
    const right = studentSortKey(b);
    for (let index = 0; index < left.length; index += 1) {
      if (index === 0 && left[index] !== right[index]) return left[index] - right[index];
      const comparison = String(left[index]).localeCompare(String(right[index]), undefined, { sensitivity: "base" });
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}

function openStudentForm(record = null) {
  editingStudentId = record?.id || null;
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="studentForm" class="modal">
        <div class="modal-header">
          <div><p class="eyebrow">Students</p><h2>${record ? "Edit Student" : "Add Student"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>LRN<input id="studentLrn" required value="${escapeHtml(record?.lrn || "")}" /></label>
          <label>Last Name<input id="studentLastName" required value="${escapeHtml(record?.lastName || "")}" /></label>
          <label>First Name<input id="studentFirstName" required value="${escapeHtml(record?.firstName || "")}" /></label>
          <label>Middle Name<input id="studentMiddleName" value="${escapeHtml(record?.middleName || "")}" /></label>
          <label>Sex<select id="studentSex" required>${optionList(["M", "F"], normalizeSex(record?.sex || ""), "Select sex")}</select></label>
          <label>Birth Date<input id="studentBirthDate" placeholder="mm/dd/yyyy" value="${escapeHtml(record?.birthDate || "")}" /></label>
          <label>Age as of 1st Friday June<input id="studentAge" value="${escapeHtml(record?.ageAsOfFirstFridayJune || "")}" /></label>
          <label>Mother Tongue<input id="studentMotherTongue" value="${escapeHtml(record?.motherTongue || "")}" /></label>
          <label>IP / Ethnic Group<input id="studentIpEthnicGroup" value="${escapeHtml(record?.ipEthnicGroup || "")}" /></label>
          <label>Religion<input id="studentReligion" value="${escapeHtml(record?.religion || "")}" /></label>
          <label>House # / Street / Sitio / Purok<input id="studentHouseStreet" value="${escapeHtml(record?.houseStreet || "")}" /></label>
          <label>Barangay<input id="studentBarangay" value="${escapeHtml(record?.barangay || "")}" /></label>
          <label>Municipality / City<input id="studentMunicipalityCity" value="${escapeHtml(record?.municipalityCity || "")}" /></label>
          <label>Province<input id="studentProvince" value="${escapeHtml(record?.province || "")}" /></label>
          <label>Father's Name<input id="studentFatherName" value="${escapeHtml(record?.fatherName || "")}" /></label>
          <label>Mother's Maiden Name<input id="studentMotherName" value="${escapeHtml(record?.motherName || "")}" /></label>
          <label>Guardian Name<input id="studentGuardianName" value="${escapeHtml(record?.guardianName || "")}" /></label>
          <label>Guardian Relationship<input id="studentGuardianRelationship" value="${escapeHtml(record?.guardianRelationship || "")}" /></label>
          <label>Contact Number<input id="studentContactNumber" value="${escapeHtml(record?.contactNumber || "")}" /></label>
          <label>Learning Modality<input id="studentLearningModality" value="${escapeHtml(record?.learningModality || "")}" /></label>
          <label>Section<select id="studentSectionId" required>${activeClassOptions(record?.sectionId || "")}</select></label>
          <label>Status<select id="studentStatus">${optionList(studentStatuses, normalizeStudentStatus(record?.status), "Select status")}</select></label>
          <label>Remarks<textarea id="studentRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Changes" : "Add Student"}</button>
        </div>
      </form>
    </div>
  `);
}

function buildStudentPayloadFromForm() {
  const section = getSelectedClass(document.querySelector("#studentSectionId").value);
  return {
    lrn: document.querySelector("#studentLrn").value.trim(),
    lastName: document.querySelector("#studentLastName").value.trim(),
    firstName: document.querySelector("#studentFirstName").value.trim(),
    middleName: document.querySelector("#studentMiddleName").value.trim(),
    sex: normalizeSex(document.querySelector("#studentSex").value),
    birthDate: document.querySelector("#studentBirthDate").value.trim(),
    ageAsOfFirstFridayJune: document.querySelector("#studentAge").value.trim(),
    motherTongue: document.querySelector("#studentMotherTongue").value.trim(),
    ipEthnicGroup: document.querySelector("#studentIpEthnicGroup").value.trim(),
    religion: document.querySelector("#studentReligion").value.trim(),
    houseStreet: document.querySelector("#studentHouseStreet").value.trim(),
    barangay: document.querySelector("#studentBarangay").value.trim(),
    municipalityCity: document.querySelector("#studentMunicipalityCity").value.trim(),
    province: document.querySelector("#studentProvince").value.trim(),
    fatherName: document.querySelector("#studentFatherName").value.trim(),
    motherName: document.querySelector("#studentMotherName").value.trim(),
    guardianName: document.querySelector("#studentGuardianName").value.trim(),
    guardianRelationship: document.querySelector("#studentGuardianRelationship").value.trim(),
    contactNumber: document.querySelector("#studentContactNumber").value.trim(),
    learningModality: document.querySelector("#studentLearningModality").value.trim(),
    gradeLevel: section?.gradeLevel || "",
    sectionId: section?.id || "",
    sectionName: section ? classLabel(section) : "",
    adviserId: section?.adviserId || "",
    schoolYear: section?.schoolYear || "",
    term: "",
    remarks: document.querySelector("#studentRemarks").value.trim(),
    status: normalizeStudentStatus(document.querySelector("#studentStatus").value),
  };
}

async function handleStudentFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const data = buildStudentPayloadFromForm();
  const duplicate = studentRecordsCache.find((student) => student.lrn === data.lrn && student.id !== editingStudentId);
  if (duplicate) {
    message.textContent = "Duplicate LRN found. Check the existing student record first.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  try {
    if (editingStudentId) {
      const before = studentRecordsCache.find((record) => record.id === editingStudentId);
      await updateDoc(doc(db, "students", editingStudentId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Students", editingStudentId, before, data);
      showDashboardMessage("Student updated successfully.");
    } else {
      const created = await addDoc(collection(db, "students"), {
        ...data,
        createdByUid: auth.currentUser.uid,
        createdByName: currentUserProfile.fullName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await createAuditLog("create", "Students", created.id, null, data);
      showDashboardMessage("Student added successfully.");
    }
    const shouldReturnToEnrollment = Boolean(document.querySelector("#enrollmentTableHost"));
    document.querySelector("#academicModal")?.remove();
    if (shouldReturnToEnrollment) {
      await loadEnrollmentModuleRecords();
      await refreshEnrollmentCounters(currentUserProfile.role);
    } else {
      await renderStudentsModule();
    }
    await refreshClassStudentTotal(data.sectionId);
    await refreshAcademicCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

function openStudentImportForm() {
  pendingSf1ImportRows = [];
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="studentImportForm" class="modal">
        <div class="modal-header">
          <div><p class="eyebrow">SF1 Import</p><h2>Import Students</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <label>Section<select id="importSectionId" required>${activeClassOptions()}</select></label>
        <label class="sf1-drop-zone" id="sf1DropZone">
          <input id="sf1FileInput" type="file" accept=".xls,.xlsx,.xlsm" />
          <strong>Drop SF1 Excel file here</strong>
          <span>or click to choose .xls / .xlsx</span>
        </label>
        <div id="sf1ImportPreview" class="empty-state">No SF1 file selected yet.</div>
        <label>Paste fallback<textarea id="studentImportRows" rows="7" placeholder="Optional: copy learner rows from SF1 and paste here if file upload is unavailable."></textarea></label>
        <p class="helper-text">The importer reads learner rows from the SF1 table and skips headers, TOTAL MALE/FEMALE/COMBINED, and duplicate LRNs.</p>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">Import Students</button>
        </div>
      </form>
    </div>
  `);
}

function setSf1ImportMessage(message, isError = false) {
  const preview = document.querySelector("#sf1ImportPreview");
  if (!preview) return;
  preview.textContent = message;
  preview.classList.toggle("message", isError);
  preview.classList.toggle("error", isError);
  preview.classList.toggle("empty-state", !isError);
}

async function parseSf1WorkbookFile(file) {
  if (!window.XLSX) {
    throw new Error("Excel parser is still loading. Check your internet connection and try again.");
  }
  const buffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("No worksheet found in the selected SF1 file.");
  return window.XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  });
}

async function handleSf1File(file) {
  if (!file) return;
  try {
    setSf1ImportMessage(`Reading ${file.name}...`);
    const rows = await parseSf1WorkbookFile(file);
    pendingSf1ImportRows = rows.filter((row) => /^[0-9]{12}$/.test(sf1Cell(row, 0)));
    const maleCount = pendingSf1ImportRows.filter((row) => normalizeSex(sf1Cell(row, 6)) === "M").length;
    const femaleCount = pendingSf1ImportRows.filter((row) => normalizeSex(sf1Cell(row, 6)) === "F").length;
    setSf1ImportMessage(`Ready to import ${pendingSf1ImportRows.length} learners from ${file.name}: ${maleCount} male, ${femaleCount} female.`);
  } catch (error) {
    pendingSf1ImportRows = [];
    setSf1ImportMessage(`Unable to read SF1: ${error.message}`, true);
  }
}

async function handleStudentImportSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const section = getSelectedClass(document.querySelector("#importSectionId").value);
  const pastedRows = document.querySelector("#studentImportRows").value.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
  const rows = pendingSf1ImportRows.length ? pendingSf1ImportRows : pastedRows;
  if (!section || !rows.length) return;
  let imported = 0;
  let skipped = 0;
  try {
    for (const row of rows) {
      const payload = parseSf1Row(row, section);
      if (!payload || studentRecordsCache.some((student) => student.lrn === payload.lrn)) {
        skipped += 1;
        continue;
      }
      const recordPayload = {
        ...payload,
        createdByUid: auth.currentUser.uid,
        createdByName: currentUserProfile.fullName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const created = await addDoc(collection(db, "students"), recordPayload);
      studentRecordsCache.push({ id: created.id, ...recordPayload });
      imported += 1;
    }
    await createAuditLog("import", "Students", section.id, null, { imported, skipped });
    const shouldReturnToEnrollment = Boolean(document.querySelector("#enrollmentTableHost"));
    document.querySelector("#academicModal")?.remove();
    if (shouldReturnToEnrollment) {
      await loadEnrollmentModuleRecords();
      await refreshEnrollmentCounters(currentUserProfile.role);
    } else {
      await renderStudentsModule();
    }
    await refreshClassStudentTotal(section.id);
    showDashboardMessage(`Imported ${imported} students. Skipped ${skipped} rows.`);
  } catch (error) {
    message.textContent = `Import failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}



async function refreshDashboardAnalytics(role) {
  const host = document.querySelector("#dashboardAnalytics");
  if (!host || !db || !role) return;

  try {
    const visibility = await getTaskVisibilitySettings();
    const [reports, learners, observations, documents, financialReports, ppas, lessonPlans, workloads, classes, students, assessments, attendanceRecords] = await Promise.all([
      (hasRole(role, "Principal") || hasAnyRole(role, complianceRoles)) ? getVisibleReportAssignments() : Promise.resolve([]),
      hasAnyRole(role, learnerMonitorRoles) ? getVisibleLearnerRecords() : Promise.resolve([]),
      hasAnyRole(role, observationRoles) ? getVisibleClassroomObservations() : Promise.resolve([]),
      canViewDocumentRepository(role) ? getVisibleDocuments() : Promise.resolve([]),
      canViewFinancialReports(role) ? getVisibleFinancialReports() : Promise.resolve([]),
      canViewPpaModule(role) ? getVisiblePpaRecords() : Promise.resolve([]),
      canViewLessonPlanModule(role) ? getVisibleLessonPlans() : Promise.resolve([]),
      canViewTeacherWorkload(role) ? getVisibleTeacherWorkloadRecords() : Promise.resolve([]),
      canViewAcademicModule(role) ? getVisibleClasses() : Promise.resolve([]),
      canViewAcademicModule(role) ? getVisibleStudents() : Promise.resolve([]),
      canViewAcademicModule(role) ? getVisibleAssessments() : Promise.resolve([]),
      canViewAcademicModule(role) ? getVisibleStudentAttendance() : Promise.resolve([]),
    ]);
    studentAttendanceRecordsCache = attendanceRecords;

    const canUseEnrollment = canViewEnrollmentModule(role);
    if (canUseEnrollment) {
      await loadEnrollmentCollections();
    } else {
      enrollmentRecordsCache = [];
      transferRecordsCache = [];
      dropoutRecordsCache = [];
      classProfilesCache = [];
    }

    const visibleLessonPlans = lessonPlans.filter((record) => activeLessonPlanWeeks(visibility).includes(lessonPlanScopeKey(record)));
    const lessonPlanExpected = workloads
      .filter((workload) =>
        workload.sectionId
        && (hasAnyRole(role, ["Principal", "Master Teacher", "Head Teacher"]) || workload.teacherId === auth.currentUser.uid)
      ).length * activeLessonPlanWeeks(visibility).length;
    const lessonPlanSubmitted = new Set(visibleLessonPlans.map((record) => `${record.workloadId}:${lessonPlanScopeKey(record)}`)).size;
    const scopedAssessments = assessments.filter((record) =>
      assessmentScopeMatches(record, "pre", visibility) || assessmentScopeMatches(record, "post", visibility)
    );
    const diagnosticCompletion = countAssessmentCompletion(scopedAssessments, classes, students, "pre", visibility);
    const examCompletion = countAssessmentCompletion(scopedAssessments, classes, students, "post", visibility);
    const reportGroups = buildComplianceGroups(reports);
    const today = todayIso();
    const attendanceToday = studentAttendanceRecordsCache?.filter?.((record) => attendanceDateValue(record) === today) || [];
    const attendanceTodayRate = attendanceToday.length ? attendanceRate(attendanceToday).toFixed(1) : "0.0";
    const pendingSubmissions = reportGroups.filter((group) => ["Pending", "In Progress"].includes(group.status)).length;
    const overdueReports = reportGroups.filter((group) => group.status === "Overdue").length;
    const activeLearners = learners.filter((record) => !["Resolved", "Closed"].includes(record.status));
    const interventionAlerts = learners.filter((record) => ["Not Started", "Ongoing", "Unresolved"].includes(record.interventionStatus)).length;
    const financialSpent = financialReports.reduce((sum, record) => sum + toSafeNumber(record.amountSpent), 0);
    const financialAllocated = financialReports.reduce((sum, record) => sum + toSafeNumber(record.amountAllocated), 0);
    const utilization = financialAllocated ? ((financialSpent / financialAllocated) * 100).toFixed(1) : "0.0";
    const upcomingDeadlines = reports.filter((record) => record.dueDate && record.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
    const dashboardInsights = [
      overdueReports ? `${overdueReports} report assignment${overdueReports === 1 ? "" : "s"} are overdue.` : "",
      activeLearners.length ? `${activeLearners.length} learner monitoring case${activeLearners.length === 1 ? "" : "s"} remain active.` : "",
      interventionAlerts ? `${interventionAlerts} intervention record${interventionAlerts === 1 ? "" : "s"} are unresolved or ongoing.` : "",
      Number(utilization) >= 80 ? `Budget utilization is ${utilization}%.` : "",
      upcomingDeadlines[0] ? `${upcomingDeadlines[0].title || "A report"} is the next report deadline.` : "",
    ];

    const charts = [
      renderAttendanceKpiGrid([
        ["Attendance Today", `${attendanceTodayRate}%`, `${attendanceToday.length} records today`],
        ["Pending Submissions", String(pendingSubmissions), "Grouped report assignments"],
        ["Overdue Reports", String(overdueReports), "Past due and incomplete"],
        ["At-Risk Learners", String(activeLearners.length), "Active monitoring cases"],
        ["Intervention Alerts", String(interventionAlerts), "Unresolved or ongoing"],
        ["Enrollment Summary", String(enrollmentRecordsCache.length), "Current enrollment records"],
        ["Workload Summary", String(workloads.length), "Teaching load records"],
        ["Financial Summary", `${utilization}%`, "Budget utilization"],
      ]),
      renderInsightPanel("Governance Alerts", dashboardInsights),
      reports.length ? renderMiniChart("Report Status Distribution", reports, reportAssignmentStatuses, "status") : "",
      reportGroups.length ? renderSummaryChart("Compliance Status", groupCountRows(reportGroups, "status")) : "",
      upcomingDeadlines.length ? renderSummaryChart("Upcoming Deadlines", upcomingDeadlines.map((record) => [record.title || record.reportType || "Report", 1])) : "",
      canViewLessonPlanModule(role) ? renderSummaryChart("Lesson Plan Completion", [
        ["Submitted", lessonPlanSubmitted],
        ["Pending", Math.max(lessonPlanExpected - lessonPlanSubmitted, 0)],
      ]) : "",
      canViewAcademicModule(role) ? renderSummaryChart("Assessment Completion", [
        ["Diagnostic Submitted", diagnosticCompletion.submitted],
        ["Diagnostic Pending", diagnosticCompletion.pending],
        ["Term Exam Submitted", examCompletion.submitted],
        ["Term Exam Pending", examCompletion.pending],
      ]) : "",
      learners.length ? renderMiniChart("Learner Risk Distribution", learners, learnerRiskLevels, "riskLevel") : "",
      learners.length ? renderMiniChart("Concern Type Distribution", learners, learnerConcernTypes, "concernType") : "",
      canUseEnrollment && enrollmentRecordsCache.length ? renderMiniChart("Enrollment by Grade Level", enrollmentRecordsCache, uniqueOptions(enrollmentRecordsCache, "gradeLevel"), "gradeLevel") : "",
      canUseEnrollment && enrollmentRecordsCache.length ? renderSummaryChart("Enrollment Status Summary", [
        ["Enrolled", enrollmentRecordsCache.filter((record) => isEnrolledStudentStatus(record.status)).length],
        ["Transfer Out", enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Transferred Out").length],
        ["Dropout", enrollmentRecordsCache.filter((record) => normalizeStudentStatus(record.status) === "Dropout").length],
      ]) : "",
      observations.length ? renderMiniChart("Observation Status Distribution", observations, observationStatuses, "status") : "",
      documents.length ? renderMiniChart("Documents by Category", documents, documentCategories, "documentCategory") : "",
      financialReports.length ? renderMiniChart("Financial Report Status", financialReports, financialStatuses, "status") : "",
      ppas.length ? renderMiniChart("PPAs by Category", ppas, ppaCategories, "ppaCategory") : "",
      ppas.length ? renderMiniChart("PPA Status Distribution", ppas, ppaStatuses, "implementationStatus") : "",
    ].filter(Boolean);

    host.innerHTML = charts.length
      ? charts.join("")
      : `<p class="empty-state">Dashboard analytics will appear as records are added to your visible modules.</p>`;
  } catch (error) {
    console.warn("Unable to load dashboard analytics:", error);
    host.innerHTML = `<p class="empty-state">Unable to load dashboard analytics right now.</p>`;
  }
}

function renderMiniChart(title, records, labels, field) {
  const chartLabels = labels.length ? labels : ["No data"];
  const rows = chartLabels.map((label) => [
    label,
    records.filter((record) => record[field] === label).length,
  ]);
  return renderSummaryChart(title, rows);
}

function renderSummaryChart(title, rows) {
  const max = Math.max(...rows.map((row) => row[1]), 1);
  return `
    <article class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${rows
          .map(([label, count]) => `
            <div class="chart-row">
              <span>${escapeHtml(label)}</span>
              <div class="chart-track"><i style="width: ${(count / max) * 100}%"></i></div>
              <strong>${count}</strong>
            </div>
          `)
          .join("")}
      </div>
    </article>
  `;
}

function updateCardValue(label, value) {
  const cards = [...document.querySelectorAll(".stat-card")];
  const card = cards.find((item) => item.querySelector("span")?.textContent === label);
  if (card) {
    const metrics = card.querySelector(".stat-card-metrics");
    if (metrics) {
      metrics.innerHTML = renderDashboardMetricMarkup(label, value);
    } else {
      card.querySelector("strong").textContent = String(value);
    }
  }
}

async function renderStudentAttendanceModule() {
  els.dashboardTitle.textContent = "Student Attendance";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div><p class="eyebrow">Attendance</p><h2>Student Attendance</h2></div>
      <div class="toolbar-actions">
        <button id="newStudentAttendanceButton" class="primary-button" type="button">Encode Attendance</button>
      </div>
    </section>
    <section id="studentAttendanceAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading attendance analytics...</p>
    </section>
    <section id="studentAttendancePrintSummary" class="print-only attendance-print-summary"></section>
    <section class="table-card">
      <div class="section-header"><h2>Attendance Records</h2></div>
      <div class="filter-grid">
        <label>Search<input id="studentAttendanceSearch" type="search" placeholder="Student, date, remarks" /></label>
        <label>Section<select id="studentAttendanceSectionFilter"></select></label>
        <label>Status<select id="studentAttendanceStatusFilter">${optionList(attendanceStatuses, "", "All statuses")}</select></label>
      </div>
      <div id="studentAttendanceTableHost" class="table-wrap"><p class="empty-state">Loading attendance...</p></div>
    </section>
  `;
  try {
    classRecordsCache = await getVisibleClasses();
    studentRecordsCache = await getVisibleStudents();
    studentAttendanceRecordsCache = await getVisibleStudentAttendance();
    document.querySelector("#studentAttendanceSectionFilter").innerHTML = activeClassOptions("", "All sections");
    applyStudentAttendanceFilters();
  } catch (error) {
    document.querySelector("#studentAttendanceTableHost").innerHTML = `<p class="empty-state">Unable to load attendance: ${escapeHtml(error.message)}</p>`;
  }
}

function applyStudentAttendanceFilters() {
  const host = document.querySelector("#studentAttendanceTableHost");
  if (!host) return;
  const status = document.querySelector("#studentAttendanceStatusFilter")?.value || "";
  filteredStudentAttendanceRecords = studentAttendanceRecordsCache.filter((record) =>
    academicFilterMatch(record, document.querySelector("#studentAttendanceSearch")?.value || "", {
      sectionId: document.querySelector("#studentAttendanceSectionFilter")?.value || "",
    }) && (!status || record.status === status)
  );
  renderStudentAttendanceAnalytics();
  renderStudentAttendancePrintSummary();
  if (!filteredStudentAttendanceRecords.length) {
    host.innerHTML = `<p class="empty-state">No attendance records match the current filters.</p>`;
    return;
  }
  renderStudentAttendanceSectionTable(host);
}

function renderStudentAttendanceSectionTable(host) {
  const dateKeys = [...new Set(filteredStudentAttendanceRecords.map((record) => record.attendanceDate || record.attendanceWeek).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const sections = buildStudentAttendanceSectionRows();
  host.innerHTML = `
    <table class="academic-table attendance-record-table">
      <thead>
        <tr>
          <th>Section</th>
          <th>Students</th>
          ${dateKeys.map((dateKey) => `<th class="attendance-date-heading"><span>${escapeHtml(dateKey.includes("-") ? shortDateLabel(dateKey) : dateKey)}</span><small>${escapeHtml(dateKey)}</small></th>`).join("")}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${sections.map((section) => renderStudentAttendanceSectionRows(section, dateKeys)).join("")}
      </tbody>
    </table>
  `;
}

function buildStudentAttendanceSectionRows() {
  const sectionMap = new Map();
  filteredStudentAttendanceRecords.forEach((record) => {
    const key = record.sectionId || record.sectionName || "unassigned";
    if (!sectionMap.has(key)) {
      const cachedSection = classRecordsCache.find((section) => section.id === record.sectionId);
      sectionMap.set(key, {
        id: key,
        sectionId: record.sectionId || "",
        sectionName: record.sectionName || (cachedSection ? classLabel(cachedSection) : "Unassigned section"),
        records: [],
      });
    }
    sectionMap.get(key).records.push(record);
  });
  return [...sectionMap.values()].sort((a, b) => a.sectionName.localeCompare(b.sectionName));
}

function renderStudentAttendanceSectionRows(section, dateKeys) {
  const isExpanded = expandedStudentAttendanceSections.has(section.id);
  const studentCount = attendanceUniqueCount(section.records, (record) => record.studentId || record.studentName);
  return `
    <tr class="attendance-section-row">
      <td>
        <strong>${escapeHtml(section.sectionName)}</strong>
        <small class="row-note">${escapeHtml(`${section.records.length} attendance records`)}</small>
      </td>
      <td>${escapeHtml(String(studentCount))}</td>
      ${dateKeys.map((dateKey) => renderStudentAttendanceSectionPercent(section, dateKey)).join("")}
      <td>
        <button class="secondary-button toggle-student-attendance-section" type="button" data-section-id="${escapeAttribute(section.id)}">
          ${isExpanded ? "Collapse" : "Expand"}
        </button>
      </td>
    </tr>
    ${isExpanded ? renderStudentAttendanceDetailRow(section, dateKeys) : ""}
  `;
}

function renderStudentAttendanceSectionPercent(section, dateKey) {
  const records = section.records.filter((record) => attendanceDateValue(record) === dateKey);
  if (!records.length) return `<td class="attendance-record-cell"><span class="muted-mark">-</span></td>`;
  const present = records.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const rate = records.length ? (present / records.length) * 100 : 0;
  const absent = records.filter((record) => record.status === "Absent").length;
  return `
    <td class="attendance-record-cell" title="${escapeAttribute(`${present}/${records.length} present or late, ${absent} absent`)}">
      <strong>${rate.toFixed(0)}%</strong>
      <small class="row-note">${escapeHtml(`${present}/${records.length}`)}</small>
    </td>
  `;
}

function renderStudentAttendanceDetailRow(section, dateKeys) {
  const students = getStudentAttendanceDetailStudents(section);
  return `
    <tr class="attendance-detail-row">
      <td colspan="${dateKeys.length + 3}">
        <div class="table-wrap attendance-detail-table">
          <table class="academic-table attendance-record-table">
            <thead>
              <tr>
                <th>Name</th>
                ${dateKeys.map((dateKey) => `<th class="attendance-date-heading"><span>${escapeHtml(dateKey.includes("-") ? shortDateLabel(dateKey) : dateKey)}</span><small>${escapeHtml(dateKey)}</small></th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${students.map((student) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(student.displayName)}</strong>
                    <small class="row-note">${escapeHtml(section.sectionName)}</small>
                  </td>
                  ${dateKeys.map((dateKey) => renderStudentAttendanceDetailCell(section, student, dateKey)).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  `;
}

function getStudentAttendanceDetailStudents(section) {
  const recordStudents = section.records.map((record) => {
    const cachedStudent = studentRecordsCache.find((student) => student.id === record.studentId);
    return {
      id: record.studentId || record.studentName,
      lastName: cachedStudent?.lastName || record.studentName || "",
      firstName: cachedStudent?.firstName || "",
      middleName: cachedStudent?.middleName || "",
      displayName: cachedStudent ? `${cachedStudent.lastName}, ${cachedStudent.firstName} ${cachedStudent.middleName || ""}`.trim() : record.studentName || "No learner name",
    };
  });
  return sortStudentsSf1Order([...new Map(recordStudents.map((student) => [student.id, student])).values()]);
}

function renderStudentAttendanceDetailCell(section, student, dateKey) {
  const record = section.records.find((item) =>
    (item.studentId || item.studentName) === student.id
    && attendanceDateValue(item) === dateKey
  );
  if (!record) return `<td class="attendance-record-cell"><span class="muted-mark">-</span></td>`;
  const isPresent = record.status === "Present";
  const isLate = record.status === "Late";
  const statusMark = isPresent ? "&#10003;" : isLate ? "L" : "&#215;";
  const statusClass = isPresent || isLate ? "present" : "absent";
  return `
    <td class="attendance-record-cell" title="${escapeAttribute(record.status || "")}">
      <span class="attendance-status-mark ${statusClass}" role="img" aria-label="${escapeAttribute(`${student.displayName} ${dateKey} ${record.status || ""}`)}">${statusMark}</span>
    </td>
  `;
}

function attendanceSummaryRows(records, groupGetter) {
  return [...new Map(records.map((record) => {
    const key = groupGetter(record) || "Not recorded";
    return [key, key];
  })).keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const grouped = records.filter((record) => (groupGetter(record) || "Not recorded") === key);
      const present = grouped.filter((record) => record.status === "Present").length;
      const absent = grouped.filter((record) => record.status === "Absent").length;
      return { label: key, present, absent, total: grouped.length };
    });
}

function renderStudentAttendancePrintSummary() {
  const host = document.querySelector("#studentAttendancePrintSummary");
  if (!host) return;
  const records = filteredStudentAttendanceRecords;
  const present = records.filter((record) => record.status === "Present").length;
  const absent = records.filter((record) => record.status === "Absent").length;
  const sections = attendanceSummaryRows(records, (record) => record.sectionName || record.sectionId);
  const dates = attendanceSummaryRows(records, attendanceDateValue);

  host.innerHTML = `
    <div class="print-summary-grid">
      <article><span>Total Present</span><strong>${present}</strong></article>
      <article><span>Total Absent</span><strong>${absent}</strong></article>
      <article><span>Students Tracked</span><strong>${attendanceUniqueCount(records, (record) => record.studentId || record.studentName)}</strong></article>
      <article><span>Attendance Dates</span><strong>${attendanceUniqueCount(records, attendanceDateValue)}</strong></article>
    </div>
    <div class="print-two-column">
      ${renderAttendancePrintTable("By Section", sections)}
      ${renderAttendancePrintTable("By Date", dates)}
    </div>
  `;
}

function renderAttendancePrintTable(title, rows) {
  const body = rows.length
    ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.label)}</td>
        <td>${row.present}</td>
        <td>${row.absent}</td>
        <td>${row.total}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4">No records to summarize.</td></tr>`;
  return `
    <section class="print-summary-table">
      <h3>${escapeHtml(title)}</h3>
      <table>
        <thead><tr><th>Group</th><th>Present</th><th>Absent</th><th>Total</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </section>
  `;
}

function attendanceRate(records, presentStatuses = ["Present", "Late"]) {
  if (!records.length) return 0;
  return (records.filter((record) => presentStatuses.includes(record.status)).length / records.length) * 100;
}

function attendanceDateValue(record) {
  return record.attendanceDate || record.attendanceWeek || "";
}

function attendanceUniqueCount(records, fieldGetter) {
  return new Set(records.map(fieldGetter).filter(Boolean)).size;
}

function renderAttendanceKpiGrid(items) {
  return `
    <div class="attendance-kpi-grid">
      ${items.map(([label, value, note]) => `
        <article class="attendance-kpi-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <small>${escapeHtml(note)}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderRateRows(title, rows, emptyMessage = "No records to summarize.") {
  const normalizedRows = rows.length ? rows : [["No data", 0, emptyMessage]];
  return `
    <article class="chart-card attendance-rate-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${normalizedRows.map(([label, rate, note]) => `
          <div class="attendance-rate-row">
            <span>${escapeHtml(label)}</span>
            <div class="chart-track"><i style="width: ${Math.max(0, Math.min(Number(rate) || 0, 100))}%"></i></div>
            <strong>${Number(rate || 0).toFixed(1)}%</strong>
            <small>${escapeHtml(note || "")}</small>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderStudentAttendanceAnalytics() {
  const host = document.querySelector("#studentAttendanceAnalytics");
  if (!host) return;
  const records = filteredStudentAttendanceRecords;
  const present = records.filter((record) => ["Present", "Late"].includes(record.status)).length;
  const absent = records.filter((record) => record.status === "Absent").length;
  const late = records.filter((record) => record.status === "Late").length;
  const excused = records.filter((record) => record.status === "Excused").length;
  const studentAttendanceGroups = groupCountRows(records, (record) => record.studentId || record.studentName).map(([key]) => {
    const studentRecords = records.filter((record) => (record.studentId || record.studentName) === key);
    return {
      key,
      name: studentRecords[0]?.studentName || key,
      absent: studentRecords.filter((record) => record.status === "Absent").length,
      late: studentRecords.filter((record) => record.status === "Late").length,
      total: studentRecords.length,
    };
  });
  const chronicAbsenteeism = studentAttendanceGroups.filter((item) => item.absent >= 3).length;
  const perfectAttendance = studentAttendanceGroups.filter((item) => item.total > 0 && item.absent === 0 && item.late === 0).length;
  const monthlyRows = groupCountRows(records.filter((record) => ["Present", "Late"].includes(record.status)), (record) => analyticsMonthKey(attendanceDateValue(record)), "No month")
    .filter(([label]) => label !== "No month")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const sectionAbsenceRows = groupCountRows(records.filter((record) => record.status === "Absent"), (record) => record.sectionName || record.sectionId).slice(0, 8);
  const heatmapRows = groupCountRows(records.filter((record) => record.status === "Absent"), attendanceDateValue).slice(0, 10);
  const trend = compareLatestTwo(monthlyRows);
  const sectionRows = classRecordsCache
    .map((section) => {
      const sectionRecords = records.filter((record) => record.sectionId === section.id);
      if (!sectionRecords.length) return null;
      const sectionAbsent = sectionRecords.filter((record) => record.status === "Absent").length;
      return [
        classLabel(section),
        attendanceRate(sectionRecords),
        `${sectionRecords.length} records, ${sectionAbsent} absent`,
      ];
    })
    .filter(Boolean)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
  const dailyRows = [...new Set(records.map(attendanceDateValue).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5)
    .map((dateKey) => {
      const dateRecords = records.filter((record) => attendanceDateValue(record) === dateKey);
      return [
        dateKey.includes("-") ? shortDateLabel(dateKey) : dateKey,
        attendanceRate(dateRecords),
        `${dateRecords.length} records`,
      ];
    });
  const insights = [
    sectionAbsenceRows[0] ? `${sectionAbsenceRows[0][0]} has the highest absenteeism in the current view.` : "",
    trend.change < 0 ? "Attendance dropped compared to the previous month." : trend.change > 0 ? "Attendance improved compared to the previous month." : "",
    chronicAbsenteeism ? `${chronicAbsenteeism} learner${chronicAbsenteeism === 1 ? "" : "s"} show chronic absenteeism.` : "",
    late ? `${late} late mark${late === 1 ? "" : "s"} need follow-up.` : "",
  ];

  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Attendance Rate", `${attendanceRate(records).toFixed(1)}%`, `${present} present or late of ${records.length}`],
      ["Total Absences", String(absent), `${excused} excused records`],
      ["Total Late", String(late), "Late attendance marks"],
      ["Chronic Absenteeism", String(chronicAbsenteeism), "3 or more absences"],
      ["Perfect Attendance", String(perfectAttendance), "No absence or late marks"],
      ["Students Tracked", String(attendanceUniqueCount(records, (record) => record.studentId || record.studentName)), "Within current filters"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("Status Distribution", attendanceStatuses.map((item) => [item, records.filter((record) => record.status === item).length]))}
      ${renderVerticalBarChart("Monthly Attendance Trend", monthlyRows)}
      ${renderSummaryChart("Attendance by Section", sectionAbsenceRows)}
      ${renderRateRows("Lowest Section Rates", sectionRows)}
      ${renderRateRows("Recent Daily Rates", dailyRows)}
      ${renderSummaryChart("Absent-Heavy Days", heatmapRows)}
      ${renderInsightPanel("Attendance Alerts", insights)}
    </div>
  `;
}

function openStudentAttendanceForm(record = null) {
  editingStudentAttendanceId = record?.id || null;
  const editableClasses = classRecordsCache.filter((section) => canEditSectionRecords(section.id));
  const sectionOptions = editableClasses.map((section) => `<option value="${escapeHtml(section.id)}" ${section.id === record?.sectionId ? "selected" : ""}>${escapeHtml(classLabel(section))}</option>`).join("");
  const initialAttendanceDate = record?.attendanceDate || todayIso();
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="studentAttendanceForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Student Attendance</p><h2>${record ? "Edit Class Attendance" : "Encode Class Attendance"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Section<select id="attendanceSectionId" required><option value="">Select section</option>${sectionOptions}</select></label>
          <label>Date<input id="attendanceDate" type="date" value="${escapeHtml(initialAttendanceDate)}" /></label>
          <div class="batch-actions">
            <button id="checkAllAttendance" class="secondary-button" type="button">Check All Present</button>
            <button id="clearAllAttendance" class="secondary-button" type="button">Clear All</button>
          </div>
        </div>
        <div id="attendanceBatchHost" class="batch-table-host"><p class="empty-state">Select a section to show students.</p></div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">Save Class Attendance</button>
        </div>
      </form>
    </div>
  `);
  renderAttendanceBatchRows();
}

function sectionActiveStudents(sectionId) {
  return sortStudentsSf1Order(studentRecordsCache.filter((student) => student.sectionId === sectionId && isEnrolledStudentStatus(student.status)));
}

function findAttendanceRecord(sectionId, studentId, attendanceDate) {
  return studentAttendanceRecordsCache.find((record) =>
    record.sectionId === sectionId
    && record.studentId === studentId
    && (attendanceDate ? record.attendanceDate === attendanceDate : true)
  );
}

function renderAttendanceBatchRows() {
  const sectionId = document.querySelector("#attendanceSectionId")?.value || "";
  const host = document.querySelector("#attendanceBatchHost");
  if (!host) return;
  const attendanceDate = document.querySelector("#attendanceDate")?.value || "";
  const dates = attendanceDateColumns(attendanceDate);
  const students = sectionActiveStudents(sectionId);
  if (!sectionId) {
    host.innerHTML = `<p class="empty-state">Select a section to show students.</p>`;
    return;
  }
  if (!students.length) {
    host.innerHTML = `<p class="empty-state">No active students found for this section.</p>`;
    return;
  }
  host.innerHTML = `
    <div class="table-wrap">
      <table class="batch-table attendance-batch-table">
        <thead>
          <tr>
            <th class="attendance-check-heading"><span>${escapeHtml(shortDateLabel(dates[0]))}</span><small>${escapeHtml(dates[0])}</small></th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((student) => {
            const date = dates[0];
            const existing = findAttendanceRecord(sectionId, student.id, date);
            const isPresent = !existing || ["Present", "Late"].includes(existing.status);
            return `
              <tr>
                <td class="attendance-check-cell">
                  <input class="attendance-present-checkbox" type="checkbox" data-student-id="${escapeHtml(student.id)}" data-date="${escapeHtml(date)}" ${isPresent ? "checked" : ""} aria-label="${escapeHtml(`${student.lastName}, ${student.firstName} ${date}`)} attendance" />
                </td>
                <td><strong>${escapeHtml(`${student.lastName}, ${student.firstName} ${student.middleName || ""}`.trim())}</strong></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function handleStudentAttendanceFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const section = getSelectedClass(document.querySelector("#attendanceSectionId").value);
  if (!section || !canEditSectionRecords(section.id)) {
    message.textContent = "You can only encode attendance for your assigned section.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const students = sectionActiveStudents(section.id);
  const attendanceDate = document.querySelector("#attendanceDate").value;
  if (!attendanceDate) {
    message.textContent = "Add an attendance date before saving attendance.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const dates = attendanceDateColumns(attendanceDate);
  const originalButtonText = submitButton?.textContent || "Save Class Attendance";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add("is-busy");
    submitButton.setAttribute("aria-busy", "true");
    submitButton.textContent = "Saving attendance...";
  }
  message.textContent = "Saving attendance. Please wait...";
  message.classList.remove("hidden", "error");
  try {
    let saved = 0;
    for (const student of students) {
      for (const date of dates) {
        const checked = document.querySelector(`.attendance-present-checkbox[data-student-id="${CSS.escape(student.id)}"][data-date="${CSS.escape(date)}"]`)?.checked;
        const existing = findAttendanceRecord(section.id, student.id, date);
        const data = {
          attendanceDate: date,
          sectionId: section.id,
          sectionName: classLabel(section),
          adviserId: section.adviserId || "",
          studentId: student.id,
          studentName: `${student.lastName}, ${student.firstName}`,
          status: checked ? "Present" : "Absent",
          remarks: "",
          encodedBy: auth.currentUser.uid,
          encodedByName: currentUserProfile.fullName || auth.currentUser.email,
        };
        if (existing) {
          await updateDoc(doc(db, "studentAttendance", existing.id), { ...data, attendanceWeek: deleteField(), updatedAt: serverTimestamp() });
          await createAuditLog("update", "Student Attendance", existing.id, existing, data);
        } else {
          const created = await addDoc(collection(db, "studentAttendance"), { ...data, encodedAt: serverTimestamp(), updatedAt: serverTimestamp() });
          await createAuditLog("create", "Student Attendance", created.id, null, data);
        }
        saved += 1;
      }
    }
    document.querySelector("#academicModal")?.remove();
    await renderStudentAttendanceModule();
    await refreshAcademicCounters(currentUserProfile.role);
    showDashboardMessage(`Saved ${saved} attendance entries.`);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove("is-busy");
      submitButton.removeAttribute("aria-busy");
      submitButton.textContent = originalButtonText;
    }
  }
}

async function renderTeacherAttendanceModule() {
  els.dashboardTitle.textContent = "Teacher Attendance";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div><p class="eyebrow">Personnel monitoring</p><h2>Teacher Attendance</h2></div>
      <div class="toolbar-actions">${canManageTeacherAttendance() ? `<button id="newTeacherAttendanceButton" class="primary-button" type="button">Encode Teacher Attendance</button>` : ""}</div>
    </section>
    <section id="teacherAttendanceAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading teacher attendance analytics...</p>
    </section>
    <section id="teacherAttendancePrintSummary" class="print-only attendance-print-summary"></section>
    <section class="table-card">
      <div class="section-header"><h2>Teacher Attendance Records</h2></div>
      <div class="filter-grid">
        <label>Search<input id="teacherAttendanceSearch" type="search" placeholder="Teacher or remarks" /></label>
        <label>Status<select id="teacherAttendanceStatusFilter">${optionList(teacherAttendanceStatuses, "", "All statuses")}</select></label>
      </div>
      <div id="teacherAttendanceTableHost" class="table-wrap"><p class="empty-state">Loading teacher attendance...</p></div>
    </section>
  `;
  try {
    await loadTeacherAttendancePersonnel();
    teacherAttendanceRecordsCache = await getVisibleTeacherAttendance();
    applyTeacherAttendanceFilters();
  } catch (error) {
    document.querySelector("#teacherAttendanceTableHost").innerHTML = `<p class="empty-state">Unable to load teacher attendance: ${escapeHtml(error.message)}</p>`;
  }
}

function applyTeacherAttendanceFilters() {
  const host = document.querySelector("#teacherAttendanceTableHost");
  if (!host) return;
  const search = (document.querySelector("#teacherAttendanceSearch")?.value || "").toLowerCase();
  const status = document.querySelector("#teacherAttendanceStatusFilter")?.value || "";
  filteredTeacherAttendanceRecords = teacherAttendanceRecordsCache.filter((record) =>
    teacherAttendanceStatuses.includes(record.status)
    && (!search || Object.values(record).join(" ").toLowerCase().includes(search))
    && (!status || record.status === status)
  );
  renderTeacherAttendanceAnalytics();
  renderTeacherAttendancePrintSummary();
  if (!filteredTeacherAttendanceRecords.length) {
    host.innerHTML = `<p class="empty-state">No teacher attendance records match the current filters.</p>`;
    return;
  }
  renderTeacherAttendanceMatrix(host);
}

function renderTeacherAttendanceMatrix(host) {
  const records = filteredTeacherAttendanceRecords;
  const dates = [...new Set(records.map((record) => record.attendanceDate).filter(Boolean))].sort();
  const personnel = [...new Map(records
    .map((record) => [record.teacherId || record.teacherName, {
      id: record.teacherId || record.teacherName,
      name: record.teacherName || "Personnel",
      role: record.teacherRole || "",
    }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const recordsByPersonDate = new Map(records.map((record) => [`${record.teacherId || record.teacherName}:${record.attendanceDate}`, record]));

  host.innerHTML = `
    <table class="academic-table teacher-attendance-matrix">
      <thead>
        <tr>
          <th>Personnel</th>
          ${dates.map((date) => `
            <th>
              <span>${escapeHtml(shortDateLabel(date))}</span>
              ${canManageTeacherAttendance() ? `<button class="secondary-button edit-teacher-attendance-date" type="button" data-date="${escapeHtml(date)}">Edit</button>` : ""}
            </th>
          `).join("")}
        </tr>
      </thead>
      <tbody>
        ${personnel.map((person) => `
          <tr>
            <td>
              <strong>${escapeHtml(person.name)}</strong>
              <small class="row-note">${escapeHtml(person.role || "Personnel")}</small>
            </td>
            ${dates.map((date) => {
              const record = recordsByPersonDate.get(`${person.id}:${date}`);
              if (!record) return `<td><span class="muted-mark">-</span></td>`;
              const isPresent = record.status === "Present";
              return `
                <td title="${escapeHtml(record.remarks || record.status || "")}">
                  <span class="attendance-status-mark ${isPresent ? "present" : "absent"}" role="img" aria-label="${escapeHtml(`${person.name} ${date} ${record.status}`)}">${isPresent ? "✓" : "x"}</span>
                </td>
              `;
            }).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderTeacherAttendancePrintSummary() {
  const host = document.querySelector("#teacherAttendancePrintSummary");
  if (!host) return;
  const records = filteredTeacherAttendanceRecords;
  const present = records.filter((record) => record.status === "Present").length;
  const absent = records.filter((record) => record.status === "Absent").length;
  const dates = attendanceSummaryRows(records, attendanceDateValue);
  const personnel = attendanceSummaryRows(records, (record) => record.teacherName || record.teacherId);

  host.innerHTML = `
    <div class="print-summary-grid">
      <article><span>Total Present</span><strong>${present}</strong></article>
      <article><span>Total Absent</span><strong>${absent}</strong></article>
      <article><span>Personnel Tracked</span><strong>${attendanceUniqueCount(records, (record) => record.teacherId || record.teacherName)}</strong></article>
      <article><span>Attendance Dates</span><strong>${attendanceUniqueCount(records, attendanceDateValue)}</strong></article>
    </div>
    <div class="print-two-column">
      ${renderAttendancePrintTable("By Date", dates)}
      ${renderAttendancePrintTable("By Personnel", personnel)}
    </div>
  `;
}

function renderTeacherAttendanceAnalytics() {
  const host = document.querySelector("#teacherAttendanceAnalytics");
  if (!host) return;
  const records = filteredTeacherAttendanceRecords;
  const presentStatuses = ["Present"];
  const present = records.filter((record) => presentStatuses.includes(record.status)).length;
  const absent = records.filter((record) => record.status === "Absent").length;
  const late = records.filter((record) => record.status === "Late").length;
  const teacherAttendanceGroups = groupCountRows(records, (record) => record.teacherId || record.teacherName).map(([key]) => {
    const teacherRecords = records.filter((record) => (record.teacherId || record.teacherName) === key);
    return {
      key,
      name: teacherRecords[0]?.teacherName || key,
      absent: teacherRecords.filter((record) => record.status === "Absent").length,
      late: teacherRecords.filter((record) => record.status === "Late").length,
      total: teacherRecords.length,
    };
  });
  const chronicAbsenteeism = teacherAttendanceGroups.filter((item) => item.absent >= 3).length;
  const perfectAttendance = teacherAttendanceGroups.filter((item) => item.total > 0 && item.absent === 0 && item.late === 0).length;
  const monthlyRows = groupCountRows(records.filter((record) => record.status === "Present"), (record) => analyticsMonthKey(attendanceDateValue(record)), "No month")
    .filter(([label]) => label !== "No month")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const absenceRows = teacherAttendanceGroups
    .filter((item) => item.absent > 0)
    .sort((a, b) => b.absent - a.absent || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((item) => [item.name, item.absent]);
  const heatmapRows = groupCountRows(records.filter((record) => record.status === "Absent"), attendanceDateValue).slice(0, 10);
  const trend = compareLatestTwo(monthlyRows);
  const teacherRows = [...new Set(records.map((record) => record.teacherId || record.teacherName).filter(Boolean))]
    .map((teacherKey) => {
      const teacherRecords = records.filter((record) => (record.teacherId || record.teacherName) === teacherKey);
      const teacherName = teacherRecords[0]?.teacherName || teacherKey;
      const teacherAbsences = teacherRecords.filter((record) => record.status === "Absent").length;
      return [
        teacherName,
        attendanceRate(teacherRecords, presentStatuses),
        `${teacherRecords.length} records, ${teacherAbsences} absent`,
      ];
    })
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
  const dateRows = [...new Set(records.map(attendanceDateValue).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5)
    .map((dateKey) => {
      const dateRecords = records.filter((record) => attendanceDateValue(record) === dateKey);
      return [
        dateKey.includes("-") ? shortDateLabel(dateKey) : dateKey,
        attendanceRate(dateRecords, presentStatuses),
        `${dateRecords.length} records`,
      ];
    });
  const insights = [
    absenceRows[0] ? `${absenceRows[0][0]} has the highest personnel absence count.` : "",
    trend.change < 0 ? "Teacher attendance dropped compared to the previous month." : trend.change > 0 ? "Teacher attendance improved compared to the previous month." : "",
    chronicAbsenteeism ? `${chronicAbsenteeism} personnel have repeated absences.` : "",
  ];

  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Attendance Rate", `${attendanceRate(records, presentStatuses).toFixed(1)}%`, `${present} present of ${records.length}`],
      ["Total Absences", String(absent), "Marked absent"],
      ["Total Late", String(late), "Late marks"],
      ["Chronic Absenteeism", String(chronicAbsenteeism), "3 or more absences"],
      ["Perfect Attendance", String(perfectAttendance), "No absence or late marks"],
      ["Teachers Tracked", String(attendanceUniqueCount(records, (record) => record.teacherId || record.teacherName)), "Within current filters"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("Status Distribution", teacherAttendanceStatuses.map((item) => [item, records.filter((record) => record.status === item).length]))}
      ${renderVerticalBarChart("Monthly Attendance Trend", monthlyRows)}
      ${renderSummaryChart("Teacher Attendance Comparison", absenceRows)}
      ${renderRateRows("Lowest Teacher Rates", teacherRows)}
      ${renderRateRows("Recent Daily Rates", dateRows)}
      ${renderSummaryChart("Absent-Heavy Days", heatmapRows)}
      ${renderInsightPanel("Teacher Attendance Alerts", insights)}
    </div>
  `;
}

function findTeacherAttendanceRecord(teacherId, attendanceDate) {
  return teacherAttendanceRecordsCache.find((record) =>
    record.teacherId === teacherId
    && record.attendanceDate === attendanceDate
  );
}

function renderTeacherAttendanceChecklistRows(attendanceDate) {
  const host = document.querySelector("#teacherAttendanceChecklistRows");
  if (!host) return;
  if (!academicTeachersCache.length) {
    host.innerHTML = `<tr><td colspan="3"><p class="empty-state">No approved personnel found.</p></td></tr>`;
    return;
  }
  host.innerHTML = academicTeachersCache.map((person) => {
    const existing = findTeacherAttendanceRecord(person.id, attendanceDate);
    const isPresent = existing?.status === "Present";
    return `
      <tr>
        <td>
          <strong>${escapeHtml(person.fullName || person.email || person.id)}</strong>
          <small class="row-note">${escapeHtml(person.role || "Personnel")}</small>
        </td>
        <td>
          <input
            class="teacher-attendance-present-checkbox"
            type="checkbox"
            data-teacher-id="${escapeHtml(person.id)}"
            ${isPresent ? "checked" : ""}
            aria-label="${escapeHtml(`${person.fullName || person.email || person.id} present`)}"
          />
        </td>
        <td>
          <input
            class="teacher-attendance-remarks"
            type="text"
            data-teacher-id="${escapeHtml(person.id)}"
            value="${escapeHtml(existing?.remarks || "")}"
            placeholder="Optional"
          />
        </td>
      </tr>
    `;
  }).join("");
}

function openTeacherAttendanceForm(record = null) {
  editingTeacherAttendanceId = record?.id || null;
  const selectedDate = record?.attendanceDate || todayIso();
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="teacherAttendanceForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Teacher Attendance</p><h2>Daily Personnel Checklist</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid">
          <label>Date<input id="teacherAttendanceDate" type="date" required value="${escapeHtml(selectedDate)}" /></label>
        </div>
        <div class="table-wrap">
          <table class="batch-table">
            <thead><tr><th>Personnel</th><th>Present</th><th>Remarks</th></tr></thead>
            <tbody id="teacherAttendanceChecklistRows"></tbody>
          </table>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">Save Attendance Checklist</button>
        </div>
      </form>
    </div>
  `);
  renderTeacherAttendanceChecklistRows(selectedDate);
  document.querySelector("#teacherAttendanceDate")?.addEventListener("input", (event) => {
    renderTeacherAttendanceChecklistRows(event.target.value);
  });
}

async function handleTeacherAttendanceFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const attendanceDate = document.querySelector("#teacherAttendanceDate")?.value || "";
  if (!attendanceDate) {
    message.textContent = "Select an attendance date.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  try {
    let saved = 0;
    for (const person of academicTeachersCache) {
      const present = document.querySelector(`.teacher-attendance-present-checkbox[data-teacher-id="${CSS.escape(person.id)}"]`)?.checked;
      const remarks = document.querySelector(`.teacher-attendance-remarks[data-teacher-id="${CSS.escape(person.id)}"]`)?.value.trim() || "";
      const existing = findTeacherAttendanceRecord(person.id, attendanceDate);
      const data = {
        teacherId: person.id,
        teacherName: person.fullName || person.email || person.id,
        teacherRole: person.role || "",
        attendanceDate,
        status: present ? "Present" : "Absent",
        remarks,
        encodedBy: auth.currentUser.uid,
        encodedByName: currentUserProfile.fullName || auth.currentUser.email,
      };
      if (existing) {
        await updateDoc(doc(db, "teacherAttendance", existing.id), { ...data, updatedAt: serverTimestamp() });
        await createAuditLog("update", "Teacher Attendance", existing.id, existing, data);
      } else {
        const created = await addDoc(collection(db, "teacherAttendance"), { ...data, encodedAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await createAuditLog("create", "Teacher Attendance", created.id, null, data);
      }
      saved += 1;
    }
    document.querySelector("#academicModal")?.remove();
    await renderTeacherAttendanceModule();
    showDashboardMessage(`Saved attendance for ${saved} personnel.`);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function renderTeacherWorkloadModule() {
  els.dashboardTitle.textContent = "Teacher Workload";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Teacher workload</p>
        <h2>Teacher Workload Dashboard</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageTeacherWorkload() ? `
          <button id="newTeachingLoadButton" class="primary-button" type="button">Add Teaching Load</button>
          <button id="newAncillaryDutyButton" class="secondary-button" type="button">Add Ancillary Duty</button>
        ` : ""}
      </div>
    </section>
    <section id="teacherWorkloadAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading workload analytics...</p>
    </section>
    <section class="table-card">
      <div class="section-header"><h2>Workload Overview</h2></div>
      <div class="filter-grid">
        <label>Search<input id="workloadSearch" type="search" placeholder="Teacher, subject, section, adviser, duty" /></label>
        <label>Department<select id="workloadDepartmentFilter"></select></label>
        <label>Grade Level<select id="workloadGradeFilter"></select></label>
        <label>Subject Area<select id="workloadSubjectFilter"></select></label>
        <label>Status<select id="workloadStatusFilter"></select></label>
      </div>
      <div id="teacherWorkloadTableHost" class="table-wrap"><p class="empty-state">Loading workload records...</p></div>
    </section>
    <section id="teacherWorkloadDetailHost" class="table-card">
      <p class="empty-state">Select a teacher to view their detailed workload profile.</p>
    </section>
  `;
  try {
    await loadTeacherWorkloadTeachers();
    [classRecordsCache, studentRecordsCache, teacherWorkloadRecordsCache, ancillaryAssignmentRecordsCache, observationRecordsCache] = await Promise.all([
      getVisibleClasses(),
      getVisibleStudents(),
      getVisibleTeacherWorkloadRecords(),
      getVisibleAncillaryAssignments(),
      hasAnyRole(currentUserProfile, observationRoles) ? getVisibleClassroomObservations() : Promise.resolve([]),
    ]);
    teacherWorkloadSummariesCache = buildTeacherWorkloadSummaries();
    populateTeacherWorkloadFilters();
    applyTeacherWorkloadFilters();
  } catch (error) {
    document.querySelector("#teacherWorkloadTableHost").innerHTML = `<p class="empty-state">Unable to load workload data: ${escapeHtml(error.message)}</p>`;
  }
}

function summaryUniqueValues(getter) {
  return [...new Set(teacherWorkloadSummariesCache.flatMap((summary) => {
    const value = getter(summary);
    return Array.isArray(value) ? value : [value];
  }).filter(Boolean))].sort();
}

function populateTeacherWorkloadFilters() {
  document.querySelector("#workloadDepartmentFilter").innerHTML = optionList(summaryUniqueValues((summary) => summary.department), "", "All departments");
  document.querySelector("#workloadGradeFilter").innerHTML = optionList(summaryUniqueValues((summary) => summary.gradeLevels), "", "All grade levels");
  document.querySelector("#workloadSubjectFilter").innerHTML = optionList(summaryUniqueValues((summary) => summary.subjectAreas), "", "All subject areas");
  document.querySelector("#workloadStatusFilter").innerHTML = optionList(WORKLOAD_RULES.statusThresholds.map((item) => item.label), "", "All statuses");
}

function applyTeacherWorkloadFilters() {
  const host = document.querySelector("#teacherWorkloadTableHost");
  if (!host) return;
  const search = (document.querySelector("#workloadSearch")?.value || "").trim().toLowerCase();
  const department = document.querySelector("#workloadDepartmentFilter")?.value || "";
  const gradeLevel = document.querySelector("#workloadGradeFilter")?.value || "";
  const subjectArea = document.querySelector("#workloadSubjectFilter")?.value || "";
  const status = document.querySelector("#workloadStatusFilter")?.value || "";

  filteredTeacherWorkloadSummaries = teacherWorkloadSummariesCache.filter((summary) => {
    const haystack = [
      summary.teacherName,
      summary.department,
      summary.workloadStatus,
      ...summary.subjects,
      ...summary.sections,
      ...summary.advisoryClasses.map(classLabel),
      ...summary.subjectAreas,
      ...summary.duties.map((duty) => duty.dutyName),
    ].join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!department || summary.department === department)
      && (!gradeLevel || summary.gradeLevels.includes(gradeLevel))
      && (!subjectArea || summary.subjectAreas.includes(subjectArea))
      && (!status || summary.workloadStatus === status);
  });

  renderTeacherWorkloadAnalytics();
  renderTeacherWorkloadTable(host);
  if (filteredTeacherWorkloadSummaries.length === 1) {
    renderTeacherWorkloadDetail(filteredTeacherWorkloadSummaries[0].teacherId);
  }
}

function renderTeacherWorkloadAnalytics() {
  const host = document.querySelector("#teacherWorkloadAnalytics");
  if (!host) return;
  const summaries = filteredTeacherWorkloadSummaries;
  const overloaded = summaries.filter((summary) => summary.workloadStatus === "Overloaded");
  const light = summaries.filter((summary) => summary.workloadStatus === "Light Load");
  const average = summaries.length
    ? summaries.reduce((sum, summary) => sum + summary.workloadScore, 0) / summaries.length
    : 0;
  const mostOverloaded = summaries[0]?.teacherName || "None";
  const ancillaryCount = summaries.reduce((sum, summary) => sum + summary.duties.length, 0);
  const totalTeachingLoad = summaries.reduce((sum, summary) => sum + summary.teachingHours + summary.advisoryScore, 0);
  const departmentRows = groupSumRows(summaries, (summary) => summary.department || summary.role || "Unassigned", (summary) => summary.workloadScore).slice(0, 8);
  const ancillaryRows = groupCountRows(summaries.flatMap((summary) => summary.duties), "dutyName").slice(0, 8);
  const overloadedTeacher = summaries.find((summary) => summary.workloadScore > average && ["Heavy Load", "Overloaded"].includes(summary.workloadStatus));

  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total Teachers", String(summaries.length), "Within current filters"],
      ["Total Teaching Load", `${totalTeachingLoad.toFixed(1)} hrs`, "Class load plus adviser load"],
      ["Average Load", average.toFixed(1), "Average workload score"],
      ["Most Loaded Teacher", mostOverloaded, "Highest workload score"],
      ["Ancillary Assignments", String(ancillaryCount), "Coordinator and adviser duties"],
      ["Observation Count", String(observationRecordsCache.length || 0), "Visible observation records"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("Workload Status", WORKLOAD_RULES.statusThresholds.map((item) => [item.label, summaries.filter((summary) => summary.workloadStatus === item.label).length]))}
      ${renderSummaryChart("Teacher Load Comparison", summaries.slice(0, 8).map((summary) => [summary.teacherName, Math.round(summary.workloadScore)]))}
      ${renderAnalyticsPieChart("Department Workload Distribution", departmentRows.map(([label, value]) => [label, Math.round(value)]))}
      ${renderSummaryChart("Ancillary Assignment Distribution", ancillaryRows)}
      ${renderInsightPanel("Workload Insights", [
        departmentRows[0] ? `${departmentRows[0][0]} has the highest workload concentration.` : "",
        overloadedTeacher ? `${overloadedTeacher.teacherName} exceeds the current average workload.` : "",
        light.length ? `${light.length} teacher${light.length === 1 ? "" : "s"} may receive additional load if needed.` : "",
      ])}
    </div>
  `;
}

function renderTeacherWorkloadTable(host) {
  if (!filteredTeacherWorkloadSummaries.length) {
    host.innerHTML = `<p class="empty-state">No teacher workloads match the current filters.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table workload-table">
      <thead>
        <tr>
          <th>Teacher</th>
          <th>Subjects</th>
          <th>Classes</th>
          <th>Adviser</th>
          <th>Teaching Load</th>
          <th>Ancillary Duties</th>
          <th>Workload</th>
        </tr>
      </thead>
      <tbody>
        ${filteredTeacherWorkloadSummaries.map((summary) => `
          <tr class="workload-summary-row" tabindex="0" role="button" data-teacher-id="${escapeHtml(summary.teacherId)}" aria-label="View workload profile for ${escapeAttribute(summary.teacherName)}">
            <td>
              <strong>${escapeHtml(summary.teacherName)}</strong>
              <small class="row-note">${escapeHtml(summary.department || summary.role || "Teacher")}</small>
            </td>
            <td>${summary.subjects.length ? summary.subjects.map((subject) => `<span class="workload-chip">${escapeHtml(subject)}</span>`).join("") : `<span class="muted-mark">-</span>`}</td>
            <td>${summary.sections.length ? summary.sections.map((section) => `<span class="workload-chip">${escapeHtml(section)}</span>`).join("") : `<span class="muted-mark">-</span>`}</td>
            <td>
              ${summary.advisoryClasses.length ? `
                ${summary.advisoryClasses.map((section) => `<span class="workload-chip">${escapeHtml(classLabel(section))}</span>`).join("")}
                <small class="row-note">${summary.advisoryScore.toFixed(1)} equivalent hours</small>
              ` : `<span class="muted-mark">-</span>`}
            </td>
            <td>
              <strong>${summary.teachingHours.toFixed(1)} hrs/week</strong>
              <small class="row-note">${summary.teachingAssignments.length} class loads, ${summary.preparations} preparations, ${summary.studentCount} students</small>
            </td>
            <td>
              <strong>${summary.duties.length}</strong>
              <small class="row-note">${summary.ancillaryScore.toFixed(1)} equivalent hours</small>
            </td>
            <td>
              ${workloadStatusBadge(summary.workloadStatus)}
              <small class="row-note">${summary.workloadScore.toFixed(1)} total score</small>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderTeacherWorkloadDetail(teacherId) {
  const host = document.querySelector("#teacherWorkloadDetailHost");
  const summary = teacherWorkloadSummariesCache.find((item) => item.teacherId === teacherId);
  if (!host || !summary) return;
  host.innerHTML = `
    <div class="section-header">
      <div>
        <p class="eyebrow">Teacher profile workload</p>
        <h2>${escapeHtml(summary.teacherName)}</h2>
      </div>
      ${workloadStatusBadge(summary.workloadStatus)}
    </div>
    <div class="attendance-kpi-grid workload-profile-kpis">
      <article class="attendance-kpi-card"><span>Total Score</span><strong>${summary.workloadScore.toFixed(1)}</strong><small>${escapeHtml(summary.workloadCategory)} category</small></article>
      <article class="attendance-kpi-card"><span>Teaching Load</span><strong>${summary.teachingLoadScore.toFixed(1)}</strong><small>${summary.teachingHours.toFixed(1)} class hrs + ${summary.advisoryScore.toFixed(1)} adviser hrs</small></article>
      <article class="attendance-kpi-card"><span>Ancillary Load</span><strong>${summary.ancillaryScore.toFixed(1)}</strong><small>${summary.duties.length} duties</small></article>
      <article class="attendance-kpi-card"><span>Students Handled</span><strong>${summary.studentCount}</strong><small>${summary.sections.length} sections/classes</small></article>
    </div>
    <div class="workload-detail-grid">
      <article>
        <h3>Classes</h3>
        ${summary.teachingAssignments.length ? `
          <table class="compact-table">
            <thead><tr><th>Class</th><th>Hours</th><th>Prep</th><th></th></tr></thead>
            <tbody>${summary.teachingAssignments.map((record) => `
              <tr>
                <td>${escapeHtml(subjectGradeSectionClassLabel(record, "No section"))}<small class="row-note">${escapeHtml(record.subjectArea || "")}</small></td>
                <td>${Number(record.weeklyHours || 0).toFixed(1)}</td>
                <td>${Number(record.preparations || 0)}</td>
                <td class="row-actions">
                  ${canManageTeacherWorkload() ? `
                    <button class="secondary-button edit-teaching-load" type="button" data-id="${escapeHtml(record.id)}">Edit</button>
                    <button class="secondary-button remove-teaching-load" type="button" data-id="${escapeHtml(record.id)}">Remove</button>
                  ` : ""}
                </td>
              </tr>
            `).join("")}</tbody>
          </table>
        ` : `<p class="empty-state">No teaching load records yet.</p>`}
      </article>
      <article>
        <h3>Ancillary Assignments</h3>
        ${summary.duties.length ? `
          <table class="compact-table">
            <thead><tr><th>Duty</th><th>Hours</th><th>Assigned By</th><th></th></tr></thead>
            <tbody>${summary.duties.map((record) => `
              <tr>
                <td>${escapeHtml(record.dutyName || "")}<small class="row-note">${escapeHtml(record.description || "")}</small></td>
                <td>${Number(record.equivalentHours || 0).toFixed(1)}</td>
                <td>${escapeHtml(record.assignedByName || "")}</td>
                <td class="row-actions">
                  ${canManageTeacherWorkload() ? `
                    <button class="secondary-button edit-ancillary-duty" type="button" data-id="${escapeHtml(record.id)}">Edit</button>
                    <button class="secondary-button remove-ancillary-duty" type="button" data-id="${escapeHtml(record.id)}">Remove</button>
                  ` : ""}
                </td>
              </tr>
            `).join("")}</tbody>
          </table>
        ` : `<p class="empty-state">No ancillary assignments yet.</p>`}
      </article>
      <article>
        <h3>Advisory Classes</h3>
        ${summary.advisoryClasses.length ? `
          <table class="compact-table">
            <thead><tr><th>Section</th><th>School Year</th><th>Hours</th><th></th></tr></thead>
            <tbody>${summary.advisoryClasses.map((section) => `
              <tr>
                <td>${escapeHtml(classLabel(section))}</td>
                <td>${escapeHtml(section.schoolYear || "")}</td>
                <td>${WORKLOAD_RULES.advisoryClassHours.toFixed(1)}</td>
                <td class="row-actions">${canManageClasses() ? `<button class="secondary-button edit-advisory-class" type="button" data-id="${escapeHtml(section.id)}">Edit Adviser</button>` : ""}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        ` : `<p class="empty-state">No advisory class assigned.</p>`}
      </article>
      <article>
        <h3>Weekly Schedule Summary</h3>
        <p>${escapeHtml(summary.teacherName)} currently has ${summary.teachingHours.toFixed(1)} weekly teaching hours, ${summary.preparations} preparations, ${summary.advisoryClasses.length} advisory class${summary.advisoryClasses.length === 1 ? "" : "es"} worth ${summary.advisoryScore.toFixed(1)} hours, and ${summary.duties.length} ancillary assignment${summary.duties.length === 1 ? "" : "s"}.</p>
      </article>
      <article>
        <h3>Balancing Suggestions</h3>
        <ul class="suggestion-list">${summary.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
    </div>
  `;
}

function openTeachingLoadForm(record = null) {
  const sectionOptions = classRecordsCache
    .filter((section) => section.status !== "archived")
    .map((section) => `<option value="${escapeHtml(section.id)}" ${section.id === record?.sectionId ? "selected" : ""}>${escapeHtml(classLabel(section))}</option>`)
    .join("");
  const subjectOptions = getSubjectOptionsForWorkload(record?.gradeLevel || "", record?.sectionId || "", record?.subjectId || "");
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="teachingLoadForm" class="modal" data-id="${escapeHtml(record?.id || "")}">
        <div class="modal-header">
          <div><p class="eyebrow">Teacher Workload</p><h2>${record ? "Edit Teaching Load" : "Add Teaching Load"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Teacher<select id="workloadTeacherId" required>${teacherOptions(record?.teacherId || "", "Select teacher")}</select></label>
          <label>Section<select id="workloadSectionId"><option value="">No section</option>${sectionOptions}</select></label>
          <label>Grade Level<select id="workloadGradeLevel" required>${optionList(gradeLevels, record?.gradeLevel || "", "Select grade")}</select></label>
          <label>Subject<select id="workloadSubjectId" required>${subjectOptions}</select></label>
          <label>Weekly Hours<input id="workloadWeeklyHours" type="number" min="0" step="0.5" value="${escapeHtml(record?.weeklyHours ?? "")}" placeholder="4" /></label>
          <label>Preparations<input id="workloadPreparations" type="number" min="0" step="1" value="${escapeHtml(record?.preparations ?? 1)}" /></label>
          <label class="form-field-wide">Description<textarea id="workloadDescription" rows="3">${escapeHtml(record?.description || "")}</textarea></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Changes" : "Save Teaching Load"}</button>
        </div>
      </form>
    </div>
  `);
}

function getSubjectOptionsForWorkload(gradeLevel = "", sectionId = "", selectedSubjectId = "") {
  const activeSubjects = schoolSubjectRecordsCache.filter((record) => (record.status || "active") === "active");
  const filtered = activeSubjects.filter((record) =>
    (!gradeLevel || record.gradeLevel === gradeLevel)
    && (!record.sectionId || !sectionId || record.sectionId === sectionId)
  );
  const options = filtered
    .sort((a, b) => subjectLabel(a).localeCompare(subjectLabel(b)))
    .map((record) => `<option value="${escapeHtml(record.id)}" ${record.id === selectedSubjectId ? "selected" : ""}>${escapeHtml(subjectLabel(record))}</option>`)
    .join("");
  return `<option value="">${gradeLevel ? "Select subject" : "Select grade level first"}</option>${options}`;
}

function syncTeachingLoadSubjectOptions() {
  const section = getSelectedClass(document.querySelector("#workloadSectionId")?.value || "");
  const gradeField = document.querySelector("#workloadGradeLevel");
  if (section && gradeField) gradeField.value = section.gradeLevel || "";
  const gradeLevel = gradeField?.value || "";
  const subjectField = document.querySelector("#workloadSubjectId");
  if (subjectField) subjectField.innerHTML = getSubjectOptionsForWorkload(gradeLevel, section?.id || "");
}

function openAncillaryDutyForm(record = null) {
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="ancillaryDutyForm" class="modal" data-id="${escapeHtml(record?.id || "")}">
        <div class="modal-header">
          <div><p class="eyebrow">Teacher Workload</p><h2>${record ? "Edit Ancillary Duty" : "Add Ancillary Duty"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Teacher<select id="ancillaryTeacherId" required>${teacherOptions(record?.teacherId || "", "Select teacher")}</select></label>
          <label>Duty<select id="ancillaryDutyName" required>${optionList(ancillaryDutyOptions, record?.dutyName || "", "Select duty")}</select></label>
          <label>Equivalent Hours / Points<input id="ancillaryEquivalentHours" type="number" min="0" step="0.5" value="${escapeHtml(record?.equivalentHours ?? 2)}" required /></label>
          <label class="form-field-wide">Description<textarea id="ancillaryDescription" rows="3">${escapeHtml(record?.description || "")}</textarea></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Changes" : "Save Duty"}</button>
        </div>
      </form>
    </div>
  `);
}

async function handleTeachingLoadFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const form = event.target;
  const recordId = form.dataset.id || "";
  const teacher = academicTeachersCache.find((item) => item.id === document.querySelector("#workloadTeacherId").value);
  const section = getSelectedClass(document.querySelector("#workloadSectionId").value);
  const subject = schoolSubjectRecordsCache.find((item) => item.id === document.querySelector("#workloadSubjectId").value);
  if (!teacher || !subject) return;
  const weeklyHoursInput = document.querySelector("#workloadWeeklyHours").value;
  const weeklyHours = weeklyHoursInput === "" ? Number(subject.weeklyHours || getDefaultSubjectHours(subject.subjectName, subject.subjectArea)) : Number(weeklyHoursInput);
  const data = {
    teacherId: teacher.id,
    teacherName: teacherDisplayName(teacher),
    department: teacher.department || "",
    subjectId: subject.id,
    subjectName: subject.subjectName || "",
    subjectArea: subject.subjectArea || "",
    sectionId: section?.id || "",
    sectionName: section ? classLabel(section) : "",
    schoolYear: section?.schoolYear || "",
    gradeLevel: section?.gradeLevel || document.querySelector("#workloadGradeLevel").value || subject.gradeLevel || "",
    weeklyHours,
    preparations: Number(document.querySelector("#workloadPreparations").value || 0),
    description: document.querySelector("#workloadDescription").value.trim(),
    assignedByUid: auth.currentUser.uid,
    assignedByName: currentUserProfile.fullName || auth.currentUser.email,
  };
  try {
    if (recordId) {
      const before = teacherWorkloadRecordsCache.find((record) => record.id === recordId);
      await updateDoc(doc(db, "teacherWorkloads", recordId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Teacher Workload", recordId, before, data);
    } else {
      const created = await addDoc(collection(db, "teacherWorkloads"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await createAuditLog("create", "Teacher Workload", created.id, null, data);
    }
    document.querySelector("#academicModal")?.remove();
    await renderTeacherWorkloadModule();
    await refreshTeacherWorkloadCounters(currentUserProfile.role);
    showDashboardMessage(recordId ? "Teaching load updated." : "Teaching load saved.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function handleAncillaryDutyFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const form = event.target;
  const recordId = form.dataset.id || "";
  const teacher = academicTeachersCache.find((item) => item.id === document.querySelector("#ancillaryTeacherId").value);
  if (!teacher) return;
  const data = {
    teacherId: teacher.id,
    teacherName: teacherDisplayName(teacher),
    department: teacher.department || "",
    dutyName: document.querySelector("#ancillaryDutyName").value,
    equivalentHours: Number(document.querySelector("#ancillaryEquivalentHours").value || 0),
    description: document.querySelector("#ancillaryDescription").value.trim(),
    assignedByUid: auth.currentUser.uid,
    assignedByName: currentUserProfile.fullName || auth.currentUser.email,
  };
  try {
    if (recordId) {
      const before = ancillaryAssignmentRecordsCache.find((record) => record.id === recordId);
      await updateDoc(doc(db, "ancillaryAssignments", recordId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Teacher Workload", recordId, before, data);
    } else {
      const created = await addDoc(collection(db, "ancillaryAssignments"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await createAuditLog("create", "Teacher Workload", created.id, null, data);
    }
    document.querySelector("#academicModal")?.remove();
    await renderTeacherWorkloadModule();
    await refreshTeacherWorkloadCounters(currentUserProfile.role);
    showDashboardMessage(recordId ? "Ancillary duty updated." : "Ancillary duty saved.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function removeTeacherWorkloadRecord(collectionName, recordId) {
  if (!canManageTeacherWorkload()) return;
  await deleteDoc(doc(db, collectionName, recordId));
  await createAuditLog("delete", "Teacher Workload", recordId, null, { collectionName });
  await renderTeacherWorkloadModule();
  await refreshTeacherWorkloadCounters(currentUserProfile.role);
  showDashboardMessage("Workload record removed.");
}

async function renderGradeSubmissionModule() {
  const canEncode = hasAnyRole(currentUserProfile, ["Teacher", "Master Teacher", "Head Teacher"]);
  const canMonitor = hasAnyRole(currentUserProfile, ["Principal", "Master Teacher", "Head Teacher"]);
  els.dashboardTitle.textContent = "Grade Submission";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Academic records</p>
        <h2>Grade Submission</h2>
        <p>Encode learner grades by assigned subject, grade level, section, school year, and term.</p>
      </div>
    </section>
    ${canEncode ? `
      <section class="table-card grade-encoding-section">
        <div class="section-header">
          <div><p class="eyebrow">Encode Grades</p><h2>My Assigned Classes</h2></div>
        </div>
        <div id="gradeEncodingCardsHost" class="grade-submission-card-grid"><p class="empty-state">Loading assigned classes...</p></div>
      </section>
    ` : ""}
    <section id="gradeTrackerAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading grade analytics...</p>
    </section>
    <section class="table-card ${canMonitor ? "" : "hidden"}">
      <div class="section-header"><div><p class="eyebrow">Monitor Submissions</p><h2>Expected Class Grade Submissions</h2></div></div>
      <div class="filter-grid">
        <label>Search<input id="gradeTrackerSearch" type="search" placeholder="Section, subject, teacher, remarks" /></label>
        <label>School Year<select id="gradeSchoolYearFilter"></select></label>
        <label>Term / Quarter<select id="gradeTermFilter">${optionList(activeGradeTerms(), "", "All visible terms")}</select></label>
        <label>Grade Level<select id="gradeLevelFilter"></select></label>
        <label>Section<select id="gradeSectionFilter"></select></label>
        <label>Subject<select id="gradeSubjectFilter"></select></label>
        <label>Subject Teacher<select id="gradeTeacherFilter"></select></label>
        <label>Status<select id="gradeStatusFilter">${optionList(gradeSubmissionStatusOptions, "", "All statuses")}</select></label>
      </div>
      <div id="gradeTrackerTableHost" class="table-wrap"><p class="empty-state">Loading grade submissions...</p></div>
    </section>
  `;
  try {
    await loadTeacherWorkloadTeachers();
    await getTaskVisibilitySettings();
    classRecordsCache = await getVisibleClasses();
    [teacherWorkloadRecordsCache, schoolSubjectRecordsCache] = await Promise.all([
      getVisibleTeacherWorkloadRecords(),
      getVisibleSchoolSubjects(),
    ]);
    classRecordsCache = mergeClassesWithWorkloadSections(classRecordsCache, teacherWorkloadRecordsCache);
    studentRecordsCache = await getAssessmentVisibleStudents(classRecordsCache);
    gradeSubmissionRecordsCache = await getVisibleGradeSubmissions();
    populateGradeTrackerFilters();
    applyGradeTrackerFilters();
    renderGradeEncodingCards();
  } catch (error) {
    document.querySelector("#gradeTrackerTableHost").innerHTML = `<p class="empty-state">Unable to load grade tracker: ${escapeHtml(error.message)}</p>`;
    const cardHost = document.querySelector("#gradeEncodingCardsHost");
    if (cardHost) cardHost.innerHTML = `<p class="empty-state">Unable to load assigned classes: ${escapeHtml(error.message)}</p>`;
  }
}

function populateGradeTrackerFilters() {
  const rows = buildGradeSubmissionRows();
  document.querySelector("#gradeSchoolYearFilter").innerHTML = optionList([...new Set(rows.map((row) => row.schoolYear).filter(Boolean))].sort(), "", "All years");
  document.querySelector("#gradeTermFilter").innerHTML = optionList(activeGradeTerms(), "", "All visible terms");
  document.querySelector("#gradeLevelFilter").innerHTML = optionList([...new Set(rows.map((row) => row.gradeLevel).filter(Boolean))].sort(), "", "All grades");
  document.querySelector("#gradeSectionFilter").innerHTML = optionList([...new Set(rows.map((row) => row.sectionName).filter(Boolean))].sort(), "", "All sections");
  document.querySelector("#gradeSubjectFilter").innerHTML = optionList([...new Set(rows.map((row) => row.subjectName).filter(Boolean))].sort(), "", "All subjects");
  document.querySelector("#gradeTeacherFilter").innerHTML = optionList([...new Set(rows.map((row) => row.teacherName).filter(Boolean))].sort(), "", "All teachers");
  document.querySelector("#gradeStatusFilter").innerHTML = optionList(gradeSubmissionStatusOptions, "", "All statuses");
}

function renderGradeEncodingCards() {
  const host = document.querySelector("#gradeEncodingCardsHost");
  if (!host) return;
  const rows = buildGradeSubmissionRows(
    gradeSubmissionRecordsCache,
    getGradeSubmissionEditableWorkloads()
  ).filter((row) => row.teacherUid === auth.currentUser.uid || row.teacherId === auth.currentUser.uid);
  if (!rows.length) {
    host.innerHTML = `<p class="empty-state">No assigned teaching loads with sections are available for grade encoding.</p>`;
    return;
  }
  host.innerHTML = rows.map((row) => `
    <article class="grade-submission-card">
      <div>
        <span class="badge status-${statusClass(row.submissionStatus)}">${escapeHtml(row.submissionStatus)}</span>
        <h3>${escapeHtml(row.subjectName || "Unspecified Subject")}</h3>
        <p>${escapeHtml(row.gradeLevel || "No grade level")} - ${escapeHtml(row.sectionName || "No section")}</p>
      </div>
      <dl>
        <div><dt>School Year</dt><dd>${escapeHtml(row.schoolYear || "Not recorded")}</dd></div>
        <div><dt>Term / Quarter</dt><dd>${escapeHtml(row.term || "Not recorded")}</dd></div>
        <div><dt>Encoded</dt><dd>${Number(row.encodedStudents || 0)} / ${Number(row.totalStudents || 0)}</dd></div>
      </dl>
      <button class="primary-button edit-grade-submission" type="button" data-row-key="${escapeAttribute(row.key)}" ${canEditGradeSubmissionRow(row) ? "" : "disabled"}>
        ${row.submissionStatus === "Not Started" ? "Encode Grades" : row.submissionStatus === "Draft" || row.submissionStatus === "Returned" ? "Continue Encoding" : row.submissionStatus}
      </button>
    </article>
  `).join("");
}

function applyGradeTrackerFilters() {
  const host = document.querySelector("#gradeTrackerTableHost");
  if (!host) return;
  const search = (document.querySelector("#gradeTrackerSearch")?.value || "").trim().toLowerCase();
  const schoolYear = document.querySelector("#gradeSchoolYearFilter")?.value || "";
  const term = document.querySelector("#gradeTermFilter")?.value || "";
  const gradeLevel = document.querySelector("#gradeLevelFilter")?.value || "";
  const sectionName = document.querySelector("#gradeSectionFilter")?.value || "";
  const subjectName = document.querySelector("#gradeSubjectFilter")?.value || "";
  const teacherName = document.querySelector("#gradeTeacherFilter")?.value || "";
  const status = document.querySelector("#gradeStatusFilter")?.value || "";

  filteredGradeSubmissionRows = buildGradeSubmissionRows().filter((row) => {
    const haystack = [
      row.schoolYear,
      row.term,
      row.gradeLevel,
      row.sectionName,
      row.subjectName,
      subjectGradeSectionClassLabel(row, "No section"),
      row.teacherName,
      row.submissionStatus,
      row.remarks,
    ].filter(Boolean).join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!schoolYear || row.schoolYear === schoolYear)
      && (!term || row.term === term)
      && (!gradeLevel || row.gradeLevel === gradeLevel)
      && (!sectionName || row.sectionName === sectionName)
      && (!subjectName || row.subjectName === subjectName)
      && (!teacherName || row.teacherName === teacherName)
      && (!status || row.submissionStatus === status);
  });
  filteredGradeSubmissionGroups = buildGradeSubmissionDisplayGroups(filteredGradeSubmissionRows);

  renderGradeTrackerAnalytics();
  renderGradeTrackerTables(host);
}

function renderGradeTrackerAnalytics() {
  const host = document.querySelector("#gradeTrackerAnalytics");
  if (!host) return;
  const rows = filteredGradeSubmissionRows;
  const totalExpected = rows.length;
  const submitted = rows.filter((row) => row.submissionStatus === "Submitted").length;
  const notStarted = rows.filter((row) => row.submissionStatus === "Not Started").length;
  const draft = rows.filter((row) => row.submissionStatus === "Draft").length;
  const returned = rows.filter((row) => row.submissionStatus === "Returned").length;
  const approved = rows.filter((row) => row.submissionStatus === "Approved").length;
  const complied = rows.filter((row) => isGradeSubmissionComplied(row.submissionStatus)).length;
  const compliancePercentage = totalExpected ? (complied / totalExpected) * 100 : 0;
  const statusRows = gradeSubmissionStatusOptions.map((item) => [item, rows.filter((row) => row.submissionStatus === item).length]);
  const sectionRows = gradeSubmissionComplianceRows(rows, (row) => row.sectionName);
  const subjectRows = gradeSubmissionComplianceRows(rows, (row) => row.subjectName);
  const teacherRows = gradeSubmissionComplianceRows(rows, (row) => row.teacherName);
  const termRows = gradeSubmissionComplianceRows(rows, (row) => row.term)
    .sort((a, b) => {
      const order = new Map(termOptions.map((term, index) => [term, index]));
      return (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99) || String(a[0]).localeCompare(String(b[0]));
    });
  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total Expected Grade Submissions", String(totalExpected), "Subject-section-teacher records"],
      ["Submitted", String(submitted), "Marked Submitted"],
      ["Not Started", String(notStarted), "No encoded draft yet"],
      ["Draft", String(draft), "Saved but not submitted"],
      ["Returned", String(returned), "Needs teacher revision"],
      ["Approved", String(approved), "Approved grade submissions"],
      ["Compliance Percentage", `${compliancePercentage.toFixed(1)}%`, `${complied} of ${totalExpected} complied`],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderAnalyticsPieChart("Submission Status Distribution", statusRows)}
      ${renderRateRows("Compliance by Section", sectionRows)}
      ${renderRateRows("Compliance by Subject", subjectRows)}
      ${renderRateRows("Compliance by Teacher", teacherRows)}
      ${renderVerticalBarChart("Quarterly / Term Submission Trend", termRows)}
    </div>
  `;
}

function renderGradeTrackerTables(host) {
  if (!filteredGradeSubmissionGroups.length) {
    host.innerHTML = `<p class="empty-state">No grade submission records match the current filters.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table grade-submission-table">
      <thead>
        <tr>
          <th>School Year</th>
          <th>Term / Quarter</th>
          <th>Class</th>
          <th>Subject Teacher</th>
          <th>Encoded Students</th>
          <th>Date Submitted</th>
          <th>Status</th>
          <th>Remarks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${filteredGradeSubmissionGroups.map((group, index) => renderGradeSubmissionGroupRows(group, index)).join("")}</tbody>
    </table>
  `;
}

function gradeSubmissionComplianceRows(rows, getter) {
  const buckets = new Map();
  rows.forEach((row) => {
    const label = String(getter(row) || "Not recorded").trim() || "Not recorded";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(row);
  });
  return [...buckets.entries()]
    .map(([label, groupRows]) => {
      const complied = groupRows.filter((row) => isGradeSubmissionComplied(row.submissionStatus)).length;
      const rate = groupRows.length ? (complied / groupRows.length) * 100 : 0;
      return [label, Number(rate.toFixed(1)), `${complied}/${groupRows.length} complied`];
    })
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10);
}

function buildGradeSubmissionDisplayGroups(rows = []) {
  const batchCounts = rows.reduce((totals, row) => {
    if (row.batchId) totals.set(row.batchId, (totals.get(row.batchId) || 0) + 1);
    return totals;
  }, new Map());
  const groups = new Map();
  rows.forEach((row) => {
    const groupId = row.batchId && batchCounts.get(row.batchId) > 1 ? `batch:${row.batchId}` : `row:${row.key}`;
    if (!groups.has(groupId)) {
      groups.set(groupId, { id: groupId, rows: [], isBatch: groupId.startsWith("batch:") });
    }
    groups.get(groupId).rows.push(row);
  });
  return [...groups.values()];
}

function renderGradeSubmissionGroupRows(group, index) {
  if (!group.isBatch) return renderGradeSubmissionRecordRow(group.rows[0]);
  const rows = group.rows;
  const first = rows[0] || {};
  const complied = rows.filter((row) => isGradeSubmissionComplied(row.submissionStatus)).length;
  const rate = rows.length ? (complied / rows.length) * 100 : 0;
  const targetId = `gradeSubmissionGroupDetails${index}`;
  return `
    <tr class="assessment-group-row grade-submission-group-row" data-target="${targetId}" tabindex="0">
      <td>${escapeHtml(first.schoolYear || "Mixed")}</td>
      <td><strong>${escapeHtml(first.term || "Multiple")}</strong></td>
      <td><strong>Bulk grade submission</strong><small class="row-note">${rows.length} class-teacher records</small></td>
      <td>${escapeHtml(first.teacherName || "Multiple teachers")}</td>
      <td>${rows.reduce((sum, row) => sum + Number(row.encodedStudents || 0), 0)} / ${rows.reduce((sum, row) => sum + Number(row.totalStudents || 0), 0)}</td>
      <td>${escapeHtml(first.dateSubmitted || "Not submitted")}</td>
      <td><strong>${rate.toFixed(1)}%</strong><small class="row-note">${complied}/${rows.length} complied</small></td>
      <td>${escapeHtml(first.remarks || "")}</td>
      <td><button class="secondary-button" type="button">Expand</button></td>
    </tr>
    <tr id="${targetId}" class="assessment-group-details hidden">
      <td colspan="9">
        <div class="table-wrap">
          <table class="compact-table">
            <thead><tr><th>Class</th><th>Subject Teacher</th><th>Encoded</th><th>Status</th><th>Date Submitted</th><th>Remarks</th><th></th></tr></thead>
            <tbody>${rows.map((row) => `
              <tr>
                <td>${escapeHtml(subjectGradeSectionClassLabel(row, "No section"))}</td>
                <td>${escapeHtml(row.teacherName || "Unspecified Teacher")}</td>
                <td>${Number(row.encodedStudents || 0)} / ${Number(row.totalStudents || 0)}</td>
                <td>${gradeSubmissionStatusBadge(row.submissionStatus)}</td>
                <td>${escapeHtml(row.dateSubmitted || "Not submitted")}</td>
                <td>${escapeHtml(row.remarks || "")}</td>
                <td class="row-actions">${gradeSubmissionActionButton(row)}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
      </td>
    </tr>
  `;
}

function renderGradeSubmissionRecordRow(row) {
  return `
    <tr>
      <td>${escapeHtml(row.schoolYear || "Not recorded")}</td>
      <td>${escapeHtml(row.term || "Not recorded")}</td>
      <td><strong>${escapeHtml(subjectGradeSectionClassLabel(row, "No section"))}</strong>${row.isLegacy ? `<small class="row-note">Legacy grade entries</small>` : ""}</td>
      <td>${escapeHtml(row.teacherName || "Unspecified Teacher")}</td>
      <td>${Number(row.encodedStudents || 0)} / ${Number(row.totalStudents || 0)}</td>
      <td>${escapeHtml(row.dateSubmitted || "Not submitted")}</td>
      <td>${gradeSubmissionStatusBadge(row.submissionStatus)}</td>
      <td>${escapeHtml(row.remarks || "")}</td>
      <td class="row-actions">${gradeSubmissionActionButton(row)}</td>
    </tr>
  `;
}

function gradeSubmissionStatusBadge(status = "Not Started") {
  return `<span class="badge status-${statusClass(status)}">${escapeHtml(status)}</span>`;
}

function gradeSubmissionActionButton(row) {
  if (!canEditGradeSubmissionRow(row)) return "";
  const label = row.submissionStatus === "Not Started" ? "Encode Grades" : "Continue";
  return `<button class="secondary-button edit-grade-submission" type="button" data-row-key="${escapeAttribute(row.key)}">${label}</button>`;
}

function canEditGradeSubmissionRow(row = {}) {
  return hasAnyRole(currentUserProfile, ["Teacher", "Master Teacher", "Head Teacher"])
    && (row.teacherUid || row.teacherId) === auth.currentUser.uid
    && ["Not Started", "Draft", "Returned"].includes(row.submissionStatus || "Not Started");
}

function isGradeSubmissionOverdue(row = {}) {
  return Boolean(row.dueDate && row.dueDate < todayIso() && !isGradeSubmissionComplied(row.submissionStatus));
}

function getGradeSubmissionEditableWorkloads() {
  if (!hasAnyRole(currentUserProfile, ["Teacher", "Master Teacher", "Head Teacher"])) return [];
  return teacherWorkloadRecordsCache
    .filter((workload) => workload.sectionId && workload.teacherId === auth.currentUser.uid)
    .sort((a, b) => assessmentWorkloadLabel(a).localeCompare(assessmentWorkloadLabel(b)));
}

function findGradeSubmissionRowByKey(key = "") {
  return buildGradeSubmissionRows().find((row) => row.key === key) || filteredGradeSubmissionRows.find((row) => row.key === key) || null;
}

function openGradeSubmissionForm(source = null) {
  const row = source?.key ? source : null;
  const workload = source?.sectionId && source?.subjectName && !source.key ? source : teacherWorkloadRecordsCache.find((item) => item.id === row?.workloadId);
  const initial = initialGradeSubmissionFormData(row, workload);
  const students = gradeSubmissionStudentsForSection(initial.sectionId);
  const existingGrades = initial.grades || {};
  editingGradeSubmissionId = row?.recordId || "";
  editingGradeSubmissionRowKey = row?.key || "";
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="gradeSubmissionForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Grade Encoding</p><h2>${initial.subjectName || "Encode Grades"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="grade-encoding-summary">
          <div><span>Subject</span><strong>${escapeHtml(initial.subjectName || "Unspecified Subject")}</strong></div>
          <div><span>Grade / Section</span><strong>${escapeHtml(initial.gradeLevel || "No grade")} - ${escapeHtml(initial.sectionName || "No section")}</strong></div>
          <div><span>School Year</span><strong>${escapeHtml(initial.schoolYear || "Not recorded")}</strong></div>
          <div><span>Term / Quarter</span><strong>${escapeHtml(initial.term || "Not recorded")}</strong></div>
          <div><span>Teacher</span><strong>${escapeHtml(initial.teacherName || "Unspecified Teacher")}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(initial.submissionStatus || "Not Started")}</strong></div>
        </div>
        <input type="hidden" id="gradeSubmissionWorkloadId" value="${escapeAttribute(initial.workloadId)}" />
        <input type="hidden" id="gradeSubmissionTerm" value="${escapeAttribute(initial.term)}" />
        <label class="modal-field">Submission Remarks<textarea id="gradeSubmissionRemarks" rows="3">${escapeHtml(initial.remarks)}</textarea></label>
        <div class="table-wrap">
          <table class="academic-table grade-entry-table grade-encoding-table">
            <thead><tr><th>No.</th><th>Student Name</th><th>Grade</th></tr></thead>
            <tbody>
              ${students.length ? students.map((student, index) => {
                const gradeEntry = existingGrades[student.id] || existingGrades[student.lrn] || {};
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${escapeHtml(studentFullName(student) || student.learnerName || "Unnamed student")}</strong></td>
                    <td><input class="grade-entry-input grade-submission-grade-input" data-student-id="${escapeAttribute(student.id)}" type="number" min="0" max="100" step="1" inputmode="numeric" autocomplete="off" value="${escapeAttribute(gradeEntry.grade ?? "")}" /></td>
                  </tr>
                `;
              }).join("") : `<tr><td colspan="3"><p class="empty-state">No active students are enrolled in this section yet.</p></td></tr>`}
            </tbody>
          </table>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel / Back</button>
          <button class="secondary-button" type="submit" name="gradeSubmissionAction" value="draft">Save Draft</button>
          <button class="primary-button" type="submit" name="gradeSubmissionAction" value="submit">Submit Grades</button>
        </div>
      </form>
    </div>
  `);
}

function initialGradeSubmissionFormData(row = null, workload = null) {
  const section = getSelectedClass(row?.sectionId || workload?.sectionId || "");
  const selectedWorkload = workload || teacherWorkloadRecordsCache.find((item) => item.id === row?.workloadId);
  const teacherUid = row?.teacherUid || selectedWorkload?.teacherId || auth.currentUser?.uid || "";
  const teacher = academicTeachersCache.find((item) => item.id === teacherUid);
  return {
    workloadId: selectedWorkload?.id || row?.workloadId || "",
    schoolYear: row?.schoolYear || section?.schoolYear || selectedWorkload?.schoolYear || "",
    term: row?.term || activeGradeTerms()[0] || "",
    gradeLevel: row?.gradeLevel || selectedWorkload?.gradeLevel || section?.gradeLevel || "",
    sectionId: row?.sectionId || selectedWorkload?.sectionId || "",
    sectionName: row?.sectionName || selectedWorkload?.sectionName || (section ? classLabel(section) : ""),
    subjectName: row?.subjectName || selectedWorkload?.subjectName || "",
    subjectId: row?.subjectId || selectedWorkload?.subjectId || "",
    subjectArea: row?.subjectArea || selectedWorkload?.subjectArea || "",
    subjectCategory: row?.subjectCategory || selectedWorkload?.subjectArea || "",
    teacherUid,
    teacherName: row?.teacherName || selectedWorkload?.teacherName || teacher?.fullName || currentUserProfile?.fullName || auth.currentUser?.email || "",
    submissionStatus: row?.submissionStatus || "Not Started",
    dateSubmitted: row?.dateSubmitted || "",
    remarks: row?.remarks || "",
    grades: row?.grades || {},
  };
}

function gradeSubmissionStudentsForSection(sectionId = "") {
  return sortStudentsSf1Order(studentRecordsCache.filter((student) => student.sectionId === sectionId && isEnrolledStudentStatus(student.status)));
}

function syncGradeSubmissionFormFields() {
  return null;
}

async function handleGradeSubmissionFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const action = event.submitter?.value || "draft";
  const workloadId = document.querySelector("#gradeSubmissionWorkloadId")?.value || "";
  const workload = teacherWorkloadRecordsCache.find((item) => item.id === workloadId);
  const row = findGradeSubmissionRowByKey(editingGradeSubmissionRowKey) || buildGradeSubmissionRows().find((item) => item.workloadId === workloadId && item.term === document.querySelector("#gradeSubmissionTerm")?.value);
  const initial = initialGradeSubmissionFormData(row, workload);
  const section = getSelectedClass(initial.sectionId);
  const students = gradeSubmissionStudentsForSection(initial.sectionId);
  const term = document.querySelector("#gradeSubmissionTerm")?.value || "";
  const submissionStatus = action === "submit" ? "Submitted" : "Draft";
  if (!workload || !section || !term || workload.teacherId !== auth.currentUser.uid) {
    message.textContent = "You can only encode grades for your own assigned teaching loads.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (row?.submissionStatus === "Approved") {
    message.textContent = "Approved grade submissions can no longer be edited.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const grades = {};
  const invalidRows = [];
  students.forEach((student) => {
    const gradeInput = document.querySelector(`.grade-submission-grade-input[data-student-id="${CSS.escape(student.id)}"]`);
    const rawGrade = String(gradeInput?.value || "").trim();
    const numericGrade = rawGrade === "" ? "" : Number(rawGrade);
    if (rawGrade !== "" && numericGrade !== 0 && (!Number.isFinite(numericGrade) || numericGrade < 60 || numericGrade > 100)) {
      invalidRows.push(studentFullName(student) || student.lrn || student.id);
    }
    grades[student.id] = {
      studentId: student.id,
      lrn: student.lrn || "",
      studentName: studentFullName(student) || student.learnerName || "",
      grade: numericGrade,
      remarks: "",
    };
  });
  if (action === "submit" && !students.length) {
    invalidRows.push("No active students in this section");
  }
  if (invalidRows.length) {
    message.textContent = action === "submit"
      ? `Submit requires grades to be blank, 0, or from 60 to 100. Check: ${invalidRows.slice(0, 4).join(", ")}${invalidRows.length > 4 ? "..." : ""}`
      : `Grades must be blank, 0, or from 60 to 100. Check: ${invalidRows.slice(0, 4).join(", ")}${invalidRows.length > 4 ? "..." : ""}`;
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const recordId = editingGradeSubmissionId || gradeSubmissionDocId(workload.id, term);
  const recordRef = doc(db, "gradeSubmissions", recordId);
  let existing = editingGradeSubmissionId ? gradeSubmissionRecordsCache.find((record) => record.id === editingGradeSubmissionId) : null;
  const submissionSchoolYear = section.schoolYear || workload.schoolYear || initial.schoolYear || students.find((student) => student.schoolYear)?.schoolYear || "";
  if (!submissionSchoolYear) {
    message.textContent = "Save failed: School year is missing for this section. Ask an administrator to update the class or teaching load school year.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const data = {
    workloadId: workload.id,
    teacherId: workload.teacherId,
    teacherUid: workload.teacherId,
    teacherName: workload.teacherName || currentUserProfile.fullName || auth.currentUser.email,
    schoolYear: submissionSchoolYear,
    term,
    quarter: term,
    gradeLevel: workload.gradeLevel || section.gradeLevel || "",
    sectionId: section.id,
    sectionName: classLabel(section),
    subjectId: workload.subjectId || "",
    subjectName: workload.subjectName || initial.subjectName || "Unspecified Subject",
    subjectArea: workload.subjectArea || initial.subjectArea || "",
    subjectCategory: workload.subjectArea || initial.subjectCategory || "",
    submissionStatus,
    dateSubmitted: action === "submit" ? todayIso() : existing?.dateSubmitted || "",
    remarks: document.querySelector("#gradeSubmissionRemarks")?.value.trim() || "",
    grades,
    createdBy: existing?.createdBy || auth.currentUser.uid,
    createdByName: existing?.createdByName || currentUserProfile.fullName || auth.currentUser.email,
  };
  try {
    if (existing) {
      await setDoc(recordRef, { ...data, createdAt: existing.createdAt || serverTimestamp(), updatedAt: serverTimestamp() }, { merge: false });
      await createAuditLog("update", "Grade Submission", recordId, existing, data);
    } else {
      await setDoc(recordRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await createAuditLog("create", "Grade Submission", recordId, null, data);
    }
    document.querySelector("#academicModal")?.remove();
    await renderGradeSubmissionModule();
    await refreshGradeSubmissionCounters(currentUserProfile.role);
    showDashboardMessage(action === "submit" ? "Grades submitted." : "Grade draft saved.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function renderLessonPlanModule() {
  els.dashboardTitle.textContent = "Lesson Plans";
  const canSubmit = hasAnyRole(currentUserProfile, ["Teacher", "Master Teacher", "Head Teacher"]);
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">DLL monitoring</p>
        <h2>Lesson Plans</h2>
      </div>
      <div class="toolbar-actions">
        ${canSubmit ? `<button id="newLessonPlanButton" class="primary-button" type="button">Submit Lesson Plan</button>` : ""}
      </div>
    </section>
    <section id="lessonPlanAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading lesson plan analytics...</p>
    </section>
    <section class="table-card">
      <div class="section-header">
        <div><p class="eyebrow">${canReviewLessonPlan() ? "Reviewer monitoring" : "My pending DLLs"}</p><h2>Missing Lesson Plans</h2></div>
      </div>
      <div id="missingLessonPlansHost" class="table-wrap"><p class="empty-state">Loading missing lesson plans...</p></div>
    </section>
    ${canReviewLessonPlan() ? `
      <section class="table-card">
        <div class="section-header">
          <div><p class="eyebrow">Reviewer monitoring</p><h2>Submitted, Not Yet Checked</h2></div>
        </div>
        <div id="uncheckedLessonPlansHost" class="table-wrap"><p class="empty-state">Loading unchecked submissions...</p></div>
      </section>
    ` : ""}
    <section class="table-card">
      <div class="filter-grid">
        <label>Search<input id="lessonPlanSearch" type="search" placeholder="Teacher, subject, section" /></label>
        <label>Status<select id="lessonPlanStatusFilter"></select></label>
        <label>Submission<select id="lessonPlanTypeFilter"></select></label>
      </div>
      <div id="lessonPlanTableHost" class="table-wrap"><p class="empty-state">Loading lesson plans...</p></div>
    </section>
  `;
  try {
    await loadTeacherWorkloadTeachers();
    await getTaskVisibilitySettings();
    classRecordsCache = await getVisibleClasses();
    teacherWorkloadRecordsCache = await getVisibleTeacherWorkloadRecords();
    lessonPlanRecordsCache = await getVisibleLessonPlans();
    populateLessonPlanFilters();
    applyLessonPlanFilters();
  } catch (error) {
    document.querySelector("#lessonPlanTableHost").innerHTML = `<p class="empty-state">Unable to load lesson plans: ${escapeHtml(error.message)}</p>`;
  }
}

function populateLessonPlanFilters() {
  document.querySelector("#lessonPlanStatusFilter").innerHTML = optionList(["Submitted", "Noted", "Confirmed", "Returned for Revision"], "", "All statuses");
  document.querySelector("#lessonPlanTypeFilter").innerHTML = optionList(submissionTypes, "", "All submission types");
}

function applyLessonPlanFilters() {
  const host = document.querySelector("#lessonPlanTableHost");
  if (!host) return;
  const search = (document.querySelector("#lessonPlanSearch")?.value || "").trim().toLowerCase();
  const status = document.querySelector("#lessonPlanStatusFilter")?.value || "";
  const type = document.querySelector("#lessonPlanTypeFilter")?.value || "";
  filteredLessonPlans = lessonPlanRecordsCache.filter((record) => {
    const haystack = [
      record.teacherName,
      record.subjectName,
      record.sectionName,
      record.gradeLevel,
      subjectGradeSectionClassLabel(record),
      record.term,
      record.weekNumber ? `Week ${record.weekNumber}` : "",
      record.weekStart,
      record.status,
      record.submissionType,
      record.reviewTag,
      record.teacherRemarks,
      record.reviewerRemarks,
    ].filter(Boolean).join(" ").toLowerCase();
    return activeLessonPlanWeeks().includes(lessonPlanScopeKey(record))
      && (!search || haystack.includes(search))
      && (!status || record.status === status)
      && (!type || record.submissionType === type);
  });
  renderLessonPlanTable(host);
  renderLessonPlanAnalytics();
  renderPrincipalLessonPlanMonitoring();
}

function getVisibleLessonPlanRecordsForMonitoring() {
  return lessonPlanRecordsCache.filter((record) => activeLessonPlanWeeks().includes(lessonPlanScopeKey(record)));
}

function buildMissingLessonPlanRows() {
  const submittedKeys = new Set(getVisibleLessonPlanRecordsForMonitoring()
    .map((record) => `${record.workloadId}:${lessonPlanScopeKey(record)}`));
  return teacherWorkloadRecordsCache
    .filter((workload) =>
      workload.sectionId
      && (canReviewLessonPlan() || workload.teacherId === auth.currentUser.uid)
    )
    .flatMap((workload) => activeLessonPlanWeeks().map((scopeKey) => {
      if (submittedKeys.has(`${workload.id}:${scopeKey}`)) return null;
      const scope = lessonPlanWeekOptions.find((item) => item.key === scopeKey);
      return {
        workload,
        scopeKey,
        term: scope?.term || scopeKey.split(":")[0] || "",
        weekNumber: scope?.weekNumber || "",
      };
    }))
    .filter(Boolean)
    .sort((a, b) =>
      (a.workload.teacherName || "").localeCompare(b.workload.teacherName || "")
      || (a.term || "").localeCompare(b.term || "")
      || Number(a.weekNumber || 0) - Number(b.weekNumber || 0)
    );
}

function renderPrincipalLessonPlanMonitoring() {
  const missingHost = document.querySelector("#missingLessonPlansHost");
  const uncheckedHost = document.querySelector("#uncheckedLessonPlansHost");
  if (!missingHost && !uncheckedHost) return;

  const search = (document.querySelector("#lessonPlanSearch")?.value || "").trim().toLowerCase();
  const type = document.querySelector("#lessonPlanTypeFilter")?.value || "";
  const missingRows = buildMissingLessonPlanRows().filter(({ workload, term, weekNumber }) => {
    const haystack = [
      workload.teacherName,
      workload.subjectName,
      workload.sectionName,
      workload.gradeLevel,
      subjectGradeSectionClassLabel(workload),
      term,
      weekNumber ? `Week ${weekNumber}` : "",
    ].filter(Boolean).join(" ").toLowerCase();
    return !search || haystack.includes(search);
  });

  const uncheckedRows = getVisibleLessonPlanRecordsForMonitoring()
    .filter((record) => record.status === "Submitted")
    .filter((record) => !type || record.submissionType === type)
    .filter((record) => {
      const haystack = [
        record.teacherName,
        record.subjectName,
        record.sectionName,
        record.gradeLevel,
        subjectGradeSectionClassLabel(record),
        record.term,
        record.weekNumber ? `Week ${record.weekNumber}` : "",
        record.submissionType,
        record.teacherRemarks,
      ].filter(Boolean).join(" ").toLowerCase();
      return !search || haystack.includes(search);
    })
    .sort((a, b) => (a.teacherName || "").localeCompare(b.teacherName || "") || (a.term || "").localeCompare(b.term || "") || Number(a.weekNumber || 0) - Number(b.weekNumber || 0));

  if (missingHost) {
    missingHost.innerHTML = missingRows.length ? `
    <table class="compliance-table">
      <thead><tr><th>Teacher</th><th>Class</th><th>Missing Week</th><th>Status</th></tr></thead>
      <tbody>
        ${missingRows.map(({ workload, term, weekNumber }) => `
          <tr>
            <td>
              ${escapeHtml(workload.teacherName || "Teacher")}
              <small class="row-note">${escapeHtml(workload.department || workload.subjectArea || "")}</small>
            </td>
            <td><strong>${escapeHtml(subjectGradeSectionClassLabel(workload))}</strong></td>
            <td>${escapeHtml(term)} - Week ${escapeHtml(weekNumber)}</td>
            <td><span class="badge status-not-submitted">Not Submitted</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : `<p class="empty-state">All visible class weeks have lesson plan submissions.</p>`;
  }

  if (uncheckedHost) {
    uncheckedHost.innerHTML = uncheckedRows.length ? `
    <table class="compliance-table">
      <thead><tr><th>Teacher</th><th>Class</th><th>Week</th><th>Submission</th><th>Action</th></tr></thead>
      <tbody>
        ${uncheckedRows.map((record) => `
          <tr>
            <td>${escapeHtml(record.teacherName || "Teacher")}<small class="row-note">${escapeHtml(record.teacherRole || "")}</small></td>
            <td><strong>${escapeHtml(subjectGradeSectionClassLabel(record))}</strong></td>
            <td>${escapeHtml(record.term || "")} - Week ${escapeHtml(record.weekNumber || "")}<small class="row-note">${escapeHtml(record.weekStart || "")}</small></td>
            <td>${escapeHtml(record.submissionType || "Submitted")}<small class="row-note">${record.fileLink ? `<a href="${escapeHtml(record.fileLink)}" target="_blank" rel="noopener">Open DLL</a>` : "Hard copy / no link"}</small></td>
            <td><button class="secondary-button review-lesson-plan" type="button" data-id="${escapeHtml(record.id)}">Review</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : `<p class="empty-state">No submitted lesson plans are waiting for checking.</p>`;
  }
}

function renderLessonPlanAnalytics() {
  const host = document.querySelector("#lessonPlanAnalytics");
  if (!host) return;
  const visibleWeeks = activeLessonPlanWeeks();
  const visibleRecords = lessonPlanRecordsCache.filter((record) => visibleWeeks.includes(lessonPlanScopeKey(record)));
  const workloads = teacherWorkloadRecordsCache.filter((workload) => workload.sectionId);
  const expected = workloads.length * visibleWeeks.length;
  const submitted = new Set(visibleRecords.map((record) => `${record.workloadId}:${lessonPlanScopeKey(record)}`)).size;
  const reviewed = visibleRecords.filter((record) => ["Noted", "Confirmed"].includes(record.status)).length;
  const unchecked = visibleRecords.filter((record) => record.status === "Submitted").length;
  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Submitted DLLs", String(submitted), `${expected} expected class-week submissions`],
      ["Pending DLLs", String(Math.max(expected - submitted, 0)), "Based on Principal visibility"],
      ["Unchecked", String(unchecked), "Submitted but not yet checked"],
      ["Reviewed", String(reviewed), "Noted or confirmed submissions"],
      ["Visible Weeks", String(visibleWeeks.length), "Configured in School Setup"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("DLL Status", ["Submitted", "Noted", "Confirmed", "Returned for Revision"].map((status) => [status, visibleRecords.filter((record) => record.status === status).length]))}
    </div>
  `;
}

function renderLessonPlanTable(host) {
  if (!filteredLessonPlans.length) {
    host.innerHTML = `<p class="empty-state">No lesson plan submissions match the current view.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="compliance-table">
      <thead>
        <tr>
          <th>Teacher</th>
          <th>Class</th>
          <th>Week</th>
          <th>Submission</th>
          <th>Status</th>
          <th>Review</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredLessonPlans.map(renderLessonPlanRow).join("")}
      </tbody>
    </table>
  `;
}

function renderLessonPlanRow(record) {
  const fileLink = record.fileLink
    ? `<a href="${escapeHtml(record.fileLink)}" target="_blank" rel="noopener">Open DLL</a>`
    : `<span class="row-note">Hard copy / no link</span>`;
  const canEdit = record.teacherId === auth.currentUser.uid;
  const canReview = canReviewLessonPlan();
  return `
    <tr>
      <td>
        ${escapeHtml(record.teacherName || "Teacher")}
        <small class="row-note">${escapeHtml(record.teacherRole || "")}</small>
      </td>
      <td><strong>${escapeHtml(subjectGradeSectionClassLabel(record))}</strong></td>
      <td>
        ${escapeHtml(record.term || "Term not set")} ${record.weekNumber ? `- Week ${escapeHtml(record.weekNumber)}` : ""}
        <small class="row-note">${escapeHtml(record.weekStart || "No date")}</small>
      </td>
      <td>
        ${escapeHtml(record.submissionType || "No submission")}
        <small class="row-note">${fileLink}</small>
        <small class="row-note">${escapeHtml(record.teacherRemarks || "No teacher remarks")}</small>
      </td>
      <td><span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "Submitted")}</span></td>
      <td>
        ${record.reviewTag ? `<span class="badge status-${statusClass(record.reviewTag)}">${escapeHtml(record.reviewTag)}</span>` : `<span class="row-note">No tag</span>`}
        ${escapeHtml(record.reviewerRemarks || "No remarks")}
        <small class="row-note">${record.reviewedByName ? `By ${escapeHtml(record.reviewedByName)}` : "Not reviewed yet"}</small>
      </td>
      <td>
        <div class="row-actions">
          ${canEdit ? `<button class="secondary-button edit-lesson-plan" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canReview ? `<button class="secondary-button review-lesson-plan" type="button" data-id="${escapeHtml(record.id)}">Review</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function openLessonPlanForm(record = null) {
  const encodableWorkloads = teacherWorkloadRecordsCache.filter(canSubmitLessonPlanForWorkload);
  const selectedWorkload = encodableWorkloads.find((workload) => workload.id === record?.workloadId) || encodableWorkloads[0];
  const workloadOptions = encodableWorkloads
    .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedWorkload?.id ? "selected" : ""}>${escapeHtml(gradeWorkloadLabel(item))}</option>`)
    .join("");
  const hasWorkloads = encodableWorkloads.length > 0;
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="lessonPlanForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">DLL / Lesson Plan</p><h2>${record ? "Update Lesson Plan" : "Submit Lesson Plan"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Class<select id="lessonPlanWorkloadId" required>${workloadOptions}</select></label>
          <label>Term<select id="lessonPlanTerm" required>${optionList([...new Set(lessonPlanWeekOptions.filter((item) => activeLessonPlanWeeks().includes(item.key)).map((item) => item.term))], record?.term || "", "Select term")}</select></label>
          <label>Week<select id="lessonPlanWeekNumber" required></select></label>
          <label>Week Start<input id="lessonPlanWeekStart" type="date" required value="${escapeHtml(record?.weekStart || todayIso())}" /></label>
          <label>Submission Type<select id="lessonPlanSubmissionType" required>${optionList(submissionTypes, record?.submissionType || "", "Select type")}</select></label>
          <label id="lessonPlanFileField">DLL Link<input id="lessonPlanFileLink" type="url" placeholder="https://..." value="${escapeHtml(record?.fileLink || "")}" /></label>
        </div>
        ${hasWorkloads ? "" : `<p class="empty-state">No assigned classes are available for lesson plan submission.</p>`}
        <label class="modal-field">Teacher Remarks<textarea id="lessonPlanTeacherRemarks" rows="4">${escapeHtml(record?.teacherRemarks || "")}</textarea></label>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit" ${hasWorkloads ? "" : "disabled"}>${record ? "Save Changes" : "Submit Lesson Plan"}</button>
        </div>
      </form>
    </div>
  `);
  const syncFileLink = () => {
    const type = document.querySelector("#lessonPlanSubmissionType").value;
    const fileField = document.querySelector("#lessonPlanFileField");
    fileField.classList.toggle("hidden", type !== "Soft Copy");
    document.querySelector("#lessonPlanFileLink").required = type === "Soft Copy";
  };
  document.querySelector("#lessonPlanSubmissionType").addEventListener("input", syncFileLink);
  const syncWeekOptions = () => {
    const selectedTerm = document.querySelector("#lessonPlanTerm").value;
    const selectedWeek = Number(record?.weekNumber || 0);
    const options = lessonPlanWeekOptions
      .filter((item) => activeLessonPlanWeeks().includes(item.key) && item.term === selectedTerm)
      .map((item) => `<option value="${item.weekNumber}" ${item.weekNumber === selectedWeek ? "selected" : ""}>Week ${item.weekNumber}</option>`)
      .join("");
    document.querySelector("#lessonPlanWeekNumber").innerHTML = options || `<option value="">No visible weeks</option>`;
  };
  document.querySelector("#lessonPlanTerm").addEventListener("input", syncWeekOptions);
  syncFileLink();
  syncWeekOptions();
}

async function handleLessonPlanFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const workload = teacherWorkloadRecordsCache.find((item) => item.id === document.querySelector("#lessonPlanWorkloadId").value);
  const weekStart = document.querySelector("#lessonPlanWeekStart").value;
  const term = document.querySelector("#lessonPlanTerm").value;
  const weekNumber = Number(document.querySelector("#lessonPlanWeekNumber").value || 0);
  const submissionType = document.querySelector("#lessonPlanSubmissionType").value;
  const fileLink = document.querySelector("#lessonPlanFileLink").value.trim();
  if (!workload || !canSubmitLessonPlanForWorkload(workload)) {
    message.textContent = "Select one of your assigned classes.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (!activeLessonPlanWeeks().includes(`${term}:Week ${weekNumber}`)) {
    message.textContent = "Select a visible term and week for this lesson plan.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (submissionType === "Soft Copy" && !fileLink) {
    message.textContent = "Soft Copy submissions require a DLL link.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (fileLink && !isValidUrl(fileLink)) {
    message.textContent = "Enter a valid http or https DLL link.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const section = getSelectedClass(workload.sectionId);
  const existing = findLessonPlanRecord(workload.id, term, weekNumber);
  const data = {
    workloadId: workload.id,
    teacherId: workload.teacherId,
    teacherName: workload.teacherName || currentUserProfile.fullName || auth.currentUser.email,
    teacherRole: currentUserProfile.role,
    subjectName: workload.subjectName || "",
    subjectArea: workload.subjectArea || "",
    sectionId: workload.sectionId || "",
    sectionName: workload.sectionName || "",
    gradeLevel: workload.gradeLevel || section?.gradeLevel || "",
    schoolYear: section?.schoolYear || "",
    term,
    weekNumber,
    weekStart,
    submissionType,
    fileLink: submissionType === "Soft Copy" ? fileLink : "",
    teacherRemarks: document.querySelector("#lessonPlanTeacherRemarks").value.trim(),
    status: "Submitted",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  try {
    let lessonPlanId = existing?.id || "";
    if (existing) {
      await updateDoc(doc(db, "lessonPlans", existing.id), { ...data, createdAt: existing.createdAt });
      await createAuditLog("update", "Lesson Plans", existing.id, existing, data);
    } else {
      const created = await addDoc(collection(db, "lessonPlans"), { ...data, createdAt: serverTimestamp() });
      lessonPlanId = created.id;
      await createAuditLog("create", "Lesson Plans", created.id, null, data);
    }
    await createRoleNotifications(["Principal", "Master Teacher", "Head Teacher"].filter((role) => role !== currentUserProfile.role), {
      notificationType: "lesson_plan_submitted",
      title: "Lesson plan submitted",
      message: `${data.teacherName} submitted ${subjectGradeSectionClassLabel(data)}.`,
      relatedModule: "Lesson Plans",
      relatedRecordId: lessonPlanId,
      actionUrl: "#Lesson Plans",
    });
    document.querySelector("#academicModal")?.remove();
    await renderLessonPlanModule();
    showDashboardMessage("Lesson plan submitted.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

function openLessonPlanReviewForm(record) {
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="lessonPlanReviewForm" class="modal" data-id="${escapeHtml(record.id)}">
        <div class="modal-header">
          <div><p class="eyebrow">Review DLL</p><h2>${escapeHtml(record.teacherName || "Teacher")}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <p class="review-summary">
          ${escapeHtml(subjectGradeSectionClassLabel(record))}<br />
          <span>${escapeHtml(record.submissionType || "Submission")} ${record.fileLink ? "- link provided" : "- hard copy / no link"}</span>
        </p>
        <label>Status<select id="lessonPlanReviewStatus" required>${optionList(["Noted", "Confirmed", "Returned for Revision"], record.status || "", "Select status")}</select></label>
        <label>Tag<select id="lessonPlanReviewTag">${optionList(["For checking", "Complied", "Needs revision", "For follow-up"], record.reviewTag || "", "No tag")}</select></label>
        <label>Reviewer Remarks<textarea id="lessonPlanReviewerRemarks" rows="4">${escapeHtml(record.reviewerRemarks || "")}</textarea></label>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit">Save Review</button>
        </div>
      </form>
    </div>
  `);
}

async function handleLessonPlanReviewSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const record = lessonPlanRecordsCache.find((item) => item.id === event.target.dataset.id);
  if (!record || !canReviewLessonPlan()) return;
  try {
    await updateDoc(doc(db, "lessonPlans", record.id), {
      status: document.querySelector("#lessonPlanReviewStatus").value,
      reviewTag: document.querySelector("#lessonPlanReviewTag").value,
      reviewerRemarks: document.querySelector("#lessonPlanReviewerRemarks").value.trim(),
      reviewedByUid: auth.currentUser.uid,
      reviewedByName: currentUserProfile.fullName || auth.currentUser.email,
      reviewedByRole: currentUserProfile.role,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createAuditLog("update", "Lesson Plans", record.id, record, { status: document.querySelector("#lessonPlanReviewStatus").value });
    await createNotification({
      recipientUid: record.teacherId,
      recipientName: record.teacherName,
      recipientRole: record.teacherRole || "Teacher",
      notificationType: "lesson_plan_reviewed",
      title: "Lesson plan reviewed",
      message: `${subjectGradeSectionClassLabel(record)} was ${document.querySelector("#lessonPlanReviewStatus").value}.`,
      relatedModule: "Lesson Plans",
      relatedRecordId: record.id,
      actionUrl: "#Lesson Plans",
    });
    document.querySelector("#academicModal")?.remove();
    await renderLessonPlanModule();
    showDashboardMessage("Lesson plan review saved.");
  } catch (error) {
    message.textContent = `Review failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function renderAssessmentModule() {
  els.dashboardTitle.textContent = "Diagnostic Test & Exam";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div><p class="eyebrow">Assessment monitoring</p><h2>Diagnostic Test and Exam</h2></div>
      <div id="assessmentToolbarActions" class="toolbar-actions"></div>
    </section>
    <section class="attendance-analytics" id="assessmentComparisonCards">
      <p class="empty-state">Loading assessment comparison...</p>
    </section>
    <section class="table-card">
      <div class="section-header"><h2>Assessment Records</h2></div>
      <div class="filter-grid">
        <label>Search<input id="assessmentSearch" type="search" placeholder="Section, subject, teacher, title" /></label>
        <label>School Year<select id="assessmentSchoolYearFilter"></select></label>
        <label>Term<select id="assessmentTermFilter"></select></label>
        <label>Grade Level<select id="assessmentGradeFilter"></select></label>
        <label>Section<select id="assessmentSectionFilter"></select></label>
        <label>Subject<select id="assessmentSubjectFilter"></select></label>
        <label>Subject Teacher<select id="assessmentTeacherFilter"></select></label>
        <label>Assessment Type<select id="assessmentTypeFilter"></select></label>
        <label>MPS Range<select id="assessmentMpsFilter"><option value="">All MPS ranges</option><option value="low">Below 75%</option><option value="mid">75% to 84%</option><option value="high">85% and above</option></select></label>
      </div>
      <div id="assessmentTableHost" class="table-wrap"><p class="empty-state">Loading assessments...</p></div>
    </section>
  `;
  try {
    await getTaskVisibilitySettings();
    await loadTeacherWorkloadTeachers();
    [teacherWorkloadRecordsCache, schoolSubjectRecordsCache] = await Promise.all([
      getVisibleTeacherWorkloadRecords(),
      getVisibleSchoolSubjects(),
    ]);
    classRecordsCache = await getAssessmentVisibleClasses();
    studentRecordsCache = await getAssessmentVisibleStudents(classRecordsCache);
    assessmentRecordsCache = await getVisibleAssessments();
    const assessmentActions = document.querySelector("#assessmentToolbarActions");
    if (assessmentActions) {
      const hasOwnClasses = getAssessmentEditableWorkloads().length > 0;
      assessmentActions.innerHTML = canEncodeAssessmentScores() && hasOwnClasses
        ? `<button id="newAssessmentButton" class="primary-button" type="button">Encode Scores</button>`
        : "";
    }
    document.querySelector("#assessmentSchoolYearFilter").innerHTML = optionList(uniqueOptions(assessmentRecordsCache, "schoolYear"), "", "All years");
    document.querySelector("#assessmentTermFilter").innerHTML = optionList([...new Set(assessmentScopeOptions.filter((item) => activeAssessmentScopes().includes(item.key)).map((item) => item.term))], "", "All visible terms");
    document.querySelector("#assessmentGradeFilter").innerHTML = optionList(uniqueOptions([...assessmentRecordsCache, ...classRecordsCache], "gradeLevel"), "", "All grade levels");
    document.querySelector("#assessmentSectionFilter").innerHTML = activeClassOptions("", "All sections");
    document.querySelector("#assessmentSubjectFilter").innerHTML = optionList([...new Set(assessmentRecordsCache.map(assessmentSubjectName))].sort(), "", "All subjects");
    document.querySelector("#assessmentTeacherFilter").innerHTML = optionList([...new Set(assessmentRecordsCache.map(assessmentTeacherName))].sort(), "", "All teachers");
    document.querySelector("#assessmentTypeFilter").innerHTML = optionList(assessmentTypeOptions(), "", "All assessment types");
    applyAssessmentFilters();
  } catch (error) {
    document.querySelector("#assessmentTableHost").innerHTML = `<p class="empty-state">Unable to load assessments: ${escapeHtml(error.message)}</p>`;
  }
}

function applyAssessmentFilters() {
  const host = document.querySelector("#assessmentTableHost");
  if (!host) return;
  const search = (document.querySelector("#assessmentSearch")?.value || "").trim().toLowerCase();
  const schoolYear = document.querySelector("#assessmentSchoolYearFilter")?.value || "";
  const term = document.querySelector("#assessmentTermFilter")?.value || "";
  const gradeLevel = document.querySelector("#assessmentGradeFilter")?.value || "";
  const sectionId = document.querySelector("#assessmentSectionFilter")?.value || "";
  const subjectName = document.querySelector("#assessmentSubjectFilter")?.value || "";
  const teacherName = document.querySelector("#assessmentTeacherFilter")?.value || "";
  const assessmentType = document.querySelector("#assessmentTypeFilter")?.value || "";
  const mpsRange = document.querySelector("#assessmentMpsFilter")?.value || "";
  filteredAssessmentRecords = assessmentRecordsCache.filter((record) =>
    (assessmentScopeMatches(record, "pre") || assessmentScopeMatches(record, "post"))
    && (!schoolYear || record.schoolYear === schoolYear)
    && (!term || record.term === term)
    && (!gradeLevel || record.gradeLevel === gradeLevel)
    && (!sectionId || record.sectionId === sectionId)
    && (!subjectName || assessmentSubjectName(record) === subjectName)
    && (!teacherName || assessmentTeacherName(record) === teacherName)
    && (!assessmentType || assessmentDisplayType(record) === assessmentType)
    && (!search || [
      record.sectionName,
      record.gradeLevel,
      assessmentSubjectName(record),
      subjectGradeSectionClassLabel(record, "No section"),
      assessmentTeacherName(record),
      assessmentDisplayType(record),
      record.assessmentTitle,
      record.studentName,
    ].filter(Boolean).join(" ").toLowerCase().includes(search))
  );
  filteredAssessmentGroups = buildAssessmentGroups(filteredAssessmentRecords)
    .filter((group) =>
      !mpsRange
      || (mpsRange === "low" && group.mps < 75)
      || (mpsRange === "mid" && group.mps >= 75 && group.mps < 85)
      || (mpsRange === "high" && group.mps >= 85)
    );
  filteredAssessmentRecords = filteredAssessmentGroups.flatMap((group) => group.records);
  const comparisonRows = buildAssessmentComparisonRows(filteredAssessmentGroups);
  renderAssessmentComparisonCards(filteredAssessmentRecords, filteredAssessmentGroups);
  if (!filteredAssessmentGroups.length) {
    host.innerHTML = `<p class="empty-state">No assessment records match the current filters.</p>`;
    return;
  }
  const terms = assessmentComparisonTerms(filteredAssessmentGroups);
  const termHeaders = terms.map((item) => `
    <th>${escapeHtml(item)} Diagnostic MPS</th>
    <th>${escapeHtml(item)} Term Exam MPS</th>
    <th>${escapeHtml(item)} Comparison</th>
  `).join("");
  host.innerHTML = `
    <table class="academic-table assessment-record-table">
      <thead><tr><th>Class</th><th>Subject Teacher</th>${termHeaders}<th>Learners</th></tr></thead>
      <tbody>${comparisonRows.map((row, index) => `
        <tr class="assessment-group-row" data-target="assessmentGroupDetails${index}" tabindex="0">
          <td><strong>${escapeHtml(assessmentGroupClassLabel(row))}</strong><small class="row-note">${escapeHtml(row.schoolYear || "No school year")}</small></td>
          <td>${escapeHtml(row.teacherName)}</td>
          ${terms.map((termName) => {
            const termData = row.terms.get(termName) || {};
            return `
              <td>${renderAssessmentMpsCell(termData.diagnostic)}</td>
              <td>${renderAssessmentMpsCell(termData.exam)}</td>
              <td>${renderAssessmentComparisonCell(termData)}</td>
            `;
          }).join("")}
          <td>${row.numberOfLearners}</td>
        </tr>
        <tr id="assessmentGroupDetails${index}" class="assessment-group-details hidden">
          <td colspan="${terms.length * 3 + 3}">
            <div class="assessment-student-score-panel">
              <div class="section-header">
                <h3>${escapeHtml(assessmentGroupClassLabel(row))}</h3>
              </div>
              <div class="table-wrap">
                <table class="batch-table">
                  <thead><tr><th>Term</th><th>Assessment</th><th>MPS</th><th>Mean Score</th><th>Highest</th><th>Lowest</th><th>Learners</th><th></th></tr></thead>
                  <tbody>${renderAssessmentComparisonDetails(row, terms)}</tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>`).join("")}</tbody>
    </table>
  `;
}

function assessmentTypeOptions() {
  return ["Diagnostic Test", "Term Exam"];
}

function assessmentTypeFromScoreType(scoreType = "") {
  return scoreType === "post" ? "Term Exam" : "Diagnostic Test";
}

function assessmentScoreTypeFromType(assessmentType = "") {
  return assessmentType === "Term Exam" || assessmentType === "Quarterly Exam" || assessmentType === "Post Test" || assessmentType === "Long Test" ? "post" : "pre";
}

function assessmentSubjectName(record = {}) {
  return record.subjectName || "Unspecified Subject";
}

function assessmentTeacherName(record = {}) {
  return record.teacherName || record.adviserName || record.encodedByName || record.createdByName || "Unspecified Teacher";
}

function assessmentDisplayType(record = {}) {
  if (record.assessmentType === "Diagnostic Test") return "Diagnostic Test";
  if (record.assessmentType) return "Term Exam";
  if (getAssessmentHighScore(record, "post") > 0) return "Term Exam";
  return "Diagnostic Test";
}

function assessmentProficiencyLevel(mps) {
  if (mps >= 90) return "Outstanding";
  if (mps >= 85) return "Very Satisfactory";
  if (mps >= 80) return "Satisfactory";
  if (mps >= 75) return "Fairly Satisfactory";
  return "Needs Intervention";
}

function assessmentGroupKey(record = {}) {
  if (record.assessmentBatchId) return `batch:${record.assessmentBatchId}`;
  return [
    record.schoolYear || "",
    record.term || "",
    record.gradeLevel || "",
    record.sectionId || record.sectionName || "",
    record.subjectId || assessmentSubjectName(record),
    record.teacherUid || assessmentTeacherName(record),
    assessmentDisplayType(record),
    record.assessmentTitle || "",
    record.dateAdministered || "",
  ].join("|");
}

function buildAssessmentGroups(records = []) {
  const buckets = new Map();
  records.forEach((record) => {
    const key = assessmentGroupKey(record);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(record);
  });
  return [...buckets.entries()].map(([id, groupRecords]) => {
    const first = groupRecords[0] || {};
    const scoreType = assessmentDisplayType(first) === "Diagnostic Test" ? "pre" : "post";
    const scores = groupRecords
      .map((record) => scoreType === "pre" ? Number(record.preTestScore || 0) : Number(record.postTestScore || 0))
      .filter((value) => Number.isFinite(value));
    const totalItems = scoreType === "pre" ? getAssessmentHighScore(first, "pre") : getAssessmentHighScore(first, "post");
    const meanScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const mps = totalItems ? (meanScore / totalItems) * 100 : Number(first.mps || 0);
    return {
      id,
      records: groupRecords,
      schoolYear: first.schoolYear || "",
      term: first.term || "",
      gradeLevel: first.gradeLevel || "",
      sectionName: first.sectionName || "",
      subjectName: assessmentSubjectName(first),
      subjectCategory: first.subjectCategory || first.subjectArea || "",
      teacherName: assessmentTeacherName(first),
      assessmentType: assessmentDisplayType(first),
      assessmentTitle: first.assessmentTitle || "",
      dateAdministered: first.dateAdministered || "",
      totalItems,
      numberOfLearners: groupRecords.length,
      highestScore: scores.length ? Math.max(...scores) : 0,
      lowestScore: scores.length ? Math.min(...scores) : 0,
      meanScore,
      mps,
      proficiencyLevel: first.proficiencyLevel || assessmentProficiencyLevel(mps),
      isLegacy: !first.subjectName || !first.teacherUid,
    };
  }).sort((a, b) => (b.dateAdministered || "").localeCompare(a.dateAdministered || "") || a.subjectName.localeCompare(b.subjectName));
}

function assessmentComparisonTerms(groups = []) {
  const order = new Map(termOptions.map((term, index) => [term, index]));
  return [...new Set(groups.map((group) => group.term || "Not recorded"))]
    .sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99) || String(a).localeCompare(String(b)));
}

function assessmentComparisonBaseKey(group = {}) {
  return [
    group.schoolYear || "",
    group.gradeLevel || "",
    group.sectionName || "",
    group.subjectName || "",
    group.teacherName || "",
  ].join("|");
}

function buildAssessmentComparisonRows(groups = []) {
  const rows = new Map();
  groups.forEach((group) => {
    const key = assessmentComparisonBaseKey(group);
    if (!rows.has(key)) {
      rows.set(key, {
        schoolYear: group.schoolYear || "",
        gradeLevel: group.gradeLevel || "",
        sectionName: group.sectionName || "",
        subjectName: group.subjectName || "",
        teacherName: group.teacherName || "",
        numberOfLearners: 0,
        terms: new Map(),
      });
    }
    const row = rows.get(key);
    row.numberOfLearners = Math.max(row.numberOfLearners, Number(group.numberOfLearners || 0));
    const term = group.term || "Not recorded";
    if (!row.terms.has(term)) row.terms.set(term, {});
    const termData = row.terms.get(term);
    if (group.assessmentType === "Diagnostic Test") {
      termData.diagnostic = group;
    } else {
      termData.exam = group;
    }
  });
  return [...rows.values()].sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
    || a.gradeLevel.localeCompare(b.gradeLevel)
    || a.sectionName.localeCompare(b.sectionName)
  );
}

function renderAssessmentMpsCell(group) {
  if (!group) return `<span class="muted-mark">-</span>`;
  return `<strong>${Number(group.mps || 0).toFixed(1)}%</strong><small class="row-note">${escapeHtml(group.proficiencyLevel || assessmentProficiencyLevel(group.mps || 0))}</small>`;
}

function formatAssessmentMpsDifference(termData = {}) {
  if (!termData.diagnostic || !termData.exam) return "Incomplete";
  const difference = Number(termData.exam.mps || 0) - Number(termData.diagnostic.mps || 0);
  return `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} pp`;
}

function renderAssessmentComparisonCell(termData = {}) {
  if (!termData.diagnostic || !termData.exam) return `<span class="muted-mark">Incomplete</span>`;
  const difference = Number(termData.exam.mps || 0) - Number(termData.diagnostic.mps || 0);
  const className = difference >= 0 ? "positive" : "negative";
  return `<strong class="${className}">${formatAssessmentMpsDifference(termData)}</strong><small class="row-note">Exam vs diagnostic</small>`;
}

function renderAssessmentComparisonDetails(row, terms = []) {
  const detailRows = [];
  terms.forEach((term) => {
    const termData = row.terms.get(term) || {};
    [
      ["Diagnostic Test", termData.diagnostic],
      ["Term Exam", termData.exam],
    ].forEach(([label, group]) => {
      if (!group) return;
      detailRows.push(`
        <tr>
          <td>${escapeHtml(term)}</td>
          <td>${escapeHtml(label)}</td>
          <td><strong>${Number(group.mps || 0).toFixed(1)}%</strong></td>
          <td>${Number(group.meanScore || 0).toFixed(2)} / ${Number(group.totalItems || 0).toFixed(2)}</td>
          <td>${Number(group.highestScore || 0).toFixed(2)}</td>
          <td>${Number(group.lowestScore || 0).toFixed(2)}</td>
          <td>${Number(group.numberOfLearners || 0)}</td>
          <td class="row-actions">${canEditAssessmentRecord(group.records[0]) ? `<button class="secondary-button edit-assessment" type="button" data-id="${escapeHtml(group.records[0].id)}">Edit Scores</button>` : ""}</td>
        </tr>
      `);
    });
  });
  return detailRows.join("") || `<tr><td colspan="8"><p class="empty-state">No detailed scores available.</p></td></tr>`;
}

function assessmentGroupClassLabel(group = {}) {
  return subjectGradeSectionClassLabel(group);
}

function assessmentPerformanceRows(groups = [], getter) {
  const buckets = new Map();
  groups
    .filter((group) => group.assessmentType === "Term Exam" || !groups.some((item) => item.assessmentType === "Term Exam" && assessmentComparisonBaseKey(item) === assessmentComparisonBaseKey(group) && item.term === group.term))
    .forEach((group) => {
      const label = String(getter(group) || "Not recorded").trim() || "Not recorded";
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label).push(Number(group.mps || 0));
    });
  return [...buckets.entries()]
    .map(([label, values]) => [label, Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderAssessmentComparisonCards(records = [], groups = buildAssessmentGroups(records)) {
  const host = document.querySelector("#assessmentComparisonCards");
  if (!host) return;
  const stats = computeAssessmentStats(records, [], studentRecordsCache, classRecordsCache);
  const comparedCount = buildAssessmentComparisonRows(groups).reduce((sum, row) =>
    sum + [...row.terms.values()].filter((termData) => termData.diagnostic && termData.exam).length, 0);
  const subjectRows = assessmentPerformanceRows(groups, (group) => group.subjectName).slice(0, 8);
  const sectionRows = assessmentPerformanceRows(groups, (group) => group.sectionName).slice(0, 8);
  const gradeRows = assessmentPerformanceRows(groups, (group) => group.gradeLevel).slice(0, 8);
  const teacherRows = assessmentPerformanceRows(groups, (group) => group.teacherName).slice(0, 8);
  const termRows = assessmentPerformanceRows(groups, (group) => group.term)
    .sort((a, b) => {
      const termOrder = new Map(termOptions.map((term, index) => [term, index]));
      return (termOrder.get(a[0]) ?? 99) - (termOrder.get(b[0]) ?? 99) || String(a[0]).localeCompare(String(b[0]));
    });
  const subjectLowRows = [...subjectRows].sort((a, b) => a[1] - b[1]).slice(0, 8);
  const gradeLowRows = [...gradeRows].sort((a, b) => a[1] - b[1]).slice(0, 8);
  const highest = subjectRows[0] || ["None", 0];
  const lowest = subjectLowRows[0] || ["None", 0];
  const bestGrade = gradeRows[0] || ["None", 0];
  const lowGrade = gradeLowRows[0] || ["None", 0];
  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["School-wide Average MPS", `${stats.postMps.toFixed(1)}%`, "Term exam MPS"],
      ["Best Performing Subject", highest[0], `${highest[1]}% MPS`],
      ["Lowest Performing Subject", lowest[0], `${lowest[1]}% MPS`],
      ["Best Performing Grade", bestGrade[0], `${bestGrade[1]}% MPS`],
      ["Lowest Performing Grade", lowGrade[0], `${lowGrade[1]}% MPS`],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("MPS by Subject", subjectRows)}
      ${renderSummaryChart("MPS by Section", sectionRows)}
      ${renderSummaryChart("MPS by Grade Level", gradeRows)}
      ${renderVerticalBarChart("Quarterly MPS Trend", termRows)}
      ${renderSummaryChart("MPS by Subject Teacher", teacherRows)}
      ${renderSummaryChart("Lowest Performing Subjects", subjectLowRows)}
      ${renderSummaryChart("Lowest Performing Grades", gradeLowRows)}
      ${renderInsightPanel("MPS Insights", [
        termRows.length >= 2 && termRows.at(-1)[1] < termRows.at(-2)[1] ? `MPS decreased by ${(termRows.at(-2)[1] - termRows.at(-1)[1]).toFixed(1)}% from the previous term.` : "",
        bestGrade[0] !== "None" ? `${bestGrade[0]} has the highest average MPS by grade.` : "",
        lowest[0] !== "None" ? `${lowest[0]} needs instructional follow-up.` : "",
        comparedCount ? `${comparedCount} class-term pairs have both diagnostic and term exam MPS.` : "",
      ])}
    </div>
  `;
}

function openAssessmentForm(record = null) {
  editingAssessmentId = record?.id || null;
  const editableWorkloads = getAssessmentEditableWorkloads();
  const selectedWorkload = record && canEditAssessmentRecord(record) ? findAssessmentEditableWorkload(record, editableWorkloads) : null;
  const selectedScoreType = record ? assessmentScoreTypeFromType(assessmentDisplayType(record)) : "";
  const scoreTypeOptions = assessmentScoreTypes
    .map((type) => `<option value="${escapeHtml(type.value)}" ${type.value === selectedScoreType ? "selected" : ""}>${escapeHtml(type.label)}</option>`)
    .join("");
  const hasWorkloads = editableWorkloads.length > 0;
  const noWorkloadMessage = assessmentWorkloadEmptyMessage();
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="assessmentForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Assessments</p><h2>${record ? "Edit Class Scores" : "Encode Class Scores"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Term<select id="assessmentTerm" required>${optionList([...new Set(assessmentScopeOptions.filter((item) => activeAssessmentScopes().includes(item.key)).map((item) => item.term))], record?.term || "", "Select term")}</select></label>
          <label>Type<select id="assessmentScoreType" required><option value="">Select type</option>${scoreTypeOptions}</select></label>
          <label>Total Items<input id="assessmentDefaultHighest" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(record ? getAssessmentHighScore(record, record.postTestScore ? "post" : "pre") : "")}" placeholder="Apply to all" /></label>
          <div class="batch-actions">
            <button id="applyHighestToAll" class="secondary-button" type="button">Apply Highest to All</button>
          </div>
        </div>
        <input id="assessmentWorkloadId" type="hidden" value="${escapeAttribute(selectedWorkload?.id || "")}" />
        <div class="assessment-workload-picker" id="assessmentWorkloadPicker">
          ${hasWorkloads ? renderAssessmentWorkloadCards(editableWorkloads, selectedWorkload?.id || "") : `<p class="empty-state">${escapeHtml(noWorkloadMessage)}</p>`}
        </div>
        <div id="assessmentBatchHost" class="batch-table-host"><p class="empty-state">${hasWorkloads ? "Select a class card to show students." : escapeHtml(noWorkloadMessage)}</p></div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit" ${hasWorkloads ? "" : "disabled"}>Save Class Scores</button>
        </div>
      </form>
    </div>
  `);
}

function assessmentWorkloadEmptyMessage() {
  if (canEncodeAssessmentScores()) {
    return "No subject-grade-section teaching load is assigned to your account for score encoding.";
  }
  return "No classes assigned to your account are available for score encoding.";
}

function renderAssessmentWorkloadCards(workloads = [], selectedId = "") {
  return `
    <div class="assessment-workload-card-grid">
      ${workloads.map((workload) => {
        const activeStudents = sectionActiveStudents(workload.sectionId).length;
        const selected = workload.id === selectedId;
        return `
          <button class="assessment-workload-card ${selected ? "is-selected" : ""}" type="button" data-workload-id="${escapeAttribute(workload.id)}" aria-pressed="${selected ? "true" : "false"}">
            <strong>${escapeHtml(subjectGradeSectionClassLabel(workload))}</strong>
            <small>${escapeHtml(workload.teacherName || currentUserProfile?.fullName || "Subject Teacher")}</small>
            <em>${activeStudents} learner${activeStudents === 1 ? "" : "s"}</em>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function normalizeAssessmentMatchValue(value = "") {
  return String(value || "").trim().toLowerCase();
}

function findAssessmentEditableWorkload(record = {}, workloads = getAssessmentEditableWorkloads()) {
  if (!record || !workloads.length) return null;
  const exact = workloads.find((workload) => workload.id === record.workloadId);
  if (exact) return exact;
  const recordSection = normalizeAssessmentMatchValue(record.sectionName);
  const recordSectionOnly = normalizeAssessmentMatchValue(assessmentSectionOnlyLabel(record.sectionName));
  const recordSubject = normalizeAssessmentMatchValue(assessmentSubjectName(record));
  const recordTeacher = normalizeAssessmentMatchValue(record.teacherUid || record.teacherId);
  const scored = workloads.map((workload) => {
    const section = getSelectedClass(workload.sectionId);
    const workloadSection = normalizeAssessmentMatchValue(workload.sectionName || classLabel(section || {}));
    const workloadSectionOnly = normalizeAssessmentMatchValue(assessmentSectionOnlyLabel(workload.sectionName || section?.sectionName || ""));
    const workloadSubject = normalizeAssessmentMatchValue(workload.subjectName);
    let score = 0;
    if (record.sectionId && workload.sectionId === record.sectionId) score += 50;
    if (recordSection && [workloadSection, workloadSectionOnly].includes(recordSection)) score += 35;
    if (recordSectionOnly && [workloadSection, workloadSectionOnly].includes(recordSectionOnly)) score += 35;
    if (record.subjectId && workload.subjectId === record.subjectId) score += 30;
    if (recordSubject && workloadSubject === recordSubject) score += 25;
    if (recordTeacher && workload.teacherId === recordTeacher) score += 15;
    if (record.gradeLevel && (workload.gradeLevel || section?.gradeLevel) === record.gradeLevel) score += 10;
    return { workload, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].workload : null;
}

function getAssessmentEditableWorkloads() {
  if (!canEncodeAssessmentScores()) return [];
  const assignedWorkloads = teacherWorkloadRecordsCache
    .filter((workload) =>
      workload.sectionId
      && workload.teacherId === auth.currentUser.uid
      && getSelectedClass(workload.sectionId)?.status !== "archived"
    );
  return assignedWorkloads
    .sort((a, b) => assessmentWorkloadLabel(a).localeCompare(assessmentWorkloadLabel(b)));
}

function buildAssessmentFallbackWorkloads(existingWorkloads = []) {
  if (!hasRole(currentUserProfile, "Teacher")) return [];
  const advisoryClasses = classRecordsCache.filter((section) =>
    section.adviserId === auth.currentUser.uid
    && (section.status || "active") !== "archived"
  );
  const existingKeys = new Set(existingWorkloads.map((workload) =>
    `${workload.sectionId || ""}:${workload.subjectId || normalizeAssessmentMatchValue(workload.subjectName)}`
  ));
  return advisoryClasses.flatMap((section) => {
    const subjects = schoolSubjectRecordsCache.filter((subject) =>
      (subject.status || "active") !== "archived"
      && (!subject.gradeLevel || subject.gradeLevel === section.gradeLevel)
      && (!subject.sectionId || subject.sectionId === section.id)
    );
    return subjects.map((subject) => ({
      id: `fallback:${section.id}:${subject.id || normalizeAssessmentMatchValue(subject.subjectName)}`,
      isFallbackWorkload: true,
      teacherId: auth.currentUser.uid,
      teacherName: currentUserProfile.fullName || auth.currentUser.email,
      subjectId: subject.id || "",
      subjectName: subject.subjectName || "Subject",
      subjectArea: subject.subjectArea || "",
      sectionId: section.id,
      sectionName: classLabel(section),
      gradeLevel: section.gradeLevel || "",
      schoolYear: section.schoolYear || "",
    })).filter((workload) =>
      !existingKeys.has(`${workload.sectionId}:${workload.subjectId || normalizeAssessmentMatchValue(workload.subjectName)}`)
    );
  });
}

function assessmentWorkloadLabel(workload = {}) {
  return subjectGradeSectionClassLabel(workload);
}

function assessmentSectionOnlyLabel(sectionName = "") {
  return String(sectionName || "Class").replace(/^Grade\s+\d+\s*-\s*/i, "");
}

function assessmentSubjectOptions(sectionId = "", selected = "") {
  const workloads = teacherWorkloadRecordsCache.filter((record) =>
    record.sectionId === sectionId
    && record.teacherId === auth.currentUser.uid
  );
  const options = workloads.length
    ? workloads.map((workload) => ({
      value: workload.subjectId || `${workload.subjectName}:${workload.teacherId}`,
      label: `${workload.subjectName || "Subject"}${workload.subjectArea ? ` (${workload.subjectArea})` : ""}`,
    }))
    : schoolSubjectRecordsCache
      .filter((subject) => !sectionId || !subject.gradeLevel || subject.gradeLevel === getSelectedClass(sectionId)?.gradeLevel)
      .map((subject) => ({ value: subject.id, label: `${subject.subjectName}${subject.subjectArea ? ` (${subject.subjectArea})` : ""}` }));
  return `<option value="">Select subject</option>${options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === selected ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}`;
}

function assessmentSubjectTeacherOptions(selected = "") {
  const teachers = [...new Map([
    ...academicTeachersCache,
    ...teacherWorkloadRecordsCache.map((record) => ({ id: record.teacherId, fullName: record.teacherName, role: "Teacher" })),
    currentUserProfile ? { id: auth.currentUser.uid, fullName: currentUserProfile.fullName || auth.currentUser.email, role: currentUserProfile.role } : null,
  ].filter((teacher) => teacher?.id).map((teacher) => [teacher.id, teacher])).values()];
  return `<option value="">Select subject teacher</option>${teachers
    .map((teacher) => `<option value="${escapeHtml(teacher.id)}" ${teacher.id === selected ? "selected" : ""}>${escapeHtml(teacher.fullName || teacher.email || teacher.id)}</option>`)
    .join("")}`;
}

function selectedAssessmentWorkload() {
  const workloadId = document.querySelector("#assessmentWorkloadId")?.value || "";
  return getAssessmentEditableWorkloads().find((record) => record.id === workloadId) || null;
}

function canEditAssessmentSelection(sectionId, teacherUid) {
  if (teacherUid === auth.currentUser.uid) {
    return teacherWorkloadRecordsCache.some((record) => record.teacherId === auth.currentUser.uid && record.sectionId === sectionId)
      || canEditSectionRecords(sectionId);
  }
  return false;
}

function findAssessmentRecord(sectionId, studentId, term, subjectId = "", assessmentType = "", assessmentTitle = "", dateAdministered = "", workloadId = "") {
  const editingRecord = editingAssessmentId ? assessmentRecordsCache.find((record) => record.id === editingAssessmentId) : null;
  if (editingRecord?.assessmentBatchId) {
    const batchMatch = assessmentRecordsCache.find((record) =>
      record.assessmentBatchId === editingRecord.assessmentBatchId
      && record.studentId === studentId
    );
    if (batchMatch) return batchMatch;
  }
  if (editingRecord) {
    const legacyGroupKey = assessmentGroupKey(editingRecord);
    const legacyMatch = assessmentRecordsCache.find((record) =>
      record.studentId === studentId
      && assessmentGroupKey(record) === legacyGroupKey
    );
    if (legacyMatch) return legacyMatch;
  }
  if (workloadId) {
    const workloadMatch = assessmentRecordsCache.find((record) =>
      record.workloadId === workloadId
      && record.studentId === studentId
      && record.term === term
      && assessmentDisplayType(record) === assessmentType
    );
    if (workloadMatch) return workloadMatch;
  }
  return assessmentRecordsCache.find((record) =>
    record.sectionId === sectionId
    && record.studentId === studentId
    && record.term === term
    && (record.subjectId || "") === subjectId
    && assessmentDisplayType(record) === assessmentType
    && (record.assessmentTitle || "") === assessmentTitle
    && (record.dateAdministered || "") === dateAdministered
  );
}

function renderAssessmentBatchRows() {
  const term = document.querySelector("#assessmentTerm")?.value || "";
  const scoreType = document.querySelector("#assessmentScoreType")?.value || "";
  const workload = selectedAssessmentWorkload();
  const sectionId = workload?.sectionId || "";
  const subjectId = workload?.subjectId || "";
  const assessmentType = assessmentTypeFromScoreType(scoreType);
  const assessmentTitle = "";
  const dateAdministered = "";
  const isPostTest = scoreType === "post";
  const host = document.querySelector("#assessmentBatchHost");
  if (!host) return;
  const students = sectionActiveStudents(sectionId);
  if (!workload || !term || !scoreType) {
    host.innerHTML = `<p class="empty-state">Select a term, type, and class card to show students.</p>`;
    return;
  }
  if (!students.length) {
    host.innerHTML = `<p class="empty-state">No active students found for this section.</p>`;
    return;
  }
  host.innerHTML = `
    <div class="table-wrap assessment-score-wrap">
      <table class="batch-table assessment-batch-table">
        <thead><tr><th class="assessment-sticky-name">Name</th><th class="assessment-sticky-score">${isPostTest ? "Term Exam" : "Diagnostic Test"}</th><th>${isPostTest ? "Term Exam Highest" : "Diagnostic Highest"}</th><th>Comparison</th></tr></thead>
        <tbody>
          ${students.map((student) => {
            const existing = findAssessmentRecord(sectionId, student.id, term, subjectId, assessmentType, assessmentTitle, dateAdministered, workload.id);
            const scoreInputClass = isPostTest ? "assessment-post-input" : "assessment-pre-input";
            const highInputClass = isPostTest ? "assessment-post-highest-input" : "assessment-pre-highest-input";
            const scoreValue = isPostTest ? existing?.postTestScore : existing?.preTestScore;
            const highValue = existing ? getAssessmentHighScore(existing, isPostTest ? "post" : "pre") : document.querySelector("#assessmentDefaultHighest")?.value;
            return `
              <tr>
                <td class="assessment-sticky-name"><strong>${escapeHtml(`${student.lastName}, ${student.firstName} ${student.middleName || ""}`.trim())}</strong></td>
                <td class="assessment-sticky-score"><input class="assessment-score-input ${scoreInputClass}" data-student-id="${escapeHtml(student.id)}" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(scoreValue ?? "")}" /></td>
                <td><input class="assessment-highest-input ${highInputClass}" data-student-id="${escapeHtml(student.id)}" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(highValue ?? "")}" /></td>
                <td class="assessment-improvement-cell" data-student-id="${escapeHtml(student.id)}">${escapeHtml(formatAssessmentComparison(existing))}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function handleAssessmentFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const workload = selectedAssessmentWorkload();
  const section = getSelectedClass(workload?.sectionId || "");
  const subjectId = workload?.subjectId || "";
  const teacherUid = workload?.teacherId || "";
  const term = document.querySelector("#assessmentTerm").value;
  const scoreType = document.querySelector("#assessmentScoreType")?.value || "";
  const assessmentType = assessmentTypeFromScoreType(scoreType);
  const assessmentTitle = "";
  const dateAdministered = "";
  const remarks = "";
  if (!section || !workload || !term || !scoreType) {
    message.textContent = "Select a term, class, and Diagnostic Test or Term Exam.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const subject = schoolSubjectRecordsCache.find((item) => item.id === subjectId);
  const teacher = academicTeachersCache.find((item) => item.id === teacherUid)
    || { fullName: workload?.teacherName || currentUserProfile?.fullName || auth.currentUser.email };
  if (!canEditAssessmentSelection(section.id, teacherUid)) {
    message.textContent = "You can only encode scores for your assigned subject and section.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (!assessmentScopeMatches({ term }, scoreType)) {
    message.textContent = "This term and score type is hidden by the Principal task visibility setting.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  if (!scoreType) {
    message.textContent = "Select Diagnostic Test or Term Exam before saving scores.";
    message.classList.add("error");
    message.classList.remove("hidden");
    return;
  }
  const students = sectionActiveStudents(section.id);
  try {
    let saved = 0;
    const assessmentBatchId = editingAssessmentId
      ? assessmentRecordsCache.find((record) => record.id === editingAssessmentId)?.assessmentBatchId || `assessment-${Date.now()}`
      : `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const batchScores = students.map((student) => {
      const field = document.querySelector(`.${scoreType === "pre" ? "assessment-pre-input" : "assessment-post-input"}[data-student-id="${CSS.escape(student.id)}"]`);
      const highest = document.querySelector(`.assessment-highest-input[data-student-id="${CSS.escape(student.id)}"]`);
      const score = Number(field?.value || 0);
      const high = Number(highest?.value || 0);
      if ((field?.value && !Number.isFinite(score)) || (highest?.value && !Number.isFinite(high))) {
        throw new Error("Enter numbers only for scores and total items.");
      }
      return { score, highest: high, hasScore: Boolean(field?.value) };
    }).filter((row) => row.hasScore || row.highest > 0);
    const enteredScores = batchScores.map((row) => row.score);
    const highestValues = batchScores.map((row) => row.highest).filter((value) => value > 0);
    const numberOfLearners = batchScores.length || students.length;
    const highestScore = enteredScores.length ? Math.max(...enteredScores) : 0;
    const lowestScore = enteredScores.length ? Math.min(...enteredScores) : 0;
    const meanScore = enteredScores.length ? enteredScores.reduce((sum, score) => sum + score, 0) / enteredScores.length : 0;
    const meanHighest = highestValues.length ? highestValues.reduce((sum, score) => sum + score, 0) / highestValues.length : 0;
    const batchMps = meanHighest ? (meanScore / meanHighest) * 100 : 0;
    for (const student of students) {
      const existing = findAssessmentRecord(section.id, student.id, term, subjectId, assessmentType, assessmentTitle, dateAdministered, workload.id);
      const preField = document.querySelector(`.assessment-pre-input[data-student-id="${CSS.escape(student.id)}"]`);
      const postField = document.querySelector(`.assessment-post-input[data-student-id="${CSS.escape(student.id)}"]`);
      const highestField = document.querySelector(`.assessment-highest-input[data-student-id="${CSS.escape(student.id)}"]`);
      const preTestScore = scoreType === "pre"
        ? Number(preField?.value || 0)
        : Number(existing?.preTestScore || 0);
      const postTestScore = scoreType === "post"
        ? Number(postField?.value || 0)
        : Number(existing?.postTestScore || 0);
      const currentHighestPossibleScore = Number(highestField?.value || 0);
      const preHighestPossibleScore = scoreType === "pre"
        ? currentHighestPossibleScore
        : getAssessmentHighScore(existing, "pre");
      const postHighestPossibleScore = scoreType === "post"
        ? currentHighestPossibleScore
        : getAssessmentHighScore(existing, "post");
      const highestPossibleScore = scoreType === "post" ? postHighestPossibleScore : preHighestPossibleScore;
      const hasEnteredScore = scoreType === "pre" ? Boolean(preField?.value) : Boolean(postField?.value);
      if (!currentHighestPossibleScore && !hasEnteredScore) continue;
      if (currentHighestPossibleScore <= 0) {
        throw new Error(`Add a highest possible score for ${student.lastName}, ${student.firstName}.`);
      }
      const currentScore = scoreType === "pre" ? preTestScore : postTestScore;
      if (!Number.isFinite(currentScore) || !Number.isFinite(currentHighestPossibleScore)) {
        throw new Error(`Enter valid numbers for ${student.lastName}, ${student.firstName}.`);
      }
      if (currentScore > currentHighestPossibleScore) {
        throw new Error(`Score cannot be higher than the highest possible score for ${student.lastName}, ${student.firstName}.`);
      }
      const computed = calculateAssessmentValues(preTestScore, postTestScore, preHighestPossibleScore, postHighestPossibleScore);
      const data = {
        assessmentBatchId,
        workloadId: workload.id,
        schoolYear: section.schoolYear,
        term,
        quarter: term,
        gradeLevel: section.gradeLevel || "",
        sectionId: section.id,
        sectionName: classLabel(section),
        subjectId,
        subjectName: workload?.subjectName || subject?.subjectName || "Unspecified Subject",
        subjectCategory: workload?.subjectArea || subject?.subjectArea || "",
        subjectArea: workload?.subjectArea || subject?.subjectArea || "",
        teacherUid,
        teacherName: teacher.fullName || teacher.email || workload?.teacherName || "Unspecified Teacher",
        teacherId: teacherUid,
        assessmentType,
        assessmentTitle,
        dateAdministered,
        totalItems: currentHighestPossibleScore,
        numberOfLearners,
        highestScore,
        lowestScore,
        meanScore: Number(meanScore.toFixed(2)),
        mps: Number(batchMps.toFixed(2)),
        proficiencyLevel: assessmentProficiencyLevel(batchMps),
        remarks,
        adviserId: section.adviserId || "",
        studentId: student.id,
        studentName: `${student.lastName}, ${student.firstName}`,
        preTestScore,
        postTestScore,
        preHighestPossibleScore,
        postHighestPossibleScore,
        highestPossibleScore,
        ...computed,
        encodedBy: auth.currentUser.uid,
        encodedByName: currentUserProfile.fullName || auth.currentUser.email,
        createdBy: existing?.createdBy || auth.currentUser.uid,
        createdByName: existing?.createdByName || currentUserProfile.fullName || auth.currentUser.email,
      };
      if (existing) {
        await updateDoc(doc(db, "assessments", existing.id), { ...data, updatedAt: serverTimestamp() });
        await createAuditLog("update", "Diagnostic Test & Exam", existing.id, existing, data);
      } else {
        const created = await addDoc(collection(db, "assessments"), { ...data, encodedAt: serverTimestamp(), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await createAuditLog("create", "Diagnostic Test & Exam", created.id, null, data);
      }
      saved += 1;
    }
    document.querySelector("#academicModal")?.remove();
    await renderAssessmentModule();
    await refreshAcademicCounters(currentUserProfile.role);
    showDashboardMessage(`Saved assessment scores for ${saved} students.`);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

function handleAcademicAction(event) {
  if (event.target.closest(".close-academic-modal")) {
    document.querySelector("#academicModal")?.remove();
    return;
  }
  if (event.target.closest("#newClassButton")) {
    openClassForm();
    return;
  }
  const editClass = event.target.closest(".edit-class");
  if (editClass) {
    const record = classRecordsCache.find((item) => item.id === editClass.dataset.id);
    if (record) openClassForm(record);
    return;
  }
  const archiveClass = event.target.closest(".archive-class");
  if (archiveClass) {
    const record = classRecordsCache.find((item) => item.id === archiveClass.dataset.id);
    if (record && confirm(`Archive ${classLabel(record)}?`)) {
      updateDoc(doc(db, "classes", record.id), { status: "archived", updatedAt: serverTimestamp() })
        .then(() => createAuditLog("archive", "Classes / Sections", record.id, record, { status: "archived" }))
        .then(renderClassesModule)
        .then(() => showDashboardMessage("Section archived."))
        .catch((error) => showDashboardMessage(`Archive failed: ${error.message}`, true));
    }
    return;
  }
  if (event.target.closest("#newStudentButton")) {
    openStudentForm();
    return;
  }
  if (event.target.closest("#importStudentsButton")) {
    openStudentImportForm();
    return;
  }
  const editStudent = event.target.closest(".edit-student");
  if (editStudent) {
    const record = studentRecordsCache.find((item) => item.id === editStudent.dataset.id);
    if (record) openStudentForm(record);
    return;
  }
  if (event.target.closest("#newStudentAttendanceButton")) {
    openStudentAttendanceForm();
    return;
  }
  const toggleStudentAttendanceSection = event.target.closest(".toggle-student-attendance-section");
  if (toggleStudentAttendanceSection) {
    const sectionId = toggleStudentAttendanceSection.dataset.sectionId;
    if (expandedStudentAttendanceSections.has(sectionId)) {
      expandedStudentAttendanceSections.delete(sectionId);
    } else {
      expandedStudentAttendanceSections.add(sectionId);
    }
    const host = document.querySelector("#studentAttendanceTableHost");
    if (host) renderStudentAttendanceSectionTable(host);
    return;
  }
  const editStudentAttendance = event.target.closest(".edit-student-attendance");
  if (editStudentAttendance) {
    const record = studentAttendanceRecordsCache.find((item) => item.id === editStudentAttendance.dataset.id);
    if (record) openStudentAttendanceForm(record);
    return;
  }
  if (event.target.closest("#checkAllAttendance")) {
    document.querySelectorAll(".attendance-present-checkbox").forEach((field) => { field.checked = true; });
    return;
  }
  if (event.target.closest("#clearAllAttendance")) {
    document.querySelectorAll(".attendance-present-checkbox").forEach((field) => { field.checked = false; });
    return;
  }
  if (event.target.closest("#newTeacherAttendanceButton")) {
    openTeacherAttendanceForm();
    return;
  }
  const editTeacherAttendanceDate = event.target.closest(".edit-teacher-attendance-date");
  if (editTeacherAttendanceDate) {
    openTeacherAttendanceForm({ attendanceDate: editTeacherAttendanceDate.dataset.date });
    return;
  }
  const editTeacherAttendance = event.target.closest(".edit-teacher-attendance");
  if (editTeacherAttendance) {
    const record = teacherAttendanceRecordsCache.find((item) => item.id === editTeacherAttendance.dataset.id);
    if (record) openTeacherAttendanceForm(record);
    return;
  }
  if (event.target.closest("#newTeachingLoadButton")) {
    openTeachingLoadForm();
    return;
  }
  if (event.target.closest("#newAncillaryDutyButton")) {
    openAncillaryDutyForm();
    return;
  }
  const editTeachingLoad = event.target.closest(".edit-teaching-load");
  if (editTeachingLoad) {
    const record = teacherWorkloadRecordsCache.find((item) => item.id === editTeachingLoad.dataset.id);
    if (record) openTeachingLoadForm(record);
    return;
  }
  const editAncillaryDuty = event.target.closest(".edit-ancillary-duty");
  if (editAncillaryDuty) {
    const record = ancillaryAssignmentRecordsCache.find((item) => item.id === editAncillaryDuty.dataset.id);
    if (record) openAncillaryDutyForm(record);
    return;
  }
  const editAdvisoryClass = event.target.closest(".edit-advisory-class");
  if (editAdvisoryClass) {
    const record = classRecordsCache.find((item) => item.id === editAdvisoryClass.dataset.id);
    if (record) openClassForm(record);
    return;
  }
  const viewWorkloadProfile = event.target.closest(".workload-summary-row");
  if (viewWorkloadProfile) {
    renderTeacherWorkloadDetail(viewWorkloadProfile.dataset.teacherId);
    document.querySelector("#teacherWorkloadDetailHost")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const removeTeachingLoad = event.target.closest(".remove-teaching-load");
  if (removeTeachingLoad && confirm("Remove this teaching load record?")) {
    removeTeacherWorkloadRecord("teacherWorkloads", removeTeachingLoad.dataset.id)
      .catch((error) => showDashboardMessage(`Remove failed: ${error.message}`, true));
    return;
  }
  const removeAncillaryDuty = event.target.closest(".remove-ancillary-duty");
  if (removeAncillaryDuty && confirm("Remove this ancillary duty?")) {
    removeTeacherWorkloadRecord("ancillaryAssignments", removeAncillaryDuty.dataset.id)
      .catch((error) => showDashboardMessage(`Remove failed: ${error.message}`, true));
    return;
  }
  if (event.target.closest("#encodeGradeButton")) {
    openGradeSubmissionForm();
    return;
  }
  const editGradeSubmission = event.target.closest(".edit-grade-submission");
  if (editGradeSubmission) {
    const row = findGradeSubmissionRowByKey(editGradeSubmission.dataset.rowKey);
    if (row) openGradeSubmissionForm(row);
    return;
  }
  const gradeSubmissionGroupRow = event.target.closest(".grade-submission-group-row");
  if (gradeSubmissionGroupRow) {
    const target = document.querySelector(`#${CSS.escape(gradeSubmissionGroupRow.dataset.target)}`);
    target?.classList.toggle("hidden");
    return;
  }
  const encodeWorkloadGrades = event.target.closest(".encode-workload-grades");
  if (encodeWorkloadGrades) {
    const workload = teacherWorkloadRecordsCache.find((item) => item.id === encodeWorkloadGrades.dataset.id);
    if (workload) openGradeSubmissionForm(workload);
    return;
  }
  if (event.target.closest("#newLessonPlanButton")) {
    openLessonPlanForm();
    return;
  }
  const editLessonPlan = event.target.closest(".edit-lesson-plan");
  if (editLessonPlan) {
    const record = lessonPlanRecordsCache.find((item) => item.id === editLessonPlan.dataset.id);
    if (record) openLessonPlanForm(record);
    return;
  }
  const reviewLessonPlan = event.target.closest(".review-lesson-plan");
  if (reviewLessonPlan) {
    const record = lessonPlanRecordsCache.find((item) => item.id === reviewLessonPlan.dataset.id);
    if (record) openLessonPlanReviewForm(record);
    return;
  }
  if (event.target.closest("#newAssessmentButton")) {
    openAssessmentForm();
    return;
  }
  const assessmentWorkloadCard = event.target.closest(".assessment-workload-card");
  if (assessmentWorkloadCard) {
    const workloadId = assessmentWorkloadCard.dataset.workloadId || "";
    const workloadField = document.querySelector("#assessmentWorkloadId");
    if (workloadField) workloadField.value = workloadId;
    document.querySelectorAll(".assessment-workload-card").forEach((card) => {
      const selected = card === assessmentWorkloadCard;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    renderAssessmentBatchRows();
    return;
  }
  const assessmentGroupRow = event.target.closest(".assessment-group-row");
  if (assessmentGroupRow) {
    const targetId = assessmentGroupRow.dataset.target || "";
    const details = targetId ? document.querySelector(`#${CSS.escape(targetId)}`) : null;
    details?.classList.toggle("hidden");
    assessmentGroupRow.classList.toggle("is-expanded", !details?.classList.contains("hidden"));
    return;
  }
  const editAssessment = event.target.closest(".edit-assessment");
  if (editAssessment) {
    const record = assessmentRecordsCache.find((item) => item.id === editAssessment.dataset.id);
    if (record) openAssessmentForm(record);
    return;
  }
  if (event.target.closest("#applyHighestToAll")) {
    const value = document.querySelector("#assessmentDefaultHighest")?.value || "";
    document.querySelectorAll(".assessment-highest-input").forEach((field) => { field.value = value; });
  }
}

async function renderTeacherComplianceModule() {
  els.dashboardTitle.textContent = "Report Assignment";
  const canAssign = canCreateAssignments();
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Compliance module</p>
        <h2>Report Assignment Module</h2>
      </div>
      <div class="toolbar-actions">
        ${canAssign ? `<button id="newComplianceButton" class="primary-button" type="button">Create Assignment</button>` : ""}
        <button id="downloadComplianceCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadComplianceExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printComplianceView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="complianceAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading report assignment summary...</p>
    </section>

    <section class="table-card">
      <div class="filter-grid">
        <label>
          Search
          <input id="complianceSearch" type="search" placeholder="Search records" />
        </label>
        <label class="principal-filter">
          Assigned User
          <select id="filterAssignee"></select>
        </label>
        <label>
          Report Type
          <select id="filterReportType"></select>
        </label>
        <label>
          Status
          <select id="filterStatus"></select>
        </label>
        <label>
          Compliance
          <select id="filterComplianceStatus"></select>
        </label>
        <label>
          Role
          <select id="filterRole"></select>
        </label>
        <label>
          Assigned Group
          <select id="filterAssignedGroup"></select>
        </label>
        <label>
          Due Date
          <input id="filterDueDate" type="date" />
        </label>
      </div>
      <div id="complianceTableHost" class="table-wrap">
        <p class="empty-state">Loading report assignments...</p>
      </div>
    </section>
  `;

  await loadComplianceRecords();
  bindComplianceModuleEvents();
}

async function loadComplianceRecords() {
  complianceRecordsCache = await getVisibleReportAssignments();
  complianceRecordsCache.sort((a, b) => {
    const first = a.updatedAt?.toMillis?.() || 0;
    const second = b.updatedAt?.toMillis?.() || 0;
    return second - first;
  });
  populateComplianceFilters();
  applyComplianceFilters();
}

function populateComplianceFilters() {
  const assigneeFilter = document.querySelector("#filterAssignee");
  const reportFilter = document.querySelector("#filterReportType");
  const statusFilter = document.querySelector("#filterStatus");
  const roleFilter = document.querySelector("#filterRole");
  const complianceFilter = document.querySelector("#filterComplianceStatus");
  const assignedGroupFilter = document.querySelector("#filterAssignedGroup");
  const groups = buildComplianceGroups(complianceRecordsCache);

  assigneeFilter.innerHTML = optionList(uniqueOptions(complianceRecordsCache, "assignedToName"), "", "All users");
  reportFilter.innerHTML = labeledOptionList(reportAssignmentTypeFilterOptions(complianceRecordsCache), "", "All report types");
  statusFilter.innerHTML = optionList(reportAssignmentStatuses, "", "All statuses");
  roleFilter.innerHTML = optionList(uniqueOptions(complianceRecordsCache, "assignedToRole"), "", "All roles");
  complianceFilter.innerHTML = optionList(["Pending", "In Progress", "Completed", "Overdue", "Reviewed", "Approved"], "", "All compliance");
  assignedGroupFilter.innerHTML = optionList([...new Set(groups.map((group) => group.assignedToLabel).filter(Boolean))].sort(), "", "All groups");
}

function applyComplianceFilters() {
  const search = document.querySelector("#complianceSearch").value.trim().toLowerCase();
  const assignee = document.querySelector("#filterAssignee").value;
  const reportType = document.querySelector("#filterReportType").value;
  const status = document.querySelector("#filterStatus").value;
  const role = document.querySelector("#filterRole").value;
  const dueDate = document.querySelector("#filterDueDate").value;
  const assignedGroup = document.querySelector("#filterAssignedGroup")?.value || "";
  const complianceStatus = document.querySelector("#filterComplianceStatus")?.value || "";

  filteredComplianceRecords = complianceRecordsCache.filter((record) => {
    const searchable = [
      record.title,
      record.description,
      record.assignedByName,
      record.assignedByRole,
      record.assignedToName,
      record.assignedToRole,
      record.assignedToType,
      ...(record.assignedUserNames || []),
      record.reportType,
      formatReportAssignmentType(record.reportType),
      record.status,
      record.submissionType,
      record.submissionRemarks,
      record.reviewRemarks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!assignee || record.assignedToName === assignee) &&
      (!reportType || record.reportType === reportType) &&
      (!status || record.status === status) &&
      (!role || record.assignedToRole === role) &&
      (!dueDate || record.dueDate === dueDate)
    );
  });

  filteredComplianceGroups = buildComplianceGroups(filteredComplianceRecords)
    .filter((group) => (!assignedGroup || group.assignedToLabel === assignedGroup)
      && (!complianceStatus || group.status === complianceStatus));
  filteredComplianceRecords = filteredComplianceGroups.flatMap((group) => group.records);
  renderComplianceAnalytics();
  renderComplianceTable();
}

function complianceGroupKey(record) {
  if (record.assignmentGroupId) return `group:${record.assignmentGroupId}`;
  const createdAtMillis = record.createdAt?.toMillis?.();
  if (!createdAtMillis) return `single:${record.id}`;
  const allowedTypes = (record.allowedSubmissionTypes || []).join("/");
  return [
    "legacy",
    record.assignedByUid || "",
    record.title || "",
    record.reportType || "",
    record.dueDate || "",
    record.description || "",
    allowedTypes,
    Math.floor(createdAtMillis / 600000),
  ].join("|");
}

function buildComplianceGroups(records) {
  const buckets = new Map();
  records.forEach((record) => {
    const key = complianceGroupKey(record);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(record);
  });
  return [...buckets.entries()]
    .map(([key, groupRecords]) => buildComplianceGroup(groupRecords, key))
    .sort((a, b) => {
      const first = Math.max(...a.records.map((record) => record.updatedAt?.toMillis?.() || record.createdAt?.toMillis?.() || 0));
      const second = Math.max(...b.records.map((record) => record.updatedAt?.toMillis?.() || record.createdAt?.toMillis?.() || 0));
      return second - first;
    });
}

function buildComplianceGroup(records, key = "") {
  const sortedRecords = [...records].sort((a, b) => (a.assignedToName || "").localeCompare(b.assignedToName || ""));
  const first = sortedRecords[0] || {};
  const total = sortedRecords.length;
  const submitted = sortedRecords.filter(isComplianceSubmitted).length;
  const percentage = total ? Math.round((submitted / total) * 100) : 0;
  const status = deriveComplianceGroupStatus(sortedRecords, submitted, total);
  return {
    id: key || complianceGroupKey(first),
    records: sortedRecords,
    title: first.title || "Untitled report",
    reportType: first.reportType || "",
    description: first.description || "",
    assignedByName: first.assignedByName || "",
    dueDate: first.dueDate || "",
    allowedSubmissionTypes: first.allowedSubmissionTypes || [],
    assignedToLabel: getComplianceAssignedToLabel({ records: sortedRecords }),
    total,
    submitted,
    percentage,
    status,
  };
}

function getComplianceAssignedToLabel(group) {
  const records = group.records || [];
  const first = records[0] || {};
  if (records.length <= 1) return first.assignedToName || "No assignee";
  if (first.assignedToType && first.assignedToType !== "Selected User") return first.assignedToType;
  const rolesInGroup = [...new Set(records.map((record) => record.assignedToRole).filter(Boolean))];
  if (rolesInGroup.length === 1) return `${records.length} ${rolesInGroup[0]}${records.length === 1 ? "" : "s"}`;
  return `${records.length} Personnel`;
}

function isComplianceSubmitted(record) {
  const status = record.status || "";
  if (["Submitted", "Received", "Checked", "Approved"].includes(status)) return true;
  return status === "Late" && Boolean(record.submittedAt || record.submissionType || record.fileLink);
}

function deriveComplianceGroupStatus(records, submitted, total) {
  const dueDates = records.map((record) => record.dueDate).filter(Boolean);
  const isOverdue = dueDates.some((dueDate) => dueDate < todayIso()) && submitted < total;
  if (isOverdue) return "Overdue";
  if (total && records.every((record) => record.status === "Approved")) return "Approved";
  if (total && records.every((record) => ["Received", "Checked", "Approved"].includes(record.status))) return "Reviewed";
  if (submitted === 0) return "Pending";
  if (submitted >= total) return "Completed";
  return "In Progress";
}

function complianceProgressClass(percentage) {
  if (percentage >= 100) return "success";
  if (percentage >= 80) return "info";
  if (percentage >= 50) return "warning";
  return "danger";
}

function renderComplianceAnalytics() {
  const host = document.querySelector("#complianceAnalytics");
  if (!host) return;
  const groups = filteredComplianceGroups;
  const averageCompliance = groups.length
    ? Math.round(groups.reduce((sum, group) => sum + group.percentage, 0) / groups.length)
    : 0;
  const categoryRows = groups.map((group) => [formatReportAssignmentType(group.reportType), group.percentage])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 8);
  const statusRows = groupCountRows(groups, "status");
  const monthlyRows = groupCountRows(groups.filter((group) => ["Completed", "Reviewed", "Approved"].includes(group.status)), (group) =>
    analyticsMonthKey(analyticsDateValue(group.records[0], ["submittedAt", "updatedAt", "createdAt"])), "No month")
    .filter(([label]) => label !== "No month")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const personnelRows = groupCountRows(groups.flatMap((group) => group.records.filter(isComplianceSubmitted)), "assignedToName").slice(0, 8);
  const lowGroup = groups.filter((group) => group.percentage < 50).sort((a, b) => a.percentage - b.percentage)[0];
  const overduePersonnel = new Set(groups.filter((group) => group.status === "Overdue").flatMap((group) => group.records.map((record) => record.assignedToUid || record.assignedToName))).size;
  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total Assignments", String(groups.length), "Grouped visible assignments"],
      ["Average Compliance Rate", `${averageCompliance}%`, "Average submitted rate"],
      ["Overdue Reports", String(groups.filter((group) => group.status === "Overdue").length), "Past due and incomplete"],
      ["Fully Completed", String(groups.filter((group) => ["Completed", "Reviewed", "Approved"].includes(group.status)).length), "100% submitted"],
      ["Pending Assignments", String(groups.filter((group) => group.status === "Pending").length), "No submissions yet"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("Compliance by Report Category", categoryRows)}
      ${renderAnalyticsPieChart("Submission Status Distribution", statusRows)}
      ${renderVerticalBarChart("Monthly Compliance Trend", monthlyRows)}
      ${renderSummaryChart("Personnel Compliance Ranking", personnelRows)}
      ${renderInsightPanel("Report Compliance Alerts", [
        lowGroup ? `${lowGroup.title} has only ${lowGroup.percentage}% compliance.` : "",
        overduePersonnel ? `${overduePersonnel} personnel have overdue report assignments.` : "",
        averageCompliance >= 80 ? "Overall report compliance is in a healthy range." : "",
      ])}
    </div>
  `;
}

function renderComplianceTable() {
  const tableHost = document.querySelector("#complianceTableHost");

  if (!filteredComplianceGroups.length) {
    tableHost.innerHTML = `<p class="empty-state">No report assignments match the current view.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table class="compliance-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Submitted</th>
          <th>Compliance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredComplianceGroups.map(renderComplianceGroupRows).join("")}
      </tbody>
    </table>
  `;
}

function analyticsMonthKey(value) {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function analyticsDateValue(record, fields = ["date", "createdAt", "updatedAt"]) {
  const field = fields.find((name) => record?.[name]);
  return field ? record[field] : "";
}

function groupCountRows(records, getter, fallback = "Not recorded") {
  const getValue = typeof getter === "function" ? getter : (record) => record?.[getter];
  const totals = new Map();
  records.forEach((record) => {
    const label = String(getValue(record) || "").trim() || fallback;
    totals.set(label, (totals.get(label) || 0) + 1);
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function groupSumRows(records, getter, valueGetter, fallback = "Not recorded") {
  const getLabel = typeof getter === "function" ? getter : (record) => record?.[getter];
  const totals = new Map();
  records.forEach((record) => {
    const label = String(getLabel(record) || "").trim() || fallback;
    totals.set(label, (totals.get(label) || 0) + toSafeNumber(valueGetter(record)));
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderAnalyticsPieChart(title, rows, emptyMessage = "No data available yet.") {
  const cleanRows = rows.filter(([, value]) => Number(value) > 0);
  const total = cleanRows.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  if (!total) {
    return `<article class="chart-card analytics-chart-card"><h3>${escapeHtml(title)}</h3><p class="empty-state">${escapeHtml(emptyMessage)}</p></article>`;
  }
  let currentPercent = 0;
  const segments = cleanRows.map(([, value], index) => {
    const share = (Number(value) / total) * 100;
    const start = currentPercent;
    currentPercent += share;
    return `var(--financial-chart-${(index % 8) + 1}) ${start}% ${currentPercent}%`;
  });
  return `
    <article class="chart-card analytics-chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="financial-pie-layout">
        <div class="financial-pie" style="background: conic-gradient(${segments.join(", ")});" role="img" aria-label="${escapeAttribute(`${title} total ${total}`)}">
          <span>${escapeHtml(String(total))}</span>
          <small>Total</small>
        </div>
        <div class="financial-chart-legend">
          ${cleanRows.map(([label, value], index) => `
            <div class="financial-legend-row" title="${escapeAttribute(`${label}: ${value}`)}">
              <i style="background: var(--financial-chart-${(index % 8) + 1});"></i>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(String(value))}</strong>
              <small>${total ? ((Number(value) / total) * 100).toFixed(1) : "0.0"}%</small>
            </div>
          `).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderVerticalBarChart(title, rows, emptyMessage = "No trend data available yet.") {
  const cleanRows = rows.length ? rows : [["No data", 0]];
  const max = Math.max(...cleanRows.map(([, value]) => Number(value) || 0), 0);
  if (!max) {
    return `<article class="chart-card analytics-chart-card"><h3>${escapeHtml(title)}</h3><p class="empty-state">${escapeHtml(emptyMessage)}</p></article>`;
  }
  return `
    <article class="chart-card analytics-chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="financial-bar-chart analytics-vertical-chart">
        ${cleanRows.map(([label, value]) => {
          const height = Math.max((Number(value || 0) / max) * 100, value > 0 ? 6 : 0);
          return `
            <div class="financial-bar-column" title="${escapeAttribute(`${label}: ${value}`)}">
              <span>${escapeHtml(String(value))}</span>
              <div class="financial-bar-track"><i style="height: ${height}%"></i></div>
              <strong>${escapeHtml(label)}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderInsightPanel(title, insights = []) {
  const items = insights.filter(Boolean);
  return `
    <article class="chart-card insight-panel">
      <h3>${escapeHtml(title)}</h3>
      ${items.length
        ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : `<p class="empty-state">Insights will appear as more records are encoded.</p>`}
    </article>
  `;
}

function compareLatestTwo(rows) {
  if (rows.length < 2) return { current: 0, previous: 0, change: 0 };
  const sorted = [...rows].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const previous = Number(sorted.at(-2)?.[1] || 0);
  const current = Number(sorted.at(-1)?.[1] || 0);
  return { current, previous, change: current - previous };
}

function renderComplianceGroupRows(group) {
  const isExpanded = expandedComplianceGroups.has(group.id);
  const primaryRecord = group.records.find((record) => canSubmitAssignment(record)) || group.records[0];
  const canSubmit = primaryRecord && canSubmitAssignment(primaryRecord);
  const canReview = group.records.some((record) => canReviewAssignment(record));
  const allowedTypes = (group.allowedSubmissionTypes || []).join(", ") || "Any";
  const progressClass = complianceProgressClass(group.percentage);

  return `
    <tr class="compliance-group-row" data-group-id="${escapeAttribute(group.id)}">
      <td>
        <button class="link-button toggle-compliance-group" type="button" data-group-id="${escapeAttribute(group.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
          ${isExpanded ? "Hide" : "Show"}
        </button>
        <strong>${escapeHtml(group.title)}</strong>
        <small class="row-note">Assigned by ${escapeHtml(group.assignedByName || "Unknown")}</small>
      </td>
      <td>${escapeHtml(formatReportAssignmentType(group.reportType))}</td>
      <td>
        ${escapeHtml(group.assignedToLabel)}
        <small class="row-note">${escapeHtml(group.total === 1 ? "Single assignment" : `${group.total} personnel`)}</small>
      </td>
      <td>
        ${group.dueDate ? escapeHtml(group.dueDate) : "No due date"}
        <small class="row-note">Allowed: ${escapeHtml(allowedTypes)}</small>
      </td>
      <td>
        <strong>${escapeHtml(`${group.submitted} / ${group.total}`)}</strong>
        <small class="row-note">Submitted</small>
      </td>
      <td>
        <div class="compliance-progress compliance-progress-${progressClass}">
          <span style="width: ${group.percentage}%"></span>
        </div>
        <strong>${escapeHtml(`${group.percentage}%`)}</strong>
      </td>
      <td><span class="badge status-${statusClass(group.status)}">${escapeHtml(group.status)}</span></td>
      <td>
        <div class="row-actions">
          ${canSubmit ? `<button class="secondary-button submit-compliance" type="button" data-id="${escapeHtml(primaryRecord.id)}">Comply</button>` : ""}
          ${canReview && group.total === 1 ? `<button class="secondary-button review-compliance" type="button" data-id="${escapeHtml(primaryRecord.id)}">Review</button>` : ""}
          <button class="secondary-button toggle-compliance-group" type="button" data-group-id="${escapeAttribute(group.id)}">${isExpanded ? "Collapse" : "Expand"}</button>
        </div>
      </td>
    </tr>
    ${isExpanded ? renderComplianceDetailRow(group) : ""}
  `;
}

function renderComplianceDetailRow(group) {
  return `
    <tr class="compliance-detail-row">
      <td colspan="8">
        <div class="compliance-detail-panel">
          ${group.records.map(renderCompliancePersonDetail).join("")}
        </div>
      </td>
    </tr>
  `;
}

function renderCompliancePersonDetail(record) {
  const fileLink = record.fileLink
    ? `<a href="${escapeAttribute(record.fileLink)}" target="_blank" rel="noopener">Open file</a>`
    : `<span class="row-note">No attachment</span>`;
  const reviewer = record.reviewedByName ? `Reviewed by ${record.reviewedByName}` : "No reviewer yet";

  return `
    <article class="compliance-person-card">
      <div>
        <strong>${escapeHtml(record.assignedToName || "No assignee")}</strong>
        <small class="row-note">${escapeHtml(record.assignedToRole || "No role")}</small>
      </div>
      <div>
        <span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "Not Submitted")}</span>
        <small class="row-note">Submitted ${escapeHtml(formatDate(record.submittedAt))}</small>
      </div>
      <div>
        ${escapeHtml(record.submissionRemarks || "No submission remarks")}
        <small class="row-note">${fileLink}</small>
      </div>
      <div>
        ${escapeHtml(record.reviewRemarks || "No review remarks")}
        <small class="row-note">${escapeHtml(reviewer)}${record.reviewedAt ? ` - ${escapeHtml(formatDate(record.reviewedAt))}` : ""}</small>
      </div>
      <div class="row-actions">
        ${canSubmitAssignment(record) ? `<button class="secondary-button submit-compliance" type="button" data-id="${escapeHtml(record.id)}">Comply</button>` : ""}
        ${canReviewAssignment(record) ? `<button class="secondary-button review-compliance" type="button" data-id="${escapeHtml(record.id)}">Review</button>` : ""}
      </div>
    </article>
  `;
}

function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

function isValidLrn(lrn = "") {
  return /^[0-9]{12}$/.test(lrn);
}

function requireValidLrn(lrn) {
  if (!isValidLrn(lrn)) {
    throw new Error("LRN must be exactly 12 digits.");
  }
}

async function renderComplianceForm() {
  closeComplianceModal();
  assignableUsersCache = await getApprovedUsers();
  const groupOptions = assignmentGroupOptions()
    .map((group) => `<option value="${group.value}">${group.label}</option>`)
    .join("");
  const assigneeOptions = assignableUsersCache
    .map(
      (user) => `
        <label class="checkbox-row">
          <input type="checkbox" name="assignedUsers" value="${escapeHtml(user.uid)}" />
          <span>${escapeHtml(user.fullName || user.email)} <small>${escapeHtml(user.role || "")}</small></span>
        </label>
      `
    )
    .join("");

  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="complianceModal" class="modal-backdrop">
        <form id="complianceForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Report assignment</p>
              <h2>Create Assignment</h2>
            </div>
            <button id="closeComplianceModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <div class="form-grid compliance-form-grid">
            <label>Title<input id="assignmentTitle" required /></label>
            <label>Report Type<select id="complianceReportType" required>${optionList(reportAssignmentTypes, "", "Select report type")}</select></label>
            <label>Due Date<input id="assignmentDueDate" type="date" required /></label>
            <fieldset class="checkbox-group">
              <legend>Allowed Submission Types</legend>
              ${submissionTypes
                .map(
                  (type) => `
                    <label class="checkbox-row">
                      <input type="checkbox" name="allowedSubmissionTypes" value="${type}" checked />
                      <span>${type}</span>
                    </label>
                  `
                )
                .join("")}
            </fieldset>
          </div>
          <label class="modal-field">Description<textarea id="assignmentDescription" rows="4"></textarea></label>
          <fieldset class="checkbox-group">
            <legend>Assign To</legend>
            <div class="assignment-group-picker">
              <label>Assign Group<select id="assignmentGroupSelect">
                <option value="">Choose group</option>
                ${groupOptions}
              </select></label>
              <button id="clearAssigneesButton" class="secondary-button" type="button">Clear</button>
            </div>
            <div class="assignee-list">
              ${assigneeOptions || `<p class="empty-state">No approved users are available for assignment.</p>`}
            </div>
          </fieldset>
          <div id="complianceFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelComplianceForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Create Assignment</button>
          </div>
        </form>
      </div>
    `
  );
  document.querySelector("#assignmentGroupSelect")?.addEventListener("change", (event) => {
    applyAssignmentGroupSelection(event.target.value);
  });
}

function closeComplianceModal() {
  document.querySelector("#complianceModal")?.remove();
}

function getComplianceFormData() {
  const assignedToUids = [...document.querySelectorAll('input[name="assignedUsers"]:checked')]
    .map((input) => input.value);
  const allowedSubmissionTypes = [...document.querySelectorAll('input[name="allowedSubmissionTypes"]:checked')]
    .map((input) => input.value);
  const selectedGroup = document.querySelector("#assignmentGroupSelect")?.value || "";
  const groupLabel = assignmentGroupOptions().find((group) => group.value === selectedGroup)?.label;

  return {
    title: document.querySelector("#assignmentTitle").value.trim(),
    reportType: document.querySelector("#complianceReportType").value,
    description: document.querySelector("#assignmentDescription").value.trim(),
    dueDate: document.querySelector("#assignmentDueDate").value,
    allowedSubmissionTypes,
    assignedToUids,
    assignedToType: groupLabel || (assignedToUids.length > 1 ? "Selected Users" : "Selected User"),
  };
}

async function handleComplianceFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#complianceFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  submitButton.disabled = true;

  try {
    const data = getComplianceFormData();
    if (!data.allowedSubmissionTypes.length) {
      throw new Error("Select at least one allowed submission type.");
    }
    if (!data.assignedToUids.length) {
      throw new Error("Select at least one assignee.");
    }
    if (data.dueDate && data.dueDate < todayIso()) {
      throw new Error("Due date cannot be earlier than today.");
    }
    if (!isCurrentReportAssignmentType(data.reportType)) {
      throw new Error("Select a valid report type.");
    }

    await createReportAssignments(data);
    closeComplianceModal();
    showDashboardMessage("Report assignment created.");
    await loadComplianceRecords();
    await refreshComplianceCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function renderSubmitForm(record) {
  closeComplianceModal();
  const allowedTypes = record.allowedSubmissionTypes?.length ? record.allowedSubmissionTypes : submissionTypes;
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="complianceModal" class="modal-backdrop">
        <form id="submitComplianceForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Submit compliance</p>
              <h2>${escapeHtml(record.title || "Report Assignment")}</h2>
            </div>
            <button id="closeComplianceModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <label>Submission Type<select id="submissionType" required>${optionList(allowedTypes, record.submissionType || "", "Select type")}</select></label>
          <label id="fileLinkField" class="hidden">Cloud File Link<input id="submissionFileLink" type="url" value="${escapeHtml(record.fileLink || "")}" placeholder="https://..." /></label>
          <label>Remarks<textarea id="submissionRemarks" rows="4">${escapeHtml(record.submissionRemarks || "")}</textarea></label>
          <div id="complianceFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelComplianceForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Submit Compliance</button>
          </div>
        </form>
      </div>
    `
  );

  const syncFileLinkVisibility = () => {
    const type = document.querySelector("#submissionType").value;
    const fileField = document.querySelector("#fileLinkField");
    fileField.classList.toggle("hidden", type !== "Soft Copy");
    document.querySelector("#submissionFileLink").required = type === "Soft Copy";
  };
  document.querySelector("#submissionType").addEventListener("input", syncFileLinkVisibility);
  syncFileLinkVisibility();

  document.querySelector("#submitComplianceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#complianceFormMessage");
    const submitButton = event.target.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      const submissionType = document.querySelector("#submissionType").value;
      const fileLink = document.querySelector("#submissionFileLink").value.trim();
      if (submissionType === "Soft Copy" && !fileLink) {
        throw new Error("Soft Copy submissions require a cloud file link.");
      }
      if (fileLink && !isValidUrl(fileLink)) {
        throw new Error("Enter a valid http or https soft copy link.");
      }
      await submitReportCompliance(record.id, {
        submissionType,
        fileLink,
        submissionRemarks: document.querySelector("#submissionRemarks").value.trim(),
      });
      closeComplianceModal();
      showDashboardMessage("Compliance submitted.");
      await loadComplianceRecords();
      await refreshComplianceCounters(currentUserProfile.role);
    } catch (error) {
      message.textContent = `Submission failed: ${error.message}`;
      message.classList.add("error");
      message.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function renderReviewForm(record) {
  closeComplianceModal();
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="complianceModal" class="modal-backdrop">
        <form id="reviewComplianceForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Review submission</p>
              <h2>${escapeHtml(record.assignedToName || "Assigned User")}</h2>
            </div>
            <button id="closeComplianceModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <p class="review-summary">
            ${escapeHtml(record.title || "Untitled report")}<br />
            <span>${escapeHtml(record.submissionType || "No submission type")} - ${escapeHtml(record.submissionRemarks || "No submission remarks")}</span>
          </p>
          <label>Status<select id="reviewStatus" required>${optionList(reviewerStatuses, record.status, "Select status")}</select></label>
          <label>Review Remarks<textarea id="reviewRemarks" rows="4">${escapeHtml(record.reviewRemarks || "")}</textarea></label>
          <div id="complianceFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelComplianceForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Save Review</button>
          </div>
        </form>
      </div>
    `
  );

  document.querySelector("#reviewComplianceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#complianceFormMessage");
    const submitButton = event.target.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      await updateReportAssignmentStatus(
        record.id,
        document.querySelector("#reviewStatus").value,
        document.querySelector("#reviewRemarks").value.trim()
      );
      closeComplianceModal();
      showDashboardMessage("Compliance status updated.");
      await loadComplianceRecords();
      await refreshComplianceCounters(currentUserProfile.role);
    } catch (error) {
      message.textContent = `Review failed: ${error.message}`;
      message.classList.add("error");
      message.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function bindComplianceModuleEvents() {
  document.querySelector("#newComplianceButton")?.addEventListener("click", () => renderComplianceForm());
  document.querySelector("#downloadComplianceCsv").addEventListener("click", downloadComplianceCsv);
  document.querySelector("#downloadComplianceExcel").addEventListener("click", downloadComplianceExcel);
  document.querySelector("#printComplianceView").addEventListener("click", printComplianceView);
  [
    "#complianceSearch",
    "#filterAssignee",
    "#filterReportType",
    "#filterStatus",
    "#filterComplianceStatus",
    "#filterRole",
    "#filterAssignedGroup",
    "#filterDueDate",
  ].forEach((selector) => document.querySelector(selector).addEventListener("input", applyComplianceFilters));
}

async function handleComplianceAction(event) {
  const submitButton = event.target.closest(".submit-compliance");
  const reviewButton = event.target.closest(".review-compliance");
  const toggleButton = event.target.closest(".toggle-compliance-group");
  const groupRow = event.target.closest(".compliance-group-row");
  const closeButton = event.target.closest("#closeComplianceModal, #cancelComplianceForm");
  const clearAssigneesButton = event.target.closest("#clearAssigneesButton");

  if (toggleButton) {
    const groupId = toggleButton.dataset.groupId;
    if (expandedComplianceGroups.has(groupId)) {
      expandedComplianceGroups.delete(groupId);
    } else {
      expandedComplianceGroups.add(groupId);
    }
    renderComplianceTable();
    return;
  }

  if (groupRow && !event.target.closest("button, a, input, select, textarea")) {
    const groupId = groupRow.dataset.groupId;
    if (groupId) {
      if (expandedComplianceGroups.has(groupId)) {
        expandedComplianceGroups.delete(groupId);
      } else {
        expandedComplianceGroups.add(groupId);
      }
      renderComplianceTable();
      return;
    }
  }

  if (closeButton) {
    closeComplianceModal();
    return;
  }

  if (clearAssigneesButton) {
    document.querySelectorAll('input[name="assignedUsers"]').forEach((input) => {
      input.checked = false;
    });
    const groupSelect = document.querySelector("#assignmentGroupSelect");
    if (groupSelect) groupSelect.value = "";
    return;
  }

  if (submitButton) {
    const record = complianceRecordsCache.find((item) => item.id === submitButton.dataset.id);
    if (record) renderSubmitForm(record);
    return;
  }

  if (reviewButton) {
    const record = complianceRecordsCache.find((item) => item.id === reviewButton.dataset.id);
    if (record) renderReviewForm(record);
    return;
  }
}

function downloadComplianceCsv() {
  const exportData = getComplianceExportData();
  downloadCsvReport({ ...exportData, filename: "report-assignments.csv" });
}

function downloadComplianceExcel() {
  const exportData = getComplianceExportData();
  downloadExcelReport({ ...exportData, filename: "report-assignments.xls" });
}

function getComplianceExportData() {
  const headers = [
    "Title",
    "Report Type",
    "Assigned By",
    "Assigned To",
    "Due Date",
    "Allowed Submission Types",
    "Submitted",
    "Total Assigned",
    "Compliance",
    "Status",
    "Personnel Details",
  ];
  const rows = filteredComplianceGroups.map((group) => [
    group.title,
    formatReportAssignmentType(group.reportType),
    group.assignedByName,
    group.assignedToLabel,
    group.dueDate,
    (group.allowedSubmissionTypes || []).join(" / "),
    group.submitted,
    group.total,
    `${group.percentage}%`,
    group.status,
    group.records.map((record) => `${record.assignedToName || "No assignee"} (${record.assignedToRole || "No role"}): ${record.status || "Not Submitted"}`).join(" / "),
  ]);
  return { reportName: "Report Assignment", headers, rows };
}

function printComplianceView() {
  printCurrentReport("Report Assignment");
}

async function renderLearnerMonitoringModule() {
  els.dashboardTitle.textContent = "Learner Monitoring";
  const canAdd = canCreateLearnerRecord();
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Learner support</p>
        <h2>Learner Monitoring Module</h2>
      </div>
      <div class="toolbar-actions">
        ${canAdd ? `<button id="newLearnerRecordButton" class="primary-button" type="button">Add Record</button>` : ""}
        <button id="downloadLearnerCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadLearnerExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printLearnerView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="learnerAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading learner analytics...</p>
    </section>

    <section class="table-card">
      <div class="filter-grid">
        <label>Search<input id="learnerSearch" type="search" placeholder="Search learners" /></label>
        <label>Grade Level<select id="filterLearnerGrade"></select></label>
        <label>Section<select id="filterLearnerSection"></select></label>
        <label>Concern Type<select id="filterLearnerConcern"></select></label>
        <label>Risk Level<select id="filterLearnerRisk"></select></label>
        <label>Status<select id="filterLearnerStatus"></select></label>
        <label>Intervention<select id="filterLearnerIntervention"></select></label>
      </div>
      <div id="learnerTableHost" class="table-wrap">
        <p class="empty-state">Loading learner monitoring records...</p>
      </div>
    </section>
  `;

  await loadLearnerRecords();
  bindLearnerModuleEvents();
}

async function loadLearnerRecords() {
  learnerRecordsCache = await getVisibleLearnerRecords();
  learnerRecordsCache.sort((a, b) => {
    const first = a.updatedAt?.toMillis?.() || 0;
    const second = b.updatedAt?.toMillis?.() || 0;
    return second - first;
  });
  populateLearnerFilters();
  applyLearnerFilters();
}

function populateLearnerFilters() {
  document.querySelector("#filterLearnerGrade").innerHTML = optionList(uniqueOptions(learnerRecordsCache, "gradeLevel"), "", "All grade levels");
  document.querySelector("#filterLearnerSection").innerHTML = optionList(uniqueOptions(learnerRecordsCache, "section"), "", "All sections");
  document.querySelector("#filterLearnerConcern").innerHTML = optionList(learnerConcernTypes, "", "All concern types");
  document.querySelector("#filterLearnerRisk").innerHTML = optionList(learnerRiskLevels, "", "All risk levels");
  document.querySelector("#filterLearnerStatus").innerHTML = optionList(learnerStatuses, "", "All statuses");
  document.querySelector("#filterLearnerIntervention").innerHTML = optionList(learnerInterventionStatuses, "", "All intervention statuses");
}

function applyLearnerFilters() {
  const search = document.querySelector("#learnerSearch").value.trim().toLowerCase();
  const gradeLevel = document.querySelector("#filterLearnerGrade").value;
  const section = document.querySelector("#filterLearnerSection").value;
  const concernType = document.querySelector("#filterLearnerConcern").value;
  const riskLevel = document.querySelector("#filterLearnerRisk").value;
  const status = document.querySelector("#filterLearnerStatus").value;
  const interventionStatus = document.querySelector("#filterLearnerIntervention").value;

  filteredLearnerRecords = learnerRecordsCache.filter((record) => {
    const searchable = [
      record.learnerName,
      record.lrn,
      record.gradeLevel,
      record.section,
      record.adviserName,
      record.concernType,
      record.concernDescription,
      record.riskLevel,
      record.attendanceStatus,
      record.readingLevel,
      record.numeracyLevel,
      record.interventionProvided,
      record.parentCommunicationNotes,
      record.behaviorIncident,
      record.violenceIncident,
      record.incompleteRequirements,
      record.healthWelfareConcern,
      record.dropoutRisk,
      record.transferConcern,
      record.status,
      record.remarks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!gradeLevel || record.gradeLevel === gradeLevel) &&
      (!section || record.section === section) &&
      (!concernType || record.concernType === concernType) &&
      (!riskLevel || record.riskLevel === riskLevel) &&
      (!status || record.status === status) &&
      (!interventionStatus || record.interventionStatus === interventionStatus)
    );
  });

  renderLearnerAnalytics();
  renderLearnerTable();
}

function renderLearnerAnalytics() {
  const chartHost = document.querySelector("#learnerAnalytics");
  if (!chartHost) return;
  const records = filteredLearnerRecords;
  const highRisk = records.filter((record) => record.riskLevel === "High Risk");
  const moderateRisk = records.filter((record) => record.riskLevel === "Needs Monitoring");
  const lowRisk = records.filter((record) => record.riskLevel === "Stable");
  const activeInterventions = records.filter((record) => ["Not Started", "Ongoing", "Referred", "Unresolved"].includes(record.interventionStatus));
  const resolvedCases = records.filter((record) => ["Resolved", "Closed"].includes(record.status) || record.interventionStatus === "Resolved");
  const concernRows = groupCountRows(records, "concernType").slice(0, 8);
  const sectionRows = groupCountRows(records, (record) => [record.gradeLevel, record.section].filter(Boolean).join(" "));
  const monthlyRows = groupCountRows(records, (record) => analyticsMonthKey(analyticsDateValue(record, ["createdAt", "updatedAt", "interventionDate"])), "No date")
    .filter(([label]) => label !== "No date")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const trend = compareLatestTwo(monthlyRows);
  const urgent = records
    .map((record) => ({
      record,
      score:
        (record.riskLevel === "High Risk" ? 4 : record.riskLevel === "Needs Monitoring" ? 2 : 0)
        + (["Not Started", "Unresolved", "Ongoing"].includes(record.interventionStatus) ? 2 : 0)
        + (["For Intervention", "Under Intervention", "Active Monitoring"].includes(record.status) ? 1 : 0)
        + (record.attendanceStatus || record.concernType === "Attendance" ? 1 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.record.learnerName || "").localeCompare(b.record.learnerName || ""))
    .slice(0, 10);
  const insights = [
    sectionRows[0] ? `${sectionRows[0][0]} has the highest number of at-risk learners.` : "",
    concernRows[0] ? `${concernRows[0][0]} is the most common concern.` : "",
    trend.change > 0 ? `Risk cases increased by ${trend.change} this month.` : trend.change < 0 ? `Risk cases decreased by ${Math.abs(trend.change)} this month.` : "",
    highRisk.length ? `${highRisk.length} high-risk learner${highRisk.length === 1 ? "" : "s"} need close monitoring.` : "",
  ];

  chartHost.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total At-Risk Learners", String(records.length), "Within current filters"],
      ["High Risk Learners", String(highRisk.length), "Immediate attention"],
      ["Moderate Risk Learners", String(moderateRisk.length), "Needs monitoring"],
      ["Low Risk Learners", String(lowRisk.length), "Stable risk level"],
      ["Active Interventions", String(activeInterventions.length), "Not yet resolved"],
      ["Resolved Cases", String(resolvedCases.length), "Resolved or closed"],
    ])}
    <div class="chart-grid analytics-wide-grid">
      ${renderAnalyticsPieChart("Risk Level Distribution", learnerRiskLevels.map((level) => [level, records.filter((record) => record.riskLevel === level).length]))}
      ${renderSummaryChart("Top Concern Types", concernRows)}
      ${renderVerticalBarChart("Monthly At-Risk Trend", monthlyRows)}
      ${renderSummaryChart("Strand/Section Risk Comparison", sectionRows.slice(0, 8))}
      ${renderInsightPanel("Smart Learner Insights", insights)}
      ${renderUrgentLearnerList(urgent)}
    </div>
  `;
}

function renderUrgentLearnerList(items = []) {
  return `
    <article class="chart-card urgent-list-card">
      <h3>Urgent Intervention List</h3>
      ${items.length ? `
        <div class="urgent-list">
          ${items.map(({ record, score }) => `
            <div>
              <strong>${escapeHtml(record.learnerName || "No learner name")}</strong>
              <span class="badge risk-${statusClass(record.riskLevel)}">${escapeHtml(record.riskLevel || "Stable")}</span>
              <small>${escapeHtml([record.gradeLevel, record.section, record.concernType].filter(Boolean).join(" | "))}</small>
              <small>${escapeHtml(record.interventionStatus || "No intervention status")} | Priority ${score}</small>
            </div>
          `).join("")}
        </div>
      ` : `<p class="empty-state">No urgent learners in the current view.</p>`}
    </article>
  `;
}

function renderDistributionChart(title, labels, field) {
  const chartLabels = labels.length ? labels : ["No data"];
  const counts = chartLabels.map((label) => filteredLearnerRecords.filter((record) => record[field] === label).length);
  const max = Math.max(...counts, 1);

  return `
    <article class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${chartLabels
          .map((label, index) => {
            const count = counts[index];
            return `
              <div class="chart-row">
                <span>${escapeHtml(label)}</span>
                <div class="chart-track"><i style="width: ${(count / max) * 100}%"></i></div>
                <strong>${count}</strong>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderLearnerTable() {
  const tableHost = document.querySelector("#learnerTableHost");
  if (!filteredLearnerRecords.length) {
    tableHost.innerHTML = `<p class="empty-state">No learner monitoring records match the current view.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table class="learner-table">
      <thead>
        <tr>
          <th>Learner</th>
          <th>Section</th>
          <th>Concern</th>
          <th>Risk</th>
          <th>Intervention</th>
          <th>Status</th>
          <th>Updated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredLearnerRecords.map(renderLearnerRow).join("")}
      </tbody>
    </table>
  `;
}

function renderLearnerRow(record) {
  const canEdit = canEditLearnerRecord(record);
  const canIntervene = canUpdateLearnerIntervention(record);

  return `
    <tr>
      <td>
        <strong>${escapeHtml(record.learnerName || "No learner name")}</strong>
        <small class="row-note">LRN: ${escapeHtml(record.lrn || "Not recorded")}</small>
      </td>
      <td>
        ${escapeHtml([record.gradeLevel || "No grade", record.section || "No section"].join(" - "))}
        <small class="row-note">Adviser: ${escapeHtml(record.adviserName || "Not recorded")}</small>
      </td>
      <td>
        ${escapeHtml(record.concernType || "No concern")}
        <small class="row-note">${escapeHtml(record.concernDescription || "No description")}</small>
      </td>
      <td><span class="badge risk-${statusClass(record.riskLevel)}">${escapeHtml(record.riskLevel || "Stable")}</span></td>
      <td>
        <span class="badge intervention-${statusClass(record.interventionStatus)}">${escapeHtml(record.interventionStatus || "Not Started")}</span>
        <small class="row-note">${escapeHtml(record.interventionProvided || "No intervention recorded")}</small>
      </td>
      <td><span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "Active Monitoring")}</span></td>
      <td>${escapeHtml(formatDate(record.updatedAt || record.createdAt))}</td>
      <td>
        <div class="row-actions">
          ${canEdit ? `<button class="secondary-button edit-learner" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canIntervene ? `<button class="secondary-button update-learner-intervention" type="button" data-id="${escapeHtml(record.id)}">Intervention</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function yesNoOptions(selected = "") {
  return optionList(["No", "Yes"], selected, "Select");
}

async function renderLearnerForm(record = null) {
  closeLearnerModal();
  editingLearnerId = record?.id || null;
  const isEditing = Boolean(record);
  [classRecordsCache, studentRecordsCache] = await Promise.all([
    getVisibleClasses(),
    getVisibleStudents(),
  ]);
  const selectedGradeLevel = record?.gradeLevel || classRecordsCache.find((section) => section.status !== "archived")?.gradeLevel || "";
  const selectedSection = findLearnerSectionForRecord(record, selectedGradeLevel);
  const selectedStudent = findLearnerStudentForRecord(record, selectedSection?.id || "");

  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="learnerModal" class="modal-backdrop">
        <form id="learnerForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Learner monitoring</p>
              <h2>${isEditing ? "Edit Record" : "Add Record"}</h2>
            </div>
            <button id="closeLearnerModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <input id="learnerAdviserUid" type="hidden" value="${escapeHtml(record?.adviserUid || auth.currentUser.uid)}" />

          <div class="form-grid learner-form-grid">
            <label>Grade Level<select id="learnerGradeLevel" required>${learnerGradeOptions(selectedGradeLevel)}</select></label>
            <label>Section<select id="learnerSectionId" required>${learnerSectionOptions(selectedGradeLevel, selectedSection?.id || "")}</select></label>
            <label>Student<select id="learnerStudentId" required>${learnerStudentOptions(selectedSection?.id || "", selectedStudent?.id || "")}</select></label>
            <label>LRN<input id="learnerLrn" value="${escapeHtml(selectedStudent?.lrn || record?.lrn || "")}" readonly required /></label>
            <label>Learner Name<input id="learnerName" value="${escapeHtml(studentFullName(selectedStudent) || record?.learnerName || "")}" readonly required /></label>
            <label>Adviser Name<input id="learnerAdviserName" value="${escapeHtml(selectedSection?.adviserName || record?.adviserName || currentUserProfile.fullName || "")}" readonly required /></label>
            <label>Concern Type<select id="learnerConcernType" required>${optionList(learnerConcernTypes, record?.concernType || "", "Select concern")}</select></label>
            <label>Risk Level<select id="learnerRiskLevel" required>${optionList(learnerRiskLevels, record?.riskLevel || "Needs Monitoring", "Select risk")}</select></label>
            <label>Status<select id="learnerStatus" required>${optionList(learnerStatuses, record?.status || "Active Monitoring", "Select status")}</select></label>
          </div>

          <label class="modal-field">Concern Description<textarea id="learnerConcernDescription" rows="3">${escapeHtml(record?.concernDescription || "")}</textarea></label>
          <label class="modal-field">Remarks<textarea id="learnerRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>

          <div id="learnerFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelLearnerForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">${isEditing ? "Save Changes" : "Add Record"}</button>
          </div>
        </form>
      </div>
    `
  );
  updateLearnerStudentFields();
}

function studentFullName(student = null) {
  if (!student) return "";
  return [student.lastName, student.firstName, student.middleName].filter(Boolean).join(", ");
}

function learnerGradeOptions(selected = "") {
  return optionList(uniqueOptions(classRecordsCache.filter((section) => section.status !== "archived"), "gradeLevel"), selected, "Select grade level");
}

function learnerSectionOptions(gradeLevel = "", selected = "") {
  const options = classRecordsCache
    .filter((section) => section.status !== "archived" && (!gradeLevel || section.gradeLevel === gradeLevel))
    .map((section) => `<option value="${escapeHtml(section.id)}" ${section.id === selected ? "selected" : ""}>${escapeHtml(section.sectionName || classLabel(section))}</option>`)
    .join("");
  return `<option value="">Select section</option>${options}`;
}

function learnerStudentOptions(sectionId = "", selected = "") {
  const options = sortStudentsSf1Order(studentRecordsCache.filter((student) =>
    student.sectionId === sectionId && isEnrolledStudentStatus(student.status)
  ))
    .map((student) => `<option value="${escapeHtml(student.id)}" ${student.id === selected ? "selected" : ""}>${escapeHtml(studentFullName(student) || student.lrn)}${student.lrn ? ` - ${escapeHtml(student.lrn)}` : ""}</option>`)
    .join("");
  return `<option value="">Select student</option>${options}`;
}

function findLearnerSectionForRecord(record = null, gradeLevel = "") {
  if (!record) return null;
  return classRecordsCache.find((section) =>
    section.id === record.sectionId ||
    (
      (!gradeLevel || section.gradeLevel === gradeLevel) &&
      [section.sectionName, classLabel(section)].includes(record.section)
    )
  ) || null;
}

function findLearnerStudentForRecord(record = null, sectionId = "") {
  if (!record) return null;
  return studentRecordsCache.find((student) =>
    student.id === record.studentId ||
    (record.lrn && student.lrn === record.lrn) ||
    (sectionId && student.sectionId === sectionId && studentFullName(student) === record.learnerName)
  ) || null;
}

function updateLearnerStudentFields() {
  const gradeSelect = document.querySelector("#learnerGradeLevel");
  const sectionSelect = document.querySelector("#learnerSectionId");
  const studentSelect = document.querySelector("#learnerStudentId");
  if (!gradeSelect || !sectionSelect || !studentSelect) return;

  const section = getSelectedClass(sectionSelect.value);
  const student = studentRecordsCache.find((record) => record.id === studentSelect.value);
  document.querySelector("#learnerName").value = studentFullName(student);
  document.querySelector("#learnerLrn").value = student?.lrn || "";
  document.querySelector("#learnerAdviserUid").value = section?.adviserId || auth.currentUser.uid;
  document.querySelector("#learnerAdviserName").value = section?.adviserName || currentUserProfile.fullName || "";
}

function learnerFieldValue(id, fallback = "") {
  return document.querySelector(`#${id}`)?.value?.trim?.() ?? fallback;
}

function learnerConcernDetail(concernType, description, targetConcern) {
  return concernType === targetConcern ? description : "";
}

function getLearnerFormData() {
  const section = getSelectedClass(document.querySelector("#learnerSectionId").value);
  const student = studentRecordsCache.find((record) => record.id === document.querySelector("#learnerStudentId").value);
  const existing = learnerRecordsCache.find((record) => record.id === editingLearnerId) || {};
  const concernType = document.querySelector("#learnerConcernType").value;
  const concernDescription = document.querySelector("#learnerConcernDescription").value.trim();
  return {
    learnerName: studentFullName(student) || document.querySelector("#learnerName").value.trim(),
    lrn: student?.lrn || document.querySelector("#learnerLrn").value.trim(),
    gradeLevel: section?.gradeLevel || document.querySelector("#learnerGradeLevel").value,
    section: section ? (section.sectionName || classLabel(section)) : "",
    adviserUid: section?.adviserId || document.querySelector("#learnerAdviserUid").value,
    adviserName: section?.adviserName || document.querySelector("#learnerAdviserName").value.trim() || currentUserProfile.fullName || auth.currentUser.email,
    concernType,
    concernDescription,
    riskLevel: document.querySelector("#learnerRiskLevel").value,
    attendanceStatus: learnerConcernDetail(concernType, concernDescription, "Attendance") || existing.attendanceStatus || "",
    readingLevel: learnerConcernDetail(concernType, concernDescription, "Reading") || existing.readingLevel || "",
    numeracyLevel: learnerConcernDetail(concernType, concernDescription, "Numeracy") || existing.numeracyLevel || "",
    interventionProvided: learnerFieldValue("learnerInterventionProvided", existing.interventionProvided || ""),
    interventionDate: document.querySelector("#learnerInterventionDate")?.value || existing.interventionDate || "",
    interventionStatus: document.querySelector("#learnerInterventionStatus")?.value || existing.interventionStatus || "Not Started",
    parentContacted: document.querySelector("#learnerParentContacted")?.value || existing.parentContacted || "No",
    parentCommunicationNotes: learnerConcernDetail(concernType, concernDescription, "Parent Communication") || existing.parentCommunicationNotes || "",
    homeVisitationConducted: document.querySelector("#learnerHomeVisitationConducted")?.value || existing.homeVisitationConducted || "No",
    homeVisitationDate: document.querySelector("#learnerHomeVisitationDate")?.value || existing.homeVisitationDate || "",
    behaviorIncident: learnerConcernDetail(concernType, concernDescription, "Behavior") || existing.behaviorIncident || "",
    violenceIncident: learnerConcernDetail(concernType, concernDescription, "Violence Incident") || existing.violenceIncident || "",
    incompleteRequirements: learnerConcernDetail(concernType, concernDescription, "Incomplete Requirements") || existing.incompleteRequirements || "",
    healthWelfareConcern: learnerConcernDetail(concernType, concernDescription, "Health/Welfare") || existing.healthWelfareConcern || "",
    dropoutRisk: concernType === "Dropout Risk" ? "Yes" : "No",
    transferConcern: concernType === "Transfer Concern" ? "Yes" : "No",
    status: document.querySelector("#learnerStatus").value,
    remarks: document.querySelector("#learnerRemarks").value.trim(),
  };
}

async function handleLearnerFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#learnerFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const wasEditing = Boolean(editingLearnerId);
  submitButton.disabled = true;

  try {
    const data = getLearnerFormData();
    if (!data.gradeLevel || !data.section || !data.learnerName) {
      throw new Error("Select a grade level, section, and student.");
    }
    requireValidLrn(data.lrn);
    if (editingLearnerId) {
      await updateLearnerMonitoringRecord(editingLearnerId, data);
    } else {
      const docRef = await createLearnerMonitoringRecord(data);
      if (data.riskLevel === "High Risk" || data.status === "For Intervention" || data.dropoutRisk === "Yes") {
        await createRoleNotification("Principal", {
          notificationType: "learner_risk_added",
          title: "Learner risk case added",
          message: `${currentUserProfile.fullName} added ${data.learnerName} for ${data.concernType}.`,
          relatedModule: "Learner Monitoring",
          relatedRecordId: docRef.id,
          actionUrl: "#Learner Monitoring",
        });
      }
      await createRoleNotifications(["Master Teacher", "Head Teacher"], {
        notificationType: "learner_risk_added",
        title: "Learner monitoring update",
        message: `${currentUserProfile.fullName} added ${data.learnerName} for ${data.concernType}.`,
        relatedModule: "Learner Monitoring",
        relatedRecordId: docRef.id,
        actionUrl: "#Learner Monitoring",
      });
    }

    closeLearnerModal();
    showDashboardMessage(wasEditing ? "Learner monitoring record updated." : "Learner monitoring record added.");
    await loadLearnerRecords();
    await refreshLearnerCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function renderLearnerInterventionForm(record) {
  closeLearnerModal();
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="learnerModal" class="modal-backdrop">
        <form id="learnerInterventionForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Intervention update</p>
              <h2>${escapeHtml(record.learnerName || "Learner")}</h2>
            </div>
            <button id="closeLearnerModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <label>Intervention Provided<input id="updateInterventionProvided" value="${escapeHtml(record.interventionProvided || "")}" /></label>
          <label>Intervention Date<input id="updateInterventionDate" type="date" value="${escapeHtml(record.interventionDate || "")}" /></label>
          <label>Intervention Status<select id="updateInterventionStatus" required>${optionList(learnerInterventionStatuses, record.interventionStatus || "Not Started", "Select status")}</select></label>
          <label>General Status<select id="updateLearnerStatus" required>${optionList(learnerStatuses, record.status || "Active Monitoring", "Select status")}</select></label>
          <label>Remarks<textarea id="updateLearnerRemarks" rows="4">${escapeHtml(record.remarks || "")}</textarea></label>
          <div id="learnerFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelLearnerForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Save Update</button>
          </div>
        </form>
      </div>
    `
  );

  document.querySelector("#learnerInterventionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#learnerFormMessage");
    const submitButton = event.target.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      await updateLearnerIntervention(record.id, {
        interventionProvided: document.querySelector("#updateInterventionProvided").value.trim(),
        interventionDate: document.querySelector("#updateInterventionDate").value,
        interventionStatus: document.querySelector("#updateInterventionStatus").value,
        status: document.querySelector("#updateLearnerStatus").value,
        remarks: document.querySelector("#updateLearnerRemarks").value.trim(),
      });
      await createRoleNotifications(["Principal", "Master Teacher", "Head Teacher"], {
        notificationType: "learner_intervention_updated",
        title: "Intervention updated",
        message: `${currentUserProfile.fullName} updated intervention notes for ${record.learnerName}.`,
        relatedModule: "Learner Monitoring",
        relatedRecordId: record.id,
        actionUrl: "#Learner Monitoring",
      });
      closeLearnerModal();
      showDashboardMessage("Intervention update saved.");
      await loadLearnerRecords();
      await refreshLearnerCounters(currentUserProfile.role);
    } catch (error) {
      message.textContent = `Update failed: ${error.message}`;
      message.classList.add("error");
      message.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function closeLearnerModal() {
  document.querySelector("#learnerModal")?.remove();
  editingLearnerId = null;
}

function bindLearnerModuleEvents() {
  document.querySelector("#newLearnerRecordButton")?.addEventListener("click", () => renderLearnerForm());
  document.querySelector("#downloadLearnerCsv").addEventListener("click", downloadLearnerCsv);
  document.querySelector("#downloadLearnerExcel").addEventListener("click", downloadLearnerExcel);
  document.querySelector("#printLearnerView").addEventListener("click", () => printCurrentReport("Learner Monitoring"));
  [
    "#learnerSearch",
    "#filterLearnerGrade",
    "#filterLearnerSection",
    "#filterLearnerConcern",
    "#filterLearnerRisk",
    "#filterLearnerStatus",
    "#filterLearnerIntervention",
  ].forEach((selector) => document.querySelector(selector).addEventListener("input", applyLearnerFilters));
}

async function handleLearnerAction(event) {
  const editButton = event.target.closest(".edit-learner");
  const interventionButton = event.target.closest(".update-learner-intervention");
  const closeButton = event.target.closest("#closeLearnerModal, #cancelLearnerForm");

  if (closeButton) {
    closeLearnerModal();
    return;
  }

  if (editButton) {
    const record = learnerRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) await renderLearnerForm(record);
    return;
  }

  if (interventionButton) {
    const record = learnerRecordsCache.find((item) => item.id === interventionButton.dataset.id);
    if (record) renderLearnerInterventionForm(record);
  }
}

function downloadLearnerCsv() {
  const exportData = getLearnerExportData();
  downloadCsvReport({ ...exportData, filename: "learner-monitoring.csv" });
}

function downloadLearnerExcel() {
  const exportData = getLearnerExportData();
  downloadExcelReport({ ...exportData, filename: "learner-monitoring.xls" });
}

function getLearnerExportData() {
  const headers = [
    "Learner Name",
    "LRN",
    "Grade Level",
    "Section",
    "Adviser",
    "Concern Type",
    "Risk Level",
    "Intervention Status",
    "Status",
    "Parent Contacted",
    "Home Visitation",
    "Dropout Risk",
    "Transfer Concern",
    "Remarks",
    "Created By",
    "Updated At",
  ];
  const rows = filteredLearnerRecords.map((record) => [
    record.learnerName,
    record.lrn,
    record.gradeLevel,
    record.section,
    record.adviserName,
    record.concernType,
    record.riskLevel,
    record.interventionStatus,
    record.status,
    record.parentContacted,
    record.homeVisitationConducted,
    record.dropoutRisk,
    record.transferConcern,
    record.remarks,
    record.createdByName,
    formatDate(record.updatedAt),
  ]);
  return { reportName: "Learner Monitoring", headers, rows };
}

async function renderClassroomObservationModule() {
  els.dashboardTitle.textContent = "Classroom Observation";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Instructional supervision</p>
        <h2>Classroom Observation Scheduling Module</h2>
      </div>
      <div class="toolbar-actions">
        ${canCreateObservation() ? `<button id="newObservationButton" class="primary-button" type="button">Create Schedule</button>` : ""}
        <button id="downloadObservationCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadObservationExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printObservationView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="observationAnalytics" class="chart-grid">
      <p class="empty-state">Loading observation analytics...</p>
    </section>

    <section class="table-card">
      <div class="filter-grid">
        <label>Search<input id="observationSearch" type="search" placeholder="Search observations" /></label>
        <label>Observed Personnel<select id="filterObservationTeacher"></select></label>
        <label>Observer<select id="filterObservationObserver"></select></label>
        <label>Grade Level<select id="filterObservationGrade"></select></label>
        <label>Section<select id="filterObservationSection"></select></label>
        <label>Date<input id="filterObservationDate" type="date" /></label>
        <label>Status<select id="filterObservationStatus"></select></label>
      </div>
      <div id="observationTableHost" class="table-wrap">
        <p class="empty-state">Loading classroom observations...</p>
      </div>
    </section>
  `;

  await loadObservationRecords();
  bindObservationModuleEvents();
}

async function loadObservationRecords() {
  observationRecordsCache = await getVisibleClassroomObservations();
  observationRecordsCache.sort((a, b) => {
    const first = a.observationDate || "";
    const second = b.observationDate || "";
    return second.localeCompare(first);
  });
  populateObservationFilters();
  applyObservationFilters();
}

function populateObservationFilters() {
  document.querySelector("#filterObservationTeacher").innerHTML = optionList(uniqueOptions(observationRecordsCache, "teacherName"), "", "All teachers");
  document.querySelector("#filterObservationObserver").innerHTML = optionList(uniqueOptions(observationRecordsCache, "observerName"), "", "All observers");
  document.querySelector("#filterObservationGrade").innerHTML = optionList(uniqueOptions(observationRecordsCache, "gradeLevel"), "", "All grade levels");
  document.querySelector("#filterObservationSection").innerHTML = optionList(uniqueOptions(observationRecordsCache, "section"), "", "All sections");
  document.querySelector("#filterObservationStatus").innerHTML = optionList(observationStatuses, "", "All statuses");
}

function applyObservationFilters() {
  const search = document.querySelector("#observationSearch").value.trim().toLowerCase();
  const teacher = document.querySelector("#filterObservationTeacher").value;
  const observer = document.querySelector("#filterObservationObserver").value;
  const gradeLevel = document.querySelector("#filterObservationGrade").value;
  const section = document.querySelector("#filterObservationSection").value;
  const date = document.querySelector("#filterObservationDate").value;
  const status = document.querySelector("#filterObservationStatus").value;

  filteredObservationRecords = observationRecordsCache.filter((record) => {
    const searchable = [
      record.teacherName,
      record.observerName,
      record.observerRole,
      record.subject,
      record.gradeLevel,
      record.section,
      subjectGradeSectionClassLabel({
        subjectName: record.subject,
        gradeLevel: record.gradeLevel,
        sectionName: record.section,
      }),
      record.observationType,
      record.status,
      record.preObservationNotes,
      record.postObservationNotes,
      record.remarks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!teacher || record.teacherName === teacher) &&
      (!observer || record.observerName === observer) &&
      (!gradeLevel || record.gradeLevel === gradeLevel) &&
      (!section || record.section === section) &&
      (!date || record.observationDate === date) &&
      (!status || record.status === status)
    );
  });

  renderObservationAnalytics();
  renderObservationTable();
}

function renderObservationAnalytics() {
  const chartHost = document.querySelector("#observationAnalytics");
  if (!chartHost) return;
  const months = uniqueOptions(filteredObservationRecords.map((record) => ({
    month: record.observationDate ? record.observationDate.slice(0, 7) : "",
  })), "month");
  const completedVsScheduled = ["Scheduled", "Completed"];

  chartHost.innerHTML = `
    ${renderObservationDistributionChart("Observation Status Distribution", observationStatuses, "status")}
    ${renderObservationDistributionChart("Observations per Month", months, "month")}
    ${renderObservationDistributionChart("Completed vs Scheduled", completedVsScheduled, "status")}
  `;
}

function renderObservationDistributionChart(title, labels, field) {
  const chartLabels = labels.length ? labels : ["No data"];
  const counts = chartLabels.map((label) =>
    filteredObservationRecords.filter((record) => {
      const value = field === "month" && record.observationDate ? record.observationDate.slice(0, 7) : record[field];
      return value === label;
    }).length
  );
  const max = Math.max(...counts, 1);

  return `
    <article class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${chartLabels
          .map((label, index) => `
            <div class="chart-row">
              <span>${escapeHtml(label)}</span>
              <div class="chart-track"><i style="width: ${(counts[index] / max) * 100}%"></i></div>
              <strong>${counts[index]}</strong>
            </div>
          `)
          .join("")}
      </div>
    </article>
  `;
}

function renderObservationTable() {
  const tableHost = document.querySelector("#observationTableHost");
  if (!filteredObservationRecords.length) {
    tableHost.innerHTML = `<p class="empty-state">No classroom observations match the current view.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table class="observation-table">
      <thead>
        <tr>
          <th>Observed Personnel</th>
          <th>Observer</th>
          <th>Class</th>
          <th>Schedule</th>
          <th>Type</th>
          <th>Status</th>
          <th>Report</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filteredObservationRecords.map(renderObservationRow).join("")}
      </tbody>
    </table>
  `;
}

function renderObservationRow(record) {
  const reportLink = record.observationReportLink
    ? `<a href="${escapeHtml(record.observationReportLink)}" target="_blank" rel="noopener">Open report</a>`
    : `<span class="row-note">No report link</span>`;

  return `
    <tr>
      <td>
        <strong>${escapeHtml(record.teacherName || "No teacher")}</strong>
        <small class="row-note">${escapeHtml(record.subject || "No subject")}</small>
      </td>
      <td>
        ${escapeHtml(record.observerName || "No observer")}
        <small class="row-note">${escapeHtml(record.observerRole || "No role")}</small>
      </td>
      <td>
        ${escapeHtml(subjectGradeSectionClassLabel({
          subjectName: record.subject,
          gradeLevel: record.gradeLevel,
          sectionName: record.section,
        }))}
      </td>
      <td>
        ${escapeHtml(record.observationDate || "No date")}
        <small class="row-note">${escapeHtml(record.observationTime || "No time")}</small>
      </td>
      <td>${escapeHtml(record.observationType || "No type")}</td>
      <td><span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "Scheduled")}</span></td>
      <td>${reportLink}</td>
      <td>
        <div class="row-actions">
          ${canEditObservation(record) ? `<button class="secondary-button edit-observation" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canUpdateObservation(record) ? `<button class="secondary-button update-observation" type="button" data-id="${escapeHtml(record.id)}">Update</button>` : ""}
          ${canAddPreObservationNotes(record) ? `<button class="secondary-button pre-observation" type="button" data-id="${escapeHtml(record.id)}">Pre-Notes</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

async function renderObservationForm(record = null) {
  closeObservationModal();
  editingObservationId = record?.id || null;
  const isEditing = Boolean(record);
  observationTeachersCache = await getObservationTeacherOptions();
  const selectedTeacherUid = record?.teacherUid || "";

  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="observationModal" class="modal-backdrop">
        <form id="observationForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Classroom observation</p>
              <h2>${isEditing ? "Edit Schedule" : "Create Schedule"}</h2>
            </div>
            <button id="closeObservationModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <input id="observationObserverUid" type="hidden" value="${escapeHtml(record?.observerUid || auth.currentUser.uid)}" />
          <input id="observationObserverName" type="hidden" value="${escapeHtml(record?.observerName || currentUserProfile.fullName)}" />
          <input id="observationObserverRole" type="hidden" value="${escapeHtml(record?.observerRole || currentUserProfile.role)}" />
          <div class="form-grid learner-form-grid">
            <label>Observed Personnel<select id="observationTeacherUid" required>${optionList(observationTeachersCache.map(observationTeacherUid), selectedTeacherUid, "Select personnel")}</select></label>
            <label>Subject<input id="observationSubject" value="${escapeHtml(record?.subject || "")}" required /></label>
            <label>Grade Level<input id="observationGradeLevel" value="${escapeHtml(record?.gradeLevel || "")}" required /></label>
            <label>Section<input id="observationSection" value="${escapeHtml(record?.section || "")}" required /></label>
            <label>Date<input id="observationDate" type="date" value="${escapeHtml(record?.observationDate || "")}" required /></label>
            <label>Time<input id="observationTime" type="time" value="${escapeHtml(record?.observationTime || "")}" required /></label>
            <label>Observation Type<select id="observationType" required>${optionList(observationTypes, record?.observationType || "", "Select type")}</select></label>
            <label>Status<select id="observationStatus" required>${optionList(observationStatuses, record?.status || "Scheduled", "Select status")}</select></label>
          </div>
          <label class="modal-field">Pre-Observation Notes<textarea id="observationPreNotes" rows="3">${escapeHtml(record?.preObservationNotes || "")}</textarea></label>
          <label class="modal-field">Post-Observation Notes<textarea id="observationPostNotes" rows="3">${escapeHtml(record?.postObservationNotes || "")}</textarea></label>
          <label class="modal-field">Observation Report Link<input id="observationReportLink" type="url" value="${escapeHtml(record?.observationReportLink || "")}" placeholder="https://..." /></label>
          <label class="modal-field">Remarks<textarea id="observationRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
          <div id="observationFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelObservationForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">${isEditing ? "Save Changes" : "Create Schedule"}</button>
          </div>
        </form>
      </div>
    `
  );

  refreshObservationTeacherSelectLabels();
}

function refreshObservationTeacherSelectLabels() {
  const select = document.querySelector("#observationTeacherUid");
  if (!select) return;
  [...select.options].forEach((option) => {
    const teacher = observationTeachersCache.find((item) => observationTeacherUid(item) === option.value);
    if (teacher) option.textContent = `${teacher.fullName || teacher.email || observationTeacherUid(teacher)} (${teacher.role || "Teacher"})`;
  });
}

function observationTeacherUid(teacher = {}) {
  return teacher.uid || teacher.id || "";
}

function getObservationFormData() {
  const teacherUid = document.querySelector("#observationTeacherUid").value;
  const teacher = observationTeachersCache.find((item) => observationTeacherUid(item) === teacherUid);
  return {
    teacherUid,
    teacherName: teacher?.fullName || teacher?.email || "",
    teacherRole: teacher?.role || "Teacher",
    observerUid: document.querySelector("#observationObserverUid").value,
    observerName: document.querySelector("#observationObserverName").value,
    observerRole: document.querySelector("#observationObserverRole").value,
    subject: document.querySelector("#observationSubject").value.trim(),
    gradeLevel: document.querySelector("#observationGradeLevel").value.trim(),
    section: document.querySelector("#observationSection").value.trim(),
    observationDate: document.querySelector("#observationDate").value,
    observationTime: document.querySelector("#observationTime").value,
    observationType: document.querySelector("#observationType").value,
    status: document.querySelector("#observationStatus").value,
    preObservationNotes: document.querySelector("#observationPreNotes").value.trim(),
    postObservationNotes: document.querySelector("#observationPostNotes").value.trim(),
    observationReportLink: document.querySelector("#observationReportLink").value.trim(),
    remarks: document.querySelector("#observationRemarks").value.trim(),
  };
}

async function handleObservationFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#observationFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const wasEditing = Boolean(editingObservationId);
  submitButton.disabled = true;

  try {
    const data = getObservationFormData();
    if (!data.teacherName) throw new Error("Select a teacher.");
    if (data.observationReportLink && !isValidUrl(data.observationReportLink)) {
      throw new Error("Enter a valid http or https observation report link.");
    }
    const { teacherRole, ...observationData } = data;
    if (editingObservationId) {
      await updateClassroomObservation(editingObservationId, observationData);
    } else {
      const docRef = await createClassroomObservation(observationData);
      await createDirectNotification({
        uid: data.teacherUid,
        fullName: data.teacherName,
        role: teacherRole,
      }, {
        notificationType: "observation_scheduled",
        title: "Observation scheduled",
        message: `${currentUserProfile.fullName} scheduled ${subjectGradeSectionClassLabel(data)} on ${data.observationDate}.`,
        relatedModule: "Classroom Observation",
        relatedRecordId: docRef.id,
        actionUrl: "#Classroom Observation",
      });
      await createRoleNotifications(["Master Teacher", "Head Teacher"], {
        notificationType: "observation_scheduled",
        title: "Observation scheduled",
        message: `${data.teacherName} has a ${data.observationType} schedule.`,
        relatedModule: "Classroom Observation",
        relatedRecordId: docRef.id,
        actionUrl: "#Classroom Observation",
      });
    }
    closeObservationModal();
    showDashboardMessage(wasEditing ? "Observation schedule updated." : "Observation schedule created.");
    await loadObservationRecords();
    await refreshObservationCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function renderObservationUpdateForm(record) {
  closeObservationModal();
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="observationModal" class="modal-backdrop">
        <form id="observationUpdateForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Observation update</p>
              <h2>${escapeHtml(record.teacherName || "Teacher")}</h2>
            </div>
            <button id="closeObservationModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <label>Status<select id="updateObservationStatus" required>${optionList(observationStatuses, record.status || "Scheduled", "Select status")}</select></label>
          <label>Observation Report Link<input id="updateObservationReportLink" type="url" value="${escapeHtml(record.observationReportLink || "")}" placeholder="https://..." /></label>
          <label>Post-Observation Notes<textarea id="updateObservationPostNotes" rows="4">${escapeHtml(record.postObservationNotes || "")}</textarea></label>
          <label>Remarks<textarea id="updateObservationRemarks" rows="4">${escapeHtml(record.remarks || "")}</textarea></label>
          <div id="observationFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelObservationForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Save Update</button>
          </div>
        </form>
      </div>
    `
  );

  document.querySelector("#observationUpdateForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#observationFormMessage");
    const submitButton = event.target.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      const nextStatus = document.querySelector("#updateObservationStatus").value;
      const observationReportLink = document.querySelector("#updateObservationReportLink").value.trim();
      if (observationReportLink && !isValidUrl(observationReportLink)) {
        throw new Error("Enter a valid http or https observation report link.");
      }
      await updateObservationStatus(record.id, {
        status: nextStatus,
        observationReportLink,
        postObservationNotes: document.querySelector("#updateObservationPostNotes").value.trim(),
        remarks: document.querySelector("#updateObservationRemarks").value.trim(),
      });
      if (nextStatus === "Completed") {
        await createRoleNotification("Principal", {
          notificationType: "observation_completed",
          title: "Observation completed",
          message: `${currentUserProfile.fullName} completed the observation for ${record.teacherName}.`,
          relatedModule: "Classroom Observation",
          relatedRecordId: record.id,
          actionUrl: "#Classroom Observation",
        });
      }
      closeObservationModal();
      showDashboardMessage("Observation updated.");
      await loadObservationRecords();
      await refreshObservationCounters(currentUserProfile.role);
    } catch (error) {
      message.textContent = `Update failed: ${error.message}`;
      message.classList.add("error");
      message.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function renderPreObservationNotesForm(record) {
  closeObservationModal();
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="observationModal" class="modal-backdrop">
        <form id="preObservationForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Pre-observation notes</p>
              <h2>${escapeHtml(record.subject || "Observation")}</h2>
            </div>
            <button id="closeObservationModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <label>Notes<textarea id="teacherPreObservationNotes" rows="5">${escapeHtml(record.preObservationNotes || "")}</textarea></label>
          <div id="observationFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelObservationForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">Save Notes</button>
          </div>
        </form>
      </div>
    `
  );

  document.querySelector("#preObservationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#observationFormMessage");
    const submitButton = event.target.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      await updateObservationPreNotes(record.id, document.querySelector("#teacherPreObservationNotes").value.trim());
      closeObservationModal();
      showDashboardMessage("Pre-observation notes saved.");
      await loadObservationRecords();
    } catch (error) {
      message.textContent = `Save failed: ${error.message}`;
      message.classList.add("error");
      message.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function closeObservationModal() {
  document.querySelector("#observationModal")?.remove();
  editingObservationId = null;
}

function bindObservationModuleEvents() {
  document.querySelector("#newObservationButton")?.addEventListener("click", () => renderObservationForm());
  document.querySelector("#downloadObservationCsv").addEventListener("click", downloadObservationCsv);
  document.querySelector("#downloadObservationExcel").addEventListener("click", downloadObservationExcel);
  document.querySelector("#printObservationView").addEventListener("click", () => printCurrentReport("Classroom Observation"));
  [
    "#observationSearch",
    "#filterObservationTeacher",
    "#filterObservationObserver",
    "#filterObservationGrade",
    "#filterObservationSection",
    "#filterObservationDate",
    "#filterObservationStatus",
  ].forEach((selector) => document.querySelector(selector).addEventListener("input", applyObservationFilters));
}

async function handleObservationAction(event) {
  const editButton = event.target.closest(".edit-observation");
  const updateButton = event.target.closest(".update-observation");
  const preNotesButton = event.target.closest(".pre-observation");
  const closeButton = event.target.closest("#closeObservationModal, #cancelObservationForm");

  if (closeButton) {
    closeObservationModal();
    return;
  }

  if (editButton) {
    const record = observationRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) await renderObservationForm(record);
    return;
  }

  if (updateButton) {
    const record = observationRecordsCache.find((item) => item.id === updateButton.dataset.id);
    if (record) renderObservationUpdateForm(record);
    return;
  }

  if (preNotesButton) {
    const record = observationRecordsCache.find((item) => item.id === preNotesButton.dataset.id);
    if (record) renderPreObservationNotesForm(record);
  }
}

function downloadObservationCsv() {
  const exportData = getObservationExportData();
  downloadCsvReport({ ...exportData, filename: "classroom-observations.csv" });
}

function downloadObservationExcel() {
  const exportData = getObservationExportData();
  downloadExcelReport({ ...exportData, filename: "classroom-observations.xls" });
}

function getObservationExportData() {
  const headers = [
    "Teacher",
    "Observer",
    "Observer Role",
    "Subject",
    "Grade Level",
    "Section",
    "Date",
    "Time",
    "Observation Type",
    "Status",
    "Report Link",
    "Pre Notes",
    "Post Notes",
    "Remarks",
    "Created By",
    "Updated At",
  ];
  const rows = filteredObservationRecords.map((record) => [
    record.teacherName,
    record.observerName,
    record.observerRole,
    record.subject,
    record.gradeLevel,
    record.section,
    record.observationDate,
    record.observationTime,
    record.observationType,
    record.status,
    record.observationReportLink,
    record.preObservationNotes,
    record.postObservationNotes,
    record.remarks,
    record.createdByName,
    formatDate(record.updatedAt),
  ]);
  return { reportName: "Classroom Observation", headers, rows };
}

async function renderEnrollmentModule() {
  els.dashboardTitle.textContent = "Enrollment";
  activeEnrollmentView = "enrollment";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Registrar module</p>
        <h2>Enrollment and Student Registry</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageEnrollmentRecords() ? `<button id="newEnrollmentRecordButton" class="primary-button" type="button">Add Student</button><button id="importStudentsButton" class="secondary-button" type="button">Import SF1 Data</button>` : ""}
        <button id="downloadEnrollmentCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadEnrollmentExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printEnrollmentView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="enrollmentAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading enrollment analytics...</p>
    </section>

    <section class="table-card">
      <div id="enrollmentFilterGrid" class="filter-grid"></div>
      <div id="enrollmentTableHost" class="table-wrap">
        <p class="empty-state">Loading enrollment records...</p>
      </div>
    </section>
  `;

  await loadEnrollmentModuleRecords();
  bindEnrollmentModuleEvents();
}

async function loadEnrollmentModuleRecords() {
  await loadEnrollmentCollections();
  populateEnrollmentFilters();
  applyEnrollmentFilters();
}

function populateEnrollmentFilters() {
  const filterHost = document.querySelector("#enrollmentFilterGrid");
  if (!filterHost) return;
  const records = enrollmentRecordsForView();

  const sharedFilters = `
    <label>Search<input id="enrollmentSearch" type="search" placeholder="Search records" /></label>
    <label>Grade Level<select id="filterEnrollmentGrade">${optionList(uniqueOptions(records, "gradeLevel"), "", "All grade levels")}</select></label>
    <label>Section<select id="filterEnrollmentSection">${optionList(uniqueOptions(records, "sectionName"), "", "All sections")}</select></label>
    <label>Status<select id="filterEnrollmentSpecific">${optionList(studentStatuses, "", "All statuses")}</select></label>
  `;
  filterHost.innerHTML = sharedFilters;
}

function applyEnrollmentFilters() {
  const records = enrollmentRecordsForView();
  const search = document.querySelector("#enrollmentSearch")?.value.trim().toLowerCase() || "";
  const gradeLevel = document.querySelector("#filterEnrollmentGrade")?.value || "";
  const section = document.querySelector("#filterEnrollmentSection")?.value || "";
  const specific = document.querySelector("#filterEnrollmentSpecific")?.value || "";

  filteredEnrollmentModuleRecords = sortStudentsSf1Order(records.filter((record) => {
    const searchable = Object.values(record)
      .filter((value) => typeof value === "string" || typeof value === "number")
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!gradeLevel || record.gradeLevel === gradeLevel) &&
      (!section || record.sectionName === section) &&
      (!specific || normalizeStudentStatus(record.status) === specific)
    );
  }));

  renderEnrollmentAnalytics();
  renderEnrollmentTable();
}

function renderEnrollmentAnalytics() {
  const chartHost = document.querySelector("#enrollmentAnalytics");
  if (!chartHost) return;
  const visibleEnrollment = activeEnrollmentView === "enrollment" ? filteredEnrollmentModuleRecords : enrollmentRecordsCache;
  const male = visibleEnrollment.filter((record) => ["M", "Male"].includes(record.sex)).length;
  const female = visibleEnrollment.filter((record) => ["F", "Female"].includes(record.sex)).length;
  const transferIn = transferRecordsCache.filter((record) => record.transferType === "Transfer In").length;
  const transferOut = transferRecordsCache.filter((record) => record.transferType === "Transfer Out").length;
  const dropouts = dropoutRecordsCache.length + visibleEnrollment.filter((record) => normalizeStudentStatus(record.status) === "Dropout").length;
  const retentionBase = visibleEnrollment.length + dropouts;
  const retentionRate = retentionBase ? ((visibleEnrollment.length / retentionBase) * 100).toFixed(1) : "0.0";
  const strandRows = groupCountRows(visibleEnrollment, (record) => record.strand || record.track || record.sectionName || record.section || record.gradeLevel).slice(0, 8);
  const gradeRows = groupCountRows(visibleEnrollment, "gradeLevel");
  const trendRows = groupCountRows(visibleEnrollment, (record) => analyticsMonthKey(record.enrollmentDate || record.createdAt), "No month")
    .filter(([label]) => label !== "No month")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  chartHost.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total Enrollment", String(visibleEnrollment.length), "Visible enrolled learners"],
      ["Male Learners", String(male), "Current view"],
      ["Female Learners", String(female), "Current view"],
      ["Transfer In", String(transferIn), "Mobility records"],
      ["Transfer Out", String(transferOut), "Mobility records"],
      ["Dropout Count", String(dropouts), "Dropout records/status"],
      ["Retention Rate", `${retentionRate}%`, "Enrollment over enrollment plus dropouts"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderAnalyticsPieChart("Enrollment by Strand/Section", strandRows)}
      ${renderVerticalBarChart("Enrollment Trend", trendRows)}
      ${renderAnalyticsPieChart("Male/Female Distribution", [["Male", male], ["Female", female]])}
      ${renderSummaryChart("Grade Level Comparison", gradeRows)}
      ${renderEnrollmentChart("Student Status Summary", visibleEnrollment.map((record) => ({ ...record, status: normalizeStudentStatus(record.status) })), studentStatuses, "status")}
      ${renderInsightPanel("Enrollment Insights", [
        strandRows[0] ? `${strandRows[0][0]} has the highest enrollment.` : "",
        transferOut > transferIn ? "Transfer out records exceed transfer in records." : "",
        dropouts ? `${dropouts} dropout record${dropouts === 1 ? "" : "s"} need retention review.` : "",
      ])}
    </div>
  `;
}

function renderEnrollmentChart(title, records, labels, field) {
  const chartLabels = labels.length ? labels : ["No data"];
  const counts = chartLabels.map((label) => records.filter((record) => record[field] === label).length);
  const max = Math.max(...counts, 1);
  return `
    <article class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${chartLabels
          .map((label, index) => `
            <div class="chart-row">
              <span>${escapeHtml(label)}</span>
              <div class="chart-track"><i style="width: ${(counts[index] / max) * 100}%"></i></div>
              <strong>${counts[index]}</strong>
            </div>
          `)
          .join("")}
      </div>
    </article>
  `;
}

function renderEnrollmentTable() {
  const tableHost = document.querySelector("#enrollmentTableHost");
  if (!filteredEnrollmentModuleRecords.length) {
    tableHost.innerHTML = `<p class="empty-state">No records match the current view.</p>`;
    return;
  }

  const headers = ["LRN", "Learner", "Sex", "Birth Date / Age", "Class", "Parent / Guardian", "Status", "Action"];

  tableHost.innerHTML = `
    <table class="enrollment-table">
      <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
      <tbody>${filteredEnrollmentModuleRecords.map(renderEnrollmentStudentRow).join("")}</tbody>
    </table>
  `;
}

function renderEnrollmentStudentRow(record) {
  const status = normalizeStudentStatus(record.status);
  return `
    <tr>
      <td>${escapeHtml(record.lrn || "")}</td>
      <td><strong>${escapeHtml([record.lastName, record.firstName, record.middleName].filter(Boolean).join(", ") || "No learner")}</strong><small class="row-note">${escapeHtml(record.learningModality || "")}</small></td>
      <td>${escapeHtml(record.sex || "")}</td>
      <td>${escapeHtml(record.birthDate || "")}<small class="row-note">${escapeHtml(record.ageAsOfFirstFridayJune || "")}</small></td>
      <td>${escapeHtml(record.gradeLevel || "No grade")}<small class="row-note">${escapeHtml(record.sectionName || "No section")} | ${escapeHtml(record.schoolYear || "No school year")}</small></td>
      <td>${escapeHtml(record.fatherName || record.motherName || record.guardianName || "")}<small class="row-note">${escapeHtml(record.contactNumber || "")}</small></td>
      <td><span class="badge status-${statusClass(status)}">${escapeHtml(status)}</span><small class="row-note">${escapeHtml(record.remarks || "")}</small></td>
      <td>${renderEnrollmentActions(record.id)}</td>
    </tr>
  `;
}

function renderTransferRecordRow(record) {
  return `
    <tr>
      <td><strong>${escapeHtml(record.learnerName || "No learner")}</strong><small class="row-note">LRN: ${escapeHtml(record.lrn || "Not recorded")}</small></td>
      <td>${escapeHtml(record.gradeLevel || "No grade")}<small class="row-note">${escapeHtml(record.section || "No section")}</small></td>
      <td><span class="badge status-${statusClass(record.transferType)}">${escapeHtml(record.transferType || "Transfer")}</span></td>
      <td>${escapeHtml(record.transferDate || "No date")}</td>
      <td>From: ${escapeHtml(record.previousSchool || "N/A")}<small class="row-note">To: ${escapeHtml(record.receivingSchool || "N/A")}</small></td>
      <td>${escapeHtml(record.reason || "No reason")}<small class="row-note">${escapeHtml(record.remarks || "No remarks")}</small></td>
      <td>${renderEnrollmentActions(record.id)}</td>
    </tr>
  `;
}

function renderDropoutRecordRow(record) {
  return `
    <tr>
      <td><strong>${escapeHtml(record.learnerName || "No learner")}</strong><small class="row-note">LRN: ${escapeHtml(record.lrn || "Not recorded")}</small></td>
      <td>${escapeHtml(record.gradeLevel || "No grade")}<small class="row-note">${escapeHtml(record.section || "No section")}</small></td>
      <td><span class="badge risk-${statusClass(record.dropoutRiskLevel)}">${escapeHtml(record.dropoutRiskLevel || "Low")}</span></td>
      <td><span class="badge status-${statusClass(record.dropoutStatus)}">${escapeHtml(record.dropoutStatus || "At Risk")}</span><small class="row-note">Last attendance: ${escapeHtml(record.lastAttendanceDate || "Not recorded")}</small></td>
      <td>${escapeHtml(record.interventionConducted || "No intervention")}<small class="row-note">${escapeHtml(record.interventionRemarks || "No intervention remarks")}</small></td>
      <td>${escapeHtml(record.remarks || "No remarks")}</td>
      <td>${renderEnrollmentActions(record.id)}</td>
    </tr>
  `;
}

function renderClassProfileRow(record) {
  return `
    <tr>
      <td>${escapeHtml(record.gradeLevel || "No grade")}<small class="row-note">${escapeHtml(record.section || "No section")}</small></td>
      <td>${escapeHtml(record.adviserName || "No adviser")}</td>
      <td>${escapeHtml(record.totalLearners || 0)}<small class="row-note">Male: ${escapeHtml(record.totalMale || 0)} | Female: ${escapeHtml(record.totalFemale || 0)}</small></td>
      <td>At risk: ${escapeHtml(record.learnersAtRiskCount || 0)}<small class="row-note">Transfers: ${escapeHtml(record.transferredCount || 0)} | Dropouts: ${escapeHtml(record.dropoutCount || 0)}</small></td>
      <td>${escapeHtml(record.schoolYear || "No school year")}</td>
      <td>${escapeHtml(formatDate(record.updatedAt))}</td>
      <td>${renderEnrollmentActions(record.id)}</td>
    </tr>
  `;
}

function renderEnrollmentActions(recordId) {
  return canManageEnrollmentRecords()
    ? `<div class="row-actions"><button class="secondary-button edit-enrollment-record" type="button" data-id="${escapeHtml(recordId)}">Edit</button></div>`
    : `<span class="row-note">Read only</span>`;
}

function renderEnrollmentRecordForm(record = null) {
  closeEnrollmentModal();
  editingEnrollmentRecordId = record?.id || null;
  const viewLabel = enrollmentViews.find((view) => view.id === activeEnrollmentView)?.label || "Record";
  const formBody = {
    enrollment: renderEnrollmentFields(record),
    transfers: renderTransferFields(record),
    dropouts: renderDropoutFields(record),
    profiles: renderClassProfileFields(record),
  }[activeEnrollmentView];

  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="enrollmentModal" class="modal-backdrop">
        <form id="enrollmentRecordForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Enrollment module</p>
              <h2>${record ? "Edit" : "Add"} ${escapeHtml(viewLabel)}</h2>
            </div>
            <button id="closeEnrollmentModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <div class="form-grid learner-form-grid">${formBody}</div>
          <div id="enrollmentFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelEnrollmentForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">${record ? "Save Changes" : "Add Record"}</button>
          </div>
        </form>
      </div>
    `
  );
}

function renderEnrollmentFields(record) {
  return `
    <label>LRN<input id="enrollmentLrn" inputmode="numeric" pattern="[0-9]{12}" maxlength="12" value="${escapeHtml(record?.lrn || "")}" required /></label>
    <label>Learner Name<input id="enrollmentLearnerName" value="${escapeHtml(record?.learnerName || "")}" required /></label>
    <label>Sex<select id="enrollmentSex" required>${optionList(["Male", "Female"], record?.sex || "", "Select sex")}</select></label>
    <label>Grade Level<input id="enrollmentGradeLevel" value="${escapeHtml(record?.gradeLevel || "")}" required /></label>
    <label>Section<input id="enrollmentSection" value="${escapeHtml(record?.section || "")}" required /></label>
    <label>Adviser Name<input id="enrollmentAdviserName" value="${escapeHtml(record?.adviserName || "")}" /></label>
    <label>School Year<input id="enrollmentSchoolYear" value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" required /></label>
    <label>Status<select id="enrollmentStatus" required>${optionList(enrollmentStatuses, record?.enrollmentStatus || "Enrolled", "Select status")}</select></label>
    <label>Enrollment Date<input id="enrollmentDate" type="date" value="${escapeHtml(record?.enrollmentDate || "")}" required /></label>
  `;
}

function renderTransferFields(record) {
  return `
    <label>LRN<input id="transferLrn" inputmode="numeric" pattern="[0-9]{12}" maxlength="12" value="${escapeHtml(record?.lrn || "")}" required /></label>
    <label>Learner Name<input id="transferLearnerName" value="${escapeHtml(record?.learnerName || "")}" required /></label>
    <label>Grade Level<input id="transferGradeLevel" value="${escapeHtml(record?.gradeLevel || "")}" required /></label>
    <label>Section<input id="transferSection" value="${escapeHtml(record?.section || "")}" required /></label>
    <label>Transfer Type<select id="transferType" required>${optionList(transferTypes, record?.transferType || "", "Select type")}</select></label>
    <label>Transfer Date<input id="transferDate" type="date" value="${escapeHtml(record?.transferDate || "")}" required /></label>
    <label>Receiving School<input id="receivingSchool" value="${escapeHtml(record?.receivingSchool || "")}" /></label>
    <label>Previous School<input id="previousSchool" value="${escapeHtml(record?.previousSchool || "")}" /></label>
    <label class="form-field-wide">Reason<textarea id="transferReason" rows="3">${escapeHtml(record?.reason || "")}</textarea></label>
    <label class="form-field-wide">Remarks<textarea id="transferRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
  `;
}

function renderDropoutFields(record) {
  return `
    <label>LRN<input id="dropoutLrn" inputmode="numeric" pattern="[0-9]{12}" maxlength="12" value="${escapeHtml(record?.lrn || "")}" required /></label>
    <label>Learner Name<input id="dropoutLearnerName" value="${escapeHtml(record?.learnerName || "")}" required /></label>
    <label>Grade Level<input id="dropoutGradeLevel" value="${escapeHtml(record?.gradeLevel || "")}" required /></label>
    <label>Section<input id="dropoutSection" value="${escapeHtml(record?.section || "")}" required /></label>
    <label>Last Attendance Date<input id="lastAttendanceDate" type="date" value="${escapeHtml(record?.lastAttendanceDate || "")}" /></label>
    <label>Risk Level<select id="dropoutRiskLevel" required>${optionList(dropoutRiskLevels, record?.dropoutRiskLevel || "Moderate", "Select risk")}</select></label>
    <label>Status<select id="dropoutStatus" required>${optionList(dropoutStatuses, record?.dropoutStatus || "At Risk", "Select status")}</select></label>
    <label>Intervention Conducted<input id="interventionConducted" value="${escapeHtml(record?.interventionConducted || "")}" /></label>
    <label class="form-field-wide">Intervention Remarks<textarea id="interventionRemarks" rows="3">${escapeHtml(record?.interventionRemarks || "")}</textarea></label>
    <label class="form-field-wide">Remarks<textarea id="dropoutRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
  `;
}

function renderClassProfileFields(record) {
  return `
    <label>Grade Level<input id="profileGradeLevel" value="${escapeHtml(record?.gradeLevel || "")}" required /></label>
    <label>Section<input id="profileSection" value="${escapeHtml(record?.section || "")}" required /></label>
    <label>Adviser Name<input id="profileAdviserName" value="${escapeHtml(record?.adviserName || "")}" required /></label>
    <label>Total Male<input id="profileTotalMale" type="number" min="0" value="${escapeHtml(record?.totalMale || 0)}" /></label>
    <label>Total Female<input id="profileTotalFemale" type="number" min="0" value="${escapeHtml(record?.totalFemale || 0)}" /></label>
    <label>Total Learners<input id="profileTotalLearners" type="number" min="0" value="${escapeHtml(record?.totalLearners || 0)}" /></label>
    <label>Learners at Risk<input id="profileLearnersAtRiskCount" type="number" min="0" value="${escapeHtml(record?.learnersAtRiskCount || 0)}" /></label>
    <label>Transferred Count<input id="profileTransferredCount" type="number" min="0" value="${escapeHtml(record?.transferredCount || 0)}" /></label>
    <label>Dropout Count<input id="profileDropoutCount" type="number" min="0" value="${escapeHtml(record?.dropoutCount || 0)}" /></label>
    <label>School Year<input id="profileSchoolYear" value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" required /></label>
  `;
}

function getEnrollmentRecordFormData() {
  if (activeEnrollmentView === "enrollment") {
    return {
      lrn: document.querySelector("#enrollmentLrn").value.trim(),
      learnerName: document.querySelector("#enrollmentLearnerName").value.trim(),
      sex: document.querySelector("#enrollmentSex").value,
      gradeLevel: document.querySelector("#enrollmentGradeLevel").value.trim(),
      section: document.querySelector("#enrollmentSection").value.trim(),
      adviserName: document.querySelector("#enrollmentAdviserName").value.trim(),
      schoolYear: document.querySelector("#enrollmentSchoolYear").value.trim(),
      enrollmentStatus: document.querySelector("#enrollmentStatus").value,
      enrollmentDate: document.querySelector("#enrollmentDate").value,
    };
  }

  if (activeEnrollmentView === "transfers") {
    return {
      lrn: document.querySelector("#transferLrn").value.trim(),
      learnerName: document.querySelector("#transferLearnerName").value.trim(),
      gradeLevel: document.querySelector("#transferGradeLevel").value.trim(),
      section: document.querySelector("#transferSection").value.trim(),
      transferType: document.querySelector("#transferType").value,
      transferDate: document.querySelector("#transferDate").value,
      receivingSchool: document.querySelector("#receivingSchool").value.trim(),
      previousSchool: document.querySelector("#previousSchool").value.trim(),
      reason: document.querySelector("#transferReason").value.trim(),
      remarks: document.querySelector("#transferRemarks").value.trim(),
    };
  }

  if (activeEnrollmentView === "dropouts") {
    return {
      lrn: document.querySelector("#dropoutLrn").value.trim(),
      learnerName: document.querySelector("#dropoutLearnerName").value.trim(),
      gradeLevel: document.querySelector("#dropoutGradeLevel").value.trim(),
      section: document.querySelector("#dropoutSection").value.trim(),
      lastAttendanceDate: document.querySelector("#lastAttendanceDate").value,
      dropoutRiskLevel: document.querySelector("#dropoutRiskLevel").value,
      interventionConducted: document.querySelector("#interventionConducted").value.trim(),
      interventionRemarks: document.querySelector("#interventionRemarks").value.trim(),
      dropoutStatus: document.querySelector("#dropoutStatus").value,
      remarks: document.querySelector("#dropoutRemarks").value.trim(),
    };
  }

  const totalMale = Number(document.querySelector("#profileTotalMale").value || 0);
  const totalFemale = Number(document.querySelector("#profileTotalFemale").value || 0);
  return {
    gradeLevel: document.querySelector("#profileGradeLevel").value.trim(),
    section: document.querySelector("#profileSection").value.trim(),
    adviserName: document.querySelector("#profileAdviserName").value.trim(),
    totalMale,
    totalFemale,
    totalLearners: Number(document.querySelector("#profileTotalLearners").value || totalMale + totalFemale),
    learnersAtRiskCount: Number(document.querySelector("#profileLearnersAtRiskCount").value || 0),
    transferredCount: Number(document.querySelector("#profileTransferredCount").value || 0),
    dropoutCount: Number(document.querySelector("#profileDropoutCount").value || 0),
    schoolYear: document.querySelector("#profileSchoolYear").value.trim(),
  };
}

async function handleEnrollmentRecordFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#enrollmentFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const wasEditing = Boolean(editingEnrollmentRecordId);
  submitButton.disabled = true;

  try {
    const data = getEnrollmentRecordFormData();
    if (["enrollment", "transfers", "dropouts"].includes(activeEnrollmentView)) {
      requireValidLrn(data.lrn);
    }
    if (editingEnrollmentRecordId) {
      await updateEnrollmentModuleRecord(activeEnrollmentView, editingEnrollmentRecordId, data);
      await createRoleNotifications(["Principal", "Registrar"], {
        notificationType: "enrollment_updated",
        title: "Enrollment record updated",
        message: `${currentUserProfile.fullName} updated an enrollment module record.`,
        relatedModule: "Enrollment",
        relatedRecordId: editingEnrollmentRecordId,
        actionUrl: "#Enrollment",
      });
    } else {
      const docRef = await createEnrollmentModuleRecord(activeEnrollmentView, data);
      const notificationConfig = {
        enrollment: {
          type: "enrollment_updated",
          title: "Enrollment record added",
          message: `${currentUserProfile.fullName} added enrollment record for ${data.learnerName}.`,
        },
        transfers: {
          type: "transfer_record_added",
          title: "Transfer record added",
          message: `${currentUserProfile.fullName} added ${data.transferType} for ${data.learnerName}.`,
        },
        dropouts: {
          type: "dropout_record_added",
          title: "Dropout record added",
          message: `${currentUserProfile.fullName} added dropout monitoring for ${data.learnerName}.`,
        },
        profiles: {
          type: "enrollment_updated",
          title: "Class profile updated",
          message: `${currentUserProfile.fullName} added ${data.gradeLevel} - ${data.section} profile.`,
        },
      }[activeEnrollmentView];
      await createRoleNotifications(["Principal", "Registrar"], {
        notificationType: notificationConfig.type,
        title: notificationConfig.title,
        message: notificationConfig.message,
        relatedModule: "Enrollment",
        relatedRecordId: docRef.id,
        actionUrl: "#Enrollment",
      });
    }
    closeEnrollmentModal();
    showDashboardMessage(wasEditing ? "Enrollment record updated." : "Enrollment record added.");
    await loadEnrollmentModuleRecords();
    await refreshEnrollmentCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function closeEnrollmentModal() {
  document.querySelector("#enrollmentModal")?.remove();
  editingEnrollmentRecordId = null;
}

function bindEnrollmentModuleEvents() {
  document.querySelector("#newEnrollmentRecordButton")?.addEventListener("click", () => openStudentForm());
  document.querySelector("#downloadEnrollmentCsv").addEventListener("click", downloadEnrollmentCsv);
  document.querySelector("#downloadEnrollmentExcel").addEventListener("click", downloadEnrollmentExcel);
  document.querySelector("#printEnrollmentView").addEventListener("click", () => printCurrentReport("Enrollment and Student Registry"));
  document.querySelector("#enrollmentFilterGrid").addEventListener("input", applyEnrollmentFilters);
}

async function handleEnrollmentAction(event) {
  const editButton = event.target.closest(".edit-enrollment-record");
  const closeButton = event.target.closest("#closeEnrollmentModal, #cancelEnrollmentForm");

  if (closeButton) {
    closeEnrollmentModal();
    return;
  }

  if (editButton) {
    const record = studentRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) openStudentForm(record);
  }
}

function downloadEnrollmentCsv() {
  const exportData = getEnrollmentExportData();
  downloadCsvReport({ ...exportData, filename: "enrollment-students-report.csv" });
}

function downloadEnrollmentExcel() {
  const exportData = getEnrollmentExportData();
  downloadExcelReport({ ...exportData, filename: "enrollment-students-report.xls" });
}

function getEnrollmentExportData() {
  const rows = filteredEnrollmentModuleRecords;
  const headers = [
    "lrn",
    "lastName",
    "firstName",
    "middleName",
    "sex",
    "birthDate",
    "gradeLevel",
    "sectionName",
    "schoolYear",
    "status",
    "fatherName",
    "motherName",
    "guardianName",
    "contactNumber",
    "learningModality",
    "remarks",
  ];
  const cleanHeaders = headers.map((header) => header.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()));
  return {
    reportName: "Enrollment Student Registry",
    headers: cleanHeaders,
    rows: rows.map((record) => headers.map((header) => formatExportValue(record[header]))),
  };
}

async function renderInventoryFacilitiesModule() {
  els.dashboardTitle.textContent = "Inventory & Facilities";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">School property monitoring</p>
        <h2>Inventory & Facilities Tracker</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageInventoryFacilities() ? `<button id="newInventoryFacilityButton" class="primary-button" type="button">Add Record</button>` : ""}
        <button id="printInventoryFacilities" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>
    <section id="inventoryFacilityAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading inventory summary...</p>
    </section>
    <section class="table-card">
      <div class="section-header"><h2>Inventory and Facility Records</h2></div>
      <div class="filter-grid">
        <label>Search<input id="inventorySearch" type="search" placeholder="Item, location, property no." /></label>
        <label>Category<select id="inventoryCategoryFilter">${optionList(inventoryCategories, "", "All categories")}</select></label>
        <label>Condition<select id="inventoryConditionFilter">${optionList(inventoryConditions, "", "All conditions")}</select></label>
        <label>Status<select id="inventoryStatusFilter">${optionList(inventoryStatuses, "", "All statuses")}</select></label>
        <label>Location<select id="inventoryLocationFilter"></select></label>
      </div>
      <div id="inventoryFacilityTableHost" class="table-wrap"><p class="empty-state">Loading inventory records...</p></div>
    </section>
  `;
  try {
    inventoryFacilityRecordsCache = await getVisibleInventoryFacilities();
    populateInventoryFacilityFilters();
    applyInventoryFacilityFilters();
  } catch (error) {
    document.querySelector("#inventoryFacilityTableHost").innerHTML = `<p class="empty-state">Unable to load inventory records: ${escapeHtml(error.message)}</p>`;
  }
}

function populateInventoryFacilityFilters() {
  const locationFilter = document.querySelector("#inventoryLocationFilter");
  if (locationFilter) {
    locationFilter.innerHTML = optionList(uniqueOptions(inventoryFacilityRecordsCache, "location"), "", "All locations");
  }
}

function applyInventoryFacilityFilters() {
  const host = document.querySelector("#inventoryFacilityTableHost");
  if (!host) return;
  const search = (document.querySelector("#inventorySearch")?.value || "").trim().toLowerCase();
  const category = document.querySelector("#inventoryCategoryFilter")?.value || "";
  const condition = document.querySelector("#inventoryConditionFilter")?.value || "";
  const status = document.querySelector("#inventoryStatusFilter")?.value || "";
  const location = document.querySelector("#inventoryLocationFilter")?.value || "";

  filteredInventoryFacilityRecords = inventoryFacilityRecordsCache.filter((record) => {
    const haystack = [
      record.itemName,
      record.propertyNumber,
      record.category,
      record.location,
      record.facilityArea,
      record.personInCharge,
      record.condition,
      record.status,
      record.remarks,
    ].filter(Boolean).join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!category || record.category === category)
      && (!condition || record.condition === condition)
      && (!status || record.status === status)
      && (!location || record.location === location);
  });

  renderInventoryFacilityAnalytics();
  renderInventoryFacilityTable(host);
}

function renderInventoryFacilityAnalytics() {
  const host = document.querySelector("#inventoryFacilityAnalytics");
  if (!host) return;
  const records = filteredInventoryFacilityRecords;
  const totalQuantity = records.reduce((sum, record) => sum + Number(record.quantity || 0), 0);
  const needsRepair = records.filter((record) =>
    record.condition === "Needs Repair" ||
    record.condition === "Unserviceable" ||
    record.status === "For Repair"
  ).length;
  const missing = records.filter((record) => record.condition === "Missing" || record.status === "Lost").length;
  const serviceable = records.filter((record) => ["New", "Good", "Fair"].includes(record.condition) && !["Lost", "Disposed", "Condemned"].includes(record.status)).length;

  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Records", String(records.length), `${totalQuantity} total quantity`],
      ["Serviceable", String(serviceable), "New, good, or fair condition"],
      ["Needs Repair", String(needsRepair), "Repair or replacement needed"],
      ["Missing / Lost", String(missing), "For immediate checking"],
    ])}
    <div class="chart-grid attendance-chart-grid">
      ${renderSummaryChart("Condition Summary", inventoryConditions.map((item) => [item, records.filter((record) => record.condition === item).length]))}
      ${renderSummaryChart("Status Summary", inventoryStatuses.map((item) => [item, records.filter((record) => record.status === item).length]))}
      ${renderSummaryChart("Category Summary", inventoryCategories.map((item) => [item, records.filter((record) => record.category === item).length]))}
    </div>
  `;
}

function renderInventoryFacilityTable(host) {
  if (!filteredInventoryFacilityRecords.length) {
    host.innerHTML = `<p class="empty-state">No inventory or facility records match the current filters.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table inventory-table">
      <thead>
        <tr>
          <th>Item / Facility</th>
          <th>Person in Charge</th>
          <th>Category</th>
          <th>Location</th>
          <th>Quantity</th>
          <th>Condition</th>
          <th>Status</th>
          <th>Last Checked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredInventoryFacilityRecords.map((record) => `
          <tr>
            <td>
              <strong>${escapeHtml(record.itemName || "Unnamed record")}</strong>
              <small class="row-note">${escapeHtml(record.propertyNumber || "No property number")}</small>
              <small class="row-note">${escapeHtml(record.remarks || "")}</small>
            </td>
            <td>${escapeHtml(record.personInCharge || "Not assigned")}</td>
            <td>${escapeHtml(record.category || "")}</td>
            <td>
              ${escapeHtml(record.location || "")}
              <small class="row-note">${escapeHtml(record.facilityArea || "")}</small>
            </td>
            <td>${Number(record.quantity || 0)}</td>
            <td><span class="badge inventory-condition-${statusClass(record.condition)}">${escapeHtml(record.condition || "")}</span></td>
            <td><span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "")}</span></td>
            <td>${escapeHtml(record.lastCheckedDate || record.acquisitionDate || "")}<small class="row-note">${escapeHtml(record.encodedByName || "")}</small></td>
            <td class="row-actions">
              ${canManageInventoryFacilities() ? `<button class="secondary-button edit-inventory-facility" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openInventoryFacilityForm(record = null) {
  els.dashboardContent.insertAdjacentHTML("beforeend", `
    <div id="academicModal" class="modal-backdrop">
      <form id="inventoryFacilityForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Inventory & Facilities</p><h2>${record ? "Update Record" : "Add Record"}</h2></div>
          <button class="icon-button close-academic-modal" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Item / Facility Name<input id="inventoryItemName" required value="${escapeHtml(record?.itemName || "")}" /></label>
          <label>Property Number<input id="inventoryPropertyNumber" value="${escapeHtml(record?.propertyNumber || "")}" /></label>
          <label>Category<select id="inventoryCategory" required>${optionList(inventoryCategories, record?.category || "", "Select category")}</select></label>
          <label>Location<input id="inventoryLocation" required value="${escapeHtml(record?.location || "")}" placeholder="Room, office, building" /></label>
          <label>Facility Area<input id="inventoryFacilityArea" value="${escapeHtml(record?.facilityArea || "")}" placeholder="Classroom, lab, clinic" /></label>
          <label>Person in Charge<input id="inventoryPersonInCharge" required value="${escapeHtml(record?.personInCharge || "")}" placeholder="Name of accountable person" /></label>
          <label>Quantity<input id="inventoryQuantity" type="number" min="0" step="1" required value="${escapeHtml(record?.quantity ?? 1)}" /></label>
          <label>Condition<select id="inventoryCondition" required>${optionList(inventoryConditions, record?.condition || "Good", "Select condition")}</select></label>
          <label>Status<select id="inventoryStatus" required>${optionList(inventoryStatuses, record?.status || "Available", "Select status")}</select></label>
          <label>Acquisition Date<input id="inventoryAcquisitionDate" type="date" value="${escapeHtml(record?.acquisitionDate || "")}" /></label>
          <label>Last Checked<input id="inventoryLastCheckedDate" type="date" value="${escapeHtml(record?.lastCheckedDate || todayIso())}" /></label>
          <label class="form-field-wide">Remarks<textarea id="inventoryRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
        </div>
        <div id="academicFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button class="secondary-button close-academic-modal" type="button">Cancel</button>
          <button class="primary-button" type="submit" data-id="${escapeHtml(record?.id || "")}">${record ? "Save Changes" : "Save Record"}</button>
        </div>
      </form>
    </div>
  `);
}

async function handleInventoryFacilityFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#academicFormMessage");
  const recordId = event.target.querySelector(".primary-button")?.dataset.id || "";
  const data = {
    itemName: document.querySelector("#inventoryItemName").value.trim(),
    propertyNumber: document.querySelector("#inventoryPropertyNumber").value.trim(),
    category: document.querySelector("#inventoryCategory").value,
    location: document.querySelector("#inventoryLocation").value.trim(),
    facilityArea: document.querySelector("#inventoryFacilityArea").value.trim(),
    personInCharge: document.querySelector("#inventoryPersonInCharge").value.trim(),
    quantity: Number(document.querySelector("#inventoryQuantity").value || 0),
    condition: document.querySelector("#inventoryCondition").value,
    status: document.querySelector("#inventoryStatus").value,
    acquisitionDate: document.querySelector("#inventoryAcquisitionDate").value,
    lastCheckedDate: document.querySelector("#inventoryLastCheckedDate").value,
    remarks: document.querySelector("#inventoryRemarks").value.trim(),
    encodedByUid: auth.currentUser.uid,
    encodedByName: currentUserProfile.fullName || auth.currentUser.email,
    encodedByRole: currentUserProfile.role,
  };
  try {
    if (!data.itemName || !data.category || !data.location || !data.personInCharge) throw new Error("Add item name, category, location, and person in charge.");
    if (data.quantity < 0) throw new Error("Quantity cannot be negative.");
    if (recordId) {
      const before = inventoryFacilityRecordsCache.find((record) => record.id === recordId);
      await updateDoc(doc(db, "inventoryFacilities", recordId), { ...data, updatedAt: serverTimestamp() });
      await createAuditLog("update", "Inventory & Facilities", recordId, before, data);
    } else {
      const created = await addDoc(collection(db, "inventoryFacilities"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await createAuditLog("create", "Inventory & Facilities", created.id, null, data);
    }
    document.querySelector("#academicModal")?.remove();
    await renderInventoryFacilitiesModule();
    await refreshInventoryFacilityCounters(currentUserProfile.role);
    showDashboardMessage("Inventory record saved.");
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  }
}

async function renderFinancialReportModule() {
  els.dashboardTitle.textContent = "Financial Report";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">School financial monitoring</p>
        <h2>Financial Report Dashboard</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageFinancialReports() ? `<button id="newFinancialReportButton" class="primary-button" type="button">Add Record</button><button id="importFinancialReportButton" class="secondary-button" type="button">Import Excel</button>` : ""}
        <button id="downloadFinancialCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadFinancialExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printFinancialReport" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="financialReportAnalytics" class="attendance-analytics">
      <p class="empty-state">Loading financial summary...</p>
    </section>

    <section class="table-card">
      <div class="section-header"><h2>Financial Records</h2></div>
      <div class="filter-grid">
        <label>Search<input id="financialSearch" type="search" placeholder="Title, description, category" /></label>
        <label>School Year<select id="financialSchoolYearFilter"></select></label>
        <label>Quarter<select id="financialQuarterFilter">${optionList(financialQuarters, "", "All quarters")}</select></label>
        <label>Report Type<select id="financialTypeFilter">${optionList(financialReportTypes, "", "All report types")}</select></label>
        <label>Fund Source<select id="financialFundFilter">${optionList(financialFundSources, "", "All fund sources")}</select></label>
        <label>Status<select id="financialStatusFilter">${optionList(financialStatuses, "", "All statuses")}</select></label>
      </div>
      <div id="financialReportTableHost" class="table-wrap"><p class="empty-state">Loading financial records...</p></div>
    </section>
  `;

  try {
    financialReportRecordsCache = await getVisibleFinancialReports();
    financialReportRecordsCache.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    populateFinancialReportFilters();
    applyFinancialReportFilters();
  } catch (error) {
    document.querySelector("#financialReportTableHost").innerHTML = `<p class="empty-state">Unable to load financial records: ${escapeHtml(error.message)}</p>`;
  }
}

function populateFinancialReportFilters() {
  const schoolYearFilter = document.querySelector("#financialSchoolYearFilter");
  if (schoolYearFilter) {
    schoolYearFilter.innerHTML = optionList(uniqueOptions(financialReportRecordsCache, "schoolYear"), "", "All school years");
  }
}

function applyFinancialReportFilters() {
  const host = document.querySelector("#financialReportTableHost");
  if (!host) return;
  const search = (document.querySelector("#financialSearch")?.value || "").trim().toLowerCase();
  const schoolYear = document.querySelector("#financialSchoolYearFilter")?.value || "";
  const quarter = document.querySelector("#financialQuarterFilter")?.value || "";
  const reportType = document.querySelector("#financialTypeFilter")?.value || "";
  const fundSource = document.querySelector("#financialFundFilter")?.value || "";
  const status = document.querySelector("#financialStatusFilter")?.value || "";

  filteredFinancialReportRecords = financialReportRecordsCache.filter((record) => {
    const haystack = [
      record.reportTitle,
      record.reportType,
      record.quarter,
      record.schoolYear,
      record.fundSource,
      record.category,
      record.description,
      record.status,
      record.remarks,
    ].filter(Boolean).join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!schoolYear || record.schoolYear === schoolYear)
      && (!quarter || record.quarter === quarter)
      && (!reportType || record.reportType === reportType)
      && (!fundSource || record.fundSource === fundSource)
      && (!status || record.status === status);
  });

  renderFinancialReportAnalytics();
  renderFinancialReportTable(host);
}

function renderFinancialReportAnalytics() {
  const host = document.querySelector("#financialReportAnalytics");
  if (!host) return;
  const records = filteredFinancialReportRecords;
  const totalAllocated = records.reduce((sum, record) => sum + toSafeNumber(record.amountAllocated), 0);
  const totalSpent = records.reduce((sum, record) => sum + toSafeNumber(record.amountSpent), 0);
  const remaining = totalAllocated - totalSpent;
  const pending = records.filter((record) => ["Draft", "Submitted"].includes(record.status)).length;
  const approved = records.filter((record) => record.status === "Approved").length;
  const budgetUtilization = totalAllocated ? (totalSpent / totalAllocated) * 100 : 0;
  const categoryTotals = groupFinancialSpending(records, financialCategories, "category", "Uncategorized");
  const fundTotals = groupFinancialSpending(records, financialFundSources, "fundSource", "Unspecified");
  const largestCategory = categoryTotals[0]?.label || "None";
  const largestFund = fundTotals[0]?.label || "None";
  const quarterTotals = financialQuarters.map((quarter) => [
    quarter,
    records.filter((record) => record.quarter === quarter).reduce((sum, record) => sum + getFinancialAmountSpent(record), 0),
  ]);
  const q2VsQ1 = quarterTotals[0]?.[1] ? ((quarterTotals[1]?.[1] || 0) - quarterTotals[0][1]) / quarterTotals[0][1] * 100 : 0;

  host.innerHTML = `
    ${renderAttendanceKpiGrid([
      ["Total Allocated", formatPeso(totalAllocated), "Approved or planned funds"],
      ["Total Spent", formatPeso(totalSpent), "Recorded expenditures"],
      ["Remaining Balance", formatPeso(remaining), remaining < 0 ? "Overspent balance" : "Available balance"],
      ["Budget Utilization", `${budgetUtilization.toFixed(1)}%`, "Spent against allocation"],
      ["Largest Spending Category", largestCategory, "Highest amount spent"],
      ["Largest Fund Source", largestFund, "Largest spending source"],
      ["Remaining Balance Alert", remaining < 0 ? "Overspent" : budgetUtilization >= 80 ? "Watch" : "Healthy", remaining < 0 ? "Spending exceeds allocation" : "Based on utilization"],
      ["Number of Reports", String(records.length), "Visible report records"],
      ["Pending / Submitted", String(pending), "Draft or submitted records"],
      ["Approved Reports", String(approved), "Approved financial reports"],
    ])}
    <div class="chart-grid attendance-chart-grid financial-chart-grid">
      ${renderFinancialPieChart("Spending by Category", records, financialCategories, "category", "Uncategorized", "No financial data available yet.")}
      ${renderFinancialPieChart("Spending by Fund Source", records, financialFundSources, "fundSource", "Unspecified", "No fund source data available yet.")}
      ${renderFinancialQuarterlyChart(records)}
      ${renderFinancialUtilizationChart(records)}
      ${renderInsightPanel("Financial Insights", [
        largestCategory !== "None" ? `${largestCategory} accounts for the highest spending.` : "",
        q2VsQ1 > 0 ? `Q2 spending exceeded Q1 by ${q2VsQ1.toFixed(1)}%.` : q2VsQ1 < 0 ? `Q2 spending is ${Math.abs(q2VsQ1).toFixed(1)}% lower than Q1.` : "",
        budgetUtilization >= 80 ? "Budget utilization exceeded 80% and needs monitoring." : "",
        remaining < 0 ? "Remaining balance is negative. Review overspending immediately." : "",
      ])}
    </div>
  `;
}

function getFinancialAmountSpent(record) {
  return toSafeNumber(record?.amountSpent);
}

function getFinancialGroupLabel(record, field, fallback) {
  const value = String(record?.[field] || "").trim();
  return value || fallback;
}

function groupFinancialSpending(records, labels, field, fallback) {
  const orderedLabels = [...labels, fallback];
  const totals = new Map(orderedLabels.map((label) => [label, 0]));

  records.forEach((record) => {
    const label = getFinancialGroupLabel(record, field, fallback);
    totals.set(label, (totals.get(label) || 0) + getFinancialAmountSpent(record));
  });

  return [...totals.entries()]
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label, value }));
}

function formatFinancialPercent(value, total) {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function renderFinancialPieChart(title, records, labels, field, fallback, emptyMessage) {
  const rows = groupFinancialSpending(records, labels, field, fallback);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!rows.length || total <= 0) {
    return `
      <article class="chart-card financial-chart-card">
        <h3>${escapeHtml(title)}</h3>
        <p class="empty-state">${escapeHtml(emptyMessage)}</p>
      </article>
    `;
  }

  let currentPercent = 0;
  const segments = rows.map((row, index) => {
    const share = (row.value / total) * 100;
    const start = currentPercent;
    currentPercent += share;
    return `var(--financial-chart-${(index % 8) + 1}) ${start}% ${currentPercent}%`;
  });

  return `
    <article class="chart-card financial-chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="financial-pie-layout">
        <div
          class="financial-pie"
          style="background: conic-gradient(${segments.join(", ")});"
          role="img"
          aria-label="${escapeAttribute(`${title} totaling ${formatPeso(total)}`)}"
          title="${escapeAttribute(`${title}: ${formatPeso(total)}`)}"
        >
          <span>${escapeHtml(formatPeso(total))}</span>
          <small>Total spent</small>
        </div>
        <div class="financial-chart-legend" aria-label="${escapeAttribute(`${title} legend`)}">
          ${rows.map((row, index) => `
            <div class="financial-legend-row" title="${escapeAttribute(`${row.label}: ${formatPeso(row.value)} (${formatFinancialPercent(row.value, total)})`)}">
              <i style="background: var(--financial-chart-${(index % 8) + 1});"></i>
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(formatPeso(row.value))}</strong>
              <small>${escapeHtml(formatFinancialPercent(row.value, total))}</small>
            </div>
          `).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderFinancialQuarterlyChart(records) {
  const rows = financialQuarters.map((quarter) => ({
    label: quarter,
    value: records
      .filter((record) => record.quarter === quarter)
      .reduce((sum, record) => sum + getFinancialAmountSpent(record), 0),
  }));
  const max = Math.max(...rows.map((row) => row.value), 0);
  if (max <= 0) {
    return `
      <article class="chart-card financial-chart-card financial-trend-card">
        <h3>Quarterly Spending Trend</h3>
        <p class="empty-state">No quarterly spending data available yet.</p>
      </article>
    `;
  }

  return `
    <article class="chart-card financial-chart-card financial-trend-card">
      <h3>Quarterly Spending Trend</h3>
      <div class="financial-bar-chart" aria-label="Quarterly Spending Trend">
        ${rows.map((row) => {
          const height = Math.max((row.value / max) * 100, row.value > 0 ? 6 : 0);
          return `
            <div class="financial-bar-column" title="${escapeAttribute(`${row.label}: ${formatPeso(row.value)}`)}">
              <span>${escapeHtml(formatPeso(row.value))}</span>
              <div class="financial-bar-track"><i style="height: ${height}%"></i></div>
              <strong>${escapeHtml(row.label)}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderFinancialUtilizationChart(records) {
  const rows = financialQuarters.map((quarter) => {
    const quarterRecords = records.filter((record) => record.quarter === quarter);
    const allocated = quarterRecords.reduce((sum, record) => sum + toSafeNumber(record.amountAllocated), 0);
    const spent = quarterRecords.reduce((sum, record) => sum + toSafeNumber(record.amountSpent), 0);
    return [quarter, allocated ? Math.round((spent / allocated) * 100) : 0];
  });
  return renderSummaryChart("Budget Utilization Comparison", rows);
}

function renderFinancialReportTable(host) {
  if (!filteredFinancialReportRecords.length) {
    host.innerHTML = `<p class="empty-state">No financial records match the current filters.</p>`;
    return;
  }

  host.innerHTML = `
    <table class="academic-table financial-report-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Report Title</th>
          <th>Report Type</th>
          <th>Quarter</th>
          <th>Fund Source</th>
          <th>Category</th>
          <th>Amount Allocated</th>
          <th>Amount Spent</th>
          <th>Remaining Balance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredFinancialReportRecords.map(renderFinancialReportRow).join("")}
      </tbody>
    </table>
  `;
}

function renderFinancialReportRow(record) {
  const remaining = Number(record.remainingBalance || 0);
  return `
    <tr>
      <td>${escapeHtml(record.date || "No date")}<small class="row-note">SY ${escapeHtml(record.schoolYear || "Not recorded")}</small></td>
      <td>
        <strong>${escapeHtml(record.reportTitle || "Untitled report")}</strong>
        <small class="row-note">${escapeHtml(record.description || "No description")}</small>
        <small class="row-note">${escapeHtml(record.remarks || "")}</small>
      </td>
      <td>${escapeHtml(record.reportType || "")}</td>
      <td>${escapeHtml(record.quarter || "")}</td>
      <td>${escapeHtml(record.fundSource || "")}</td>
      <td>${escapeHtml(record.category || "")}</td>
      <td>${escapeHtml(formatPeso(record.amountAllocated))}</td>
      <td>${escapeHtml(formatPeso(record.amountSpent))}</td>
      <td>
        <span class="badge ${remaining < 0 ? "financial-warning" : "status-approved"}">${escapeHtml(formatPeso(remaining))}</span>
      </td>
      <td><span class="badge status-${statusClass(record.status)}">${escapeHtml(record.status || "Draft")}</span></td>
      <td>
        <div class="row-actions">
          <button class="secondary-button view-financial-report" type="button" data-id="${escapeHtml(record.id)}">View</button>
          ${canEditFinancialReport(record) ? `<button class="secondary-button edit-financial-report" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canManageFinancialReports() && record.status !== "Submitted" ? `<button class="secondary-button mark-financial-status" type="button" data-id="${escapeHtml(record.id)}" data-status="Submitted">Submit</button>` : ""}
          ${canReviewFinancialReports() && record.status !== "Reviewed" ? `<button class="secondary-button mark-financial-status" type="button" data-id="${escapeHtml(record.id)}" data-status="Reviewed">Review</button>` : ""}
          ${canManageFinancialReports() && record.status !== "Approved" ? `<button class="secondary-button mark-financial-status" type="button" data-id="${escapeHtml(record.id)}" data-status="Approved">Approve</button>` : ""}
          ${canDeleteFinancialReport() ? `<button class="danger-button delete-financial-report" type="button" data-id="${escapeHtml(record.id)}">Delete</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function renderFinancialReportForm(record = null) {
  closeFinancialReportModal();
  editingFinancialReportId = record?.id || null;
  els.dashboardContent.insertAdjacentHTML("afterbegin", `
    <div id="financialReportModal" class="modal-backdrop">
      <form id="financialReportForm" class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Financial report</p><h2>${record ? "Edit Financial Record" : "Add Financial Record"}</h2></div>
          <button id="closeFinancialReportModal" class="icon-button" type="button" aria-label="Close">x</button>
        </div>
        <div class="form-grid learner-form-grid">
          <label>Report Title<input id="financialReportTitle" required value="${escapeHtml(record?.reportTitle || "")}" /></label>
          <label>Report Type<select id="financialReportType" required>${optionList(financialReportTypes, record?.reportType || "", "Select report type")}</select></label>
          <label>Quarter<select id="financialQuarter" required>${optionList(financialQuarters, record?.quarter || "", "Select quarter")}</select></label>
          <label>School Year<input id="financialSchoolYear" required value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" /></label>
          <label>Date<input id="financialDate" type="date" required value="${escapeHtml(record?.date || todayIso())}" /></label>
          <label>Fund Source<select id="financialFundSource">${optionList(financialFundSources, record?.fundSource || "MOOE", "Select fund source")}</select></label>
          <label>Category<select id="financialCategory">${optionList(financialCategories, record?.category || "Supplies", "Select category")}</select></label>
          <label>Status<select id="financialStatus" required>${optionList(financialStatuses, record?.status || "Draft", "Select status")}</select></label>
          <label>Amount Allocated<input id="financialAmountAllocated" type="number" min="0" step="0.01" value="${escapeHtml(record?.amountAllocated ?? 0)}" /></label>
          <label>Amount Spent<input id="financialAmountSpent" type="number" step="0.01" required value="${escapeHtml(record?.amountSpent ?? 0)}" /></label>
          <label class="form-field-wide">Description<textarea id="financialDescription" rows="3">${escapeHtml(record?.description || "")}</textarea></label>
          <label class="form-field-wide">Remarks<textarea id="financialRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
        </div>
        <div id="financialFormBalance" class="message hidden" role="status"></div>
        <div id="financialFormMessage" class="message hidden" role="status"></div>
        <div class="modal-actions">
          <button id="cancelFinancialReportForm" class="secondary-button" type="button">Cancel</button>
          <button class="primary-button" type="submit">${record ? "Save Changes" : "Save Record"}</button>
        </div>
      </form>
    </div>
  `);
  syncFinancialBalanceMessage();
}

function getFinancialReportFormData() {
  const amountAllocated = Number(document.querySelector("#financialAmountAllocated").value || 0);
  const amountSpent = Number(document.querySelector("#financialAmountSpent").value || 0);
  return {
    reportTitle: document.querySelector("#financialReportTitle").value.trim(),
    reportType: document.querySelector("#financialReportType").value,
    quarter: document.querySelector("#financialQuarter").value,
    schoolYear: document.querySelector("#financialSchoolYear").value.trim(),
    date: document.querySelector("#financialDate").value,
    fundSource: document.querySelector("#financialFundSource").value || "Other",
    category: document.querySelector("#financialCategory").value || "Other",
    description: document.querySelector("#financialDescription").value.trim(),
    amountAllocated,
    amountSpent,
    remainingBalance: amountAllocated - amountSpent,
    status: document.querySelector("#financialStatus").value,
    remarks: document.querySelector("#financialRemarks").value.trim(),
    source: "manual",
  };
}

function validateFinancialRecordData(data) {
  if (!data.reportTitle) throw new Error("Report Title is required.");
  if (!financialReportTypes.includes(data.reportType)) throw new Error("Select a valid report type.");
  if (!financialQuarters.includes(data.quarter)) throw new Error("Select a valid quarter.");
  if (!data.schoolYear) throw new Error("School Year is required.");
  if (!data.date) throw new Error("Date is required.");
  if (!Number.isFinite(data.amountAllocated) || !Number.isFinite(data.amountSpent)) throw new Error("Amounts must be valid numbers.");
  if (!financialStatuses.includes(data.status)) throw new Error("Select a valid status.");
}

async function handleFinancialReportFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#financialFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const wasEditing = Boolean(editingFinancialReportId);
  submitButton.disabled = true;

  try {
    const data = getFinancialReportFormData();
    validateFinancialRecordData(data);
    if (editingFinancialReportId) {
      const before = financialReportRecordsCache.find((record) => record.id === editingFinancialReportId);
      await updateFinancialReport(editingFinancialReportId, data);
      await createAuditLog("update", "Financial Report", editingFinancialReportId, before, data);
    } else {
      const created = await createFinancialReport(data);
      await createAuditLog("create", "Financial Report", created.id, null, data);
    }
    closeFinancialReportModal();
    showDashboardMessage(wasEditing ? "Financial record updated." : "Financial record saved.");
    await renderFinancialReportModule();
    await refreshFinancialReportCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function syncFinancialBalanceMessage() {
  const balanceBox = document.querySelector("#financialFormBalance");
  if (!balanceBox) return;
  const allocated = Number(document.querySelector("#financialAmountAllocated")?.value || 0);
  const spent = Number(document.querySelector("#financialAmountSpent")?.value || 0);
  const remaining = allocated - spent;
  balanceBox.textContent = `Remaining balance: ${formatPeso(remaining)}`;
  balanceBox.classList.toggle("error", remaining < 0);
  balanceBox.classList.remove("hidden");
}

function closeFinancialReportModal() {
  document.querySelector("#financialReportModal")?.remove();
  editingFinancialReportId = null;
  pendingFinancialImportRows = [];
}

function renderFinancialReportDetails(record) {
  closeFinancialReportModal();
  els.dashboardContent.insertAdjacentHTML("afterbegin", `
    <div id="financialReportModal" class="modal-backdrop">
      <section class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Financial report details</p><h2>${escapeHtml(record.reportTitle || "Financial Record")}</h2></div>
          <button id="closeFinancialReportModal" class="icon-button" type="button" aria-label="Close">x</button>
        </div>
        <div class="print-report-header">
          <p><strong>Type:</strong> ${escapeHtml(record.reportType || "")} | <strong>Quarter:</strong> ${escapeHtml(record.quarter || "")} | <strong>SY:</strong> ${escapeHtml(record.schoolYear || "")}</p>
          <p><strong>Fund Source:</strong> ${escapeHtml(record.fundSource || "")} | <strong>Category:</strong> ${escapeHtml(record.category || "")} | <strong>Status:</strong> ${escapeHtml(record.status || "")}</p>
          <p><strong>Allocated:</strong> ${escapeHtml(formatPeso(record.amountAllocated))} | <strong>Spent:</strong> ${escapeHtml(formatPeso(record.amountSpent))} | <strong>Remaining:</strong> ${escapeHtml(formatPeso(record.remainingBalance))}</p>
          <p>${escapeHtml(record.description || "No description")}</p>
          <p><strong>Remarks:</strong> ${escapeHtml(record.remarks || "No remarks")}</p>
          <p><strong>Encoded by:</strong> ${escapeHtml(record.createdByName || record.encodedBy || "Not recorded")} | <strong>Updated:</strong> ${escapeHtml(formatDate(record.updatedAt || record.createdAt))}</p>
        </div>
        <div class="modal-actions">
          <button id="printFinancialDetails" class="secondary-button" type="button">Print Details</button>
          <button id="cancelFinancialReportForm" class="primary-button" type="button">Close</button>
        </div>
      </section>
    </div>
  `);
}

function openFinancialImportModal() {
  closeFinancialReportModal();
  pendingFinancialImportRows = [];
  els.dashboardContent.insertAdjacentHTML("afterbegin", `
    <div id="financialReportModal" class="modal-backdrop">
      <section class="modal wide-modal">
        <div class="modal-header">
          <div><p class="eyebrow">Financial report import</p><h2>Import Excel Records</h2></div>
          <button id="closeFinancialReportModal" class="icon-button" type="button" aria-label="Close">x</button>
        </div>
        <div id="financialImportDropZone" class="import-drop-zone">
          <input id="financialImportFileInput" type="file" accept=".xlsx,.xls,.csv" />
          <span>Choose .xlsx, .xls, or .csv file</span>
        </div>
        <p class="helper-text">Required columns: Report Title, Report Type, Quarter, School Year, Date, Amount Spent.</p>
        <div id="financialImportMessage" class="message hidden" role="status"></div>
        <div id="financialImportPreview" class="table-wrap"></div>
        <div class="modal-actions">
          <button id="cancelFinancialReportForm" class="secondary-button" type="button">Cancel</button>
          <button id="confirmFinancialImport" class="primary-button" type="button" disabled>Confirm Import</button>
        </div>
      </section>
    </div>
  `);
}

async function handleFinancialImportFile(file) {
  if (!file) return;
  const message = document.querySelector("#financialImportMessage");
  try {
    if (!window.XLSX) throw new Error("Excel parser is unavailable. Check your connection and reload the app.");
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    pendingFinancialImportRows = parseFinancialImportRows(rows);
    renderFinancialImportPreview();
    const validCount = pendingFinancialImportRows.filter((row) => row.valid).length;
    const invalidCount = pendingFinancialImportRows.length - validCount;
    message.textContent = `Preview ready: ${validCount} valid rows, ${invalidCount} invalid rows.`;
    message.classList.toggle("error", validCount === 0);
    message.classList.remove("hidden");
    document.querySelector("#confirmFinancialImport").disabled = validCount === 0;
  } catch (error) {
    message.textContent = `Import failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
    document.querySelector("#confirmFinancialImport").disabled = true;
  }
}

function parseFinancialImportRows(rows) {
  return rows
    .filter((row) => Object.values(row).some((value) => String(value ?? "").trim()))
    .map((row, index) => {
      const data = {
        reportTitle: getImportCell(row, "Report Title"),
        reportType: getImportCell(row, "Report Type"),
        quarter: getImportCell(row, "Quarter"),
        schoolYear: getImportCell(row, "School Year"),
        date: normalizeImportDate(getImportCell(row, "Date")),
        fundSource: getImportCell(row, "Fund Source") || "Other",
        category: getImportCell(row, "Category") || "Other",
        description: getImportCell(row, "Description"),
        amountAllocated: parseImportAmount(getImportCell(row, "Amount Allocated")),
        amountSpent: parseImportAmount(getImportCell(row, "Amount Spent")),
        status: getImportCell(row, "Status") || "Draft",
        remarks: getImportCell(row, "Remarks"),
        source: "excel_import",
      };
      data.remainingBalance = data.amountAllocated - data.amountSpent;
      const errors = getFinancialImportErrors(data);
      return { rowNumber: index + 2, data, valid: !errors.length, errors };
    });
}

function getImportCell(row, expectedHeader) {
  const normalized = normalizeHeader(expectedHeader);
  const key = Object.keys(row).find((header) => normalizeHeader(header) === normalized);
  return String(key ? row[key] : "").trim();
}

function normalizeHeader(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseImportAmount(value) {
  if (value === "" || value == null) return 0;
  const amount = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function normalizeImportDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return dateToIsoOnly(parsed);
  return raw;
}

function getFinancialImportErrors(data) {
  const errors = [];
  if (!data.reportTitle) errors.push("Report Title is required");
  if (!data.reportType) errors.push("Report Type is required");
  if (!financialReportTypes.includes(data.reportType)) errors.push("Invalid Report Type");
  if (!financialQuarters.includes(data.quarter)) errors.push("Invalid Quarter");
  if (!data.schoolYear) errors.push("School Year is required");
  if (!data.date) errors.push("Date is required");
  if (!Number.isFinite(data.amountAllocated)) errors.push("Amount Allocated must be numeric");
  if (!Number.isFinite(data.amountSpent)) errors.push("Amount Spent must be numeric");
  if (!financialFundSources.includes(data.fundSource)) errors.push("Invalid Fund Source");
  if (!financialCategories.includes(data.category)) errors.push("Invalid Category");
  if (!financialStatuses.includes(data.status)) errors.push("Invalid Status");
  return errors;
}

function renderFinancialImportPreview() {
  const host = document.querySelector("#financialImportPreview");
  if (!host) return;
  if (!pendingFinancialImportRows.length) {
    host.innerHTML = `<p class="empty-state">No rows found in the selected file.</p>`;
    return;
  }
  host.innerHTML = `
    <table class="academic-table financial-import-table">
      <thead>
        <tr>
          <th>Row</th>
          <th>Status</th>
          <th>Report Title</th>
          <th>Quarter</th>
          <th>Amount Spent</th>
          <th>Remaining</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${pendingFinancialImportRows.map((row) => `
          <tr>
            <td>${row.rowNumber}</td>
            <td><span class="badge status-${row.valid ? "approved" : "returned-for-revision"}">${row.valid ? "Valid" : "Invalid"}</span></td>
            <td>${escapeHtml(row.data.reportTitle || "Missing title")}<small class="row-note">${escapeHtml(row.data.reportType || "")}</small></td>
            <td>${escapeHtml(row.data.quarter || "")}<small class="row-note">SY ${escapeHtml(row.data.schoolYear || "")}</small></td>
            <td>${escapeHtml(formatPeso(row.data.amountSpent))}</td>
            <td><span class="badge ${Number(row.data.remainingBalance || 0) < 0 ? "financial-warning" : "status-approved"}">${escapeHtml(formatPeso(row.data.remainingBalance))}</span></td>
            <td>${escapeHtml(row.errors.join("; ") || "Ready to import")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function confirmFinancialImport() {
  const validRows = pendingFinancialImportRows.filter((row) => row.valid);
  if (!validRows.length) return;
  const importButton = document.querySelector("#confirmFinancialImport");
  importButton.disabled = true;
  const importedBatchId = `financial-${Date.now()}`;
  const batch = writeBatch(db);

  validRows.forEach((row) => {
    const ref = doc(collection(db, "financialReports"));
    batch.set(ref, {
      ...row.data,
      importedBatchId,
      encodedBy: auth.currentUser.uid,
      encodedAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
      createdByName: currentUserProfile.fullName || auth.currentUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    await createAuditLog("import", "Financial Report", importedBatchId, null, { imported: validRows.length });
    closeFinancialReportModal();
    await renderFinancialReportModule();
    await refreshFinancialReportCounters(currentUserProfile.role);
    showDashboardMessage("Financial records imported successfully.");
  } catch (error) {
    const message = document.querySelector("#financialImportMessage");
    message.textContent = `Import failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
    importButton.disabled = false;
  }
}

function handleFinancialReportAction(event) {
  if (event.target.closest("#newFinancialReportButton")) {
    renderFinancialReportForm();
    return;
  }
  if (event.target.closest("#importFinancialReportButton")) {
    openFinancialImportModal();
    return;
  }
  if (event.target.closest("#downloadFinancialCsv")) {
    downloadFinancialCsv();
    return;
  }
  if (event.target.closest("#downloadFinancialExcel")) {
    downloadFinancialExcel();
    return;
  }
  if (event.target.closest("#printFinancialReport")) {
    printCurrentReport("Financial Report");
    return;
  }
  if (event.target.closest("#closeFinancialReportModal, #cancelFinancialReportForm")) {
    closeFinancialReportModal();
    return;
  }
  if (event.target.closest("#printFinancialDetails")) {
    printCurrentReport("Financial Report Details");
    return;
  }
  if (event.target.closest("#financialImportDropZone") && event.target.id !== "financialImportFileInput") {
    event.preventDefault();
    document.querySelector("#financialImportFileInput")?.click();
    return;
  }
  if (event.target.closest("#confirmFinancialImport")) {
    confirmFinancialImport();
    return;
  }

  const viewButton = event.target.closest(".view-financial-report");
  const editButton = event.target.closest(".edit-financial-report");
  const deleteButton = event.target.closest(".delete-financial-report");
  const statusButton = event.target.closest(".mark-financial-status");

  if (viewButton) {
    const record = financialReportRecordsCache.find((item) => item.id === viewButton.dataset.id);
    if (record) renderFinancialReportDetails(record);
    return;
  }
  if (editButton) {
    const record = financialReportRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) renderFinancialReportForm(record);
    return;
  }
  if (statusButton) {
    const record = financialReportRecordsCache.find((item) => item.id === statusButton.dataset.id);
    if (!record) return;
    updateFinancialReportStatus(record.id, statusButton.dataset.status)
      .then(() => createAuditLog("update", "Financial Report", record.id, record, { status: statusButton.dataset.status }))
      .then(renderFinancialReportModule)
      .then(() => refreshFinancialReportCounters(currentUserProfile.role))
      .then(() => showDashboardMessage(`Financial record marked ${statusButton.dataset.status}.`))
      .catch((error) => showDashboardMessage(`Status update failed: ${error.message}`, true));
    return;
  }
  if (deleteButton) {
    const record = financialReportRecordsCache.find((item) => item.id === deleteButton.dataset.id);
    if (!record || !confirm(`Delete ${record.reportTitle || "this financial record"}?`)) return;
    deleteFinancialReport(record.id)
      .then(() => createAuditLog("delete", "Financial Report", record.id, record, null))
      .then(renderFinancialReportModule)
      .then(() => refreshFinancialReportCounters(currentUserProfile.role))
      .then(() => showDashboardMessage("Financial record deleted."))
      .catch((error) => showDashboardMessage(`Delete failed: ${error.message}`, true));
  }
}

function downloadFinancialCsv() {
  const exportData = getFinancialExportData();
  downloadCsvReport({ ...exportData, filename: "financial-reports.csv" });
}

function downloadFinancialExcel() {
  const exportData = getFinancialExportData();
  downloadExcelReport({ ...exportData, filename: "financial-reports.xls" });
}

function getFinancialExportData() {
  const headers = [
    "Date",
    "Report Title",
    "Report Type",
    "Quarter",
    "School Year",
    "Fund Source",
    "Category",
    "Description",
    "Amount Allocated",
    "Amount Spent",
    "Remaining Balance",
    "Status",
    "Remarks",
    "Encoded By",
    "Created At",
    "Updated At",
    "Source",
  ];
  const rows = filteredFinancialReportRecords.map((record) => [
    record.date,
    record.reportTitle,
    record.reportType,
    record.quarter,
    record.schoolYear,
    record.fundSource,
    record.category,
    record.description,
    record.amountAllocated,
    record.amountSpent,
    record.remainingBalance,
    record.status,
    record.remarks,
    record.createdByName || record.encodedBy,
    formatDate(record.createdAt || record.encodedAt),
    formatDate(record.updatedAt),
    record.source,
  ]);
  return { reportName: "Financial Report", headers, rows };
}

async function renderDocumentRepositoryModule() {
  els.dashboardTitle.textContent = "Document Repository";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">Cloud links repository</p>
        <h2>Document Repository Module</h2>
      </div>
      <div class="toolbar-actions">
        ${canManageDocument() ? `<button id="newDocumentButton" class="primary-button" type="button">Add Document</button>` : ""}
        <button id="downloadDocumentCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadDocumentExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printDocumentView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section class="table-card">
      <div class="module-tabs">
        ${documentViews
          .map((view) => `<button class="tab-button document-view-tab ${view.id === activeDocumentView ? "active" : ""}" type="button" data-view="${view.id}">${view.label}</button>`)
          .join("")}
      </div>
    </section>

    <section id="documentAnalytics" class="chart-grid">
      <p class="empty-state">Loading document analytics...</p>
    </section>

    <section class="table-card">
      <div class="filter-grid">
        <label>Search<input id="documentSearch" type="search" placeholder="Search documents" /></label>
        <label>Category<select id="filterDocumentCategory"></select></label>
        <label>Uploaded By<select id="filterDocumentUploader"></select></label>
        <label>School Year<select id="filterDocumentSchoolYear"></select></label>
        <label>Role Visibility<select id="filterDocumentRole"></select></label>
        <label>Date Uploaded<input id="filterDocumentDate" type="date" /></label>
        <label>Sort<select id="sortDocuments">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A-Z</option>
          <option value="category">Category A-Z</option>
        </select></label>
      </div>
      <div id="documentTableHost" class="table-wrap">
        <p class="empty-state">Loading documents...</p>
      </div>
    </section>
  `;

  await loadDocumentRecords();
  bindDocumentModuleEvents();
}

async function loadDocumentRecords() {
  documentRecordsCache = await getVisibleDocuments();
  populateDocumentFilters();
  applyDocumentFilters();
}

function populateDocumentFilters() {
  document.querySelector("#filterDocumentCategory").innerHTML = optionList(documentCategories, "", "All categories");
  document.querySelector("#filterDocumentUploader").innerHTML = optionList(uniqueOptions(documentRecordsCache, "uploadedByName"), "", "All uploaders");
  document.querySelector("#filterDocumentSchoolYear").innerHTML = optionList(uniqueOptions(documentRecordsCache, "schoolYear"), "", "All school years");
  document.querySelector("#filterDocumentRole").innerHTML = optionList(roles, "", "All visibility roles");
}

function applyDocumentFilters() {
  const activeCategory = documentViews.find((view) => view.id === activeDocumentView)?.category || "";
  const search = document.querySelector("#documentSearch").value.trim().toLowerCase();
  const category = document.querySelector("#filterDocumentCategory").value || activeCategory;
  const uploader = document.querySelector("#filterDocumentUploader").value;
  const schoolYear = document.querySelector("#filterDocumentSchoolYear").value;
  const role = document.querySelector("#filterDocumentRole").value;
  const date = document.querySelector("#filterDocumentDate").value;
  const sort = document.querySelector("#sortDocuments").value;

  filteredDocumentRecords = documentRecordsCache.filter((record) => {
    const searchable = [
      record.documentTitle,
      record.documentCategory,
      record.documentDescription,
      record.schoolYear,
      record.uploadedByName,
      record.uploadedByRole,
      record.tags,
      record.remarks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const createdDate = record.createdAt?.toDate?.();
    const createdDateValue = createdDate ? createdDate.toISOString().slice(0, 10) : "";

    return (
      (!search || searchable.includes(search)) &&
      (!category || record.documentCategory === category) &&
      (!uploader || record.uploadedByName === uploader) &&
      (!schoolYear || record.schoolYear === schoolYear) &&
      (!role || normalizeRoleList(role).some((item) => (record.visibilityRoles || []).includes(item))) &&
      (!date || createdDateValue === date)
    );
  });

  filteredDocumentRecords.sort((a, b) => {
    if (sort === "title") return (a.documentTitle || "").localeCompare(b.documentTitle || "");
    if (sort === "category") return (a.documentCategory || "").localeCompare(b.documentCategory || "");
    const first = a.createdAt?.toMillis?.() || 0;
    const second = b.createdAt?.toMillis?.() || 0;
    return sort === "oldest" ? first - second : second - first;
  });

  renderDocumentAnalytics();
  renderDocumentTable();
}

function renderDocumentAnalytics() {
  const chartHost = document.querySelector("#documentAnalytics");
  if (!chartHost) return;
  const months = uniqueOptions(
    filteredDocumentRecords.map((record) => {
      const created = record.createdAt?.toDate?.();
      return { month: created ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}` : "" };
    }),
    "month"
  );
  chartHost.innerHTML = `
    ${renderDocumentChart("Documents by Category", filteredDocumentRecords, documentCategories, "documentCategory")}
    ${renderDocumentChart("Upload Trend by Month", filteredDocumentRecords, months, "month")}
    ${renderDocumentChart("Most Accessed Categories", filteredDocumentRecords, documentCategories, "documentCategory")}
  `;
}

function renderDocumentChart(title, records, labels, field) {
  const chartLabels = labels.length ? labels : ["No data"];
  const counts = chartLabels.map((label) =>
    records.filter((record) => {
      const created = record.createdAt?.toDate?.();
      const value = field === "month" && created
        ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
        : record[field];
      return value === label;
    }).length
  );
  const max = Math.max(...counts, 1);
  return `
    <article class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${chartLabels
          .map((label, index) => `
            <div class="chart-row">
              <span>${escapeHtml(label)}</span>
              <div class="chart-track"><i style="width: ${(counts[index] / max) * 100}%"></i></div>
              <strong>${counts[index]}</strong>
            </div>
          `)
          .join("")}
      </div>
    </article>
  `;
}

function renderDocumentTable() {
  const tableHost = document.querySelector("#documentTableHost");
  if (!filteredDocumentRecords.length) {
    tableHost.innerHTML = `<p class="empty-state">No documents match the current view.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table class="document-table">
      <thead>
        <tr>
          <th>Document</th>
          <th>Category</th>
          <th>Visibility</th>
          <th>Uploaded By</th>
          <th>School Year</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${filteredDocumentRecords.map(renderDocumentRow).join("")}</tbody>
    </table>
  `;
}

function renderDocumentRow(record) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(record.documentTitle || "Untitled document")}</strong>
        <small class="row-note">${escapeHtml(record.documentDescription || "No description")}</small>
        <small class="row-note">${escapeHtml(record.tags || "No tags")}</small>
      </td>
      <td><span class="badge">${escapeHtml(record.documentCategory || "Other")}</span></td>
      <td>${escapeHtml((record.visibilityRoles || []).join(", ") || "No visibility")}</td>
      <td>${escapeHtml(record.uploadedByName || "Unknown")}<small class="row-note">${escapeHtml(record.uploadedByRole || "")}</small></td>
      <td>${escapeHtml(record.schoolYear || "No school year")}</td>
      <td>${escapeHtml(formatDate(record.updatedAt || record.createdAt))}</td>
      <td>
        <div class="row-actions">
          <a class="secondary-button link-button" href="${escapeHtml(record.documentLink || "#")}" target="_blank" rel="noopener">Open</a>
          <button class="secondary-button copy-document-link" type="button" data-id="${escapeHtml(record.id)}">Copy</button>
          <button class="secondary-button print-document-info" type="button" data-id="${escapeHtml(record.id)}">Print Info</button>
          ${canManageDocument(record) ? `<button class="secondary-button edit-document" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canDeleteDocument(record) ? `<button class="secondary-button delete-document" type="button" data-id="${escapeHtml(record.id)}">Delete</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function renderDocumentForm(record = null) {
  closeDocumentModal();
  editingDocumentId = record?.id || null;
  const visibilityOptions = roles
    .map((role) => `
      <label class="checkbox-row">
        <input type="checkbox" name="documentVisibilityRoles" value="${escapeHtml(role)}" ${(record?.visibilityRoles || roles).includes(role) ? "checked" : ""} />
        <span>${escapeHtml(role)}</span>
      </label>
    `)
    .join("");

  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="documentModal" class="modal-backdrop">
        <form id="documentForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Document link</p>
              <h2>${record ? "Edit Document" : "Add Document"}</h2>
            </div>
            <button id="closeDocumentModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <div class="form-grid learner-form-grid">
            <label>Title<input id="documentTitle" value="${escapeHtml(record?.documentTitle || "")}" required /></label>
            <label>Category<select id="documentCategory" required>${optionList(documentCategories, record?.documentCategory || "", "Select category")}</select></label>
            <label>School Year<input id="documentSchoolYear" value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" /></label>
            <label class="form-field-wide">Google Drive / Cloud Link<input id="documentLink" type="url" value="${escapeHtml(record?.documentLink || "")}" placeholder="https://..." required /></label>
          </div>
          <label class="modal-field">Description<textarea id="documentDescription" rows="3">${escapeHtml(record?.documentDescription || "")}</textarea></label>
          <label class="modal-field">Tags<input id="documentTags" value="${escapeHtml(record?.tags || "")}" placeholder="comma-separated tags" /></label>
          <fieldset class="checkbox-group">
            <legend>Visible To</legend>
            <div class="assignee-list">${visibilityOptions}</div>
          </fieldset>
          <label class="modal-field">Remarks<textarea id="documentRemarks" rows="3">${escapeHtml(record?.remarks || "")}</textarea></label>
          <div id="documentFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelDocumentForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">${record ? "Save Changes" : "Add Document"}</button>
          </div>
        </form>
      </div>
    `
  );
}

function getDocumentFormData() {
  const visibilityRoles = [...document.querySelectorAll('input[name="documentVisibilityRoles"]:checked')].map((input) => input.value);
  normalizeRoleList(currentUserProfile).forEach((role) => {
    if (!visibilityRoles.includes(role)) visibilityRoles.push(role);
  });

  return {
    documentTitle: document.querySelector("#documentTitle").value.trim(),
    documentCategory: document.querySelector("#documentCategory").value,
    documentDescription: document.querySelector("#documentDescription").value.trim(),
    documentLink: document.querySelector("#documentLink").value.trim(),
    schoolYear: document.querySelector("#documentSchoolYear").value.trim(),
    visibilityRoles,
    tags: document.querySelector("#documentTags").value.trim(),
    remarks: document.querySelector("#documentRemarks").value.trim(),
  };
}

async function handleDocumentFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#documentFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  const wasEditing = Boolean(editingDocumentId);
  submitButton.disabled = true;

  try {
    const data = getDocumentFormData();
    if (!data.visibilityRoles.length) throw new Error("Select at least one visibility role.");
    if (!isValidUrl(data.documentLink)) throw new Error("Enter a valid http or https document link.");
    if (editingDocumentId) {
      await updateDocumentRecord(editingDocumentId, data);
    } else {
      const docRef = await createDocumentRecord(data);
      const notifyRoles = [...data.visibilityRoles];
      if (["Governance Documents", "Financial Documents", "Memoranda"].includes(data.documentCategory)) {
        notifyRoles.push("Principal");
      }
      notifyRoles.push("Administrative Assistant");
      await createRoleNotifications(notifyRoles, {
        notificationType: "document_uploaded",
        title: "Document uploaded",
        message: `${currentUserProfile.fullName} uploaded ${data.documentTitle}.`,
        relatedModule: "Document Repository",
        relatedRecordId: docRef.id,
        actionUrl: "#Document Repository",
      });
    }
    closeDocumentModal();
    showDashboardMessage(wasEditing ? "Document updated." : "Document added.");
    await loadDocumentRecords();
    await refreshDocumentCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function closeDocumentModal() {
  document.querySelector("#documentModal")?.remove();
  editingDocumentId = null;
}

function bindDocumentModuleEvents() {
  document.querySelector("#newDocumentButton")?.addEventListener("click", () => renderDocumentForm());
  document.querySelector("#downloadDocumentCsv").addEventListener("click", downloadDocumentCsv);
  document.querySelector("#downloadDocumentExcel").addEventListener("click", downloadDocumentExcel);
  document.querySelector("#printDocumentView").addEventListener("click", () => printCurrentReport("Document Repository"));
  document.querySelectorAll(".document-view-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeDocumentView = button.dataset.view;
      document.querySelectorAll(".document-view-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      applyDocumentFilters();
    });
  });
  [
    "#documentSearch",
    "#filterDocumentCategory",
    "#filterDocumentUploader",
    "#filterDocumentSchoolYear",
    "#filterDocumentRole",
    "#filterDocumentDate",
    "#sortDocuments",
  ].forEach((selector) => document.querySelector(selector).addEventListener("input", applyDocumentFilters));
}

async function handleDocumentAction(event) {
  const editButton = event.target.closest(".edit-document");
  const deleteButton = event.target.closest(".delete-document");
  const copyButton = event.target.closest(".copy-document-link");
  const printButton = event.target.closest(".print-document-info");
  const closeButton = event.target.closest("#closeDocumentModal, #cancelDocumentForm");

  if (closeButton) {
    closeDocumentModal();
    return;
  }

  if (editButton) {
    const record = documentRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) renderDocumentForm(record);
    return;
  }

  if (copyButton) {
    const record = documentRecordsCache.find((item) => item.id === copyButton.dataset.id);
    if (record?.documentLink) {
      await navigator.clipboard.writeText(record.documentLink);
      showDashboardMessage("Document link copied.");
    }
    return;
  }

  if (printButton) {
    const record = documentRecordsCache.find((item) => item.id === printButton.dataset.id);
    if (record) {
      renderDocumentInfoPrint(record);
      printCurrentReport("Document Info");
      renderDocumentRepositoryModule();
    }
    return;
  }

  if (deleteButton) {
    const record = documentRecordsCache.find((item) => item.id === deleteButton.dataset.id);
    if (!record || !canDeleteDocument(record)) return;
    try {
      await deleteDocumentRecord(record.id);
      showDashboardMessage("Document deleted.");
      await loadDocumentRecords();
      await refreshDocumentCounters(currentUserProfile.role);
    } catch (error) {
      showDashboardMessage(`Delete failed: ${error.message}`, true);
    }
  }
}

function handleInventoryFacilityAction(event) {
  if (event.target.closest("#newInventoryFacilityButton")) {
    openInventoryFacilityForm();
    return;
  }

  if (event.target.closest("#printInventoryFacilities")) {
    printCurrentReport("Inventory & Facilities");
    return;
  }

  const editButton = event.target.closest(".edit-inventory-facility");
  if (editButton) {
    const record = inventoryFacilityRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) openInventoryFacilityForm(record);
  }
}

function renderDocumentInfoPrint(record) {
  els.dashboardTitle.textContent = "Document Info";
  els.dashboardContent.innerHTML = `
    <section class="module-panel">
      <p class="eyebrow">Document repository</p>
      <h2>${escapeHtml(record.documentTitle || "Document")}</h2>
      <p>${escapeHtml(record.documentDescription || "No description")}</p>
      <p><strong>Category:</strong> ${escapeHtml(record.documentCategory || "Other")}</p>
      <p><strong>School Year:</strong> ${escapeHtml(record.schoolYear || "Not recorded")}</p>
      <p><strong>Visible To:</strong> ${escapeHtml((record.visibilityRoles || []).join(", "))}</p>
      <p><strong>Link:</strong> ${escapeHtml(record.documentLink || "No link")}</p>
      <p><strong>Remarks:</strong> ${escapeHtml(record.remarks || "No remarks")}</p>
    </section>
  `;
}

function downloadDocumentCsv() {
  const exportData = getDocumentExportData();
  downloadCsvReport({ ...exportData, filename: "document-repository.csv" });
}

function downloadDocumentExcel() {
  const exportData = getDocumentExportData();
  downloadExcelReport({ ...exportData, filename: "document-repository.xls" });
}

function getDocumentExportData() {
  const headers = [
    "Title",
    "Category",
    "Description",
    "Link",
    "School Year",
    "Uploaded By",
    "Uploaded Role",
    "Visibility Roles",
    "Tags",
    "Remarks",
    "Created At",
    "Updated At",
  ];
  const rows = filteredDocumentRecords.map((record) => [
    record.documentTitle,
    record.documentCategory,
    record.documentDescription,
    record.documentLink,
    record.schoolYear,
    record.uploadedByName,
    record.uploadedByRole,
    (record.visibilityRoles || []).join(" / "),
    record.tags,
    record.remarks,
    formatDate(record.createdAt),
    formatDate(record.updatedAt),
  ]);
  return { reportName: "Document Repository", headers, rows };
}

async function renderPpaMonitoringModule() {
  els.dashboardTitle.textContent = "PPA Monitoring and Evaluation";
  els.dashboardContent.innerHTML = `
    <section class="module-panel compliance-toolbar">
      <div>
        <p class="eyebrow">District monitoring tool</p>
        <h2>PPA Monitoring and Evaluation</h2>
      </div>
      <div class="toolbar-actions">
        ${canCreatePpaRecord() ? `<button id="newPpaButton" class="primary-button" type="button">Add PPA Record</button>` : ""}
        <button id="downloadPpaCsv" class="secondary-button" type="button">Export CSV</button>
        <button id="downloadPpaExcel" class="secondary-button" type="button">Export Excel</button>
        <button id="printPpaView" class="secondary-button" type="button">Print Report</button>
      </div>
    </section>

    <section id="ppaAnalytics" class="chart-grid">
      <p class="empty-state">Loading PPA analytics...</p>
    </section>

    <section class="table-card">
      <div class="filter-grid">
        <label>Search<input id="ppaSearch" type="search" placeholder="Search PPA records" /></label>
        <label>Category<select id="filterPpaCategory"></select></label>
        <label>Term<select id="filterPpaQuarter"></select></label>
        <label>School Year<select id="filterPpaSchoolYear"></select></label>
        <label>Status<select id="filterPpaStatus"></select></label>
        <label>Program Proponent<select id="filterPpaProponent"></select></label>
      </div>
      <div id="ppaTableHost" class="table-wrap">
        <p class="empty-state">Loading PPA monitoring records...</p>
      </div>
    </section>
  `;

  await loadPpaRecords();
  bindPpaModuleEvents();
}

async function loadPpaRecords() {
  ppaRecordsCache = await getVisiblePpaRecords();
  ppaRecordsCache.sort((a, b) => (b.monitoringDate || "").localeCompare(a.monitoringDate || ""));
  populatePpaFilters();
  applyPpaFilters();
}

function populatePpaFilters() {
  document.querySelector("#filterPpaCategory").innerHTML = optionList(ppaCategories, "", "All categories");
  document.querySelector("#filterPpaQuarter").innerHTML = optionList(ppaQuarters, "", "All terms");
  document.querySelector("#filterPpaSchoolYear").innerHTML = optionList(uniqueOptions(ppaRecordsCache, "schoolYear"), "", "All school years");
  document.querySelector("#filterPpaStatus").innerHTML = optionList(ppaStatuses, "", "All statuses");
  document.querySelector("#filterPpaProponent").innerHTML = optionList(uniqueOptions(ppaRecordsCache, "programProponent"), "", "All proponents");
}

function applyPpaFilters() {
  const search = document.querySelector("#ppaSearch").value.trim().toLowerCase();
  const category = document.querySelector("#filterPpaCategory").value;
  const quarter = document.querySelector("#filterPpaQuarter").value;
  const schoolYear = document.querySelector("#filterPpaSchoolYear").value;
  const status = document.querySelector("#filterPpaStatus").value;
  const proponent = document.querySelector("#filterPpaProponent").value;

  filteredPpaRecords = ppaRecordsCache.filter((record) => {
    const searchable = [
      record.ppaTitle,
      record.ppaCategory,
      ppaTermLabel(record.monitoringQuarter),
      record.schoolYear,
      record.programProponent,
      record.targetBeneficiaries,
      record.implementationStatus,
      record.accomplishmentSummary,
      record.findingsResults,
      record.recommendation,
      record.remarksTAProvided,
      record.nextSteps,
    ].filter(Boolean).join(" ").toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!category || record.ppaCategory === category) &&
      (!quarter || ppaTermLabel(record.monitoringQuarter) === quarter) &&
      (!schoolYear || record.schoolYear === schoolYear) &&
      (!status || record.implementationStatus === status) &&
      (!proponent || record.programProponent === proponent)
    );
  });

  renderPpaAnalytics();
  renderPpaTable();
}

function renderPpaAnalytics() {
  const chartHost = document.querySelector("#ppaAnalytics");
  if (!chartHost) return;
  const evidentCounts = getPpaEvidenceCounts(filteredPpaRecords);
  chartHost.innerHTML = `
    ${renderPpaChart("PPAs by Category", filteredPpaRecords, ppaCategories, "ppaCategory")}
    ${renderPpaChart("PPA Status Distribution", filteredPpaRecords, ppaStatuses, "implementationStatus")}
    ${renderSummaryChart("Evident vs Not Evident", [["Evident", evidentCounts.evident], ["Not Evident", evidentCounts.notEvident]])}
  `;
}

function renderPpaChart(title, records, labels, field) {
  const rows = labels.map((label) => [label, records.filter((record) => record[field] === label).length]);
  return renderSummaryChart(title, rows);
}

function getPpaEvidenceCounts(records) {
  return records.reduce((counts, record) => {
    (record.checklistIndicators || []).forEach((indicator) => {
      if (indicator.evidentStatus === "Evident") counts.evident += 1;
      if (indicator.evidentStatus === "Not Evident") counts.notEvident += 1;
    });
    return counts;
  }, { evident: 0, notEvident: 0 });
}

function ppaMovFolderLink(record = {}) {
  if (!record) return "";
  return record.movFolderLink || record.movLink || (record.movLinks || [])[0] || "";
}

function renderPpaTable() {
  const tableHost = document.querySelector("#ppaTableHost");
  if (!filteredPpaRecords.length) {
    tableHost.innerHTML = `<p class="empty-state">No PPA monitoring records match the current view.</p>`;
    return;
  }

  tableHost.innerHTML = `
    <table class="ppa-table">
      <thead>
        <tr>
          <th>PPA</th>
          <th>Category</th>
          <th>Term / Date</th>
          <th>Proponent</th>
          <th>Status</th>
          <th>Evidence</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${filteredPpaRecords.map(renderPpaRow).join("")}</tbody>
    </table>
  `;
}

function renderPpaRow(record) {
  const counts = getPpaEvidenceCounts([record]);
  const movFolderLink = ppaMovFolderLink(record);
  return `
    <tr>
      <td>
        <button class="link-button ppa-title-button view-ppa" type="button" data-id="${escapeHtml(record.id)}">
          ${escapeHtml(record.ppaTitle || "Untitled PPA")}
        </button>
        <small class="row-note">${escapeHtml(record.targetBeneficiaries || "No beneficiaries recorded")}</small>
        <small class="row-note">${escapeHtml(record.accomplishmentSummary || "No accomplishment summary")}</small>
        ${movFolderLink ? `<a class="row-note" href="${escapeHtml(movFolderLink)}" target="_blank" rel="noopener">Open MOV folder</a>` : ""}
      </td>
      <td>${escapeHtml(record.ppaCategory || "No category")}</td>
      <td>
        ${escapeHtml(ppaTermLabel(record.monitoringQuarter) || "No term")}
        <small class="row-note">${escapeHtml(record.monitoringDate || "No date")}</small>
        <small class="row-note">SY ${escapeHtml(record.schoolYear || "Not recorded")}</small>
      </td>
      <td>${escapeHtml(record.programProponent || "No proponent")}</td>
      <td><span class="badge status-${statusClass(record.implementationStatus)}">${escapeHtml(record.implementationStatus || "Ongoing")}</span></td>
      <td>
        Evident: ${counts.evident}
        <small class="row-note">Not Evident: ${counts.notEvident}</small>
      </td>
      <td>
        <div class="row-actions">
          <button class="secondary-button print-ppa" type="button" data-id="${escapeHtml(record.id)}">Print</button>
          ${canEditPpaRecord(record) ? `<button class="secondary-button edit-ppa" type="button" data-id="${escapeHtml(record.id)}">Edit</button>` : ""}
          ${canDeletePpaRecord() ? `<button class="danger-button delete-ppa" type="button" data-id="${escapeHtml(record.id)}">Delete</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function renderPpaForm(record = null) {
  closePpaModal();
  editingPpaId = record?.id || null;
  const checklist = record?.checklistIndicators || buildDefaultPpaChecklist();
  const selectedTerm = ppaTermLabel(record?.monitoringQuarter || "");
  const selectedMovFolderLink = ppaMovFolderLink(record);
  const principalChecklistSection = hasRole(currentUserProfile, "Principal") ? `
          <section class="ppa-checklist">
            <div class="section-header">
              <div>
                <p class="eyebrow">Checklist indicators</p>
                <h2>Principal Evidence Review</h2>
              </div>
            </div>
            ${checklist.map(renderPpaChecklistField).join("")}
          </section>
  ` : "";
  els.dashboardContent.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="ppaModal" class="modal-backdrop">
        <form id="ppaForm" class="modal wide-modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">PPA monitoring</p>
              <h2>${record ? "Edit PPA Monitoring Record" : "Add PPA Monitoring Record"}</h2>
            </div>
            <button id="closePpaModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <div class="form-grid learner-form-grid">
            <label>PPA Title<input id="ppaTitle" value="${escapeHtml(record?.ppaTitle || "")}" required /></label>
            <label>Category<select id="ppaCategory" required>${optionList(ppaCategories, record?.ppaCategory || "", "Select category")}</select></label>
            <label>Term<select id="ppaQuarter" required>${optionList(ppaQuarters, selectedTerm, "Select term")}</select></label>
            <label>Monitoring Date<input id="ppaMonitoringDate" type="date" value="${escapeHtml(record?.monitoringDate || "")}" required /></label>
            <label>School Year<input id="ppaSchoolYear" value="${escapeHtml(record?.schoolYear || "")}" placeholder="2026-2027" required /></label>
            <label>Program Proponent<input id="ppaProgramProponent" value="${escapeHtml(record?.programProponent || currentUserProfile.fullName || "")}" required /></label>
            <label>Target Beneficiaries<input id="ppaTargetBeneficiaries" value="${escapeHtml(record?.targetBeneficiaries || "")}" required /></label>
            <label>Status<select id="ppaStatus" required>${optionList(ppaStatuses, record?.implementationStatus || "Ongoing", "Select status")}</select></label>
            <label>Conforme / School Head<input id="ppaConformeSchoolHead" value="${escapeHtml(record?.conformeSchoolHead || "")}" /></label>
            <label class="form-field-wide">Google Drive MOV Folder Link<input id="ppaMovFolderLink" type="url" value="${escapeHtml(selectedMovFolderLink)}" placeholder="https://drive.google.com/drive/folders/..." required /></label>
          </div>

          <label class="modal-field">Accomplishment Summary<textarea id="ppaAccomplishmentSummary" rows="3">${escapeHtml(record?.accomplishmentSummary || "")}</textarea></label>
          <label class="modal-field">Findings and Results<textarea id="ppaFindingsResults" rows="3">${escapeHtml(record?.findingsResults || "")}</textarea></label>
          <label class="modal-field">Recommendation<textarea id="ppaRecommendation" rows="3">${escapeHtml(record?.recommendation || "")}</textarea></label>
          <label class="modal-field">Overall Remarks / Technical Assistance Provided<textarea id="ppaRemarksTAProvided" rows="3">${escapeHtml(record?.remarksTAProvided || "")}</textarea></label>
          <label class="modal-field">Next Steps<textarea id="ppaNextSteps" rows="3">${escapeHtml(record?.nextSteps || "")}</textarea></label>

          ${principalChecklistSection}

          <div id="ppaFormMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelPpaForm" class="secondary-button" type="button">Cancel</button>
            <button class="primary-button" type="submit">${record ? "Save Changes" : "Save PPA Record"}</button>
          </div>
        </form>
      </div>
    `
  );
}

function buildDefaultPpaChecklist() {
  return ppaChecklistIndicators.map((indicatorText) => ({
    indicatorText,
    evidentStatus: "Not Evident",
    meansOfVerification: "",
    remarksTAProvided: "",
  }));
}

function renderPpaChecklistField(indicator, index) {
  return `
    <article class="ppa-checklist-item" data-index="${index}">
      <p>${escapeHtml(indicator.indicatorText)}</p>
      <div class="form-grid learner-form-grid">
        <label>Principal Finding<select class="ppa-indicator-status">${optionList(["Evident", "Not Evident"], indicator.evidentStatus || "Not Evident", "Select status")}</select></label>
        <label class="form-field-wide">Principal Remarks<textarea class="ppa-indicator-remarks" rows="2">${escapeHtml(indicator.remarksTAProvided || "")}</textarea></label>
      </div>
    </article>
  `;
}

function getPpaFormData() {
  const movFolderLink = document.querySelector("#ppaMovFolderLink").value.trim();
  const checklistItems = [...document.querySelectorAll(".ppa-checklist-item")];
  const existingRecord = editingPpaId ? ppaRecordsCache.find((record) => record.id === editingPpaId) : null;
  const checklistIndicators = checklistItems.length
    ? checklistItems.map((item, index) => ({
      indicatorText: ppaChecklistIndicators[index],
      evidentStatus: item.querySelector(".ppa-indicator-status").value,
      meansOfVerification: "",
      remarksTAProvided: item.querySelector(".ppa-indicator-remarks").value.trim(),
    }))
    : existingRecord?.checklistIndicators || buildDefaultPpaChecklist();

  return {
    ppaTitle: document.querySelector("#ppaTitle").value.trim(),
    ppaCategory: document.querySelector("#ppaCategory").value,
    monitoringQuarter: document.querySelector("#ppaQuarter").value,
    monitoringDate: document.querySelector("#ppaMonitoringDate").value,
    schoolYear: document.querySelector("#ppaSchoolYear").value.trim(),
    programProponent: document.querySelector("#ppaProgramProponent").value.trim(),
    targetBeneficiaries: document.querySelector("#ppaTargetBeneficiaries").value.trim(),
    implementationStatus: document.querySelector("#ppaStatus").value,
    accomplishmentSummary: document.querySelector("#ppaAccomplishmentSummary").value.trim(),
    findingsResults: document.querySelector("#ppaFindingsResults").value.trim(),
    recommendation: document.querySelector("#ppaRecommendation").value.trim(),
    remarksTAProvided: document.querySelector("#ppaRemarksTAProvided").value.trim(),
    nextSteps: document.querySelector("#ppaNextSteps").value.trim(),
    movLinks: movFolderLink ? [movFolderLink] : [],
    conformeSchoolHead: document.querySelector("#ppaConformeSchoolHead").value.trim(),
    checklistIndicators,
  };
}

async function handlePpaFormSubmit(event) {
  event.preventDefault();
  const message = document.querySelector("#ppaFormMessage");
  const submitButton = event.target.querySelector(".primary-button");
  submitButton.disabled = true;

  try {
    const data = getPpaFormData();
    const wasEditing = Boolean(editingPpaId);
    if (!isGoogleDriveFolderUrl(data.movLinks[0] || "")) {
      throw new Error("MOV folder link must be a valid Google Drive folder URL.");
    }
    if (wasEditing) {
      const existing = ppaRecordsCache.find((record) => record.id === editingPpaId);
      if (!canEditPpaRecord(existing)) throw new Error("You do not have permission to edit this PPA record.");
      await updatePpaRecord(editingPpaId, data);
    } else {
      await createPpaRecord(data);
    }
    closePpaModal();
    showDashboardMessage(wasEditing ? "PPA record updated." : "PPA record created.");
    await loadPpaRecords();
    await refreshPpaCounters(currentUserProfile.role);
  } catch (error) {
    message.textContent = `Save failed: ${error.message}`;
    message.classList.add("error");
    message.classList.remove("hidden");
  } finally {
    submitButton.disabled = false;
  }
}

function closePpaModal() {
  document.querySelector("#ppaModal")?.remove();
  editingPpaId = null;
}

function bindPpaModuleEvents() {
  document.querySelector("#newPpaButton")?.addEventListener("click", () => renderPpaForm());
  document.querySelector("#downloadPpaCsv").addEventListener("click", downloadPpaCsv);
  document.querySelector("#downloadPpaExcel").addEventListener("click", downloadPpaExcel);
  document.querySelector("#printPpaView").addEventListener("click", () => printCurrentReport("PPA Monitoring and Evaluation"));
  [
    "#ppaSearch",
    "#filterPpaCategory",
    "#filterPpaQuarter",
    "#filterPpaSchoolYear",
    "#filterPpaStatus",
    "#filterPpaProponent",
  ].forEach((selector) => document.querySelector(selector).addEventListener("input", applyPpaFilters));
}

async function handlePpaAction(event) {
  const viewButton = event.target.closest(".view-ppa");
  const editButton = event.target.closest(".edit-ppa");
  const deleteButton = event.target.closest(".delete-ppa");
  const printButton = event.target.closest(".print-ppa");
  const backButton = event.target.closest("#backPpaList");
  const printDetailButton = event.target.closest("#printPpaDetail");
  const closeButton = event.target.closest("#closePpaModal, #cancelPpaForm");

  if (closeButton) {
    closePpaModal();
    return;
  }

  if (backButton) {
    await renderPpaMonitoringModule();
    return;
  }

  if (printDetailButton) {
    printCurrentReport("PPA Monitoring and Evaluation");
    return;
  }

  if (viewButton) {
    const record = ppaRecordsCache.find((item) => item.id === viewButton.dataset.id);
    if (record) renderPpaPrintRecord(record, { showActions: true });
    return;
  }

  if (editButton) {
    const record = ppaRecordsCache.find((item) => item.id === editButton.dataset.id);
    if (record) renderPpaForm(record);
    return;
  }

  if (printButton) {
    const record = ppaRecordsCache.find((item) => item.id === printButton.dataset.id);
    if (record) {
      renderPpaPrintRecord(record);
      printCurrentReport("PPA Monitoring and Evaluation");
      renderPpaMonitoringModule();
    }
    return;
  }

  if (deleteButton) {
    const record = ppaRecordsCache.find((item) => item.id === deleteButton.dataset.id);
    if (!record || !canDeletePpaRecord()) return;
    try {
      await deletePpaRecord(record.id);
      showDashboardMessage("PPA record deleted.");
      await loadPpaRecords();
      await refreshPpaCounters(currentUserProfile.role);
    } catch (error) {
      showDashboardMessage(`Delete failed: ${error.message}`, true);
    }
  }
}

function renderPpaPrintRecord(record, options = {}) {
  const counts = getPpaEvidenceCounts([record]);
  els.dashboardTitle.textContent = "PPA Monitoring and Evaluation";
  els.dashboardContent.innerHTML = `
    <section class="module-panel ppa-print-record">
      <div class="section-header">
        <div>
          <p class="eyebrow">District Monitoring and Evaluation Tool</p>
          <h2>${escapeHtml(record.ppaTitle || "PPA Monitoring Record")}</h2>
        </div>
        ${options.showActions ? `
          <div class="row-actions">
            <button id="backPpaList" class="secondary-button" type="button">Back</button>
            <button id="printPpaDetail" class="secondary-button" type="button">Print</button>
          </div>
        ` : ""}
      </div>
      <div class="ppa-print-grid">
        <p><strong>Category:</strong> ${escapeHtml(record.ppaCategory || "Not recorded")}</p>
        <p><strong>Term:</strong> ${escapeHtml(ppaTermLabel(record.monitoringQuarter) || "Not recorded")}</p>
        <p><strong>Monitoring Date:</strong> ${escapeHtml(record.monitoringDate || "Not recorded")}</p>
        <p><strong>School Year:</strong> ${escapeHtml(record.schoolYear || "Not recorded")}</p>
        <p><strong>Program Proponent:</strong> ${escapeHtml(record.programProponent || "Not recorded")}</p>
        <p><strong>Beneficiaries:</strong> ${escapeHtml(record.targetBeneficiaries || "Not recorded")}</p>
        <p><strong>Status:</strong> ${escapeHtml(record.implementationStatus || "Not recorded")}</p>
        <p><strong>Conforme / School Head:</strong> ${escapeHtml(record.conformeSchoolHead || "Not recorded")}</p>
      </div>
      <p><strong>Accomplishment Summary:</strong> ${escapeHtml(record.accomplishmentSummary || "No summary")}</p>
      <p><strong>Findings and Results:</strong> ${escapeHtml(record.findingsResults || "No findings")}</p>
      <p><strong>Recommendation:</strong> ${escapeHtml(record.recommendation || "No recommendation")}</p>
      <p><strong>Overall Remarks / Technical Assistance Provided:</strong> ${escapeHtml(record.remarksTAProvided || "No remarks")}</p>
      <p><strong>Next Steps:</strong> ${escapeHtml(record.nextSteps || "No next steps")}</p>
      <p><strong>Google Drive MOV Folder:</strong> ${escapeHtml(ppaMovFolderLink(record) || "No link")}</p>
      <p><strong>Evidence Summary:</strong> Evident ${counts.evident} | Not Evident ${counts.notEvident}</p>
      <div class="table-wrap">
        <table class="ppa-print-table">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>Status</th>
              <th>Principal Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${(record.checklistIndicators || []).map((indicator) => `
              <tr>
                <td>${escapeHtml(indicator.indicatorText)}</td>
                <td>${escapeHtml(indicator.evidentStatus)}</td>
                <td>${escapeHtml(indicator.remarksTAProvided || "")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function downloadPpaCsv() {
  const exportData = getPpaExportData();
  downloadCsvReport({ ...exportData, filename: "ppa-monitoring.csv" });
}

function downloadPpaExcel() {
  const exportData = getPpaExportData();
  downloadExcelReport({ ...exportData, filename: "ppa-monitoring.xls" });
}

function getPpaExportData() {
  const headers = [
    "PPA Title",
    "Category",
    "Term",
    "Monitoring Date",
    "School Year",
    "Program Proponent",
    "Target Beneficiaries",
    "Status",
    "Evident Count",
    "Not Evident Count",
    "Findings and Results",
    "Recommendation",
    "Overall Remarks / Technical Assistance Provided",
    "Next Steps",
    "Google Drive MOV Folder",
    "Conforme / School Head",
    "Created By",
    "Updated At",
  ];
  const rows = filteredPpaRecords.map((record) => {
    const counts = getPpaEvidenceCounts([record]);
    return [
      record.ppaTitle,
      record.ppaCategory,
      ppaTermLabel(record.monitoringQuarter),
      record.monitoringDate,
      record.schoolYear,
      record.programProponent,
      record.targetBeneficiaries,
      record.implementationStatus,
      counts.evident,
      counts.notEvident,
      record.findingsResults,
      record.recommendation,
      record.remarksTAProvided,
      record.nextSteps,
      ppaMovFolderLink(record),
      record.conformeSchoolHead,
      record.createdByName,
      formatDate(record.updatedAt),
    ];
  });
  return { reportName: "PPA Monitoring and Evaluation", headers, rows };
}

function isPrincipal() {
  return hasRole(currentUserProfile, "Principal");
}

async function renderSettingsModule() {
  els.dashboardTitle.textContent = "Settings";

  if (!isPrincipal()) {
    els.dashboardContent.innerHTML = `
      <section class="module-panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Account</p>
            <h2>Settings</h2>
          </div>
        </div>
        <div class="settings-panel-body">
          <p class="empty-state">Settings tools are available to the Principal account.</p>
        </div>
      </section>
    `;
    return;
  }

  els.dashboardContent.innerHTML = `
    <section class="table-card settings-users-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Principal settings</p>
          <h2>Pending User Approvals</h2>
        </div>
      </div>
      <div id="pendingUsersTable" class="table-wrap">
        <p class="empty-state">Loading pending users...</p>
      </div>
    </section>

    <section class="module-panel settings-danger-zone">
      <div class="section-header">
        <div>
          <p class="eyebrow">Principal settings</p>
          <h2>Record Cleanup</h2>
        </div>
      </div>
      <div class="settings-panel-body">
        <p>
          Delete all operational records across modules while keeping user accounts intact.
          This includes reports, learners, observations, enrollment, documents, PPAs,
          academic records, notifications, and audit logs.
        </p>
        <button id="deleteAllRecordsButton" class="danger-button compact-danger-button" type="button">
          Delete all records except users
        </button>
      </div>
    </section>

    <section class="table-card settings-users-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Principal settings</p>
          <h2>User Management</h2>
        </div>
        <button id="deleteSelectedUsersButton" class="danger-button compact-danger-button" type="button" disabled>
          Delete selected users
        </button>
      </div>
      <div class="settings-user-toolbar">
        <label class="checkbox-row select-all-users-row">
          <input id="selectAllSettingsUsers" type="checkbox" />
          <span>Select all shown users</span>
        </label>
        <label>Search users<input id="settingsUserSearch" type="search" placeholder="Search name, email, role, or status" /></label>
      </div>
      <div id="settingsUsersTable" class="table-wrap">
        <p class="empty-state">Loading users...</p>
      </div>
    </section>
  `;

  await loadSettingsUsers();
}

function normalizeUserStatus(user = {}) {
  const status = String(user.status || "").trim().toLowerCase();
  if (status === "approved" || status === "pending") return status;
  return normalizeRoleList(user).length ? "approved" : "pending";
}

function normalizeSettingsUser(userSnapshot) {
  const data = userSnapshot.data();
  return {
    id: userSnapshot.id,
    ...data,
    uid: data.uid || userSnapshot.id,
    status: normalizeUserStatus(data),
  };
}

async function loadSettingsUsers({ renderPending = true } = {}) {
  const tableHost = document.querySelector("#settingsUsersTable");
  if (!tableHost || !db) return;

  try {
    const snapshot = await getDocs(collection(db, "users"));
    settingsUsersCache = snapshot.docs
      .map(normalizeSettingsUser)
      .sort((a, b) => (a.fullName || a.email || "").localeCompare(b.fullName || b.email || ""));
    renderSettingsUsersTable();
    if (renderPending) await loadPendingUsers();
  } catch (error) {
    console.warn("Unable to load users:", error);
    tableHost.innerHTML = `<p class="empty-state error">Unable to load user profiles: ${escapeHtml(error.message)}</p>`;
    const pendingHost = document.querySelector("#pendingUsersTable");
    if (pendingHost) {
      pendingHost.innerHTML = `<p class="empty-state error">Unable to load pending approvals: ${escapeHtml(error.message)}</p>`;
    }
  }
}

function getFilteredSettingsUsers() {
  const search = document.querySelector("#settingsUserSearch")?.value.trim().toLowerCase() || "";
  return settingsUsersCache.filter((user) => {
    const searchable = [
      user.fullName,
      user.email,
      user.role,
      ...(Array.isArray(user.roles) ? user.roles : []),
      user.requestedRole,
      user.status,
      user.id,
    ].filter(Boolean).join(" ").toLowerCase();
    return !search || searchable.includes(search);
  });
}

function renderSettingsUsersTable() {
  const tableHost = document.querySelector("#settingsUsersTable");
  if (!tableHost) return;

  const users = getFilteredSettingsUsers();
  if (!users.length) {
    tableHost.innerHTML = `<p class="empty-state">No users match the current search.</p>`;
    syncSettingsUserSelection();
    return;
  }

  tableHost.innerHTML = `
    <table class="settings-users-table">
      <thead>
        <tr>
          <th>Select</th>
          <th>User</th>
          <th>Role</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(renderSettingsUserRow).join("")}
      </tbody>
    </table>
  `;
  syncSettingsUserSelection();
}

function renderSettingsUserRow(user) {
  const isCurrentUser = user.id === auth.currentUser.uid;
  const canChangeRole = user.status === "approved" && !isCurrentUser;
  const userRoleLabel = normalizeRoleList(user).join(" / ");
  return `
    <tr>
      <td>
        <input
          class="settings-user-checkbox"
          type="checkbox"
          value="${escapeHtml(user.id)}"
          ${isCurrentUser ? "disabled" : ""}
          aria-label="Select ${escapeHtml(user.fullName || user.email || user.id)}"
        />
      </td>
      <td>
        <strong>${escapeHtml(user.fullName || "Unnamed user")}</strong>
        <small class="row-note">${escapeHtml(user.email || "No email")}</small>
        <small class="row-note">UID: ${escapeHtml(user.uid || user.id)}</small>
        ${isCurrentUser ? `<small class="row-note warning-text">Current signed-in Principal cannot be selected.</small>` : ""}
      </td>
      <td>
        ${canChangeRole
          ? `<div class="settings-role-select role-checkbox-list" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName || user.email || user.id)}" data-previous-roles="${escapeHtml(normalizeRoleList(user).join("|"))}" role="group" aria-label="Change roles for ${escapeHtml(user.fullName || user.email || user.id)}">
              ${settingsRoleOptions(user)}
            </div>`
          : escapeHtml(userRoleLabel || user.requestedRole || "No role assigned")}
        ${user.status === "pending" ? `<small class="row-note">Use Pending User Approvals to assign the first role.</small>` : ""}
      </td>
      <td><span class="badge status-${statusClass(user.status)}">${escapeHtml(user.status || "unknown")}</span></td>
      <td>${escapeHtml(formatDate(user.createdAt))}</td>
    </tr>
  `;
}

function settingsRoleOptions(user = {}) {
  const selectedRoles = normalizeRoleList(user);
  return roles
    .map((role) => `
      <label class="checkbox-row role-option-row">
        <input class="settings-role-checkbox" type="checkbox" value="${escapeHtml(role)}" ${selectedRoles.includes(role) ? "checked" : ""} />
        <span>${escapeHtml(role)}</span>
      </label>
    `)
    .join("");
}

async function handleSettingsRoleChange(roleList) {
  if (!isPrincipal()) throw new Error("Only Principal can change user roles.");
  const userId = roleList.dataset.userId || "";
  const userName = roleList.dataset.userName || "this user";
  const previousRoles = (roleList.dataset.previousRoles || "").split("|").filter(Boolean);
  const nextRoles = [...roleList.querySelectorAll(".settings-role-checkbox:checked")]
    .map((input) => input.value)
    .filter((role) => roles.includes(role));
  if (!userId || nextRoles.join("|") === previousRoles.join("|")) return;
  if (!nextRoles.length) {
    roleList.querySelectorAll(".settings-role-checkbox").forEach((input) => {
      input.checked = previousRoles.includes(input.value);
    });
    showDashboardMessage("Select at least one role for the user.", true);
    return;
  }

  const confirmed = window.confirm(`Change ${userName}'s roles from ${previousRoles.join(" / ") || "No role"} to ${nextRoles.join(" / ")}?`);
  if (!confirmed) {
    roleList.querySelectorAll(".settings-role-checkbox").forEach((input) => {
      input.checked = previousRoles.includes(input.value);
    });
    return;
  }

  roleList.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  try {
    await updateDoc(doc(db, "users", userId), { role: nextRoles[0], roles: nextRoles });
    const user = settingsUsersCache.find((item) => item.id === userId);
    if (user) {
      user.role = nextRoles[0];
      user.roles = nextRoles;
    }
    roleList.dataset.previousRoles = nextRoles.join("|");
    showDashboardMessage(`${userName}'s roles were changed to ${nextRoles.join(" / ")}.`);
    await refreshUserCounters(currentUserProfile.role);
  } catch (error) {
    roleList.querySelectorAll(".settings-role-checkbox").forEach((input) => {
      input.checked = previousRoles.includes(input.value);
    });
    showDashboardMessage(`Role change failed: ${error.message}`, true);
  } finally {
    roleList.querySelectorAll("input").forEach((input) => {
      input.disabled = false;
    });
  }
}

function getSelectedSettingsUserIds() {
  return [...document.querySelectorAll(".settings-user-checkbox:checked")].map((input) => input.value);
}

function syncSettingsUserSelection() {
  const selectedCount = getSelectedSettingsUserIds().length;
  const deleteButton = document.querySelector("#deleteSelectedUsersButton");
  if (deleteButton) {
    deleteButton.disabled = selectedCount === 0;
    deleteButton.textContent = selectedCount
      ? `Delete selected users (${selectedCount})`
      : "Delete selected users";
  }

  const selectAll = document.querySelector("#selectAllSettingsUsers");
  const available = [...document.querySelectorAll(".settings-user-checkbox:not(:disabled)")];
  if (selectAll) {
    selectAll.checked = available.length > 0 && available.every((input) => input.checked);
    selectAll.indeterminate = available.some((input) => input.checked) && !selectAll.checked;
  }
}

function openDeleteVerificationModal({ title, message, actionLabel, onConfirm }) {
  closeDeleteVerificationModal();
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="deleteVerificationModal" class="modal-backdrop" role="dialog" aria-modal="true">
        <form id="deleteVerificationForm" class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Verification required</p>
              <h2>${escapeHtml(title)}</h2>
            </div>
            <button id="closeDeleteVerificationModal" class="icon-button" type="button" aria-label="Close">x</button>
          </div>
          <p>${escapeHtml(message)}</p>
          <label>Enter verification code to continue<input id="deleteVerificationInput" type="password" autocomplete="off" required /></label>
          <div id="deleteVerificationMessage" class="message hidden" role="status"></div>
          <div class="modal-actions">
            <button id="cancelDeleteVerification" class="secondary-button" type="button">Cancel</button>
            <button class="danger-button" type="submit">${escapeHtml(actionLabel)}</button>
          </div>
        </form>
      </div>
    `
  );

  const form = document.querySelector("#deleteVerificationForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.querySelector("#deleteVerificationInput");
    const messageBox = document.querySelector("#deleteVerificationMessage");
    const submitButton = form.querySelector(".danger-button");
    if (input.value !== DELETE_VERIFICATION_CODE) {
      messageBox.textContent = "Verification code is incorrect.";
      messageBox.classList.add("error");
      messageBox.classList.remove("hidden");
      return;
    }

    submitButton.disabled = true;
    try {
      await onConfirm();
      closeDeleteVerificationModal();
    } catch (error) {
      messageBox.textContent = `Delete failed: ${error.message}`;
      messageBox.classList.add("error");
      messageBox.classList.remove("hidden");
      submitButton.disabled = false;
    }
  });
  document.querySelector("#deleteVerificationInput")?.focus();
}

function closeDeleteVerificationModal() {
  document.querySelector("#deleteVerificationModal")?.remove();
}

async function deleteDocumentsInBatches(documentRefs) {
  const chunkSize = 450;
  let deletedCount = 0;
  for (let index = 0; index < documentRefs.length; index += chunkSize) {
    const batch = writeBatch(db);
    const chunk = documentRefs.slice(index, index + chunkSize);
    chunk.forEach((documentRef) => batch.delete(documentRef));
    await batch.commit();
    deletedCount += chunk.length;
  }
  return deletedCount;
}

async function deleteAllRecordsExceptUsers() {
  if (!isPrincipal()) throw new Error("Only Principal can delete all records.");
  const documentRefs = [];
  for (const collectionName of resettableCollections) {
    const snapshot = await getDocs(collection(db, collectionName));
    snapshot.docs.forEach((recordSnapshot) => {
      documentRefs.push(doc(db, collectionName, recordSnapshot.id));
    });
  }
  return deleteDocumentsInBatches(documentRefs);
}

async function deleteSelectedUsers(userIds) {
  if (!isPrincipal()) throw new Error("Only Principal can delete users.");
  const filteredIds = userIds.filter((userId) => userId && userId !== auth.currentUser.uid);
  if (!filteredIds.length) throw new Error("Select at least one user other than the current Principal.");
  return deleteDocumentsInBatches(filteredIds.map((userId) => doc(db, "users", userId)));
}

function handleSettingsAction(event) {
  const closeButton = event.target.closest("#closeDeleteVerificationModal, #cancelDeleteVerification");
  if (closeButton) {
    closeDeleteVerificationModal();
    return;
  }

  if (event.target.closest("#deleteAllRecordsButton")) {
    openDeleteVerificationModal({
      title: "Delete all records?",
      message: "This will permanently delete all operational records except user accounts.",
      actionLabel: "Delete all records",
      onConfirm: async () => {
        const deletedCount = await deleteAllRecordsExceptUsers();
        showDashboardMessage(`Deleted ${deletedCount} record${deletedCount === 1 ? "" : "s"}.`);
        await refreshDashboardCalendar(currentUserProfile.role);
      },
    });
    return;
  }

  if (event.target.closest("#deleteSelectedUsersButton")) {
    const selectedIds = getSelectedSettingsUserIds();
    openDeleteVerificationModal({
      title: "Delete selected users?",
      message: `This will permanently delete ${selectedIds.length} selected user profile${selectedIds.length === 1 ? "" : "s"}.`,
      actionLabel: "Delete users",
      onConfirm: async () => {
        const deletedCount = await deleteSelectedUsers(selectedIds);
        showDashboardMessage(`Deleted ${deletedCount} user profile${deletedCount === 1 ? "" : "s"}.`);
        await loadSettingsUsers();
        await refreshUserCounters(currentUserProfile.role);
      },
    });
    return;
  }

  if (event.target.closest(".settings-user-checkbox")) {
    syncSettingsUserSelection();
    return;
  }

  if (event.target.closest("#selectAllSettingsUsers")) {
    const checked = event.target.checked;
    document.querySelectorAll(".settings-user-checkbox:not(:disabled)").forEach((input) => {
      input.checked = checked;
    });
    syncSettingsUserSelection();
  }
}

const BUTTON_FEEDBACK_VISIBLE_MS = 950;
const BUTTON_FEEDBACK_WATCH_MS = 6000;
const buttonFeedbackTimers = new WeakMap();

function syncButtonFeedbackState(button) {
  if (!button) return;
  const pressedAt = Number(button.dataset.pressedAt || 0);
  const elapsed = pressedAt ? Date.now() - pressedAt : 0;
  const isButton = button instanceof HTMLButtonElement;
  const isDisabled = isButton ? button.disabled : button.getAttribute("aria-disabled") === "true";
  const wasRecentlyPressed = pressedAt && elapsed < BUTTON_FEEDBACK_WATCH_MS;
  const shouldShowBusy = (wasRecentlyPressed && elapsed < BUTTON_FEEDBACK_VISIBLE_MS)
    || (isDisabled && (wasRecentlyPressed || button.classList.contains("is-busy")));
  if (shouldShowBusy) {
    button.classList.add("is-busy");
    button.setAttribute("aria-busy", "true");
    return;
  }
  if (!isDisabled) {
    button.classList.remove("is-busy");
    button.removeAttribute("aria-busy");
    if (!wasRecentlyPressed) {
      button.removeAttribute("data-pressed-at");
    }
  }
}

function clearButtonFeedback(button) {
  if (!button) return;
  const isButton = button instanceof HTMLButtonElement;
  const isDisabled = isButton ? button.disabled : button.getAttribute("aria-disabled") === "true";
  button.classList.remove("is-pressed");
  if (!isDisabled) {
    button.classList.remove("is-busy");
    button.removeAttribute("aria-busy");
    button.removeAttribute("data-pressed-at");
  }
}

function showButtonFeedback(button, force = false) {
  if (!button) return;
  const isButton = button instanceof HTMLButtonElement;
  const isDisabled = isButton ? button.disabled : button.getAttribute("aria-disabled") === "true";
  if (isDisabled && !force) return;
  button.dataset.pressedAt = String(Date.now());
  button.classList.add("is-pressed", "is-busy");
  button.setAttribute("aria-busy", "true");
  clearTimeout(buttonFeedbackTimers.get(button));
  buttonFeedbackTimers.set(button, setTimeout(() => {
    button.classList.remove("is-pressed");
    syncButtonFeedbackState(button);
  }, BUTTON_FEEDBACK_VISIBLE_MS));
  setTimeout(() => syncButtonFeedbackState(button), 80);
  setTimeout(() => syncButtonFeedbackState(button), 500);
  setTimeout(() => clearButtonFeedback(button), BUTTON_FEEDBACK_WATCH_MS);
}

function watchButtonLoadingFeedback() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "disabled" && mutation.target instanceof HTMLButtonElement) {
        syncButtonFeedbackState(mutation.target);
      }
    });
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["disabled"] });
}

function bindEvents() {
  watchButtonLoadingFeedback();
  els.loginTab.addEventListener("click", () => switchAuthTab("login"));
  els.registerTab.addEventListener("click", () => switchAuthTab("register"));
  els.registerForm.addEventListener("submit", handleRegister);
  els.loginForm.addEventListener("submit", handleLogin);
  els.forgotPasswordButton.addEventListener("click", handleForgotPassword);
  els.logoutButton.addEventListener("click", handleLogout);
  els.pendingLogoutButton.addEventListener("click", handleLogout);
  els.menuToggle.addEventListener("click", () => els.sidebar.classList.toggle("open"));
  els.globalSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const queryText = event.currentTarget.value.trim().toLowerCase();
    if (!queryText) return;
    const matchingButton = [...document.querySelectorAll(".nav-button")]
      .find((button) => button.dataset.module?.toLowerCase().includes(queryText));
    if (matchingButton) {
      event.preventDefault();
      matchingButton.click();
      event.currentTarget.blur();
    }
  });
  els.notificationBell.addEventListener("click", () => {
    const isOpen = !els.notificationDropdown.classList.contains("hidden");
    els.notificationDropdown.classList.toggle("hidden", isOpen);
    els.notificationBell.setAttribute("aria-expanded", String(!isOpen));
  });
  els.markAllNotificationsRead.addEventListener("click", async () => {
    try {
      await markAllNotificationsRead();
    } catch (error) {
      showDashboardMessage(`Unable to mark notifications read: ${error.message}`, true);
    }
  });
  els.closeApprovalModal.addEventListener("click", closeApprovalModal);
  els.cancelApproval.addEventListener("click", closeApprovalModal);
  els.approvalForm.addEventListener("submit", handleApproval);

  els.sidebarNav.addEventListener("click", (event) => {
    const button = event.target.closest(".nav-button");
    if (!button || !currentUserProfile) return;

    document
      .querySelectorAll(".nav-button")
      .forEach((navButton) => navButton.classList.remove("active"));
    button.classList.add("active");
    els.sidebar.classList.remove("open");

    if (button.dataset.module === "Dashboard") {
      const dashboardId = dashboardByRole[primaryRole(currentUserProfile)] || "teacherDashboard";
      renderDashboardHome(dashboardId, currentUserProfile);
      els.dashboardTitle.textContent = dashboardIdToTitle(dashboardId);
    } else if (button.dataset.module === "School Setup") {
      renderSchoolSetupModule();
    } else if (button.dataset.module === "Report Assignment") {
      renderTeacherComplianceModule();
    } else if (button.dataset.module === "Learner Monitoring") {
      renderLearnerMonitoringModule();
    } else if (button.dataset.module === "Classroom Observation") {
      renderClassroomObservationModule();
    } else if (button.dataset.module === "Classes / Sections") {
      renderClassesModule();
    } else if (button.dataset.module === "Students") {
      renderStudentsModule();
    } else if (button.dataset.module === "Student Attendance") {
      renderStudentAttendanceModule();
    } else if (button.dataset.module === "Teacher Attendance") {
      renderTeacherAttendanceModule();
    } else if (button.dataset.module === "Teacher Workload") {
      renderTeacherWorkloadModule();
    } else if (["Grade Submission", "Grade Submission Tracker"].includes(button.dataset.module)) {
      renderGradeSubmissionModule();
    } else if (button.dataset.module === "Lesson Plans") {
      renderLessonPlanModule();
    } else if (button.dataset.module === "Diagnostic Test & Exam") {
      renderAssessmentModule();
    } else if (button.dataset.module === "Enrollment") {
      renderEnrollmentModule();
    } else if (button.dataset.module === "PPA Monitoring and Evaluation") {
      renderPpaMonitoringModule();
    } else if (button.dataset.module === "Document Repository") {
      renderDocumentRepositoryModule();
    } else if (button.dataset.module === "Inventory & Facilities") {
      renderInventoryFacilitiesModule();
    } else if (button.dataset.module === "Financial Report") {
      renderFinancialReportModule();
    } else if (button.dataset.module === "Downloadable Reports") {
      renderDownloadableReportsModule();
    } else if (button.dataset.module === "Settings") {
      renderSettingsModule();
    } else {
      renderModulePlaceholder(button.dataset.module);
    }
  });

  document.addEventListener("click", (event) => {
    showButtonFeedback(event.target.closest("button, .link-button"));

    if (
      els.notificationDropdown &&
      !els.notificationDropdown.classList.contains("hidden") &&
      !event.target.closest(".notification-center")
    ) {
      els.notificationDropdown.classList.add("hidden");
      els.notificationBell.setAttribute("aria-expanded", "false");
    }

    const notificationButton = event.target.closest(".notification-item, .activity-item");
    if (notificationButton) {
      const record = notificationRecordsCache.find((item) => item.id === notificationButton.dataset.id);
      if (record) {
        markNotificationRead(record.id).catch((error) => console.warn("Unable to mark notification read:", error));
        navigateFromNotification(record);
        els.notificationDropdown.classList.add("hidden");
        els.notificationBell.setAttribute("aria-expanded", "false");
      }
      return;
    }

    const dashboardCard = event.target.closest(".dashboard-module-card[data-module]");
    if (dashboardCard) {
      navigateToModule(dashboardCard.dataset.module);
      return;
    }

    const setupOpenModuleButton = event.target.closest(".setup-open-module[data-module]");
    if (setupOpenModuleButton) {
      navigateToModule(setupOpenModuleButton.dataset.module);
      return;
    }

    if (event.target.closest("#setupNewClassButton, #setupCreateSectionButton")) {
      openClassForm();
      return;
    }

    if (event.target.closest("#setupNewSubjectButton")) {
      openSchoolSubjectForm();
      return;
    }

    const setupEditSubjectButton = event.target.closest(".setup-edit-subject");
    if (setupEditSubjectButton) {
      const record = schoolSubjectRecordsCache.find((item) => item.id === setupEditSubjectButton.dataset.id);
      openSchoolSubjectForm(record);
      return;
    }

    const setupDeleteSubjectButton = event.target.closest(".setup-delete-subject");
    if (setupDeleteSubjectButton) {
      const record = schoolSubjectRecordsCache.find((item) => item.id === setupDeleteSubjectButton.dataset.id);
      if (record && confirm(`Delete ${subjectLabel(record)}?`)) {
        deleteDoc(doc(db, "schoolSubjects", record.id))
          .then(() => createAuditLog("delete", "School Setup", record.id, record, null))
          .then(renderSchoolSetupModule)
          .then(() => showDashboardMessage("Subject deleted."))
          .catch((error) => showDashboardMessage(`Delete failed: ${error.message}`, true));
      }
      return;
    }

    const setupEditClassButton = event.target.closest(".setup-edit-class");
    if (setupEditClassButton) {
      const record = classRecordsCache.find((item) => item.id === setupEditClassButton.dataset.id);
      openClassForm(record);
      return;
    }

    const approveButton = event.target.closest(".approve-button");
    if (approveButton) {
      openApprovalModal(approveButton.dataset.docId, approveButton.dataset.name);
    }

    handleComplianceAction(event);
    handleLearnerAction(event);
    handleObservationAction(event);
    handleEnrollmentAction(event);
    handleDocumentAction(event);
    handleInventoryFacilityAction(event);
    handleFinancialReportAction(event);
    handlePpaAction(event);
    handleAcademicAction(event);
    handleDownloadableReportAction(event);
    handleSettingsAction(event);

    const sf1DropZone = event.target.closest("#sf1DropZone");
    if (sf1DropZone && event.target.id !== "sf1FileInput") {
      event.preventDefault();
      document.querySelector("#sf1FileInput")?.click();
      return;
    }

    const urgentCard = event.target.closest("#urgentTaskCard");
    if (urgentCard) {
      openCalendarModal();
      return;
    }

    if (event.target.closest("#closeCalendarModal")) {
      document.querySelector("#calendarModal")?.remove();
      return;
    }

    if (event.target.closest("#closeCalendarEventModal, #cancelCalendarEventForm")) {
      document.querySelector("#calendarEventModal")?.remove();
      return;
    }

    if (event.target.closest("#newCalendarEventButton")) {
      openCalendarEventForm();
      return;
    }

    const editCalendarEvent = event.target.closest(".edit-calendar-event");
    if (editCalendarEvent) {
      const record = calendarPersonalEventsCache.find((item) => item.id === editCalendarEvent.dataset.id);
      if (record) openCalendarEventForm(record);
      return;
    }

    const deleteCalendarEvent = event.target.closest(".delete-calendar-event");
    if (deleteCalendarEvent) {
      const record = calendarPersonalEventsCache.find((item) => item.id === deleteCalendarEvent.dataset.id);
      if (record && confirm(`Delete ${record.title || "this schedule"}?`)) {
        deleteDoc(doc(db, "calendarEvents", record.id))
          .then(() => createAuditLog("delete", "Calendar", record.id, record, null))
          .then(loadCalendarModalData)
          .then(async () => {
            dashboardCalendarItemsCache = await getUserCalendarItems(currentUserProfile);
            renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems());
            showDashboardMessage("Schedule deleted.");
          })
          .catch((error) => showDashboardMessage(`Delete failed: ${error.message}`, true));
      }
      return;
    }

    if (event.target.closest("#calendarPrevMonth")) {
      const next = new Date(calendarViewYear, calendarViewMonth - 1, 1);
      renderCalendar(next.getMonth(), next.getFullYear(), getCalendarDisplayItems());
      return;
    }

    if (event.target.closest("#calendarNextMonth")) {
      const next = new Date(calendarViewYear, calendarViewMonth + 1, 1);
      renderCalendar(next.getMonth(), next.getFullYear(), getCalendarDisplayItems());
      return;
    }

    if (event.target.closest("#calendarToday")) {
      const today = new Date();
      selectedCalendarDate = todayIso();
      renderCalendar(today.getMonth(), today.getFullYear(), getCalendarDisplayItems());
      return;
    }

    const calendarCell = event.target.closest(".calendar-cell[data-date]");
    if (calendarCell) {
      selectedCalendarDate = calendarCell.dataset.date;
      renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems());
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target?.id === "urgentTaskCard") {
      openCalendarModal();
    }
    if ((event.key === "Enter" || event.key === " ") && event.target?.classList?.contains("dashboard-module-card")) {
      event.preventDefault();
      navigateToModule(event.target.dataset.module);
    }
    if ((event.key === "Enter" || event.key === " ") && event.target?.classList?.contains("workload-summary-row")) {
      event.preventDefault();
      renderTeacherWorkloadDetail(event.target.dataset.teacherId);
      document.querySelector("#teacherWorkloadDetailHost")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if ((event.key === "Enter" || event.key === " ") && event.target?.classList?.contains("assessment-group-row")) {
      event.preventDefault();
      event.target.click();
    }
    if ((event.key === "Enter" || event.key === " ") && event.target?.classList?.contains("assessment-workload-card")) {
      event.preventDefault();
      event.target.click();
    }
    if (event.key === "Enter" && event.target?.classList?.contains("assessment-score-input")) {
      event.preventDefault();
      const scoreFields = [...document.querySelectorAll(".assessment-score-input")];
      const currentIndex = scoreFields.indexOf(event.target);
      scoreFields[currentIndex + 1]?.focus();
      scoreFields[currentIndex + 1]?.select();
    }
    if (event.key === "Escape") {
      document.querySelector("#calendarModal")?.remove();
      closeDeleteVerificationModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!event.target.classList?.contains("grade-submission-grade-input") || event.key !== "Enter") return;
    event.preventDefault();
    const inputs = [...document.querySelectorAll(".grade-submission-grade-input")];
    const currentIndex = inputs.indexOf(event.target);
    const nextInput = inputs[currentIndex + 1];
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
      return;
    }
    document.querySelector('button[name="gradeSubmissionAction"][value="draft"]')?.focus();
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "settingsUserSearch") {
      renderSettingsUsersTable();
    }
    if (event.target.id === "calendarMonthSelect" || event.target.id === "calendarYearSelect") {
      const month = Number(document.querySelector("#calendarMonthSelect").value);
      const year = Number(document.querySelector("#calendarYearSelect").value);
      renderCalendar(month, year, getCalendarDisplayItems());
    }
    if (event.target.id === "calendarOwnerSelect") {
      selectedCalendarOwnerUid = event.target.value || auth.currentUser.uid;
      loadSelectedCalendarData().then(() => renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems()));
    }
    if (["calendarViewMode", "calendarCategoryFilter", "calendarAttendanceFilter", "calendarSearch"].includes(event.target.id)) {
      calendarViewMode = document.querySelector("#calendarViewMode")?.value || "month";
      calendarCategoryFilter = document.querySelector("#calendarCategoryFilter")?.value || "";
      calendarAttendanceFilter = document.querySelector("#calendarAttendanceFilter")?.value || "";
      calendarSearchTerm = document.querySelector("#calendarSearch")?.value || "";
      renderCalendar(calendarViewMonth, calendarViewYear, getCalendarDisplayItems());
    }
    if (["classSearch", "classSchoolYearFilter", "classGradeFilter"].includes(event.target.id)) {
      applyClassFilters();
    }
    if (["studentSearch", "studentSchoolYearFilter", "studentGradeFilter", "studentSectionFilter"].includes(event.target.id)) {
      applyStudentFilters();
    }
    if (["studentAttendanceSearch", "studentAttendanceSectionFilter", "studentAttendanceStatusFilter"].includes(event.target.id)) {
      applyStudentAttendanceFilters();
    }
    if (["teacherAttendanceSearch", "teacherAttendanceStatusFilter"].includes(event.target.id)) {
      applyTeacherAttendanceFilters();
    }
    if (["workloadSearch", "workloadDepartmentFilter", "workloadGradeFilter", "workloadSubjectFilter", "workloadStatusFilter"].includes(event.target.id)) {
      applyTeacherWorkloadFilters();
    }
    if (event.target.id === "workloadGradeLevel") {
      syncTeachingLoadSubjectOptions();
    }
    if (["gradeTrackerSearch", "gradeSchoolYearFilter", "gradeTermFilter", "gradeLevelFilter", "gradeSectionFilter", "gradeSubjectFilter", "gradeTeacherFilter", "gradeStatusFilter"].includes(event.target.id)) {
      applyGradeTrackerFilters();
    }
    if (["lessonPlanSearch", "lessonPlanStatusFilter", "lessonPlanTypeFilter"].includes(event.target.id)) {
      applyLessonPlanFilters();
    }
    if (["inventorySearch", "inventoryCategoryFilter", "inventoryConditionFilter", "inventoryStatusFilter", "inventoryLocationFilter"].includes(event.target.id)) {
      applyInventoryFacilityFilters();
    }
    if (["financialSearch", "financialSchoolYearFilter", "financialQuarterFilter", "financialTypeFilter", "financialFundFilter", "financialStatusFilter"].includes(event.target.id)) {
      applyFinancialReportFilters();
    }
    if (["financialAmountAllocated", "financialAmountSpent"].includes(event.target.id)) {
      syncFinancialBalanceMessage();
    }
    handleDownloadableReportInput(event);
    if (["gradeSubmissionGradeLevel", "gradeSubmissionSectionId", "gradeSubmissionSubjectId", "gradeSubmissionTeacherUid"].includes(event.target.id)) {
      syncGradeSubmissionFormFields();
    }
    if (event.target.id === "gradeSubmissionStatus") {
      const dateField = document.querySelector("#gradeSubmissionDateSubmitted");
      if (dateField && !dateField.value && gradeSubmissionCompliedStatuses.includes(event.target.value)) {
        dateField.value = new Date().toISOString().slice(0, 10);
      }
    }
    if (event.target.id === "workloadSectionId") {
      syncTeachingLoadSubjectOptions();
    }
    if (["assessmentSearch", "assessmentSchoolYearFilter", "assessmentTermFilter", "assessmentGradeFilter", "assessmentSectionFilter", "assessmentSubjectFilter", "assessmentTeacherFilter", "assessmentTypeFilter", "assessmentMpsFilter"].includes(event.target.id)) {
      applyAssessmentFilters();
    }
    if (event.target.id === "attendanceSectionId") {
      renderAttendanceBatchRows();
    }
    if (["assessmentTerm", "assessmentWorkloadId", "assessmentScoreType"].includes(event.target.id)) {
      renderAssessmentBatchRows();
    }
    if (event.target.classList?.contains("assessment-pre-input") || event.target.classList?.contains("assessment-post-input") || event.target.classList?.contains("assessment-highest-input")) {
      const studentId = event.target.dataset.studentId;
      const workload = selectedAssessmentWorkload();
      const sectionId = workload?.sectionId || "";
      const term = document.querySelector("#assessmentTerm")?.value || "";
      const scoreType = document.querySelector("#assessmentScoreType")?.value || "";
      const existing = findAssessmentRecord(
        sectionId,
        studentId,
        term,
        workload?.subjectId || "",
        assessmentTypeFromScoreType(scoreType),
        "",
        "",
        workload?.id || ""
      );
      const preField = document.querySelector(`.assessment-pre-input[data-student-id="${CSS.escape(studentId)}"]`);
      const postField = document.querySelector(`.assessment-post-input[data-student-id="${CSS.escape(studentId)}"]`);
      const pre = Number(preField?.value ?? existing?.preTestScore ?? 0);
      const post = Number(postField?.value ?? existing?.postTestScore ?? 0);
      const currentHighest = Number(document.querySelector(`.assessment-highest-input[data-student-id="${CSS.escape(studentId)}"]`)?.value || 0);
      const preHighest = scoreType === "pre" ? currentHighest : getAssessmentHighScore(existing, "pre");
      const postHighest = scoreType === "post" ? currentHighest : getAssessmentHighScore(existing, "post");
      const cell = document.querySelector(`.assessment-improvement-cell[data-student-id="${CSS.escape(studentId)}"]`);
      if (cell) {
        cell.textContent = formatAssessmentComparison({
          preTestScore: pre,
          postTestScore: post,
          preHighestPossibleScore: preHighest,
          postHighestPossibleScore: postHighest,
        });
      }
    }
  });

  document.addEventListener("change", (event) => {
    const settingsRoleList = event.target.closest?.(".settings-role-select");
    if (settingsRoleList && event.target.classList?.contains("settings-role-checkbox")) {
      handleSettingsRoleChange(settingsRoleList);
    }
    handleDownloadableReportInput(event);
    if (event.target.id === "learnerGradeLevel") {
      const sectionSelect = document.querySelector("#learnerSectionId");
      const studentSelect = document.querySelector("#learnerStudentId");
      if (sectionSelect) sectionSelect.innerHTML = learnerSectionOptions(event.target.value, "");
      if (studentSelect) studentSelect.innerHTML = learnerStudentOptions("", "");
      updateLearnerStudentFields();
    }
    if (event.target.id === "learnerSectionId") {
      const studentSelect = document.querySelector("#learnerStudentId");
      if (studentSelect) studentSelect.innerHTML = learnerStudentOptions(event.target.value, "");
      updateLearnerStudentFields();
    }
    if (event.target.id === "learnerStudentId") {
      updateLearnerStudentFields();
    }
    if (event.target.id === "sf1FileInput") {
      handleSf1File(event.target.files?.[0]);
    }
    if (event.target.id === "financialImportFileInput") {
      handleFinancialImportFile(event.target.files?.[0]);
    }
    if (["attendanceSectionId", "attendanceDate"].includes(event.target.id)) {
      renderAttendanceBatchRows();
    }
    if (["assessmentWorkloadId", "assessmentTerm", "assessmentScoreType"].includes(event.target.id)) {
      renderAssessmentBatchRows();
    }
    if (["gradeSubmissionGradeLevel", "gradeSubmissionSectionId", "gradeSubmissionSubjectId", "gradeSubmissionTeacherUid"].includes(event.target.id)) {
      syncGradeSubmissionFormFields();
    }
  });

  document.addEventListener("dragover", (event) => {
    if (event.target.closest("#sf1DropZone")) {
      event.preventDefault();
      event.target.closest("#sf1DropZone").classList.add("drag-over");
    }
    if (event.target.closest("#financialImportDropZone")) {
      event.preventDefault();
      event.target.closest("#financialImportDropZone").classList.add("drag-over");
    }
  });

  document.addEventListener("dragleave", (event) => {
    const dropZone = event.target.closest("#sf1DropZone");
    if (dropZone) dropZone.classList.remove("drag-over");
    const financialDropZone = event.target.closest("#financialImportDropZone");
    if (financialDropZone) financialDropZone.classList.remove("drag-over");
  });

  document.addEventListener("drop", (event) => {
    const dropZone = event.target.closest("#sf1DropZone");
    const financialDropZone = event.target.closest("#financialImportDropZone");
    if (!dropZone && !financialDropZone) return;
    event.preventDefault();
    if (dropZone) {
      dropZone.classList.remove("drag-over");
      handleSf1File(event.dataTransfer?.files?.[0]);
    }
    if (financialDropZone) {
      financialDropZone.classList.remove("drag-over");
      handleFinancialImportFile(event.dataTransfer?.files?.[0]);
    }
  });

  document.addEventListener("submit", (event) => {
    showButtonFeedback(event.submitter || event.target.querySelector("button[type='submit'], .primary-button"), true);

    if (event.target.id === "complianceForm") {
      handleComplianceFormSubmit(event);
    }

    if (event.target.id === "learnerForm") {
      handleLearnerFormSubmit(event);
    }

    if (event.target.id === "observationForm") {
      handleObservationFormSubmit(event);
    }

    if (event.target.id === "enrollmentRecordForm") {
      handleEnrollmentRecordFormSubmit(event);
    }

    if (event.target.id === "documentForm") {
      handleDocumentFormSubmit(event);
    }

    if (event.target.id === "ppaForm") {
      handlePpaFormSubmit(event);
    }

    if (event.target.id === "classForm") {
      handleClassFormSubmit(event);
    }

    if (event.target.id === "studentForm") {
      handleStudentFormSubmit(event);
    }

    if (event.target.id === "studentImportForm") {
      handleStudentImportSubmit(event);
    }

    if (event.target.id === "studentAttendanceForm") {
      handleStudentAttendanceFormSubmit(event);
    }

    if (event.target.id === "teacherAttendanceForm") {
      handleTeacherAttendanceFormSubmit(event);
    }

    if (event.target.id === "calendarEventForm") {
      handleCalendarEventFormSubmit(event);
    }

    if (event.target.id === "teachingLoadForm") {
      handleTeachingLoadFormSubmit(event);
    }

    if (event.target.id === "ancillaryDutyForm") {
      handleAncillaryDutyFormSubmit(event);
    }

    if (event.target.id === "gradeSubmissionForm") {
      handleGradeSubmissionFormSubmit(event);
    }

    if (event.target.id === "lessonPlanForm") {
      handleLessonPlanFormSubmit(event);
    }

    if (event.target.id === "lessonPlanReviewForm") {
      handleLessonPlanReviewSubmit(event);
    }

    if (event.target.id === "schoolSubjectForm") {
      handleSchoolSubjectFormSubmit(event);
    }

    if (event.target.id === "taskVisibilityForm") {
      handleTaskVisibilitySubmit(event);
    }

    if (event.target.id === "inventoryFacilityForm") {
      handleInventoryFacilityFormSubmit(event);
    }

    if (event.target.id === "financialReportForm") {
      handleFinancialReportFormSubmit(event);
    }

    if (event.target.id === "assessmentForm") {
      handleAssessmentFormSubmit(event);
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshingForUpdate = false;

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (hadController && event.data?.type === "SINAG_SW_UPDATED") {
      showAppUpdateMessage("New version available. Refreshing app...");
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || refreshingForUpdate) return;
    refreshingForUpdate = true;
    showAppUpdateMessage("New version available. Refreshing app...");
    window.setTimeout(() => window.location.reload(), 1200);
  });

  navigator.serviceWorker.register("./service-worker.js")
    .then((registration) => {
      registration.update();
      window.setInterval(() => registration.update(), 60 * 60 * 1000);
    })
    .catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
}

populateRoleOptions();
bindEvents();
initializeFirebase();
registerServiceWorker();
