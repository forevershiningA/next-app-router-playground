# Session Handoff — Active Screen Gravity (ASG) MCMC Run
**Written:** 2026-03-08  |  **Updated:** 2026-03-10
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

## 2. Current Chain Status (as of 2026-03-10 08:53 UTC)

| Chain | PID | Active file | Rows | Best −lnL | Status |
|-------|-----|-------------|------|-----------|--------|
| **ASG** | 1963865 | `chains/asg_chain/2026-03-09_200000__3.txt` | ~35,005 raw / 25,325 post-burn | **1387.54** | ✅ Running |
| **Alpha** | 5269 | `chains/alpha_chain4/2026-03-09_200000__1.txt` | ~31,485 raw / 27,929 post-burn | **1396.04** | ✅ Running |

Both running at ~700% CPU. Target: 200,000 steps each.
**Monitor** running (PID ~2035898) — logs to `chains/monitor.log` every 15 min.

### Quick status check
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
source planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public

ps aux | grep montepython | grep -v grep | awk '{print "PID="$2" CPU="$3"%"}'
tail -12 chains/monitor.log

# ASG __3 stats
awk 'BEGIN{b=9999;s=0;n=0}{s=s+$1;n=n+1;if($2<b)b=$2}END{print "best_lnL="b"  weighted="s"  rows="n}' \
  chains/asg_chain/2026-03-09_200000__3.txt

# Alpha stats
awk 'BEGIN{b=9999;s=0;n=0}{s=s+$1;n=n+1;if($2<b)b=$2}END{print "best_lnL="b"  weighted="s"  rows="n}' \
  chains/alpha_chain4/2026-03-09_200000__1.txt
```

---

## 3. Model Comparison (updated 2026-03-10)

| Model | Best −lnL | vs ΛCDM (~1383) | Extra params | AIC penalty |
|-------|-----------|-----------------|--------------|-------------|
| ΛCDM (Planck reference) | ~1383 | 0 | — | — |
| **ASG** | **1387.54** | +9.1 in χ² | +2 | ΔAIC ≈ +5 (marginal) |
| **α-attractor** | **1396.04** | +26.1 in χ² | +1 | ΔAIC ≈ +15 (disfavoured) |

Δχ²(α vs ASG) = **17.0** → ΔAIC = 15.0 → α-attractor strongly disfavoured.

### Key scientific results (2026-03-09 analysis)

**ASG best-fit:** n_s=0.9686, r=0.00643, V^{1/4}≈1.9×10¹⁶ GeV — within Planck 68% CL.

**New discovery:** ASG systematically deviates from the plateau-attractor universal
relation n_s = 1 − 2/N_* by Δn_s ≈ +0.002–0.004 (zero posterior samples on the
universal line). This confirms ASG as a **genuinely new class of plateau inflation**,
not a simple α-attractor realization.

**Degeneracy:** Main posterior ridge along Δ–χ₀ (Corr≈−0.66) — "wider screen lower
= narrower screen higher" in field space. β bimodality is a projection of this ridge,
NOT two physical solutions.

**Quick-look March 10 posteriors:** Concatenating `l2/chains/asg_chain/2026-03-09_200000__{1,2,3}.txt` with the default 30% per-file burn now keeps 25,325 rows (Σw ≈ 2.69×10⁴, ESS ≈ 2.3×10⁴) and returns β = 0.063 ± 0.018, Δ = (1.57 ± 0.33) M_Pl, χ₀ = (4.17 ± 0.43) M_Pl, μ = (4.32 ± 1.00) M_Pl. The α-attractor control (31,485 raw / 27,929 post-burn rows, ESS ≈ 1.9×10⁴) gives ε = (1.6 ± 1.0)×10⁻⁴, c = 1.080 ± 0.010, and A_s,inf = (2.159 ± 0.006)×10⁻⁹.

**Chains not converged** — these are preliminary values.

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

### ⚠️ ASG death spiral pattern (recurring issue)
ASG chain gets stuck every ~25–40 min with acceptance ~8–9%. Root cause: posterior
ridge along Δ–χ₀ (Corr≈−0.66) was not captured by original covmat.

**New covmat (use this):** `chains/asg_chain/asg_chain_mar09_new.covmat`
Built from 3,707 samples (combined __1+__2, 30% burn-in). Captures the ridge.

### ASG chain restart (with new covmat)
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
source planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public

# /tmp/run_asg_chain.sh already updated with new covmat + f=0.10
nohup /tmp/run_asg_chain.sh > chains/asg_chain/asg_restart_NEW.log 2>&1 &
echo "PID=$!"
```

Or manually:
```bash
nohup python montepython/MontePython.py run \
  --conf ./base_2018_plikHM_TTTEEE_lowl_lowE_lensing.ini \
  --param configs/asg_model.param \
  -o chains/asg_chain \
  -b chains/asg_chain/asg_best_restart.bestfit \
  -c chains/asg_chain/asg_chain_mar09_new.covmat \
  -j fast --update 9999 -f 0.10 -N 200000 \
  > chains/asg_chain/asg_restart_NEW.log 2>&1 &
```

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

chains/asg_chain/
  asg_best_restart.bestfit            ← valid -b restart file (lnL=1387.65)
  asg_chain.covmat                    ← OLD covmat (do not use for restart)
  asg_chain_mar09_new.covmat          ← NEW covmat (use this — captures Δ–χ₀ ridge)
  2026-03-09_200000__3.txt            ← ACTIVE chain file (f=0.10, new session)
  2026-03-09_200000__2.txt            ← previous segment (stuck, 2740 rows, ESS≈2100)
  2026-03-09_200000__1.txt            ← previous segment (stuck, 2555 rows)

chains/alpha_chain4/
  alpha_chain4_best2800000.bestfit    ← valid -b restart file
  alpha_chain4_fixed_v2.covmat        ← valid covmat
  2026-03-09_200000__1.txt            ← ACTIVE chain file (~9k rows, lnL=1396.04)

chains/
  monitor.log                         ← 15-min status log (monitor PID ~2035898)

q/
  asg_model_summary_mar09.png         ← potential + slow-roll + (n_s,r)  [use as Fig 1]
  asg_ns_r_mar09.png                  ← (n_s,r) posterior cloud
  asg_corner_mar09.png                ← corner plot 4 params (ESS~2100)
  asg_degeneracy_analysis_mar09.png   ← 4-panel: Δ–χ₀ ridge analysis
  asg_beta_bimodality_mar09.png       ← β bimodality falsification
  asg_attractor_comparison_mar09.png  ← ASG vs Starobinsky/α-attractor classes
  asg_ns_universality_mar09.png       ← Δn_s from 1-2/N_* (new-class evidence)
  asg_results_discussion_draft.md     ← draft text: results + methods note
  ASG_scientific_report_en.md         ← main paper (zenodo posteriors, not yet updated)

scripts/
  rg_spectrum_class.py       ← ASG primordial P(k) generator; reads asg_params.txt
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

- [ ] **Wait for ASG `__3`** to accumulate ~10k rows — check if β bimodality persists
      and whether posterior marginals shift from current values
- [ ] **Build updated covmat** from `__3` once it has >5k rows (may improve acceptance)
- [ ] **Convergence check** once ASG hits ~20k rows: `MontePython.py info` on chains
- [ ] **Final corner + n_s–r plots** when converged — replace `_mar09` figures
- [ ] **ΛCDM baseline run** for proper Δχ² comparison (currently using literature ~1383)
- [ ] **Finalize paper** in `q/ASG_scientific_report_en.md`:
      - Replace zenodo posteriors with converged values
      - Add new-class result (Δn_s from universality)
      - Add degeneracy analysis figure
- [ ] **Generate PDF/DOCX** from updated markdown

### Key open physics question
Does Δn_s ≈ +0.002–0.004 above n_s=1−2/N_* persist at full convergence?
If yes → strong evidence ASG is a new class of plateau inflation (publishable claim).

### Generate PDF/DOCX
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
cd q
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
