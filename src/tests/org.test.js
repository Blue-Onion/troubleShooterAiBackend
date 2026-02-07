const ORG_BASE_URL = "http://localhost:3000/api/org";

/*
  TOKENS FROM auth.test.js
  Replace these before running
*/

const USER_A_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMThhZDhjZS0xYThkLTQ1MTYtYTkzNi0xNDA2YzM0N2Y5YjIiLCJpYXQiOjE3NzA0OTMzNzMsImV4cCI6MTc3MTA5ODE3M30.mAWTYIH4l9sC3n0x9dyDA4qFLAIRymLC2RYdtxO4ZBY"; // ADMIN
const USER_B_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODIxNjY1NS1kYjExLTQxZmMtYjdhOC0zM2VkOWFmZDU5OTYiLCJpYXQiOjE3NzA0OTMzNzQsImV4cCI6MTc3MTA5ODE3NH0.rpCy3673UCu-84fkkVHPE3GrOnLF6DIgTcBnW3HWn2I"; // MEMBER

let createdOrgId = null;

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
 CREATE ORG TESTS
-------------------------- */

async function adminCreateOrg() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      name: "Chaos Org",
      description: "Schema testing",
      address: "Delhi",
      slug: "chaos-org",
      jobCategories: [{ name: "Engineering" }],
      issueCategories: [{ name: "HR" }],
    }),
  });

  const body = await res.json();
  createdOrgId = body.id;

  console.log("\nADMIN CREATE ORG");
  console.log("STATUS:", res.status);
  console.log("DATA:", JSON.stringify(body, null, 2));
}

async function createOrgNoAuth() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  await log("CREATE ORG WITHOUT TOKEN", res);
}

async function createOrgMissingName() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      description: "Desc",
      address: "Delhi",
      jobCategories: [{ name: "Eng" }],
      issueCategories: [{ name: "HR" }],
    }),
  });

  await log("CREATE ORG MISSING NAME", res);
}

async function createOrgEmptyDescription() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      name: "Org",
      description: "",
      address: "Delhi",
      jobCategories: [{ name: "Eng" }],
      issueCategories: [{ name: "HR" }],
    }),
  });

  await log("CREATE ORG EMPTY DESCRIPTION", res);
}

async function createOrgEmptyCategories() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headersFor(USER_A_TOKEN),
    body: JSON.stringify({
      name: "Org",
      description: "Desc",
      address: "Delhi",
      jobCategories: [],
      issueCategories: [],
    }),
  });

  await log("CREATE ORG EMPTY CATEGORIES", res);
}

/* -------------------------
 JOIN ORG TESTS
-------------------------- */

async function userBJoinOrg() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
    body: JSON.stringify({ role: "MEMBER" }),
  });

  await log("USER B JOINS ORG", res);
}

async function userBJoinAgain() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
    body: JSON.stringify({ role: "MEMBER" }),
  });

  await log("USER B JOIN AGAIN", res);
}

async function joinInvalidRole() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
    body: JSON.stringify({ role: "OWNER" }),
  });

  await log("JOIN INVALID ROLE", res);
}

async function joinMissingRole() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
    body: JSON.stringify({}),
  });

  await log("JOIN MISSING ROLE", res);
}

async function joinInvalidOrg() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/fake-id`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
  });

  await log("JOIN INVALID ORG", res);
}

async function joinNoAuth() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  await log("JOIN WITHOUT TOKEN", res);
}

/* -------------------------
 PERMISSION TEST
-------------------------- */

async function memberCreateOrg() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: headersFor(USER_B_TOKEN),
    body: JSON.stringify({
      name: "Illegal Org",
    }),
  });

  await log("MEMBER CREATE ORG", res);
}

/* -------------------------
 RUN
-------------------------- */

async function run() {
  console.log("\nORG TEST SUITE START\n");

  await adminCreateOrg();

  await createOrgNoAuth();
  await createOrgMissingName();
  await createOrgEmptyDescription();
  await createOrgEmptyCategories();

  await userBJoinOrg();
  await userBJoinAgain();
  await joinInvalidRole();
  await joinMissingRole();
  await joinInvalidOrg();
  await joinNoAuth();

  await memberCreateOrg();

  console.log("\nORG TEST SUITE FINISHED\n");
}

run();