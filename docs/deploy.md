# Deploying to Fly.io

This app is scaffolded and Docker/Fly-ready (built + smoke-tested locally via `docker build` / `docker run`), but the actual Fly.io deploy needs to be run by hand — `flyctl` isn't installed/authenticated in the environment this was scaffolded in, and login is an interactive browser OAuth flow.

## One-time setup

```sh
brew install flyctl        # or see https://fly.io/docs/flyctl/install/
flyctl auth login
```

## Launch

From the repo root:

```sh
flyctl launch --no-deploy
```

This reads `fly.toml` (app name `job-app`, region `iad` — change either if prompted or by editing `fly.toml` first) and registers the app on your Fly account without deploying yet.

## Create the persistent volume

The SQLite file lives on a Fly volume mounted at `/data` (see `[[mounts]]` in `fly.toml`) so it survives redeploys — without this, every deploy would start from an empty database.

```sh
flyctl volumes create job_app_data --size 1 --region <region-you-launched-in>
```

## Deploy

```sh
flyctl deploy
```

## Verify end-to-end

```sh
curl https://<your-app>.fly.dev/health
curl -X POST https://<your-app>.fly.dev/scan-now
flyctl logs
```

`/health` should return `{"status":"ok"}`; `/scan-now` should return the scan stub's JSON (`{"ranAt": "...", "status": "ok", "note": "..."}`), and `flyctl logs` should show the same scheduler startup line (`[scheduler] scan scheduled with cron expression "..."`) seen in local runs, confirming the in-process cron scheduler is alive on the deployed machine.

## Notes

- `fly.toml` sets `auto_stop_machines = false` and `min_machines_running = 1` deliberately — Fly's default scale-to-zero behavior would kill the long-lived Node process holding the in-process cron timer, breaking the scheduled-scan acceptance criterion.
- No secrets are needed yet for this scaffolding ticket (`PORT`, `DB_PATH`, `SCAN_CRON` are all non-secret and set via `[env]` in `fly.toml`). Later tickets that add Adzuna/Greenhouse credentials should use `flyctl secrets set KEY=value` rather than checking them into `fly.toml`.
