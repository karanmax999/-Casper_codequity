'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Milestone {
  id: string;
  milestone_index: number;
  threshold_score: number;
  release_percent: number;
  released_at: string | null;
  tx_hash: string | null;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  currentScore: number;
  onEvaluate?: () => void;
}

export function MilestoneTracker({ milestones, currentScore, onEvaluate }: MilestoneTrackerProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead>Release %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tx</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.map(m => {
            const isReleased = !!m.released_at;
            const isReady = !isReleased && currentScore >= m.threshold_score;
            return (
              <TableRow key={m.id}>
                <TableCell>{m.milestone_index + 1}</TableCell>
                <TableCell>{m.threshold_score}</TableCell>
                <TableCell>{m.release_percent}%</TableCell>
                <TableCell>
                  <Badge variant={isReleased ? 'default' : isReady ? 'secondary' : 'outline'}>
                    {isReleased ? 'Released' : isReady ? 'Ready' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {m.tx_hash ? (
                    <a href={`https://testnet.casper.network/deploy/${m.tx_hash}`} target="_blank" className="text-cta hover:underline">
                      {m.tx_hash.slice(0, 8)}...
                    </a>
                  ) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {onEvaluate && (
        <div className="mt-4">
          <Button onClick={onEvaluate}>Force Evaluate</Button>
        </div>
      )}
    </div>
  );
}