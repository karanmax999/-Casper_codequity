import os
import subprocess
import json
import time

def get_contract_package_hash(node_url, deploy_hash):
    cmd = ['casper-client', 'get-deploy', '--node-address', node_url, deploy_hash]
    env = os.environ.copy()
    env['PATH'] = os.path.expanduser('~/.cargo/bin') + os.pathsep + env.get('PATH', '')
    
    max_attempts = 15
    for attempt in range(max_attempts):
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, env=env, check=True)
            out = res.stdout
            idx = out.find('{')
            if idx != -1:
                data = json.loads(out[idx:])
                exec_results = data.get('result', {}).get('execution_results', [])
                if exec_results:
                    exec_result = exec_results[0].get('result', {})
                    if 'Success' in exec_result:
                        transforms = exec_result['Success'].get('effect', {}).get('transforms', [])
                        for t in transforms:
                            key = t.get('key', '')
                            if key.startswith('contract-package-'):
                                return 'success', key
                        return 'success', None
                    elif 'Failure' in exec_result:
                        error_msg = exec_result['Failure'].get('error_message', 'Unknown failure')
                        return 'failed', error_msg
            
            print(f"Deploy {deploy_hash[:10]}... is still pending. Retrying in 10s... (Attempt {attempt+1}/{max_attempts})")
            time.sleep(10)
        except subprocess.CalledProcessError as e:
            print(f"Error querying deploy {deploy_hash}: {e.stderr or e}")
            time.sleep(10)
        except Exception as e:
            print(f"Error querying deploy {deploy_hash}: {e}")
            time.sleep(10)
            
    return 'pending', None

def main():
    deployed_env_path = 'scripts/deployed_contracts.env'
    if not os.path.exists(deployed_env_path):
        print("ERROR: deployed_contracts.env not found.")
        return
        
    env_vars = {}
    with open(deployed_env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k] = v

    escrow_hash = env_vars.get('ESCROW_DEPLOY_HASH')
    safe_hash = env_vars.get('SAFE_DEPLOY_HASH')
    
    if not escrow_hash or not safe_hash:
        print("ERROR: Deploy hashes not found in deployed_contracts.env.")
        return

    node_url = 'https://node.testnet.cspr.cloud/rpc'
    
    print(f"Querying node: {node_url}")
    print(f"Escrow Deploy Hash: {escrow_hash}")
    print(f"SAFE Deploy Hash: {safe_hash}")
    
    print("\nWaiting for EscrowVault deployment to finalize...")
    escrow_status, escrow_val = get_contract_package_hash(node_url, escrow_hash)
    if escrow_status == 'success':
        if escrow_val:
            print(f"Found EscrowVault URef: {escrow_val}")
        else:
            print("ERROR: Deploy succeeded but no contract package hash found.")
    elif escrow_status == 'failed':
        print(f"ERROR: EscrowVault deploy failed with error: {escrow_val}")
    else:
        print("ERROR: EscrowVault deploy timed out (still pending).")

    print("\nWaiting for SAFEToken deployment to finalize...")
    safe_status, safe_val = get_contract_package_hash(node_url, safe_hash)
    if safe_status == 'success':
        if safe_val:
            print(f"Found SAFEToken URef: {safe_val}")
        else:
            print("ERROR: Deploy succeeded but no contract package hash found.")
    elif safe_status == 'failed':
        print(f"ERROR: SAFEToken deploy failed with error: {safe_val}")
    else:
        print("ERROR: SAFEToken deploy timed out (still pending).")

    if escrow_status == 'success' and escrow_val and safe_status == 'success' and safe_val:
        backend_env = 'backend/.env'
        if os.path.exists(backend_env):
            with open(backend_env, 'r') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if line.startswith('ESCROW_CONTRACT_UREF='):
                    new_lines.append(f"ESCROW_CONTRACT_UREF={escrow_val}\n")
                elif line.startswith('SAFE_CONTRACT_UREF='):
                    new_lines.append(f"SAFE_CONTRACT_UREF={safe_val}\n")
                else:
                    new_lines.append(line)
            
            with open(backend_env, 'w') as f:
                f.writelines(new_lines)
            print("\nSuccessfully updated backend/.env with both contract URefs!")
        else:
            print("\nERROR: backend/.env not found.")

if __name__ == '__main__':
    main()
