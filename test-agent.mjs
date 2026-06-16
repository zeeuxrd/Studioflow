async function testAgent() {
  console.log("Testing Idea Architect API Route...");
  try {
    const response = await fetch('http://127.0.0.1:3001/api/agent/idea-architect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: "test-user-1234",
        niche: "Artificial Intelligence for Beginners",
        tone_preference: "educational"
      })
    });

    console.log("HTTP STATUS:", response.status);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log("RESPONSE RECEIVED:");
      console.log(JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log("✅ SUCCESS! Agent generated structured ideas and saved them to the DB.");
      } else {
        console.log("❌ FAILED!");
      }
    } catch (e) {
      console.error("RAW NON-JSON RESPONSE:");
      console.log(text.substring(0, 500));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testAgent();
