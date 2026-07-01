import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type StartupRound = {
  id: string;
  amount_cspr: number;
  status: string;
  milestones?: Array<{
    id?: string;
    released_at?: string | null;
  }>;
};

type StartupProfile = {
  id: string;
  name: string;
  traction_score: number | null;
  description?: string | null;
  github_url?: string | null;
  funding_rounds?: StartupRound[];
};

export default async function StartupProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select(`
      id,
      name,
      traction_score,
      description,
      github_url,
      funding_rounds (
        id,
        amount_cspr,
        status,
        milestones (*)
      )
    `)
    .eq("id", params.id)
    .single();

  if (!startup) {
    notFound();
  }

  const profile = startup as StartupProfile;
  const rounds = profile.funding_rounds || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-mono font-semibold text-white">{profile.name}</h1>
        <Badge variant="outline" className="text-accent border-accent">
          Score: {profile.traction_score ?? 0}/100
        </Badge>
      </div>

      {profile.description && (
        <p className="text-muted-foreground">{profile.description}</p>
      )}

      {profile.github_url && (
        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          GitHub Repository
        </a>
      )}

      <div>
        <h2 className="text-2xl font-mono font-semibold text-white mb-4">Funding Rounds</h2>
        {rounds.length === 0 ? (
          <p className="text-muted-foreground">No funding rounds yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rounds.map((round) => (
              <Link key={round.id} href={`/dashboard/rounds/${round.id}`}>
                <Card className="h-full hover:border-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="font-mono">{round.amount_cspr} CSPR</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={round.status === "active" ? "default" : "secondary"}>
                        {round.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {round.milestones?.length || 0} milestones
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {round.milestones?.filter((milestone) => milestone.released_at).length || 0} milestones released
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
