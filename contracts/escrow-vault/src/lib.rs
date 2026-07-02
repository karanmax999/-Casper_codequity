//! EscrowVault — Codequity Launchpad smart contract on Casper Network
//!
//! Holds investor CSPR in a score-gated escrow. The Codequity AI Agent
//! (the contract owner) calls `release(milestone_index, current_score)`
//! when a startup's traction score meets a milestone threshold.
//! The contract verifies the condition on-chain before transferring funds.
//!
//! # Flow
//! 1. Investor sends CSPR to the agent, who deploys this contract with
//!    the agreed milestones and initial CSPR balance.
//! 2. The agent monitors traction scores off-chain (via Codequity API).
//! 3. When score >= threshold, agent calls `release(index, score)`.
//! 4. Contract verifies, transfers funds to startup wallet, emits event.
//!
//! # Security
//! - Only the owner (agent) can call `release` and `deposit`.
//! - Each milestone can only be released once.
//! - The contract enforces the threshold check on-chain (agent passes
//!   current_score; the contract independently verifies against stored threshold).
#![no_std]

use odra::prelude::*;
use odra::casper_types::U512;

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// Represents a single funding milestone.
#[odra::odra_type]
pub struct Milestone {
    /// Minimum traction score (0–100) required to release this tranche.
    pub threshold_score: u8,
    /// Percentage of the total escrow to release (0–100). All milestones must sum to 100.
    pub release_percent: u8,
    /// Whether this milestone's funds have already been released.
    pub released: bool,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted when CSPR is deposited into the vault.
#[odra::event]
pub struct Deposited {
    pub from: Address,
    pub amount_motes: U512,
}

/// Emitted when a milestone tranche is successfully released to the startup.
#[odra::event]
pub struct MilestoneReleased {
    pub milestone_index: u8,
    pub amount_motes: U512,
    pub recipient: Address,
    pub score_at_release: u8,
}

// ---------------------------------------------------------------------------
// Contract module
// ---------------------------------------------------------------------------

/// EscrowVault contract module.
#[odra::module(events = [Deposited, MilestoneReleased])]
pub struct EscrowVault {
    /// The Codequity agent wallet — only this address may release funds.
    owner: Var<Address>,
    /// The startup's wallet address — receives released funds.
    startup: Var<Address>,
    /// Ordered list of milestones defining release schedule.
    milestones: Var<Vec<Milestone>>,
    /// Total CSPR deposited in motes (1 CSPR = 1_000_000_000 motes).
    total_deposited: Var<U512>,
}

#[odra::module]
impl EscrowVault {
    /// Initialise the vault.
    ///
    /// # Arguments
    /// * `startup` — the startup wallet that will receive released funds.
    /// * `milestones` — ordered release schedule; `release_percent` values must sum to 100.
    ///
    /// The deployer (caller) becomes the `owner`. Initial CSPR is sent along
    /// with the deploy transaction as the attached value.
    #[odra(init)]
    pub fn init(&mut self, startup: Address, milestones: Vec<u8>) {
        let milestones: Vec<Milestone> = match odra::casper_types::bytesrepr::FromBytes::from_bytes(&milestones) {
            Ok((m, _)) => m,
            Err(_) => self.env().revert(Error::InvalidMilestonesBytes),
        };

        // Validate milestone percentages sum to 100
        let total_pct: u32 = milestones.iter().map(|m| m.release_percent as u32).sum();
        if total_pct != 100 {
            self.env().revert(Error::InvalidMilestonePercentages);
        }
        if milestones.is_empty() {
            self.env().revert(Error::NoMilestones);
        }

        self.owner.set(self.env().caller());
        self.startup.set(startup);
        self.milestones.set(milestones);

        // Record any CSPR sent with the deploy as initial deposit
        let attached = self.env().attached_value();
        if attached > U512::zero() {
            self.total_deposited.set(attached);
            self.env().emit_event(Deposited {
                from: self.env().caller(),
                amount_motes: attached,
            });
        }
    }

    // -----------------------------------------------------------------------
    // Owner-only actions
    // -----------------------------------------------------------------------

    /// Deposit additional CSPR into the vault (owner only).
    #[odra(payable)]
    pub fn deposit(&mut self) {
        self.require_owner();
        let amount = self.env().attached_value();
        if amount == U512::zero() {
            self.env().revert(Error::ZeroDeposit);
        }
        let current = self.total_deposited.get_or_default();
        self.total_deposited.set(current + amount);
        self.env().emit_event(Deposited {
            from: self.env().caller(),
            amount_motes: amount,
        });
    }

    /// Release a milestone tranche to the startup wallet.
    ///
    /// # Arguments
    /// * `milestone_index` — 0-based index of the milestone to release.
    /// * `current_score` — the startup's current traction score (0–100).
    ///   The agent passes this value; the contract verifies it meets the threshold.
    ///
    /// Reverts if:
    /// - caller is not the owner
    /// - milestone index out of range
    /// - milestone already released
    /// - `current_score` < milestone threshold
    /// - insufficient vault balance
    pub fn release(&mut self, milestone_index: u8, current_score: u8) {
        self.require_owner();

        let mut milestones = self.milestones.get_or_default();
        let idx = milestone_index as usize;

        if idx >= milestones.len() {
            self.env().revert(Error::MilestoneIndexOutOfRange);
        }

        let milestone = &milestones[idx];

        if milestone.released {
            self.env().revert(Error::MilestoneAlreadyReleased);
        }

        if current_score < milestone.threshold_score {
            self.env().revert(Error::ScoreBelowThreshold);
        }

        // Calculate amount to transfer
        let total = self.total_deposited.get_or_default();
        let amount = total * milestone.release_percent as u64 / 100u64;

        if amount == U512::zero() {
            self.env().revert(Error::ZeroRelease);
        }

        let startup_addr = self.startup.get_or_revert_with(Error::StartupNotSet);

        // Transfer to startup
        self.env().transfer_tokens(&startup_addr, &amount);

        // Mark as released
        milestones[idx].released = true;
        self.milestones.set(milestones);

        self.env().emit_event(MilestoneReleased {
            milestone_index,
            amount_motes: amount,
            recipient: startup_addr,
            score_at_release: current_score,
        });
    }

    // -----------------------------------------------------------------------
    // Views (read-only)
    // -----------------------------------------------------------------------

    /// Returns all milestones and their current release status.
    pub fn get_milestones(&self) -> Vec<Milestone> {
        self.milestones.get_or_default()
    }

    /// Returns the total CSPR deposited (in motes).
    pub fn get_total_deposited(&self) -> U512 {
        self.total_deposited.get_or_default()
    }

    /// Returns the owner address.
    pub fn get_owner(&self) -> Address {
        self.owner.get_or_revert_with(Error::OwnerNotSet)
    }

    /// Returns the startup recipient address.
    pub fn get_startup(&self) -> Address {
        self.startup.get_or_revert_with(Error::StartupNotSet)
    }

    /// Check whether a given score satisfies a milestone (utility for agent).
    pub fn can_release(&self, milestone_index: u8, current_score: u8) -> bool {
        let milestones = self.milestones.get_or_default();
        let idx = milestone_index as usize;
        if idx >= milestones.len() {
            return false;
        }
        let ms = &milestones[idx];
        !ms.released && current_score >= ms.threshold_score
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    fn require_owner(&self) {
        if self.env().caller() != self.owner.get_or_revert_with(Error::OwnerNotSet) {
            self.env().revert(Error::CallerIsNotOwner);
        }
    }
}

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

/// Contract-level error codes that map to Casper's user-error system.
#[odra::odra_error]
pub enum Error {
    CallerIsNotOwner = 1,
    MilestoneIndexOutOfRange = 2,
    MilestoneAlreadyReleased = 3,
    ScoreBelowThreshold = 4,
    InvalidMilestonePercentages = 5,
    NoMilestones = 6,
    ZeroDeposit = 7,
    ZeroRelease = 8,
    OwnerNotSet = 9,
    StartupNotSet = 10,
    InvalidMilestonesBytes = 11,
}
