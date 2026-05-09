#!/usr/bin/env bash
# monitor_v15.sh — 15-min monitor for PolyChord v15
# Usage: nohup bash scripts/monitor_v15.sh > logs/monitor_v15.log 2>&1 &

INTERVAL=900  # 15 minutes
MP_ROOT=/home/polcreation/class_public/python/montepython_public
CHAIN_DIR="${MP_ROOT}/chains/asg_polychord_v15"
PC_DIR="${CHAIN_DIR}/PC"
PID_FILE="${MP_ROOT}/logs/v15.pid"
LOG="${MP_ROOT}/logs/monitor_v15.log"

V14_LNZ=-1410.19
V13_LNZ=-1409.25
MH_BEST=1387.60

check() {
  echo "========================================"
  echo "V15 CHECK: $(date -u '+%Y-%m-%d %H:%M UTC')"

  # --- Process alive? ---
  if [[ -f "$PID_FILE" ]]; then
    V15_PID=$(cat "$PID_FILE")
    if kill -0 "$V15_PID" 2>/dev/null; then
      CPU=$(ps -p "$V15_PID" -o %cpu= 2>/dev/null | tr -d ' ')
      MEM=$(ps -p "$V15_PID" -o rss= 2>/dev/null | awk '{printf "%.0fMB", $1/1024}')
      echo "PROCESS: ✅ ALIVE  PID=$V15_PID  CPU=${CPU}%  MEM=$MEM"
    else
      echo "PROCESS: ❌ DEAD  (PID=$V15_PID not found)"
    fi
  else
    echo "PROCESS: ⚠️  No PID file found"
  fi

  # --- Live points generated so far (from log) ---
  LOGFILE=$(ls -t "${MP_ROOT}"/logs/v15_*.log 2>/dev/null | head -1)
  if [[ -n "$LOGFILE" ]]; then
    LIVE_PCT=$(grep -o '[0-9]*%' "$LOGFILE" | tail -1)
    LAST_LINE=$(tail -3 "$LOGFILE" | tr '\n' ' ')
    echo "LOG:     last=${LAST_LINE}"
    [[ -n "$LIVE_PCT" ]] && echo "         live-pt generation: ${LIVE_PCT}"
  fi

  # --- Dead points & best lnL (from dead-birth file) ---
  DEAD_FILE="${PC_DIR}/asg_polychord_v15_dead-birth.txt"
  if [[ -f "$DEAD_FILE" ]]; then
    NDEAD=$(grep -c "" "$DEAD_FILE" 2>/dev/null || echo 0)
    # Best logL = max of col 30 (logL), excluding boundary (-1e31)
    BEST_LNL=$(awk '$30 > -1e30 {print $30}' "$DEAD_FILE" | sort -rn | head -1)
    BEST_LNL_DISP=$(echo "$BEST_LNL" | awk '{printf "%.2f", -$1}')
    # Latest logL = last non-boundary dead point
    LATEST_LNL=$(awk '$30 > -1e30 {print $30}' "$DEAD_FILE" | tail -1 | awk '{printf "%.2f", -$1}')
    BOUNDARY=$(awk '$30 <= -1e30' "$DEAD_FILE" | wc -l)
    AGE=$(( $(date +%s) - $(stat -c %Y "$DEAD_FILE") ))
    echo "SAMPLING:"
    echo "  dead pts   : $NDEAD  (boundary/bad: $BOUNDARY, file age: ${AGE}s)"
    echo "  best  -lnL : ${BEST_LNL_DISP}  (MH best: ${MH_BEST}, v14 best PC: 1389.81)"
    echo "  latest -lnL: ${LATEST_LNL}  (live logL frontier)"
    if [[ $AGE -gt 3600 ]]; then
      echo "  ⚠️  WARNING: dead-birth file stale (${AGE}s > 1h)"
    fi
  else
    echo "SAMPLING: no dead-birth file yet (still generating live points)"
  fi

  # --- ln(Z) from stats (updated at each PolyChord checkpoint) ---
  STATS_FILE="${PC_DIR}/asg_polychord_v15.stats"
  if [[ -f "$STATS_FILE" ]]; then
    LNZ=$(grep "log(Z)" "$STATS_FILE" | head -1 | awk '{print $3}')
    LNZ_ERR=$(grep "log(Z)" "$STATS_FILE" | head -1 | awk '{print $5}')
    NPOSTERIOR=$(grep "nposterior" "$STATS_FILE" | awk '{print $2}')
    NEQUALS=$(grep "nequals" "$STATS_FILE" | awk '{print $2}')
    NLIKE=$(grep "nlike" "$STATS_FILE" | awk '{print $2, $3}')
    echo "EVIDENCE:"
    printf "  ln(Z)      : %.3f ± %.3f\n" "$LNZ" "$LNZ_ERR" 2>/dev/null || echo "  ln(Z)      : $LNZ ± $LNZ_ERR"
    echo "  vs v14     : ${V14_LNZ} ± 0.38"
    echo "  vs v13     : ${V13_LNZ} ± 0.48"
    echo "  posterior  : $NPOSTERIOR weighted, $NEQUALS equal-weight"
    echo "  total evals: $NLIKE"
  else
    echo "EVIDENCE:  no stats file yet"
  fi

  # --- Cluster count ---
  N_CLUSTERS=$(ls "${PC_DIR}"/asg_polychord_v15_[0-9]*.txt 2>/dev/null | wc -l)
  [[ $N_CLUSTERS -gt 0 ]] && echo "CLUSTERS:  $N_CLUSTERS found so far"

  echo ""
}

# Run once immediately, then every 15 min
check
while true; do
  sleep "$INTERVAL"
  check
done
