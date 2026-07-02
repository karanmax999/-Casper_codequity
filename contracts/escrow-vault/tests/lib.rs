//! Unit tests for EscrowVault using the Odra mock environment.
//!
//! Run with: cargo test --features mock

#[cfg(test)]
mod tests {
    use odra::host::{Deployer, HostRef, NoArgs};
    use odra::prelude::*;
    use crate::{EscrowVaultHostRef, EscrowVaultInitArgs, Milestone};

    /// Build a standard set of two milestones: 50% at score 60, 50% at score 80.
    fn two_milestones() -> Vec<Milestone> {
        vec![
            Milestone { threshold_score: 60, release_percent: 50, released: false },
            Milestone { threshold_score: 80, release_percent: 50, released: false },
        ]
    }

    // -----------------------------------------------------------------------
    // init
    // -----------------------------------------------------------------------

    #[test]
    fn test_init_stores_owner_and_startup() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);

        let contract = EscrowVaultHostRef::deploy(
            &test_env,
            EscrowVaultInitArgs {
                startup,
                milestones: two_milestones(),
            },
        );

        assert_eq!(contract.get_owner(), agent);
        assert_eq!(contract.get_startup(), startup);
        assert_eq!(contract.get_milestones().len(), 2);
    }

    #[test]
    #[should_panic(expected = "InvalidMilestonePercentages")]
    fn test_init_rejects_invalid_percentages() {
        let test_env = odra_test::env();
        let startup = test_env.get_account(1);
        // percentages sum to 90, not 100 — should revert
        let bad_milestones = vec![
            Milestone { threshold_score: 60, release_percent: 45, released: false },
            Milestone { threshold_score: 80, release_percent: 45, released: false },
        ];
        EscrowVaultHostRef::deploy(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: bad_milestones },
        );
    }

    // -----------------------------------------------------------------------
    // can_release
    // -----------------------------------------------------------------------

    #[test]
    fn test_can_release_returns_true_when_score_meets_threshold() {
        let test_env = odra_test::env();
        let startup = test_env.get_account(1);
        let contract = EscrowVaultHostRef::deploy(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
        );
        // Score 65 >= threshold 60 for milestone 0
        assert!(contract.can_release(0, 65));
        // Score 55 < threshold 60 for milestone 0
        assert!(!contract.can_release(0, 55));
    }

    // -----------------------------------------------------------------------
    // release — success path
    // -----------------------------------------------------------------------

    #[test]
    fn test_release_milestone_succeeds_when_score_met() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);

        // Deposit 1000 CSPR (1_000_000_000_000 motes)
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        // Release milestone 0 with score 70 (>= threshold 60)
        test_env.set_caller(agent);
        contract.release(0, 70);

        // Milestone 0 should now be marked released
        let milestones = contract.get_milestones();
        assert!(milestones[0].released);
        assert!(!milestones[1].released);
    }

    // -----------------------------------------------------------------------
    // release — error paths
    // -----------------------------------------------------------------------

    #[test]
    #[should_panic(expected = "ScoreBelowThreshold")]
    fn test_release_reverts_when_score_below_threshold() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        test_env.set_caller(agent);
        // Score 50 < threshold 60 — should revert
        contract.release(0, 50);
    }

    #[test]
    #[should_panic(expected = "MilestoneAlreadyReleased")]
    fn test_release_reverts_on_double_release() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        test_env.set_caller(agent);
        contract.release(0, 70); // first release — OK
        contract.release(0, 70); // second release — should revert
    }

    #[test]
    #[should_panic(expected = "CallerIsNotOwner")]
    fn test_release_reverts_for_non_owner() {
        let test_env = odra_test::env();
        let startup = test_env.get_account(1);
        let attacker = test_env.get_account(2);
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        // Attacker tries to release
        test_env.set_caller(attacker);
        contract.release(0, 70);
    }

    #[test]
    #[should_panic(expected = "MilestoneIndexOutOfRange")]
    fn test_release_reverts_for_out_of_range_index() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        test_env.set_caller(agent);
        contract.release(99, 100); // index 99 doesn't exist
    }

    // -----------------------------------------------------------------------
    // Full flow: two milestones both released
    // -----------------------------------------------------------------------

    #[test]
    fn test_full_two_milestone_flow() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let startup = test_env.get_account(1);
        let deposit = U512::from(1_000_000_000_000u64);

        let mut contract = EscrowVaultHostRef::deploy_with_value(
            &test_env,
            EscrowVaultInitArgs { startup, milestones: two_milestones() },
            deposit,
        );

        test_env.set_caller(agent);

        // Release milestone 0 (threshold 60) with score 65
        contract.release(0, 65);
        // Release milestone 1 (threshold 80) with score 85
        contract.release(1, 85);

        let milestones = contract.get_milestones();
        assert!(milestones[0].released);
        assert!(milestones[1].released);
    }
}
