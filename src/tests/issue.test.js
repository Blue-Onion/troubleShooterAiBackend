import fs from "fs";
// import FormData from "form-data"; // Using native FormData in Node 18+
const ISSUE_BASE_URL = "http://localhost:3000/api/issue";

/*
  TOKENS FROM auth.test.js / org.test.js
  Replace these before running
*/
const USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYzY3NjMxNS0xNjAwLTQ5MWUtYjFmNi1iMjczYmQwMDI0NTMiLCJpYXQiOjE3NzA1MzI2NzMsImV4cCI6MTc3MTEzNzQ3M30.iABn_8cpausOpVNXjP2gql_LdoclXLcrAxvtdEk4H1k";

// IDs needed for tests
const ORG_ID = "22e55ef8-06b2-4c0b-b0a1-28248f7d7e79";
const CATEGORY_ID = "9cb6f86c-b560-4907-acb1-09fb4a0da9fb"; // Issue Category ID

let createdIssueId = null;

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
  return data;
};

/* -------------------------
 ISSUE TESTS
-------------------------- */

async function createIssue() {
  const res = await fetch(`${ISSUE_BASE_URL}/create-issue/${ORG_ID}`, {
    method: "POST",
    headers: headersFor(USER_TOKEN),
    body: JSON.stringify({
      name: "Printer not working",
      description:
        "The main hallway printer is jammed and displaying error code 505.",
      categoryId: CATEGORY_ID,
      imgUrl: "http://example.com/broken_printer.jpg",
    }),
  });

  const body = await log("CREATE ISSUE", res);
  if (body && body.id) {
    createdIssueId = body.id;
  }
}

async function getIssues() {
  const res = await fetch(`${ISSUE_BASE_URL}/get-issues/${ORG_ID}`, {
    method: "GET",
    headers: headersFor(USER_TOKEN),
  });

  await log("GET ISSUES", res);
}

async function getIssueById() {
  if (!createdIssueId) {
    console.log("\nSKIPPING GET ISSUE BY ID (No ID created)");
    return;
  }

  const res = await fetch(
    `${ISSUE_BASE_URL}/get-issue/${ORG_ID}/${createdIssueId}`,
    {
      method: "GET",
      headers: headersFor(USER_TOKEN),
    },
  );

  await log("GET ISSUE BY ID", res);
}

/* -------------------------
 AI DESC TEST (Multipart)
-------------------------- */

// Note: This test requires a file to upload.
// Skipping actual file util implementation for simple script,
// using simple FormData if run in Node environment that supports it (Node 18+)
async function getAiDesc() {
  console.log("\nRUNNING AI IMAGE DESC TEST");

  const imagePath = "./test-image.jpg";
  if (!fs.existsSync(imagePath)) {
    console.warn(`\n⚠️  SKIPPING AI DESC TEST: ${imagePath} not found.`);
    console.warn(
      "Please place a JPEG image named 'test-image.jpg' in the root directory to run this test.\n",
    );
    return;
  }

  const buffer = fs.readFileSync(imagePath);
  // Native File object (Node 20+)
  const file = new File([buffer], "test-image.jpg", { type: "image/jpeg" });

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${ISSUE_BASE_URL}/get-ai-desc/${ORG_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
      // Native fetch sets Content-Type with boundary automatically
    },
    body: form,
  });

  await log("GET AI DESC", res);
}

/* -------------------------
 VALIDATION TESTS
-------------------------- */

async function createIssueMissingFields() {
  const res = await fetch(`${ISSUE_BASE_URL}/create-issue/${ORG_ID}`, {
    method: "POST",
    headers: headersFor(USER_TOKEN),
    body: JSON.stringify({
      name: "Incomplete Issue",
      // missing description and category
    }),
  });

  await log("CREATE ISSUE MISSING FIELDS", res);
}

/* -------------------------
 RUN
-------------------------- */

async function run() {
  console.log("\nISSUE TEST SUITE START\n");

  if (ORG_ID === "PASTE_ORG_ID_HERE") {
    console.warn(
      "⚠️  PLEASE SET ORG_ID, CATEGORY_ID AND TOKEN BEFORE RUNNING ⚠️",
    );
    return;
  }

  await createIssue();
  await getIssues();
  await getIssueById();
  await getAiDesc();
  // Validation
  await createIssueMissingFields();

  console.log("\nISSUE TEST SUITE FINISHED\n");
}

run();
