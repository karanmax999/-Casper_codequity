import { supabase } from '@/lib/supabase';
import { RoundCard } from '@/components/launchpad/RoundCard';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function Dashboard() {
  // Fetch all funding rounds with startup and milestones
  const { data: rounds } = await supabase
    .from('funding_rounds')
    .select(`
      *,
      startup:startups(*),
      milestones(*)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-heading mb-8 text-primary">Funding Rounds</h1>
      {rounds && rounds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No funding rounds found.</p>
      )}
    </div>
  );
}