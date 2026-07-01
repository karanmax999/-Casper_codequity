//! SAFEToken — On-chain representation of a Simple Agreement for Future Equity
//! on the Codequity Launchpad (Casper Network).
//!
//! Each token represents one funding agreement between an investor and a startup.
//! Metadata (funding_round_id, investor, startup, terms_hash) is stored on-chain.
//! The `terms_hash` is an IPFS CID pointing to the full SAFE document.
//!
//! # Design
//! - Minted by the Codequity agent (owner) when a funding round is created.
//! - Metadata is immutable after minting (the SAFE terms don't change).
//! - Transfer is supported for secondary market / legal assignment.
//! - One token per funding round — uniqueness enforced via `round_id` → `token_id` mapping.
#![no_std]

use odra::prelude::*;

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// On-chain metadata for a SAFE token.
#[odra::odra_type]
pub struct SafeMetadata {
    /// UUID of the Codequity funding round (from Supabase).
    pub funding_round_id: String,
    /// Investor's Casper wallet address.
    pub investor: Address,
    /// Startup's Casper wallet address.
    pub startup: Address,
    /// IPFS CID of the full SAFE legal document. Empty string if not yet uploaded.
    pub terms_hash: String,
    /// Casper block height at which this token was minted (for audit).
    pub minted_at_block: u64,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted when a new SAFE token is minted.
#[odra::event]
pub struct SafeMinted {
    pub token_id: u64,
    pub funding_round_id: String,
    pub investor: Address,
    pub startup: Address,
}

/// Emitted when a SAFE token is transferred.
#[odra::event]
pub struct SafeTransferred {
    pub token_id: u64,
    pub from: Address,
    pub to: Address,
}

// ---------------------------------------------------------------------------
// Contract module
// ---------------------------------------------------------------------------

/// SAFEToken contract — simple NFT representing a funding agreement.
#[odra::module(events = [SafeMinted, SafeTransferred])]
pub struct SafeToken {
    /// Contract owner (the Codequity agent).
    owner: Var<Address>,
    /// Total number of tokens minted (also serves as the next token_id).
    total_supply: Var<u64>,
    /// Mapping: token_id → metadata.
    metadata: Mapping<u64, SafeMetadata>,
    /// Mapping: token_id → current holder address.
    token_owner: Mapping<u64, Address>,
    /// Mapping: funding_round_id → token_id (prevent duplicate minting).
    round_to_token: Mapping<String, u64>,
    /// Mapping: funding_round_id → bool (existence check).
    round_minted: Mapping<String, bool>,
}

#[odra::module]
impl SafeToken {
    /// Initialise the SAFEToken contract.
    /// The deployer becomes the owner.
    #[odra(init)]
    pub fn init(&mut self) {
        self.owner.set(self.env().caller());
        self.total_supply.set(0);
    }

    // -----------------------------------------------------------------------
    // Owner-only: mint
    // -----------------------------------------------------------------------

    /// Mint a new SAFE token for a funding round (owner only).
    ///
    /// # Arguments
    /// * `funding_round_id` — unique UUID from Supabase funding_rounds table.
    /// * `investor` — investor's Casper wallet address.
    /// * `startup` — startup's Casper wallet address.
    /// * `terms_hash` — IPFS CID of the SAFE document (can be empty string).
    ///
    /// Returns the new `token_id`.
    ///
    /// Reverts if:
    /// - caller is not the owner
    /// - a token has already been minted for this `funding_round_id`
    pub fn mint(
        &mut self,
        funding_round_id: String,
        investor: Address,
        startup: Address,
        terms_hash: String,
    ) -> u64 {
        self.require_owner();

        // Prevent duplicate minting for the same round
        if self.round_minted.get(&funding_round_id).unwrap_or(false) {
            self.env().revert(Error::RoundAlreadyMinted);
        }

        let token_id = self.total_supply.get_or_default();
        let block_height = self.env().get_block_time(); // timestamp as proxy for block

        let meta = SafeMetadata {
            funding_round_id: funding_round_id.clone(),
            investor,
            startup,
            terms_hash,
            minted_at_block: block_height,
        };

        // Store metadata and ownership
        self.metadata.set(&token_id, meta);
        self.token_owner.set(&token_id, investor);
        self.round_to_token.set(&funding_round_id, token_id);
        self.round_minted.set(&funding_round_id, true);

        // Increment supply
        self.total_supply.set(token_id + 1);

        self.env().emit_event(SafeMinted {
            token_id,
            funding_round_id,
            investor,
            startup,
        });

        token_id
    }

    // -----------------------------------------------------------------------
    // Transfer (token holder or owner)
    // -----------------------------------------------------------------------

    /// Transfer a SAFE token to a new address.
    ///
    /// Only the current token holder or the contract owner may transfer.
    pub fn transfer(&mut self, token_id: u64, to: Address) {
        let current_holder = self.token_owner.get(&token_id)
            .unwrap_or_else(|| self.env().revert(Error::TokenNotFound));

        let caller = self.env().caller();
        let is_owner = caller == self.owner.get_or_revert_with(Error::OwnerNotSet);
        let is_holder = caller == current_holder;

        if !is_owner && !is_holder {
            self.env().revert(Error::CallerIsNotOwnerOrHolder);
        }

        let from = current_holder;
        self.token_owner.set(&token_id, to);

        self.env().emit_event(SafeTransferred { token_id, from, to });
    }

    // -----------------------------------------------------------------------
    // Views
    // -----------------------------------------------------------------------

    /// Returns the metadata for a given token_id.
    pub fn get_metadata(&self, token_id: u64) -> SafeMetadata {
        self.metadata
            .get(&token_id)
            .unwrap_or_else(|| self.env().revert(Error::TokenNotFound))
    }

    /// Returns the current holder of a token.
    pub fn get_token_owner(&self, token_id: u64) -> Address {
        self.token_owner
            .get(&token_id)
            .unwrap_or_else(|| self.env().revert(Error::TokenNotFound))
    }

    /// Returns the token_id for a given funding round (if minted).
    pub fn get_token_for_round(&self, funding_round_id: String) -> u64 {
        if !self.round_minted.get(&funding_round_id).unwrap_or(false) {
            self.env().revert(Error::TokenNotFound);
        }
        self.round_to_token.get(&funding_round_id)
            .unwrap_or_else(|| self.env().revert(Error::TokenNotFound))
    }

    /// Returns the total number of SAFE tokens minted.
    pub fn total_supply(&self) -> u64 {
        self.total_supply.get_or_default()
    }

    /// Returns the contract owner address.
    pub fn get_owner(&self) -> Address {
        self.owner.get_or_revert_with(Error::OwnerNotSet)
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

#[odra::odra_error]
pub enum Error {
    CallerIsNotOwner = 1,
    CallerIsNotOwnerOrHolder = 2,
    TokenNotFound = 3,
    RoundAlreadyMinted = 4,
    OwnerNotSet = 5,
}
