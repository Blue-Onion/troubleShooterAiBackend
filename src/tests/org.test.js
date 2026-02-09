const ORG_BASE_URL = "http://localhost:3000/api/org";

/* ================= TOKENS ================= */

const ADMIN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTMxOGJjNy1iNWI1LTQxOGMtYWY5NS04NTg5NGZhZGE1ZjUiLCJpYXQiOjE3NzA1Nzk4NTQsImV4cCI6MTc3MTE4NDY1NH0.m_JQF_BUE1yGyMHxNb3YULpFIUC_5sILiouxyGdSIsQ";

const MEMBER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYjc3NDVjMi1iNmE4LTRmMWQtOGJkYi04Mjg2NDE3ZmY3ZjEiLCJpYXQiOjE3NzA1Nzk4MDcsImV4cCI6MTc3MTE4NDYwN30.W38vtw2nUEWaGWSZBc82d2gHHNoJZQyDvDbXH5MlfCo";

const STAFF_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MDlmYjk4Zi00Njc3LTQ4NTMtODYzNS1kNTVlOGExNDIwNzciLCJpYXQiOjE3NzA1Nzk4NTUsImV4cCI6MTc3MTE4NDY1NX0.quLGfDZ8Wr6-FnB-Ryy95YeyQMbBPBcjNwoeFdfkXaU";

/* ========================================= */

let ORG_ID = "74179c43-1fc7-4f05-9117-9ba78f19f7b7";

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
    body: JSON.stringify({
      role: "STAFF",
      jobCategoryId: "19ccf0b5-f249-4dc4-a3e2-21e2cc51c61a",
    }),
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

//   await adminCreateOrg();

//   if (!ORG_ID) return console.log("ORG NOT CREATED");

//   await staffCreateOrg();
//   await memberCreateOrg();

  await staffJoin();
//   await memberJoin();

//   await joinAgain();
//   await invalidRole();
//   await missingRole();
//   await joinFakeOrg();
//   await joinNoAuth();

  console.log("\n✅ ORG FULL TEST FINISHED\n");
}

run();
