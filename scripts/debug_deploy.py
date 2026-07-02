import os, subprocess, json
def main():
    cmd = ['casper-client', 'get-deploy', '--node-address', 'https://node.testnet.casper.network', 'afdf101a1f1d80ca57ef35fcd06b0d6b4c94cf49cb2b7443f58fe34cf5d4b8f9']
    env = os.environ.copy()
    env['PATH'] = os.path.expanduser('~/.cargo/bin') + os.pathsep + env.get('PATH', '')
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    out = res.stdout
    idx = out.find('{')
    if idx != -1:
        data = json.loads(out[idx:])
        print("Keys in result:", data.get('result', {}).keys())
        deploy = data.get('result', {}).get('deploy', {})
        print("Keys in deploy:", deploy.keys())
        exec_results = data.get('result', {}).get('execution_results', [])
        print("Execution results length:", len(exec_results))
        if exec_results:
            print("First execution result keys:", exec_results[0].keys())
            print("Result status:", exec_results[0].get('result', {}).keys())
            print(json.dumps(exec_results[0], indent=2)[:1000])
        else:
            print("\nFull 'result' structure:")
            print(json.dumps(data.get('result', {}), indent=2)[:3000])
    else:
        print("No JSON found in output! Raw output:")
        print(out[:1000])

if __name__ == '__main__':
    main()
