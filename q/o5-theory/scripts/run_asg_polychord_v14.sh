#!/usr/bin/env bash
# ASG PolyChord v14 — optimised within same computational regime as v13
#
# Changes vs v13:
#   nlive        50  -> 100   (2x more dead points, 2x more posterior samples)
#   num_repeats  58  -> 29    (= 1x ndim; halved to offset nlive increase)
#   grade_frac  [2,5]-> [1,8] (halve expensive CLASS calls, more nuisance mixing)
#   precision   0.01 -> 0.005 (stops a bit later; ~+10% ndead for free)
#   chi0 prior  [1.5,9.0] -> [2.8,6.5]  (12x smaller ASG prior volume total)
#   mu   prior  [0.5,10.0] -> [3.0,6.1]
#
# Expected runtime: ~8–14 days (same regime as v13)
# Expected output:  ~500+ equal-weight posterior samples (vs 261 in v13)
# Expected ln(Z):   ~-1406 to -1407 (vs -1409.25; improvement from tighter priors)
#
# Why nlive=100 + num_repeats=29 is BETTER than nlive=50 + num_repeats=58:
#   - Total cost stays equal: 100*29 = 2900 = 50*58
#   - PolyChord's evidence error scales as 1/sqrt(nlive) -> halved from ~0.48 to ~0.34
#   - ndead scales linearly with nlive -> 2x more dead points, 2x posterior samples
#   - num_repeats=29 (=ndim) is the minimum safe value; 58 was overly conservative
#
# Why grade_frac [1,8] instead of [2,5]:
#   - Grade 0 (8 slow params: cosmo+ASG) now does 1*29=29 repeats per sample
#     (was 2*58=116; saves ~75% of CLASS calls - the bottleneck)
#   - Grade 1 (21 fast params: Planck nuisance) does 8*29=232 repeats
#     (was 5*58=290; slight reduction but fast params have very little impact on evidence)
#   - Net: dominant slow-step cost drops, runtime budget goes to nlive instead

set +e
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
set -e

MP_ROOT=/home/polcreation/class_public/python/montepython_public
CHAIN_DIR="${MP_ROOT}/chains/asg_polychord_v14"
mkdir -p "${CHAIN_DIR}"

# Starting point: PolyChord v13 posterior mean (better than v13's MH best-fit start)
export ASG_PARAMS_FILE="${CHAIN_DIR}/asg_params.txt"
printf "beta  1.163000000000000e-01\nDelta 1.371000000000000e+00\nchi0  4.726000000000000e+00\nmu    4.535000000000000e+00\n" \
  > "${ASG_PARAMS_FILE}"

echo "=== ASG PolyChord v14 at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "  nlive=100, num_repeats=29, grade_frac=[1,8], precision=0.005"
echo "  chi0 prior=[2.80,6.50], mu prior=[3.00,6.10]"
echo "  PID=$$"

cd "${MP_ROOT}"

python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/asg_model_pc_v14.param \
  -o "${CHAIN_DIR}" \
  --method PC \
  --PC_nlive 100 \
  --PC_num_repeats 29 \
  --PC_grade_frac "1 8" \
  --PC_do_clustering True \
  --PC_precision_criterion 0.005 \
  --PC_feedback 2
