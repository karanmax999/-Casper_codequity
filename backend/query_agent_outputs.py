import json
import urllib.request
import os

url = "https://uxwgjqsmqsfiafvztnli.supabase.co/rest/v1/agent_outputs?select=*"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
except Exception as e:
    print("Error:", e)
