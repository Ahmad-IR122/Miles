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
4. Stop only the processes associated with these ports.
5. If a process does not stop normally, force-stop that process.
6. Verify that ports `8000`, `8001`, and `5173` are no longer listening.
7. If a process could not be stopped, report the port, process ID, and actual error.

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

First try to stop the process normally:

```powershell
Stop-Process -Id <PID>
```

If the process is still running, force-stop it:

```powershell
Stop-Process -Id <PID> -Force
```

If multiple processes are using the Project A ports, stop each corresponding process.

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