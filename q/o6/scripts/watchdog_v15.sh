#!/usr/bin/env bash
# watchdog_v15.sh — auto-restarts v15 if it crashes, kills duplicates
# Usage: nohup bash scripts/watchdog_v15.sh >> logs/watchdog_v15.log 2>&1 &

INTERVAL=300   # check every 5 minutes
MP_ROOT=/home/polcreation/class_public/python/montepython_public
PID_FILE="${MP_ROOT}/logs/v15.pid"
LAUNCH_SCRIPT="${MP_ROOT}/scripts/run_asg_polychord_v15.sh"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M UTC')] $*"; }

kill_duplicates() {
  # Find all running MontePython v15 processes
  PIDS=$(ps aux | grep "MontePython.py run" | grep "asg_polychord_v15" | grep -v grep | awk '{print $2}' | sort -n)
  COUNT=$(echo "$PIDS" | grep -c '[0-9]' || true)
  if [[ $COUNT -gt 1 ]]; then
    KEEPER=$(echo "$PIDS" | head -1)
    log "WARNING: $COUNT duplicates found. Keeping PID=$KEEPER, killing rest."
    for PID in $(echo "$PIDS" | tail -n +2); do
      kill "$PID" 2>/dev/null && log "  Killed duplicate PID=$PID"
    done
    sleep 5
  fi
}

restart_v15() {
  log "V15 DEAD — restarting from resume..."
  NEWLOG="${MP_ROOT}/logs/v15_$(date -u +%Y%m%d_%H%M)_wd.log"
  nohup bash "$LAUNCH_SCRIPT" > "$NEWLOG" 2>&1 &
  NEWPID=$!
  sleep 5
  # Verify it actually started
  if kill -0 "$NEWPID" 2>/dev/null; then
    echo "$NEWPID" > "$PID_FILE"
    log "Restarted OK: PID=$NEWPID → $NEWLOG"
  else
    log "ERROR: restart failed (PID=$NEWPID died immediately)"
  fi
}

log "Watchdog started (check interval: ${INTERVAL}s)"

while true; do
  sleep "$INTERVAL"

  # Step 1: kill any duplicates first
  kill_duplicates

  # Step 2: check if v15 is alive
  if [[ -f "$PID_FILE" ]]; then
    V15_PID=$(cat "$PID_FILE")
    if kill -0 "$V15_PID" 2>/dev/null; then
      log "V15 OK (PID=$V15_PID)"
    else
      # Dead — but maybe a duplicate restarted it already?
      RUNNING=$(ps aux | grep "MontePython.py run" | grep "asg_polychord_v15" | grep -v grep | awk '{print $2}' | head -1)
      if [[ -n "$RUNNING" ]]; then
        log "V15 PID stale but found running PID=$RUNNING — updating PID file"
        echo "$RUNNING" > "$PID_FILE"
      else
        restart_v15
      fi
    fi
  else
    log "No PID file — checking for running process..."
    RUNNING=$(ps aux | grep "MontePython.py run" | grep "asg_polychord_v15" | grep -v grep | awk '{print $2}' | head -1)
    if [[ -n "$RUNNING" ]]; then
      log "Found running PID=$RUNNING — updating PID file"
      echo "$RUNNING" > "$PID_FILE"
    else
      restart_v15
    fi
  fi
done
