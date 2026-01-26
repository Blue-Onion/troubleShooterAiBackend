const BASE_URL = "http://localhost:3000/api/auth";

const log = (label, status, data) => {
  console.log(`\n🧪 ${label}`);
  console.log("STATUS:", status);
  console.log("DATA:", data);
};

// --------------------
// REGISTER (VALID)
// --------------------
async function registerUser() {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Blue Onion",
      email: "blueonion@test.com",
      password: "Password123"
    })
  });

  const data = await res.json();
  log("REGISTER SUCCESS", res.status, data);
}

// --------------------
// LOGIN (VALID)
// --------------------
async function loginUser() {
    
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "blueonion@test.com",
      password: "Password123"
    })
  });

  const data = await res.json();
  log("LOGIN SUCCESS", res.status, data);
}

// --------------------
// REGISTER (INVALID)
// --------------------
async function invalidRegister() {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "not-an-email",
      password: "123"
    })
  });

  const data = await res.json();
  log("REGISTER VALIDATION FAIL", res.status, data);
}

// --------------------
// RACE CONDITION TEST
// --------------------
async function raceRegister() {
  const payload = {
    name:"racist23032",
    email: "race@test.com",
    password: "Password123"
  };

  const req = () =>
    fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(async r => ({
      status: r.status,
      body: await r.json()
    }));

  const results = await Promise.all([req(), req()]);

  console.log("\n🔥 RACE CONDITION TEST");
  console.log(results);
}

// --------------------
// RUN EVERYTHING
// --------------------
async function run() {
  console.log("🚀 Starting Auth Tests");

  await registerUser();
  await loginUser();
  await invalidRegister();
  await raceRegister();

  console.log("\n✅ Tests finished");
}

run();