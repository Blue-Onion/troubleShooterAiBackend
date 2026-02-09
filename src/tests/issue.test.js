// import FormData from "form-data"; // Using native FormData in Node 18+
const ISSUE_BASE_URL = "http://localhost:3000/api/issue";

/*
  TOKENS FROM auth.test.js / org.test.js
  Replace these before running
*/
const USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYjc3NDVjMi1iNmE4LTRmMWQtOGJkYi04Mjg2NDE3ZmY3ZjEiLCJpYXQiOjE3NzA1Nzk4MDcsImV4cCI6MTc3MTE4NDYwN30.W38vtw2nUEWaGWSZBc82d2gHHNoJZQyDvDbXH5MlfCo";

// IDs needed for tests
const ORG_ID = "74179c43-1fc7-4f05-9117-9ba78f19f7b7";
const CATEGORY_ID = "6eb774b8-7496-41c4-859a-f5a311bb73e9"; // Issue Category ID

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
// async function getAiDesc() {
//   console.log("\nRUNNING AI IMAGE DESC TEST");

//   const imagePath = "./test-image.jpg";
//   if (!fs.existsSync(imagePath)) {
//     console.warn(`\n⚠️  SKIPPING AI DESC TEST: ${imagePath} not found.`);
//     console.warn(
//       "Please place a JPEG image named 'test-image.jpg' in the root directory to run this test.\n",
//     );
//     return;
//   }

//   const buffer = fs.readFileSync(imagePath);
//   // Native File object (Node 20+)
//   const file = new File([buffer], "test-image.jpg", { type: "image/jpeg" });

//   const form = new FormData();
//   form.append("image", file);

//   const res = await fetch(`${ISSUE_BASE_URL}/get-ai-desc/${ORG_ID}`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${USER_TOKEN}`,
//       // Native fetch sets Content-Type with boundary automatically
//     },
//     body: form,
//   });

//   await log("GET AI DESC", res);
// }

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

async function createIssueInvalidOrg() {
  const invalidOrgId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(`${ISSUE_BASE_URL}/create-issue/${invalidOrgId}`, {
    method: "POST",
    headers: headersFor(USER_TOKEN),
    body: JSON.stringify({
      name: "Issue for Invalid Org",
      description: "This should fail",
      categoryId: CATEGORY_ID,
      imgUrl: "http://example.com/fail.jpg",
    }),
  });

  await log(
    "CREATE ISSUE INVALID ORG (Should allow if logic doesn't check org existence, otherwise 404/400)",
    res,
  );
}

async function getIssuesInvalidOrg() {
  const invalidOrgId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(`${ISSUE_BASE_URL}/get-issues/${invalidOrgId}`, {
    method: "GET",
    headers: headersFor(USER_TOKEN),
  });

  await log("GET ISSUES INVALID ORG", res);
}

async function getIssueInvalidId() {
  const invalidIssueId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(
    `${ISSUE_BASE_URL}/get-issue/${ORG_ID}/${invalidIssueId}`,
    {
      method: "GET",
      headers: headersFor(USER_TOKEN),
    },
  );

  await log("GET ISSUE INVALID ID", res);
}

async function getAiDescNoFile() {
  // Sending request without file
  const res = await fetch(`${ISSUE_BASE_URL}/get-ai-desc/${ORG_ID}`, {
    method: "POST",
    headers: headersFor(USER_TOKEN),
  });

  await log("GET AI DESC NO FILE (Should be 400)", res);
}

async function unauthorizedAccess() {
  const res = await fetch(`${ISSUE_BASE_URL}/get-issues/${ORG_ID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // No Authorization header
    },
  });

  await log("UNAUTHORIZED ACCESS (Should be 401/403)", res);
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
  //   await getAiDesc();
  // Validation
  await createIssueMissingFields();
  await createIssueInvalidOrg();
  await getIssuesInvalidOrg();
  await getIssueInvalidId();
  await getAiDescNoFile();
  await unauthorizedAccess();

  console.log("\nISSUE TEST SUITE FINISHED\n");
}

run();
