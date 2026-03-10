# Session Handoff — Active Screen Gravity (ASG) MCMC Run
**Written:** 2026-03-09  
**CWD:** `/home/polcreation/class_public/python/montepython_public`  
**Conda env:** `plc311`  
**Source always required:** `planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh`

---

## 1. What is this project?

We are running MontePython + CLASS MCMC chains for two inflationary models against **Planck 2018 TT,TE,EE + lowl + lowE + lensing** likelihoods, targeting 200,000-step production runs each.

### ASG — Active Screen Gravity
Jordan-frame action with a Gaussian gravitational screen:
```
S = ∫d⁴x√(-g) [ F(φ)R  −  ½(∂φ)²  −  V(φ) ]
V(φ) = (1 − exp(−φ/μ))²          ← Starobinsky-like plateau
F(φ) = 1 + β·exp(−(φ−χ₀)²/Δ²)   ← "Active Screen" (non-minimal coupling)
```
Free params: **β, Δ, χ₀, μ** (plus 4 standard cosmo + 21 Planck nuisance = 29 total).

### α-attractor E-model
Standard Starobinsky-like attractor. Free params: **ε, c, A_s_inf** (plus same cosmo/nuisance = 28 total). Comparison model only — already disfavoured.

---

## 2. Current Chain Status (as of 2026-03-09 ~19:45 UTC)

| Chain | PID | Output file | Rows (latest segment) | Best −lnL | Status |
|-------|-----|-------------|-----------------------|-----------|--------|
| **ASG** | 1045685 | `chains/asg_chain/2026-03-09_200000__2.txt` | 1,665 (segment `__2`, concatenated with `__1` and `__3`) | **1387.54** | ✅ Running |
| **Alpha** | 5269 | `chains/alpha_chain4/2026-03-09_200000__1.txt` | 5,540 | **1396.04** | ✅ Running |

Both jobs are again saturating the 8-core node (≈700% CPU) with the `-f 0.2` (ASG) / `-f 0.4` (alpha) settings. Target: 200,000 accepted steps each. Fresh segments are mirrored under `q/l2/chains/**` for offline post-processing.

### Quick status check
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
source planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh

# Check PIDs alive
ps aux | grep montepython | grep -v grep | awk '{print "PID="$2" CPU="$3"% TIME="$10}'

# Alpha chain
awk 'BEGIN{b=9999;s=0}{s+=$1;if($2<b)b=$2}END{print "best_lnL="b"  steps="s}' \
  chains/alpha_chain4/2026-03-08_200000__1.txt

# ASG chain (check which file is newest)
asg=$(ls -t chains/asg_chain/2026-03-08_200000__*.txt | head -1)
awk 'BEGIN{b=9999;s=0}{s+=$1;if($2<b)b=$2}END{print "best_lnL="b"  steps="s}' "$asg"
```

---

## 3. Model Comparison (Preliminary)

| Model | Best −lnL | vs ΛCDM (~1383) | Extra params | AIC penalty |
|-------|-----------|-----------------|--------------|-------------|
| ΛCDM (Planck reference) | ~1383 | 0 | — | — |
| **ASG** | **1387.54** | +9.1 in χ² | +2 | ΔAIC ≈ +5 (marginal) |
| **α-attractor** | **1396.04** | +26 in χ² | +1 | ΔAIC ≈ +15 (disfavoured) |

Δχ²(α vs ASG) = **17.0** → AIC-corrected ΔAIC = 15.0 → α-attractor strongly disfavoured.  
**Chains not converged** — these are preliminary best-fit values, not posteriors.

---

## 4. Critical Architecture Fix (bridge-lag — already applied)

**Problem (old):** `A_s_inf` was a `'nuisance'` (fast) param in alpha_bridge. During fast sweeps CLASS was not re-run, so the Planck lnL was frozen → tau and A_s couldn't jointly optimise → chain death spiral at lnL≈1399.

**Fix (applied to these files):**

| File | Change |
|------|--------|
| `configs/alpha_attractor.param` | A_s_inf type → `'cosmo'`; ordering: A_s_inf **before** epsilon/c |
| `chains/alpha_chain4/log.param` | Same reordering + `alpha_bridge.use_nuisance = ['epsilon', 'c']` |
| `montepython/likelihoods/alpha_bridge/alpha_bridge.data` | `use_nuisance = ['epsilon','c']` (A_s_inf removed) |
| `montepython/likelihoods/alpha_bridge/alpha_bridge.py` | Added `pre_compute(data)` that writes Lambda(A_s_inf,c) to `alpha_params.txt` BEFORE CLASS runs; `self.nuisance = ['epsilon','c']` |
| `montepython/sampler.py` | Hook loop at line ~711: calls `_lkl.pre_compute(data)` before `cosmo.set()` |
| `montepython/data.py` | Line ~870: `elif elem == 'A_s_inf': del self.cosmo_arguments[elem]` — prevents CLASS receiving A_s_inf directly |

**Result:** A_s_inf is now a slow cosmo param, triggers full CLASS recompute, chain descended from stuck lnL=1399 to new best lnL=1397.05.

---

## 5. How to Restart a Dead Chain

### ASG chain died → restart from bestfit
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
source planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public

nohup python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/asg_model.param \
  -o chains/asg_chain \
  -b chains/asg_chain/asg_best_restart.bestfit \
  -c chains/asg_chain/asg_chain.covmat \
  -j fast --update 9999 -f 0.2 -N 200000 \
  > chains/asg_chain/asg_restart_NEW.log 2>&1 &
echo "PID=$!"
```
⚠️ `nohup` + bare `&` may die if shell exits. Use a wrapper script:
```bash
nohup /tmp/run_asg_chain.sh > chains/asg_chain/asg_restart_NEW.log 2>&1 &
```
Where `/tmp/run_asg_chain.sh` sources conda + clik_profile then runs the command.

### Alpha chain died → restart from bestfit
```bash
nohup python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/alpha_attractor.param \
  -o chains/alpha_chain4 \
  -b chains/alpha_chain4/alpha_chain4_best2800000.bestfit \
  -c chains/alpha_chain4/alpha_chain4_fixed_v2.covmat \
  -j fast --update 9999 -f 0.4 -N 200000 \
  > chains/alpha_chain4/alpha_restart_NEW.log 2>&1 &
```

### ⚠️ Bestfit file format — CRITICAL
`read_args_from_bestfit` parses: header line starts with `#`, names are **comma-separated**,
values on next line are space-separated. Physical values = `chain_value × scale`.

```
#  omega_b,omega_cdm,100*theta_s,...
  0.02234420  0.11944  1.04172  ...
```

- `omega_b`: scale=0.01 → physical = chain_value × 0.01
- `calib_100T`, `calib_217T`: scale=0.001 → physical = chain_value × 0.001  
- All other params: scale=1.0 → physical = chain_value (unchanged)
- Param name MUST match exactly: `100*theta_s` (not `100theta_s`)

---

## 6. ASG Death Spiral Pattern & Prevention

**Symptoms:** File timestamp stops updating for >30 min; CPU stays at 700%+; chain at lnL~1404+ with all slow steps rejected.

**Cause:** Chain wanders from best-fit (lnL~1387) to bad region (lnL~1404) then gets stuck. Jumping factor f=0.3 was too large.

**Current setting:** `-f 0.2` (reduced from 0.3). If it spirals again try `-f 0.15`.

**Detection:**
```bash
echo "file age (s):" $(( $(date +%s) - $(stat -c %Y chains/asg_chain/2026-03-08_200000__3.txt) ))
# >1800 seconds with process alive = stuck
```

---

## 7. Key Files Reference

```
montepython/
  likelihoods/alpha_bridge/
    alpha_bridge.py          ← MODIFIED: pre_compute hook, nuisance=['epsilon','c']
    alpha_bridge.data        ← MODIFIED: use_nuisance = ['epsilon','c']
  likelihoods/ASG_bridge/
    ASG_bridge.py            ← unchanged; writes asg_params.txt, runs slow-roll
  sampler.py                 ← MODIFIED: pre_compute hook loop at line ~711
  data.py                    ← MODIFIED: A_s_inf deleted from cosmo_arguments ~line 870

configs/
  alpha_attractor.param      ← MODIFIED: A_s_inf='cosmo', ordered before epsilon/c
  asg_model.param            ← unchanged

chains/alpha_chain4/
  log.param                  ← MODIFIED: matches alpha_attractor.param ordering
  alpha_chain4_best2800000.bestfit   ← valid -b restart file (physical values)
  alpha_chain4_fixed_v2.covmat       ← valid covmat (C[A_s_inf,A_s_inf]=1e-20)
  2026-03-08_200000__1.txt           ← active chain file

chains/asg_chain/
  asg_best_restart.bestfit   ← valid -b restart file (physical values, best at lnL=1387.65)
  asg_chain.covmat           ← covmat
  2026-03-08_200000__3.txt   ← active chain file (note: __3 because __1,__2 existed)

scripts/
  rg_spectrum_class.py       ← ASG primordial P(k) generator; reads asg_params.txt

q/
  ASG_scientific_report_en.md  ← main paper (UPDATED this session with correct Δχ²=18.8)
```

---

## 8. Scientific Results So Far

### ASG best-fit point (lnL=1387.54)
```
beta  = 0.0346      (screen strength)
Delta = 1.6274 M_Pl (screen width)
chi0  = 3.7404 M_Pl (screen centre in field space)
mu    = 2.1461 M_Pl (potential scale)
omega_b ≈ 0.02226, omega_cdm ≈ 0.12025, 100*theta_s ≈ 1.04169, tau ≈ 0.0533
```

### Alpha-attractor best-fit (lnL=1396.04)
```
epsilon = 3.89e-4, c = 1.1042, A_s_inf = 2.1555e-9
```

### Paper (q/ASG_scientific_report_en.md)
The manuscript now includes the **March 09 quick-look** statistics sourced from
`l2/chains/*/2026-03-09_200000__*.txt`: ASG hyper-posteriors
(`β=0.0370±0.0068`, `Δ=1.506±0.150`, `χ₀=3.988±0.354`, `μ=3.436±0.879`)
and the α-attractor control
(`ε=(3.01±1.06)×10^{-4}`, `c=1.105±0.013`, `A_{s,\rm inf}=(2.156±0.006)×10^{-9}`).
They are explicitly flagged as preliminary (ESS ≪ 10³, GR inflated) and will be
replaced once the chains deliver the target $2\\times10^{5}$ accepted steps.

---

## 9. What Needs To Happen Next

- [ ] **Monitor** both chains for death spirals (check every ~2h)
- [ ] **Convergence check** once ASG reaches ~20,000 steps: run `MontePython.py info` on chains
- [ ] **Generate plots** when converged: triangle plots via GetDist, n_s-r trajectory
- [ ] **ΛCDM baseline run** for proper Δχ² comparison (currently using literature ~1383)
- [ ] **Finalize paper** in `q/ASG_scientific_report_en.md` — quick-look March 09 numbers are now in place; overwrite them once chains truly converge
- [ ] **Generate PDF/DOCX** from updated markdown (`ASG_scientific_report_en_math.{pdf,docx}`) whenever text/figures change; pandoc+Tectonic workflow below

### Generate PDF/DOCX (tools now installed)
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
cd q
pandoc ASG_scientific_report_en.md -o ASG_scientific_report_en_math.docx
pandoc ASG_scientific_report_en.md \
  --pdf-engine=tectonic \
  --resource-path=\".;figures\" \
  -o ASG_scientific_report_en_math.pdf
```

---

## 10. Environment Setup (every new shell)

```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public
```
