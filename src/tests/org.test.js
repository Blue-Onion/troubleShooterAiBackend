const ORG_BASE_URL = "http://localhost:3000/api/org";

/* ================= TOKENS ================= */

const ADMIN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZjU2YWRkZi00OTlhLTRjNmQtYmNhYy1hMzdlZmY3MmZhMGIiLCJpYXQiOjE3NzA1MzU1NTksImV4cCI6MTc3MTE0MDM1OX0.8QaOSaddMbdzSD9mgTmJ-XxZ2-6O2p9bp10G-mvIQl0";

const MEMBER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZjQ3YTAyOS1hM2IzLTQzOTEtYjhkNy00NDE4NWJlY2MwNmMiLCJpYXQiOjE3NzA1MzU0NDUsImV4cCI6MTc3MTE0MDI0NX0.AcYZwFPwtB_gqEPmUNUA9HADFsnlVuEiqW1wB5vpz5Y";

const STAFF_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDlkMmJmNy1jMDhlLTRlN2ItYWFhMC05ZTUyY2ZkZjAzYTAiLCJpYXQiOjE3NzA1MzU1NTksImV4cCI6MTc3MTE0MDM1OX0.prcgXOnJO9-yQGd_-QbT3PJO1SSngeF99iZ6fSvJJEU";

/* ========================================= */

let ORG_ID = null;

/* ================= HELPERS ================= */

const headers = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function log(title, res) {
  let body = {};
  try {
    body = await res.json();
  } catch {}

  console.log(`\n===== ${title} =====`);
  console.log("STATUS:", res.status);
  console.log(JSON.stringify(body, null, 2));

  return body;
}

/* ================= CREATE ================= */

async function adminCreateOrg() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headers(ADMIN_TOKEN),
    body: JSON.stringify({
      name: "Chaos Mega Org",
      description: "Full RBAC + schema stress test",
      address: "South Delhi",
      slug: "chaos-mega-org",

      jobCategories: [
        { name: "Engineering" },
        { name: "Frontend" },
        { name: "Backend" },
        { name: "DevOps" },
        { name: "QA" },
        { name: "Product" },
        { name: "Design" },
        { name: "HR" },
        { name: "Finance" },
        { name: "Sales" },
      ],

      issueCategories: [
        { name: "Payroll" },
        { name: "Leave" },
        { name: "Laptop" },
        { name: "VPN" },
        { name: "Bug" },
        { name: "Access" },
        { name: "Recruitment" },
        { name: "Office Admin" },
      ],
    }),
  });

  const body = await log("ADMIN CREATE ORG", res);
  ORG_ID = body.id;
}

/* ================= PERMISSION ================= */

async function staffCreateOrg() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headers(STAFF_TOKEN),
    body: JSON.stringify({ name: "Illegal Org" }),
  });

  await log("STAFF CREATE ORG (SHOULD FAIL)", res);
}

async function memberCreateOrg() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headers(MEMBER_TOKEN),
    body: JSON.stringify({ name: "Illegal Org" }),
  });

  await log("MEMBER CREATE ORG (SHOULD FAIL)", res);
}

/* ================= JOIN ================= */

async function staffJoin() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: headers(STAFF_TOKEN),
    body: JSON.stringify({ role: "STAFF",jobCategoryId:"2d60fec6-8210-4a56-bb49-3c72835d36ce" }),
  });

  await log("STAFF JOIN ORG", res);
}

async function memberJoin() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: headers(MEMBER_TOKEN),
    body: JSON.stringify({ role: "MEMBER" }),
  });

  await log("MEMBER JOIN ORG", res);
}

async function joinAgain() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: headers(MEMBER_TOKEN),
    body: JSON.stringify({ role: "MEMBER" }),
  });

  await log("DUPLICATE JOIN", res);
}

async function invalidRole() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: headers(STAFF_TOKEN),
    body: JSON.stringify({ role: "OWNER" }),
  });

  await log("INVALID ROLE", res);
}

async function missingRole() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: headers(STAFF_TOKEN),
  });

  await log("MISSING ROLE", res);
}

async function joinFakeOrg() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/fake-id`, {
    method: "POST",
    headers: headers(STAFF_TOKEN),
    body: JSON.stringify({ role: "MEMBER" }),
  });

  await log("JOIN FAKE ORG", res);
}

async function joinNoAuth() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${ORG_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  await log("JOIN WITHOUT TOKEN", res);
}

/* ================= RUN ================= */

async function run() {
  console.log("\n🔥 ORG FULL TEST START 🔥");

  await adminCreateOrg();

  if (!ORG_ID) return console.log("ORG NOT CREATED");

  await staffCreateOrg();
  await memberCreateOrg();

  await staffJoin();
  await memberJoin();

  await joinAgain();
  await invalidRole();
  await missingRole();
  await joinFakeOrg();
  await joinNoAuth();

  console.log("\n✅ ORG FULL TEST FINISHED\n");
}

run();
