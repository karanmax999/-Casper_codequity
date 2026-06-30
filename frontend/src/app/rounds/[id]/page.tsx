import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MilestoneTracker } from '@/components/launchpad/MilestoneTracker';
import { Button } from '@/components/ui/button';
import { evaluateRound } from '@/actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoundDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch round with startup and milestones
  const { data: round, error } = await supabase
    .from('funding_rounds')
    .select(`
      *,
      startup:startups(*),
      milestones(*)
    `)
    .eq('id', id)
    .single();

  if (error || !round) {
    notFound();
  }

  // Get startup's current traction score
  const { data: startupScore } = await supabase
    .from('startups')
    .select('traction_score')
    .eq('id', round.startup_id)
    .single();

  const currentScore = startupScore?.traction_score ?? 0;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-heading mb-2">{round.startup.name}</h1>
        <p className="text-muted-foreground">
          Round Amount: <span className="font-bold text-cta">{round.amount_cspr} CSPR</span>
        </p>
        <p className="text-muted-foreground">
          Current Score: <span className="font-bold text-cta">{currentScore}/100</span>
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-heading mb-4">Milestones</h2>
        <MilestoneTracker
          milestones={round.milestones}
          currentScore={currentScore}
          onEvaluate={async () => {
            'use server';
            await evaluateRound(round.id);
          }}
        />
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline" href={`https://testnet.casper.network/contract/${round.escrow_contract_uref}`} target="_blank">
          View Escrow on Explorer
        </Button>
      </div>
    </div>
  );
}