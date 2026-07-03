const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxwgjqsmqsfiafvztnli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d2dqcXNtcXNmaWFmdnp0bmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjYxNiwiZXhwIjoyMDk0ODM4NjE2fQ.yqmkKWhdfsk_2NCzBotw3UPCpvW7zy2mhlgrZVZJn0k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .limit(1);

  if (error) {
    console.error(error);
  } else {
    console.log("Startup row keys:", Object.keys(data[0]));
    console.log("Startup row data:", data[0]);
  }
}

test();
