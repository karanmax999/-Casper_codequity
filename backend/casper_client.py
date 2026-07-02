"""
casper_client.py — Casper Network integration for the Codequity Launchpad backend.

In MOCK MODE (when AGENT_PRIVATE_KEY is not set), all methods return realistic-looking
fake transaction hashes so the full UI flow works without real testnet keys.

In LIVE MODE (when AGENT_PRIVATE_KEY is set as PEM), the client will submit real
deploys to the Casper testnet via the JSON-RPC API.
"""

import os
import hashlib
import secrets
import logging
import json
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def _is_mock_mode() -> bool:
    """Return True if no real private key is configured."""
    key = os.getenv("AGENT_PRIVATE_KEY", "").strip()
    return not key


def _fake_tx_hash() -> str:
    """Generate a realistic-looking 64-char hex hash for mock mode."""
    return secrets.token_hex(32)


def _fake_contract_uref() -> str:
    """Generate a realistic-looking Casper URef for mock mode."""
    rand_hex = secrets.token_hex(32)
    return f"uref-{rand_hex}-007"


class CasperClient:
    """
    Casper Network client for the Codequity Launchpad.

    Supports two modes:
    - Mock mode: AGENT_PRIVATE_KEY not set → fake tx hashes, no real chain calls
    - Live mode: AGENT_PRIVATE_KEY set → real Ed25519 signed deploys to testnet
    """

    def __init__(self):
        self.node_url = os.getenv("CASPER_NODE_URL", "https://testnet.casper.network")
        self.private_key_pem = os.getenv("AGENT_PRIVATE_KEY", "").strip()
        self.mock = _is_mock_mode()

        if self.mock:
            logger.warning(
                "CasperClient running in MOCK MODE — no real on-chain transactions will be submitted. "
                "Set AGENT_PRIVATE_KEY to enable live testnet calls."
            )
        else:
            logger.info("CasperClient running in LIVE MODE against %s", self.node_url)
            self._load_keypair()

    def _load_keypair(self):
        """Load the Ed25519 private key from PEM."""
        try:
            from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
            from cryptography.hazmat.primitives.serialization import load_pem_private_key, Encoding, PublicFormat, Raw

            private_key_pem_bytes = self.private_key_pem.replace("\\n", "\n").encode()
            self._private_key = load_pem_private_key(private_key_pem_bytes, password=None)
            pub_raw = self._private_key.public_key().public_bytes(
                encoding=Encoding.Raw, format=PublicFormat.Raw
            )
            self.public_key_hex = "02" + pub_raw.hex()  # Casper Ed25519 prefix
            logger.info("Loaded Ed25519 agent key: %s...", self.public_key_hex[:16])
        except Exception as exc:
            logger.error("Failed to load Ed25519 private key: %s", exc)
            raise

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def deploy_escrow_contract(
        self,
        owner_pubkey: str,
        milestones: list,
        amount_cspr: float,
    ) -> tuple[str, str]:
        """
        Deploy the EscrowVault contract.

        Returns:
            (deploy_tx_hash, contract_uref)
        """
        if self.mock:
            tx_hash = _fake_tx_hash()
            contract_uref = _fake_contract_uref()
            logger.info("[MOCK] Deployed EscrowVault → contract_uref=%s tx=%s", contract_uref, tx_hash)
            return tx_hash, contract_uref

        # LIVE mode: submit actual Wasm deploy
        # This requires the compiled EscrowVault Wasm binary at ESCROW_WASM_PATH
        return self._live_deploy_escrow(owner_pubkey, milestones, amount_cspr)

    def mint_safe_nft(
        self,
        round_id: str,
        investor_pubkey: str,
        startup_pubkey: str,
        terms_hash: str = "",
    ) -> str:
        """
        Mint a SAFE NFT for a funding round.

        Returns:
            deploy_tx_hash (the mint transaction hash)
        """
        if self.mock:
            tx_hash = _fake_tx_hash()
            logger.info("[MOCK] Minted SAFE NFT for round %s → tx=%s", round_id, tx_hash)
            return tx_hash

        return self._live_mint_safe(round_id, investor_pubkey, startup_pubkey, terms_hash)

    def release_funds(
        self,
        contract_uref: str,
        milestone_index: int,
        recipient_pubkey: str,
        current_score: int,
    ) -> str:
        """
        Call release(milestone_index) on the EscrowVault contract.
        The contract will verify current_score >= threshold before releasing.

        Returns:
            deploy_tx_hash
        """
        if self.mock:
            tx_hash = _fake_tx_hash()
            logger.info(
                "[MOCK] Released milestone %d on %s (score=%d) → tx=%s",
                milestone_index, contract_uref, current_score, tx_hash,
            )
            return tx_hash

        return self._live_release(contract_uref, milestone_index, recipient_pubkey, current_score)

    def get_deploy_status(self, deploy_hash: str) -> dict:
        """
        Query the status of a deploy by its hash.

        Returns:
            dict with 'status' key: 'pending' | 'success' | 'failed'
        """
        if self.mock:
            return {"status": "success", "mock": True, "deploy_hash": deploy_hash}

        return self._live_get_deploy_status(deploy_hash)

    # ------------------------------------------------------------------
    # Live mode helpers (only called when AGENT_PRIVATE_KEY is set)
    # ------------------------------------------------------------------

    def _live_deploy_escrow(self, owner_pubkey, milestones, amount_cspr):
        """
        Submit a real EscrowVault deploy to Casper testnet.
        Requires compiled Wasm at path set by ESCROW_WASM_PATH env var.
        """
        import subprocess
        import tempfile

        wasm_path = os.getenv("ESCROW_WASM_PATH", "contracts/escrow_vault.wasm")
        if not os.path.exists(wasm_path):
            raise FileNotFoundError(
                f"EscrowVault Wasm not found at {wasm_path}. "
                "Build with: cd contracts && odra build --release"
            )

        # Build milestone init args as JSON
        ms_args = json.dumps([
            {"threshold": m["threshold_score"], "amount_percent": int(m["release_percent"]), "released": False}
            for m in milestones
        ])

        # Write key to temp file
        with tempfile.NamedTemporaryFile(suffix=".pem", delete=False, mode="w") as f:
            f.write(self.private_key_pem.replace("\\n", "\n"))
            key_path = f.name

        try:
            result = subprocess.run(
                [
                    "casper-client", "put-deploy",
                    "--node-address", self.node_url,
                    "--secret-key", key_path,
                    "--session-path", wasm_path,
                    "--session-arg", f"owner:public_key='{owner_pubkey}'",
                    "--session-arg", f"amount_cspr:u64='{int(amount_cspr * 1_000_000_000)}'",
                    "--payment-amount", "50000000000",
                ],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                raise RuntimeError(f"casper-client error: {result.stderr}")

            output = json.loads(result.stdout)
            deploy_hash = output["result"]["deploy_hash"]
            # Contract URef is available after the deploy processes (~2-3 blocks)
            # For now return the deploy hash; the URef can be queried from the deploy result
            contract_uref = f"deploy-{deploy_hash}"  # Placeholder until on-chain resolution
            return deploy_hash, contract_uref
        finally:
            os.unlink(key_path)

    def _get_account_hash(self, pubkey: str) -> str:
        if pubkey.startswith("account-hash-"):
            return pubkey
        import subprocess
        result = subprocess.run(
            ["casper-client", "account-address", "--public-key", pubkey],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()

    def _live_mint_safe(self, round_id, investor_pubkey, startup_pubkey, terms_hash):
        """Submit a real SAFE NFT mint deploy."""
        import subprocess
        import tempfile

        safe_package_hash = os.getenv("SAFE_CONTRACT_UREF")
        if not safe_package_hash:
            raise ValueError("SAFE_CONTRACT_UREF environment variable is not configured.")

        # Resolve public keys to account hashes
        investor_account = self._get_account_hash(investor_pubkey)
        startup_account = self._get_account_hash(startup_pubkey)

        # Write key to temp file
        with tempfile.NamedTemporaryFile(suffix=".pem", delete=False, mode="w") as f:
            f.write(self.private_key_pem.replace("\\n", "\n"))
            key_path = f.name

        try:
            result = subprocess.run(
                [
                    "casper-client", "put-deploy",
                    "--node-address", self.node_url,
                    "--secret-key", key_path,
                    "--session-package-hash", safe_package_hash.replace("hash-", "").replace("uref-", ""),
                    "--session-entry-point", "mint",
                    "--session-arg", f"funding_round_id:string='{round_id}'",
                    "--session-arg", f"investor:key='{investor_account}'",
                    "--session-arg", f"startup:key='{startup_account}'",
                    "--session-arg", f"terms_hash:string='{terms_hash}'",
                    "--payment-amount", "5000000000",
                ],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                raise RuntimeError(f"casper-client error: {result.stderr}")

            output = json.loads(result.stdout)
            return output["result"]["deploy_hash"]
        finally:
            os.unlink(key_path)

    def _live_release(self, contract_uref, milestone_index, recipient_pubkey, current_score):
        """Submit a real release(milestone_index) call to the EscrowVault."""
        import subprocess
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".pem", delete=False, mode="w") as f:
            f.write(self.private_key_pem.replace("\\n", "\n"))
            key_path = f.name

        try:
            result = subprocess.run(
                [
                    "casper-client", "put-deploy",
                    "--node-address", self.node_url,
                    "--secret-key", key_path,
                    "--session-hash", contract_uref.replace("uref-", ""),
                    "--session-entry-point", "release",
                    "--session-arg", f"milestone_index:u8='{milestone_index}'",
                    "--session-arg", f"current_score:u16='{current_score}'",
                    "--session-arg", f"recipient:public_key='{recipient_pubkey}'",
                    "--payment-amount", "5000000000",
                ],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                raise RuntimeError(f"casper-client error: {result.stderr}")

            output = json.loads(result.stdout)
            return output["result"]["deploy_hash"]
        finally:
            os.unlink(key_path)

    def _live_get_deploy_status(self, deploy_hash: str) -> dict:
        """Query deploy status from Casper RPC."""
        import httpx

        try:
            response = httpx.post(
                f"{self.node_url}/rpc",
                json={
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "info_get_deploy",
                    "params": {"deploy_hash": deploy_hash},
                },
                timeout=15,
            )
            result = response.json()
            execution_results = result.get("result", {}).get("execution_results", [])
            if not execution_results:
                return {"status": "pending", "deploy_hash": deploy_hash}

            last = execution_results[-1].get("result", {})
            if "Failure" in last:
                return {"status": "failed", "error": last["Failure"].get("error_message"), "deploy_hash": deploy_hash}
            return {"status": "success", "deploy_hash": deploy_hash}
        except Exception as exc:
            logger.error("Failed to query deploy status for %s: %s", deploy_hash, exc)
            return {"status": "pending", "deploy_hash": deploy_hash, "error": str(exc)}


# Singleton instance — imported by the router
casper_client = CasperClient()
