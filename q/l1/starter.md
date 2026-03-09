# Session Handoff — Active Screen Gravity (ASG) MCMC Run
**Written:** 2026-03-08  
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

## 2. Current Chain Status (as of 2026-03-08 ~22:35 UTC)

| Chain | PID | Output file | Steps | Best −lnL | Status |
|-------|-----|-------------|-------|-----------|--------|
| **ASG** | 1211002 | `chains/asg_chain/2026-03-08_200000__3.txt` | ~1,300 | **1387.66** | ✅ Running |
| **Alpha** | 3296426 | `chains/alpha_chain4/2026-03-08_200000__1.txt` | ~12,820 | **1397.05** | ✅ Running |

Both running at ~700% CPU (multi-core). Target: 200,000 steps each.

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
| **ASG** | **1387.66** | +9.3 in χ² | +2 | ΔAIC ≈ +5 (marginal) |
| **α-attractor** | **1397.05** | +28 in χ² | +1 | ΔAIC ≈ +16 (disfavoured) |

Δχ²(α vs ASG) = **18.8** → AIC-corrected ΔAIC = 16.8 → α-attractor strongly disfavoured.  
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

### ASG best-fit point (lnL=1387.65/1387.66)
```
beta  = 0.0360      (screen strength)
Delta = 1.6187 M_Pl (screen width)
chi0  = 3.7361 M_Pl (screen centre in field space)
mu    = 2.1354 M_Pl (potential scale)
omega_b = 0.02234, omega_cdm = 0.11944, 100*theta_s = 1.04172, tau = 0.05579
```

### Alpha-attractor best-fit (lnL=1397.05)
```
epsilon = 2.003e-4, c = 1.1247, A_s_inf = 2.189e-9
```

### Paper (q/ASG_scientific_report_en.md)
The paper already has converged posterior values from an **older zenodo run**:
`β=0.36±0.20, Δ=0.70±0.23, χ₀=4.52±1.50, μ=4.25±1.06` (68% CL, 21,406 samples).  
The current runs will improve these when converged. **Do not overwrite the zenodo posteriors until chains converge.**

---

## 9. What Needs To Happen Next

- [ ] **Monitor** both chains for death spirals (check every ~2h)
- [ ] **Convergence check** once ASG reaches ~20,000 steps: run `MontePython.py info` on chains
- [ ] **Generate plots** when converged: triangle plots via GetDist, n_s-r trajectory
- [ ] **ΛCDM baseline run** for proper Δχ² comparison (currently using literature ~1383)
- [ ] **Finalize paper** in `q/ASG_scientific_report_en.md` — replace zenodo posteriors with new converged values once available
- [ ] **Generate PDF/DOCX** from updated markdown: `python-docx` + `weasyprint` installed in plc311 env; `pandoc` installed via conda

### Generate PDF/DOCX (tools now installed)
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
cd q
pandoc ASG_scientific_report_en.md -o ASG_scientific_report_en_v14.docx \
  --reference-doc=ASG_scientific_report_en_v13.docx 2>/dev/null || \
pandoc ASG_scientific_report_en.md -o ASG_scientific_report_en_v14.docx
pandoc ASG_scientific_report_en.md -o ASG_scientific_report_en_v14.pdf \
  --pdf-engine=weasyprint
```

---

## 10. Environment Setup (every new shell)

```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public
```
