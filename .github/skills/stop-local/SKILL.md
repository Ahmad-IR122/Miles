---
name: stop-local
description: Stop Project A's local development stack by stopping the processes running on ports 8000, 8001, and 5173.
---

# stop-local

Stop the Project A local development stack.

The stack uses:

- `8000` — backend
- `8001` — aiServices
- `5173` — Vite

## Process

1. Check whether ports `8000`, `8001`, and `5173` are being used.
2. Identify the processes listening on those ports.
3. If none of the ports are in use, report that the local stack is already stopped.
4. If processes are found, show the ports and process IDs that will be stopped.
5. Ask for confirmation before stopping them.
6. After confirmation, stop only the processes associated with these ports.
7. Verify that ports `8000`, `8001`, and `5173` are no longer listening.

Do not automatically kill processes without confirmation.

Do not stop unrelated processes.

## PowerShell

Use PowerShell to check the ports:

```powershell
Get-NetTCPConnection -LocalPort 8000,8001,5173 -State Listen |
    Select-Object LocalPort,OwningProcess
```

To identify a process:

```powershell
Get-Process -Id <PID>
```

After confirmation, stop the required processes:

```powershell
Stop-Process -Id <PID> -Force
```

If multiple Project A processes are using the ports, stop each corresponding process.

## Completion

After stopping the processes, verify:

```powershell
Get-NetTCPConnection -LocalPort 8000,8001,5173 -State Listen
```

If no processes are listening, report:

```text
Local stack stopped:

Backend:    stopped
aiServices: stopped
Frontend:   stopped
```

If a process could not be stopped, report the actual error and identify which port/process remains running.