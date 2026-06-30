'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createFundingRound } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateRoundPage() {
  const [startupId, setStartupId] = useState('');
  const [investorId, setInvestorId] = useState('');
  const [amount, setAmount] = useState('');
  const [milestones, setMilestones] = useState<Array<{ threshold: number; percent: number }>>([
    { threshold: 50, percent: 50 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [startups, setStartups] = useState<Array<{ id: string; name: string }>>([]);
  const [investors, setInvestors] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function fetchData() {
      const [{ data: s }, { data: i }] = await Promise.all([
        supabase.from('startups').select('id, name'),
        supabase.from('investors').select('id, name'),
      ]);
      setStartups(s || []);
      setInvestors(i || []);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await createFundingRound({
        startup_id: startupId,
        investor_id: investorId,
        amount_cspr: parseFloat(amount),
        milestones: milestones.map(m => ({ threshold_score: m.threshold, release_percent: m.percent }))
      });
      setMessage('Round created successfully!');
      // Reset form
      setStartupId('');
      setInvestorId('');
      setAmount('');
      setMilestones([{ threshold: 50, percent: 50 }]);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-heading mb-8">Create Funding Round</h1>
      <Card>
        <CardHeader><CardTitle>Round Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="startup">Startup</Label>
              <select
                id="startup"
                value={startupId}
                onChange={e => setStartupId(e.target.value)}
                required
                className="w-full border rounded p-2 bg-background text-text"
              >
                <option value="">Select startup</option>
                {startups.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="investor">Investor</Label>
              <select
                id="investor"
                value={investorId}
                onChange={e => setInvestorId(e.target.value)}
                required
                className="w-full border rounded p-2 bg-background text-text"
              >
                <option value="">Select investor</option>
                {investors.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (CSPR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Milestones</Label>
              {milestones.map((ms, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    type="number"
                    placeholder="Threshold"
                    value={ms.threshold}
                    onChange={e => {
                      const newMilestones = [...milestones];
                      newMilestones[idx].threshold = parseInt(e.target.value) || 0;
                      setMilestones(newMilestones);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="%"
                    value={ms.percent}
                    onChange={e => {
                      const newMilestones = [...milestones];
                      newMilestones[idx].percent = parseFloat(e.target.value) || 0;
                      setMilestones(newMilestones);
                    }}
                  />
                  <Button type="button" variant="destructive" onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setMilestones([...milestones, { threshold: 0, percent: 0 }])}>
                Add Milestone
              </Button>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Round'}
            </Button>
          </form>
          {message && <p className="mt-4">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}