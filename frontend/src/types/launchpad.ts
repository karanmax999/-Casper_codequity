export type LaunchpadStartup = {
  id: string;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
  traction_score?: number | null;
  wallet_pubkey?: string | null;
};

export type LaunchpadInvestor = {
  id: string;
  name: string;
  firm?: string | null;
  wallet_pubkey?: string | null;
};

export type LaunchpadMilestone = {
  id: string;
  funding_round_id: string;
  milestone_index: number;
  threshold_score: number;
  release_percent: number;
  released_at?: string | null;
  tx_hash?: string | null;
};

export type LaunchpadTransaction = {
  id: string;
  funding_round_id?: string | null;
  transaction_hash: string;
  block_hash?: string | null;
  contract_uref?: string | null;
  amount_motes?: number | null;
  action: string;
  status: string;
  created_at?: string | null;
};

export type LaunchpadRound = {
  id: string;
  startup_id: string;
  investor_id: string;
  amount_cspr: number;
  escrow_contract_uref: string;
  safe_nft_mint_hash?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  startup?: LaunchpadStartup | null;
  investor?: LaunchpadInvestor | null;
  milestones?: LaunchpadMilestone[];
  on_chain_transactions?: LaunchpadTransaction[];
};

export type CreateLaunchpadRoundInput = {
  startup_id: string;
  investor_id: string;
  amount_cspr: number;
  milestones: Array<{
    threshold_score: number;
    release_percent: number;
  }>;
};
