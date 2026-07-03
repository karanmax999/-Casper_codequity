async function query() {
  const url = "https://uxwgjqsmqsfiafvztnli.supabase.co/rest/v1/agent_outputs?select=*";
  const headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k"
  };

  try {
    const res = await fetch(url, { headers });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

query();
