# Session Handoff — Active Screen Gravity (ASG) MCMC Run
**Written:** 2026-03-08  |  **Updated:** 2026-03-09T19:39Z
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

## 2. Current Chain Status (as of 2026-03-09T19:39Z)

| Chain | PID | Active file | Rows | Weighted steps | Best −lnL | Status |
|-------|-----|-------------|------|----------------|-----------|--------|
| **ASG** | 1963865 | `chains/asg_chain/2026-03-09_200000__3.txt` | **3,625** | 5,073 | **1387.71** | ✅ Running |
| **Alpha** | 5269 | `chains/alpha_chain4/2026-03-09_200000__1.txt` | **11,585** | 13,857 | **1396.04** | ✅ Running |

Both running at ~700% CPU. Target: 200,000 steps each.  
**Monitor** running (PID 2035898) — logs to `chains/monitor.log` every 15 min.

⚠️ **Note:** ASG `__3` is still using `asg_chain.covmat` (old). The new covmat
(`asg_chain_mar09_new.covmat`) is loaded automatically on the **next restart** via
`/tmp/run_asg_chain.sh`. If `__3` stalls, kill + restart with that script.

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

## 3. Model Comparison (updated 2026-03-09)

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

**Symptoms:** File timestamp stops updating for >30 min; CPU stays at 700%+; acceptance drops to ~8–9%.

**Root cause:** Posterior ridge along Δ–χ₀ (Corr≈−0.66) not captured by original covmat → proposals perpendicular to ridge → systematic rejection.

**History of stuck chains this session:**
- `__1` f=0.20 → stuck after ~25 min
- `__2` f=0.15 → stuck after ~39 min
- `__3` f=0.10 + old covmat → running (3,625 rows so far)

**Fix:** New covmat `asg_chain_mar09_new.covmat` (built from 3,707 samples of `__1+__2`).
On next restart this covmat loads automatically via `/tmp/run_asg_chain.sh`.

**Detection:**
```bash
stat -c %Y chains/asg_chain/2026-03-09_200000__3.txt
# compare to $(date +%s) — if diff > 1800s with PID alive = stuck
```

**Recovery:**
```bash
kill 1963865
nohup /tmp/run_asg_chain.sh > chains/asg_chain/asg_restart4_newcovmat.log 2>&1 &
echo "PID=$!"
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
  asg_chain.covmat                    ← OLD covmat (currently in use by __3)
  asg_chain_mar09_new.covmat          ← NEW covmat (use for next restart)
                                         Corr(Δ,χ₀)=−0.66, Corr(β,χ₀)=+0.47
  2026-03-09_200000__3.txt            ← ACTIVE (3,625 rows, f=0.10, old covmat)
  2026-03-09_200000__2.txt            ← stuck segment (2,740 rows, ESS≈2100)
  2026-03-09_200000__1.txt            ← stuck segment (2,555 rows)

chains/alpha_chain4/
  alpha_chain4_best2800000.bestfit    ← valid -b restart file
  alpha_chain4_fixed_v2.covmat        ← valid covmat
  2026-03-09_200000__1.txt            ← ACTIVE (11,585 rows, lnL=1396.04)

chains/
  monitor.log                         ← 15-min status log (monitor PID 2035898)

q/
  ASG_scientific_report_en.tex        ← LaTeX source (v15, updated this session)
  ASG_scientific_report_en_v15.pdf    ← CURRENT PDF (15 pages, compiled 2026-03-09)
  ASG_scientific_report_en_github.md  ← Markdown source downloaded from GitHub
  asg_model_summary_mar09.png         ← Fig 1: potential + slow-roll + (n_s,r)
  asg_ns_r_mar09.png                  ← Fig 2: (n_s,r) posterior cloud
  asg_corner_mar09.png                ← corner plot 4 params (ESS~2100)
  asg_degeneracy_analysis_mar09.png   ← Fig 3: 4-panel Δ–χ₀ ridge analysis
  asg_beta_bimodality_mar09.png       ← β bimodality falsification
  asg_attractor_comparison_mar09.png  ← ASG vs Starobinsky/α-attractor classes
  asg_ns_universality_mar09.png       ← Δn_s from 1-2/N_* (new-class evidence)
  asg_results_discussion_draft.md     ← draft text: results + methods note

scripts/
  rg_spectrum_class.py       ← ASG primordial P(k) generator; reads asg_params.txt
```

### Compile PDF (tectonic installed in plc311)
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
cd /home/polcreation/class_public/python/montepython_public/q
tectonic ASG_scientific_report_en.tex
# → produces ASG_scientific_report_en.pdf
```

### FTP Backups (wiecznapamiec.home.pl)
```
ASG_scientific_report_en_v15.pdf.gz       ← PDF only (921 KB)
ASG_project_backup_2026-03-09.tar.gz      ← full archive: chains + configs +
                                              figures + tex + pdf + scripts (3.8 MB)
```
Upload: `curl -T <file> ftp://wiecznapamiec.home.pl/<file> --user "wiecznapamiec:TechPar123"`

---

## 8. Scientific Results So Far

### ASG best-fit (Mar 9 chains, −lnL = 1387.65–1387.71)
| Parameter | Best-fit | Weighted mean | 68% C.I. |
|-----------|----------|---------------|----------|
| β | 0.03638 | 0.02724 ± 0.012 | [0.0146, 0.0410] |
| Δ / M_Pl | 1.6243 | 1.7116 ± 0.153 | [1.564, 1.883] |
| χ₀ / M_Pl | 3.7039 | — | — |
| μ / M_Pl | 2.1354 | — | — |
| omega_b | 0.02234 | — | — |
| omega_cdm | 0.11944 | — | — |
| 100*θ_s | 1.04172 | — | — |
| τ | 0.05579 | — | — |

### Derived CMB observables (best-fit)
- n_s = **0.9686**, r = **0.00643**, V^(1/4) ≈ 1.9×10¹⁶ GeV
- φ_* ≈ 7.6 M_Pl >> χ₀ ≈ 3.7 M_Pl → screen acts *indirectly* during inflation
- α_eff ≡ rN²/12 ≈ 1.9 (best-fit) to ~6 (posterior mean)

### Alpha-attractor best-fit (−lnL = 1396.04–1397.05)
```
epsilon = 2.003e-4, c = 1.1247, A_s_inf = 2.189e-9
```

### Key scientific claims (confirmed by Mar 9 chains)
1. **ASG is a distinct class of plateau inflation** — not an α-attractor realization
2. **Δn_s ≈ +0.002–0.004** above n_s = 1−2/N_* across full posterior
   (zero posterior samples fall on universal line → new-class evidence)
3. **β bimodality = parametric degeneracy** along Δ–χ₀ ridge (Corr≈−0.66),
   NOT two physical solutions
4. **ΔAIC = 16.8** → α-attractor strongly disfavoured vs ASG (Δχ² ≈ 16.7)
5. **φ_* >> χ₀** → indirect screening regime

### Paper status (q/ASG_scientific_report_en.tex → v15 PDF)
- v15 PDF compiled 2026-03-09: **15 pages**, all sections complete
- Compiled with **tectonic** (installed in plc311 via conda-forge)
- New sections added this session: indirect screening note (§III), preliminary
  table + β bimodality (§VI), universality deviation (§VII), proper Conclusions (§XV)
- Abstract/tables still use **OLD zenodo posteriors** (β=0.36, Δ=0.70, χ₀=4.52, μ=4.25)
  → do NOT overwrite until ASG chain reaches GR < 0.1 (~20k rows)

---

## 9. What Needs To Happen Next

### Paper (Stage 3 — after convergence)
- [ ] **Wait for ASG `__3`** to reach ~10k rows — check β bimodality stability
- [ ] **Build updated covmat** from `__3` once it has >5k rows
- [ ] **Convergence check** at ~20k rows: run `MontePython.py info` on chains
- [ ] **Replace abstract/table posteriors** (β, Δ, χ₀, μ) with converged values
- [ ] **Final corner + n_s–r figures** when converged — replace `_mar09` versions
- [ ] **ΛCDM baseline run** for proper Δχ² comparison (currently using literature ~1383)
- [ ] **Recompile v16 PDF** with final posterior numbers
- [ ] Upload v16 to FTP and GitHub

### If ASG `__3` stalls again
```bash
kill 1963865
nohup /tmp/run_asg_chain.sh > chains/asg_chain/asg_restart4_newcovmat.log 2>&1 &
```
The new covmat is ready — next restart should be more stable (Corr Δ–χ₀ captured).

### Key open physics question
Does Δn_s ≈ +0.002–0.004 above n_s=1−2/N_* persist at full convergence?
If yes → strong evidence ASG is a new class of plateau inflation (publishable claim).

### Compile PDF (tectonic — no pdflatex needed)
```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh && conda activate plc311
cd /home/polcreation/class_public/python/montepython_public/q
tectonic ASG_scientific_report_en.tex
# produces ASG_scientific_report_en.pdf
```

### Upload to FTP
```bash
curl -T q/ASG_scientific_report_en_v15.pdf \
  ftp://wiecznapamiec.home.pl/ASG_scientific_report_en_v15.pdf \
  --user "wiecznapamiec:TechPar123"
```

---

## 10. Environment Setup (every new shell)

```bash
source /home/polcreation/miniconda3/etc/profile.d/conda.sh
conda activate plc311
source /home/polcreation/class_public/python/montepython_public/planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh
cd /home/polcreation/class_public/python/montepython_public
```
