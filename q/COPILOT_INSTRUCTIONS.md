# Copilot Instructions — ASG (Active Screen Gravity) Inflation Project

## Project Overview

This is a cosmology/theoretical physics research project investigating **threshold-induced gravitational screening as the origin of inflationary attractors**. The ASG model proposes that the inflationary plateau arises from a running Planck mass `F(χ)` rather than from a tuned scalar potential. The project comprises a TeX manuscript, Python analysis scripts, MCMC chain data, and export artifacts for arXiv/PRD submission.

## The ASG Model

Jordan-frame action with a Gaussian gravitational screen:

```
S = ∫d⁴x √(-g) [ F(χ)R − ½(∂χ)² − V(χ) ]
V(χ) = Λ⁴(1 − exp(−χ/μ))²        — Starobinsky-like plateau potential
F(χ) = M²_Pl [1 + β·exp(−(χ−χ₀)²/Δ²)]  — threshold-induced running Planck mass
```

Free model parameters: **β** (amplitude), **Δ** (width), **χ₀** (threshold position), **μ** (potential scale). These are sampled alongside 4 standard cosmological + 21 Planck nuisance parameters (29 total).

Benchmark point: `β=0.3, Δ=0.5, χ₀=5.0, μ=5.0` (all in Planck units).

## Build & Run Commands

### TeX manuscript (primary artifact)

```powershell
cd q
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
bibtex asg_inflation_v2
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
```

### Python analysis scripts

No venv required. Dependencies: `numpy`, `pandas`, `matplotlib`.

```powershell
# Process MCMC chain → CSV/JSON summaries
python scripts/process_chain.py --chain <chain_dir> --out <dest_dir>

# Background diagnostics (phase portrait, slow-roll, cutoff ratio)
python scripts/asg_background_diagnostics.py

# n_s–r plane with Planck contours
python scripts/ns_r_plane.py

# ASG vs α-attractor comparison
python scripts/compare_asg_alpha.py --asg-chain asg_chain/processed/asg_chain_post.csv --alpha-chain alpha_chain_prod/processed/alpha_chain_post.csv

# Generate all publication figures
python scripts/generate_figures.py
```

### Markdown → DOCX/PDF exports (legacy)

```powershell
pandoc ASG_scientific_report_en.md --resource-path=.;.. -o ASG_scientific_report_en_vXX.docx
```

## Directory Structure

| Path | Purpose |
|------|---------|
| `asg_inflation_v2.tex` | **Canonical TeX source** — the primary manuscript |
| `scripts/` | Python analysis: chain processing, diagnostics, figure generation |
| `figures/` | Publication-ready plots (PDF/PNG) |
| `asg_chain/` | ASG MCMC chain data + processed CSV/JSON |
| `alpha_chain_prod/` | α-attractor comparison chain data |
| `l7/chains/` | Most recent MontePython chains (Mar 09–11); canonical posterior |
| `l1/` | Older chains + Linux-side ops log (`starter.md`) |
| `asg_model.param` | MontePython parameter file for the ASG model |
| `ASG_scientific_report_en.md` | Markdown mirror of the manuscript |
| `ASG_scientific_report_en_vXX.*` | Versioned DOCX/PDF exports (increment suffix) |
| `arxiv_bundle/` | arXiv submission template (`main.tex`) |
| `zenodo_upload_package/` | Reproducibility archive for Zenodo |
| `vX/` | MCMC reproducibility repository (configs, example chains, GetDist output) |
| `brainrot/` | Popular-science / outreach versions |

## Key Conventions

- **Units**: All model parameters are in reduced Planck units (`M_Pl = 1`). Chain files store dimensionless values.
- **Chain format**: MontePython ASCII — column 1 = weight (multiplicity), column 2 = −ln(likelihood), remaining columns = parameter values. Parameter names are in the companion `.paramnames` file.
- **Burn-in**: Discard first 20% of chain samples. Convergence criterion: Gelman–Rubin R−1 < 0.01.
- **Figures**: Output to `figures/` as both PDF (for TeX `\includegraphics`) and PNG. Verify every `\includegraphics{figures/...}` reference exists before compiling.
- **Versioned exports**: Increment the `_vXX` suffix when regenerating DOCX/PDF snapshots; never overwrite existing versions.
- **Large chain files**: Can exceed 100 MB — do not commit to git. Archive to `zenodo_upload_package/` or shared storage.
- **Cross-platform**: Chains run on a Linux cluster (conda env `plc311`, MontePython + CLASS). This Windows-side directory hosts manuscripts, processed results, and figures. Keep Markdown files in LF line endings.
- **Text edits**: The TeX file (`asg_inflation_v2.tex`) is the source of truth. Mirror significant conceptual edits back into `ASG_scientific_report_en.md` when needed.

## MCMC Pipeline (Linux cluster side)

The chain workflow is documented in `l1/starter.md`. Key points:

1. **Environment**: conda `plc311` + source `clik_profile.sh` for Planck likelihoods
2. **Run command**: `montepython -p <param_file> -o <chain_dir> -N <steps> --update <interval>`
3. **Sync**: `scp`/`rsync` chain outputs into `l7/chains/`, preserving timestamps
4. **Process**: `python scripts/process_chain.py` → CSV/JSON summaries
5. **Plot**: `python scripts/ns_r_plane.py` and `python scripts/asg_background_diagnostics.py` → `figures/`

## CLASS Integration

The ASG potential is implemented as a patch to CLASS's `source/primordial.c`. See `README_CLASS.md` for build instructions. Expected output for the benchmark point:

```
n_s ≈ 0.959,  r ≈ 4×10⁻³,  α_s ≈ −(1.5–2.0)×10⁻³
```
