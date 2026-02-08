const ADMIN_BASE_URL = "http://localhost:3000/api/admin";

/*
  TOKENS FROM auth.test.js / org.test.js
  Replace these before running
*/
const USER_A_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYzY3NjMxNS0xNjAwLTQ5MWUtYjFmNi1iMjczYmQwMDI0NTMiLCJpYXQiOjE3NzA1MzQ2MzksImV4cCI6MTc3MTE0MDQzOX0.38112j680589707729716160299273741111111";
const USER_B_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhNGNjYjRhOS1jMjE0LTQ1MjAtOTEwMS1kYWFkNGE1MmNiMTUiLCJpYXQiOjE3NzA1MzQ0NTYsImV4cCI6MTc3MTEzOTI1Nn0.Orpk2THltWLvu0RrVCtdbBdd4ynN1SMKen9CvgyDstU";

// IDs needed for tests - populate these after creating resources or from DB
const ORG_ID = "22e55ef8-06b2-4c0b-b0a1-28248f7d7e79";
const ISSUE_ID = "1e311116-7743-4637-a74d-92751de93d79";
const STAFF_ID = "b82d1b20-e2f2-48db-a236-92fccf199f26"; // User ID of a pending/member staff

/* -------------------------
 Helpers
-------------------------- */

const headersFor = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const log = async (title, res) => {
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  console.log(`\n${title}`);
  console.log("STATUS:", res.status);
  console.log("DATA:", JSON.stringify(data, null, 2));
};

/* -------------------------
 ADMIN TESTS
-------------------------- */

async function getPendingApplicants() {
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/pending-applicants`, {
    method: "GET",
    headers: headersFor(USER_A_TOKEN),
  });

  await log("GET PENDING APPLICANTS", res);
}

async function decideStaff(decision = "ACCEPTED") {
  // decision: "ACCEPTED", "REJECTED", "SUSPENDED"
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/decide-staff`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      id: STAFF_ID,
      decision: decision,
    }),
  });

  await log(`DECIDE STAFF (${decision})`, res);
}

async function decideIssue(decision = "IN_PROGRESS", priority = "MEDIUM") {
  // decision: "PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"
  // priority: "LOW", "MEDIUM", "MEDIUM_HIGH", "HIGH"
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      id: ISSUE_ID,
      decision: decision,
      priority: priority,
    }),
  });

  await log(`DECIDE ISSUE (${decision}, ${priority})`, res);
}

async function assignIssue() {
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/assign-issue`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      id: ISSUE_ID,
      staffId: STAFF_ID,
    }),
  });

  await log("ASSIGN ISSUE", res);
}

/* -------------------------
 VALIDATION / FAILURE TESTS
-------------------------- */

async function decideIssueInvalidEnum() {
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      id: ISSUE_ID,
      decision: "INVALID_DECISION",
      priority: "SUPER_HIGH",
    }),
  });

  await log("DECIDE ISSUE INVALID ENUM", res);
}

async function unauthorizedAccess() {
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN), // Assuming USER_B is not admin or proper role check fails
    body: JSON.stringify({
      id: ISSUE_ID,
      decision: "RESOLVED",
      priority: "HIGH",
    }),
  });

  await log("UNAUTHORIZED ACCESS (USER B)", res);
}

/* -------------------------
 RUN
-------------------------- */

async function run() {
  console.log("\nADMIN TEST SUITE START\n");

  if (ORG_ID === "PASTE_ORG_ID_HERE") {
    console.warn(
      "⚠️  PLEASE SET ORG_ID, ISSUE_ID, STAFF_ID AND TOKENS BEFORE RUNNING ⚠️",
    );
    return;
  }

  await getPendingApplicants();

  // Uncomment based on what state you want to test
  // await decideStaff("ACCEPTED");

  await decideIssue("IN_PROGRESS", "HIGH");
  await assignIssue();

  // Failure cases
  await decideIssueInvalidEnum();
  await unauthorizedAccess();

  console.log("\nADMIN TEST SUITE FINISHED\n");
}

run();
