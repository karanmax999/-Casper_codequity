import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface RoundCardProps {
  round: {
    id: string;
    startup: { name: string; logo_url?: string; traction_score?: number };
    amount_cspr: number;
    status: string;
    escrow_contract_uref: string;
    milestones: Array<{
      id: string;
      milestone_index: number;
      threshold_score: number;
      release_percent: number;
      released_at: string | null;
      tx_hash: string | null;
    }>;
  };
}

export function RoundCard({ round }: RoundCardProps) {
  const releasedCount = round.milestones.filter(m => m.released_at).length;
  const progress = (releasedCount / round.milestones.length) * 100;

  return (
    <Card className="bg-secondary border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-heading text-lg">{round.startup.name}</CardTitle>
          <Badge variant={round.status === 'active' ? 'default' : 'secondary'}>
            {round.status}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-cta">{round.amount_cspr.toFixed(2)} CSPR</p>
        {round.startup.traction_score !== undefined && (
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-bold text-cta">{round.startup.traction_score}/100</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Milestones</span>
            <span>{releasedCount}/{round.milestones.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <a href={`/rounds/${round.id}`}>Details</a>
          </Button>
          <Button asChild variant="outline" size="sm" href={`https://testnet.casper.network/contract/${round.escrow_contract_uref}`} target="_blank">
            Explorer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}