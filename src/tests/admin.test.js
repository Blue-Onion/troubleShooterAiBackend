const ADMIN_BASE_URL = "http://localhost:3000/api/admin";

/*
  TOKENS (replace)
*/
const ADMIN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTMxOGJjNy1iNWI1LTQxOGMtYWY5NS04NTg5NGZhZGE1ZjUiLCJpYXQiOjE3NzA1Nzk4NTQsImV4cCI6MTc3MTE4NDY1NH0.m_JQF_BUE1yGyMHxNb3YULpFIUC_5sILiouxyGdSIsQ";

const MEMBER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYjc3NDVjMi1iNmE4LTRmMWQtOGJkYi04Mjg2NDE3ZmY3ZjEiLCJpYXQiOjE3NzA1Nzk4MDcsImV4cCI6MTc3MTE4NDYwN30.W38vtw2nUEWaGWSZBc82d2gHHNoJZQyDvDbXH5MlfCo";

const STAFF_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MDlmYjk4Zi00Njc3LTQ4NTMtODYzNS1kNTVlOGExNDIwNzciLCJpYXQiOjE3NzA1Nzk4NTUsImV4cCI6MTc3MTE4NDY1NX0.quLGfDZ8Wr6-FnB-Ryy95YeyQMbBPBcjNwoeFdfkXaU";

/*
  IDS (replace)
*/
const ORG_ID = "74179c43-1fc7-4f05-9117-9ba78f19f7b7";
const ISSUE_ID = "b4208e34-db9b-4ec3-ac5e-55a8e1aa7821";
const STAFF_ID = "07d54a1d-be83-46fa-9066-1fad9582c6bb";
const MEMBER_ID = "9fd01306-a54e-4e14-918e-f6d247da963b";

/* -------------------------
 Helpers
-------------------------- */

const headersFor = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

function assertStatus(res, expectedStatus, title) {
  if (res.status !== expectedStatus) {
    console.error(
      `❌ ${title} FAILED: Expected ${expectedStatus}, got ${res.status}`,
    );
    // process.exit(1); // Optional: stop on failure
  } else {
    console.log(`✅ ${title} PASSED (${res.status})`);
  }
}

async function log(title, res, expectedStatus = 200) {
  let data = {};
  try {
    data = await res.json();
  } catch {}

  assertStatus(res, expectedStatus, title);
  // console.log("DATA:", JSON.stringify(data, null, 2));
}

async function post(url, token, body) {
  return fetch(url, {
    method: "POST",
    headers: headersFor(token),
    body: JSON.stringify(body),
  });
}

/* =========================
 ADMIN TESTS
========================= */

async function adminGetPending() {
  const res = await fetch(`${ADMIN_BASE_URL}/${ORG_ID}/pending-applicants`, {
    headers: headersFor(ADMIN_TOKEN),
  });

  await log("ADMIN → GET PENDING APPLICANTS", res, 200);
}

async function adminDecideStaff(decision) {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-staff`,
    ADMIN_TOKEN,
    {
      id: STAFF_ID,
      decision,
    },
  );

  await log(`ADMIN → DECIDE STAFF (${decision})`, res, 200);
}

async function adminDecideIssue(decision, priority) {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    ADMIN_TOKEN,
    {
      id: ISSUE_ID,
      decision,
      priority,
    },
  );

  await log(`ADMIN → DECIDE ISSUE`, res, 200);
}

async function adminAssignIssue() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/assign-issue`,
    ADMIN_TOKEN,
    {
      id: ISSUE_ID,
      staffId: STAFF_ID,
    },
  );

  await log("ADMIN → ASSIGN ISSUE", res, 200);
}

/* =========================
 NEGATIVE / EDGE CASES
========================= */

async function staffTriesAdminRoute() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    STAFF_TOKEN,
    {
      id: ISSUE_ID,
      decision: "RESOLVED",
      priority: "HIGH",
    },
  );

  await log("STAFF TRY ADMIN ROUTE", res, 403);
}

async function memberTriesAdminRoute() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    MEMBER_TOKEN,
    {
      id: ISSUE_ID,
      decision: "RESOLVED",
      priority: "HIGH", // Added priority to pass validation
    },
  );

  await log("MEMBER TRY ADMIN ROUTE", res, 403);
}

async function invalidEnums() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    ADMIN_TOKEN,
    {
      id: ISSUE_ID,
      decision: "BROKEN",
      priority: "ULTRA",
    },
  );

  await log("INVALID ENUMS", res, 400);
}

async function missingBody() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    ADMIN_TOKEN,
    {},
  );

  await log("MISSING BODY", res, 400);
}

async function invalidUUID() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/assign-issue`,
    ADMIN_TOKEN,
    {
      id: "123",
      staffId: STAFF_ID,
    },
  );

  await log("INVALID UUID", res, 404);
}

async function assignToMember() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/assign-issue`,
    ADMIN_TOKEN,
    {
      id: ISSUE_ID,
      staffId: MEMBER_ID,
    },
  );

  await log("ASSIGN ISSUE TO MEMBER (Should Fail)", res, 400);
}

/* =========================
 RUN EVERYTHING
========================= */

async function run() {
  console.log("\n🚀 ADMIN TEST SUITE START\n");

  await adminGetPending();

  await adminDecideStaff("ACCEPTED");

  await adminDecideIssue("IN_PROGRESS", "HIGH");

  await adminAssignIssue();

  // ❌ failure cases
  await staffTriesAdminRoute();
  await memberTriesAdminRoute();
  await invalidEnums();
  await missingBody();
  await invalidUUID();
  await assignToMember();

  console.log("\n✅ ADMIN TEST SUITE FINISHED\n");
}

run();
