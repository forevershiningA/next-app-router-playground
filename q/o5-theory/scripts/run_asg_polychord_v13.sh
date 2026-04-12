#!/usr/bin/env bash
# ASG PolyChord v13 — aggressive: nlive=50, 2σ priors, grade_frac=[2,5], precision=0.01
# Expected runtime: ~8–12 days
set +e
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
set -e

MP_ROOT=/home/polcreation/class_public/python/montepython_public
CHAIN_DIR="${MP_ROOT}/chains/asg_polychord_v13"
mkdir -p "${CHAIN_DIR}"

export ASG_PARAMS_FILE="${CHAIN_DIR}/asg_params.txt"
printf "beta 3.920451000000000e-02\nDelta 1.596830000000000e+00\nchi0 3.807301000000000e+00\nmu 2.242273000000000e+00\n" \
  > "${ASG_PARAMS_FILE}"

echo "=== ASG PolyChord v13 at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "  nlive=50, 2σ priors, grade_frac=[2,5], precision_criterion=0.01"
echo "  PID=$$"

cd "${MP_ROOT}"

python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/asg_model_pc_v13.param \
  -o "${CHAIN_DIR}" \
  --method PC \
  --PC_nlive 50 \
  --PC_do_clustering True \
  --PC_precision_criterion 0.01 \
  --PC_feedback 2
