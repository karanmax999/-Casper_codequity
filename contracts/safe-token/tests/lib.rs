//! Unit tests for SAFEToken using the Odra mock environment.

#[cfg(test)]
mod tests {
    use odra::host::{Deployer, HostRef, NoArgs};
    use odra::prelude::*;
    use crate::SafeTokenHostRef;

    // -----------------------------------------------------------------------
    // init
    // -----------------------------------------------------------------------

    #[test]
    fn test_init_sets_owner_and_zero_supply() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);

        let contract = SafeTokenHostRef::deploy(&test_env, NoArgs);

        assert_eq!(contract.get_owner(), agent);
        assert_eq!(contract.total_supply(), 0);
    }

    // -----------------------------------------------------------------------
    // mint — success
    // -----------------------------------------------------------------------

    #[test]
    fn test_mint_creates_token_with_correct_metadata() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);

        test_env.set_caller(agent);
        let token_id = contract.mint(
            "round-uuid-001".to_string(),
            investor,
            startup,
            "QmExampleIpfsCid".to_string(),
        );

        assert_eq!(token_id, 0);
        assert_eq!(contract.total_supply(), 1);

        let meta = contract.get_metadata(0);
        assert_eq!(meta.funding_round_id, "round-uuid-001");
        assert_eq!(meta.investor, investor);
        assert_eq!(meta.startup, startup);
        assert_eq!(meta.terms_hash, "QmExampleIpfsCid");

        assert_eq!(contract.get_token_owner(0), investor);
    }

    #[test]
    fn test_mint_increments_total_supply() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);

        contract.mint("round-001".to_string(), investor, startup, "".to_string());
        contract.mint("round-002".to_string(), investor, startup, "".to_string());

        assert_eq!(contract.total_supply(), 2);
    }

    // -----------------------------------------------------------------------
    // mint — error paths
    // -----------------------------------------------------------------------

    #[test]
    #[should_panic(expected = "CallerIsNotOwner")]
    fn test_mint_reverts_for_non_owner() {
        let test_env = odra_test::env();
        let attacker = test_env.get_account(2);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(3);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(attacker);
        contract.mint("round-001".to_string(), investor, startup, "".to_string());
    }

    #[test]
    #[should_panic(expected = "RoundAlreadyMinted")]
    fn test_mint_reverts_on_duplicate_round() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);

        contract.mint("round-001".to_string(), investor, startup, "".to_string());
        // Second mint for same round — should revert
        contract.mint("round-001".to_string(), investor, startup, "".to_string());
    }

    // -----------------------------------------------------------------------
    // transfer
    // -----------------------------------------------------------------------

    #[test]
    fn test_transfer_by_token_holder() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);
        let new_holder = test_env.get_account(3);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);
        contract.mint("round-001".to_string(), investor, startup, "".to_string());

        // Investor transfers their token
        test_env.set_caller(investor);
        contract.transfer(0, new_holder);

        assert_eq!(contract.get_token_owner(0), new_holder);
    }

    #[test]
    fn test_transfer_by_owner() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);
        let new_holder = test_env.get_account(3);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);
        contract.mint("round-001".to_string(), investor, startup, "".to_string());

        // Agent (owner) can also transfer
        test_env.set_caller(agent);
        contract.transfer(0, new_holder);

        assert_eq!(contract.get_token_owner(0), new_holder);
    }

    #[test]
    #[should_panic(expected = "CallerIsNotOwnerOrHolder")]
    fn test_transfer_reverts_for_unauthorized() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);
        let attacker = test_env.get_account(3);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);
        contract.mint("round-001".to_string(), investor, startup, "".to_string());

        // Attacker tries to steal the token
        test_env.set_caller(attacker);
        contract.transfer(0, attacker);
    }

    // -----------------------------------------------------------------------
    // get_token_for_round
    // -----------------------------------------------------------------------

    #[test]
    fn test_get_token_for_round() {
        let test_env = odra_test::env();
        let agent = test_env.get_account(0);
        let investor = test_env.get_account(1);
        let startup = test_env.get_account(2);

        let mut contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        test_env.set_caller(agent);
        contract.mint("round-abc".to_string(), investor, startup, "".to_string());

        assert_eq!(contract.get_token_for_round("round-abc".to_string()), 0);
    }

    #[test]
    #[should_panic(expected = "TokenNotFound")]
    fn test_get_token_for_unminted_round_reverts() {
        let test_env = odra_test::env();
        let contract = SafeTokenHostRef::deploy(&test_env, NoArgs);
        contract.get_token_for_round("nonexistent-round".to_string());
    }
}
