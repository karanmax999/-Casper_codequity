import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k"
  };

  try {
    const res = await fetch("https://uxwgjqsmqsfiafvztnli.supabase.co/storage/v1/bucket", { headers, cache: 'no-store' });
    const buckets = await res.json();
    return NextResponse.json(buckets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
