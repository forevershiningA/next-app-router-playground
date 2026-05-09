#!/usr/bin/env bash
# ASG PolyChord v15 — nlive=200, extended mu [1.50,6.50], tighter beta/Delta/chi0, grade_frac=[2,8]
# Key change: mu prior extended DOWN to 1.50 to capture MH best-fit region (mu=2.242, lnL=1387.60)
# v14 missed this: mu was [3.00, 6.10], so the narrow MH ridge was never sampled.
# grade_frac=[2,8]: doubled slow repeats vs v14 for better mixing over wider mu range.
# Expected: ~1000 equal-weight samples, ln(Z) ~ -1407 to -1409. Runtime: ~2–3 weeks.
set +e
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
set -e

MP_ROOT=/home/polcreation/class_public/python/montepython_public
CHAIN_DIR="${MP_ROOT}/chains/asg_polychord_v15"
LOG_DIR="${MP_ROOT}/logs"
mkdir -p "${CHAIN_DIR}"
mkdir -p "${LOG_DIR}"

export ASG_PARAMS_FILE="${CHAIN_DIR}/asg_params.txt"
# Seed from v14 posterior mean — well within the new prior
printf "beta 1.530000000000000e-01\nDelta 9.390000000000000e-01\nchi0 5.184000000000000e+00\nmu 4.691000000000000e+00\n" \
  > "${ASG_PARAMS_FILE}"

LOGFILE="${LOG_DIR}/v15_$(date -u +%Y%m%d_%H%M).log"
echo "=== ASG PolyChord v15 at $(date -u +%Y-%m-%dT%H:%M:%SZ) ===" | tee -a "${LOGFILE}"
echo "  nlive=200, mu prior [1.50,6.50], beta [0.04,0.28], Delta [0.30,1.80], chi0 [4.00,6.50]" | tee -a "${LOGFILE}"
echo "  grade_frac=[2,8], num_repeats=29, precision_criterion=0.04" | tee -a "${LOGFILE}"
echo "  PID=$$" | tee -a "${LOGFILE}"
echo "  LOGFILE=${LOGFILE}" | tee -a "${LOGFILE}"

cd "${MP_ROOT}"

python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/asg_model_pc_v15.param \
  -o "${CHAIN_DIR}" \
  --method PC \
  --PC_nlive 200 \
  --PC_do_clustering True \
  --PC_precision_criterion 0.04 \
  --PC_feedback 2 \
  2>&1 | tee -a "${LOGFILE}"
