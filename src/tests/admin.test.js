const ADMIN_BASE_URL = "http://localhost:3000/api/admin";

/*
  TOKENS (replace)
*/
const ADMIN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZjU2YWRkZi00OTlhLTRjNmQtYmNhYy1hMzdlZmY3MmZhMGIiLCJpYXQiOjE3NzA1MzU1NTksImV4cCI6MTc3MTE0MDM1OX0.8QaOSaddMbdzSD9mgTmJ-XxZ2-6O2p9bp10G-mvIQl0";

const MEMBER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZjQ3YTAyOS1hM2IzLTQzOTEtYjhkNy00NDE4NWJlY2MwNmMiLCJpYXQiOjE3NzA1MzU0NDUsImV4cCI6MTc3MTE0MDI0NX0.AcYZwFPwtB_gqEPmUNUA9HADFsnlVuEiqW1wB5vpz5Y";

const STAFF_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDlkMmJmNy1jMDhlLTRlN2ItYWFhMC05ZTUyY2ZkZjAzYTAiLCJpYXQiOjE3NzA1MzU1NTksImV4cCI6MTc3MTE0MDM1OX0.prcgXOnJO9-yQGd_-QbT3PJO1SSngeF99iZ6fSvJJEU";

/*
  IDS (replace)
*/
const ORG_ID = "a3059a1f-05ab-4b66-8ce2-ea45ad894cdf";
const ISSUE_ID = "0cd6b5b0-421a-4737-87a3-6269a1579013";
const STAFF_ID = "c7b7f777-97dc-4ada-8902-ff3311e5c3ed";
const MEMBER_ID = "f0c8af8e-a47e-45ec-a487-d04e0064ec4b";

/* -------------------------
 Helpers
-------------------------- */

const headersFor = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function log(title, res) {
  let data = {};
  try {
    data = await res.json();
  } catch {}

  console.log(`\n${title}`);
  console.log("STATUS:", res.status);
  console.log("DATA:", JSON.stringify(data, null, 2));
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
  const res = await fetch(
    `${ADMIN_BASE_URL}/${ORG_ID}/pending-applicants`,
    { headers: headersFor(ADMIN_TOKEN) },
  );

  await log("ADMIN → GET PENDING APPLICANTS", res);
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

  await log(`ADMIN → DECIDE STAFF (${decision})`, res);
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

  await log(`ADMIN → DECIDE ISSUE`, res);
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

  await log("ADMIN → ASSIGN ISSUE", res);
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

  await log("STAFF TRY ADMIN ROUTE", res);
}

async function memberTriesAdminRoute() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    MEMBER_TOKEN,
    {
      id: ISSUE_ID,
      decision: "RESOLVED",
    },
  );

  await log("MEMBER TRY ADMIN ROUTE", res);
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

  await log("INVALID ENUMS", res);
}

async function missingBody() {
  const res = await post(
    `${ADMIN_BASE_URL}/${ORG_ID}/decide-issue`,
    ADMIN_TOKEN,
    {},
  );

  await log("MISSING BODY", res);
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

  await log("INVALID UUID", res);
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

  await log("ASSIGN ISSUE TO MEMBER", res);
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