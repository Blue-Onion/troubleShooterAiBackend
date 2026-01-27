const ORG_BASE_URL = "http://localhost:3000/api/org";
const AUTH_BASE_URL = "http://localhost:3000/api/auth";

let authHeaders = {
  "Content-Type": "application/json",
};

let createdOrgId = null;

/* --------------------
   Helpers
-------------------- */

const log = (label, status, data) => {
  console.log(`\n${label}`);
  console.log("STATUS:", status);
  console.log("DATA:", JSON.stringify(data, null, 2));
};

async function login(email, password) {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error("Login failed");
  }

  authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  console.log(`Logged in as ${email}`);
}

function logout() {
  authHeaders = {
    "Content-Type": "application/json",
  };
}

/* --------------------
   USER A (ADMIN)
-------------------- */

async function createOrgAsUserA() {
  const res = await fetch(`${ORG_BASE_URL}/create-org`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Test Organization",
      description: "Created by User A",
      address: "Bangalore, India",
      jobCategories: [{ name: "Engineering" }],
      issueCategories: [{ name: "HR" }],
    }),
  });

  const data = await res.json();
  createdOrgId = data.id;

  log("CREATE ORG (USER A)", res.status, data);
}

/* --------------------
   USER B (MEMBER)
-------------------- */

async function joinOrgAsUserB() {
  const res = await fetch(`${ORG_BASE_URL}/join-org/${createdOrgId}`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      role: "MEMBER",
    }),
  });

  const data = await res.json();
  log("JOIN ORG (USER B)", res.status, data);
}

/* --------------------
   RUN TESTS
-------------------- */

async function run() {
  console.log("Starting Org Join Flow Test");

  // User A
  await login("blueonion@test.com", "Password123");
  await createOrgAsUserA();
  logout();

  // User B (must already exist in DB)
  await login("seconduser@test.com", "Password123");
  await joinOrgAsUserB();

  console.log("\nOrg join flow test finished");
}

run();