# Active Screen Gravity — Starter

This repository is the Windows-side control room for the ASG (Active Screen Gravity) inflation campaign. It mirrors the live MontePython/CLASS runs executing on the Linux cluster and hosts the publication source (`ASG_scientific_report_en.md`) plus all derived figures, tables, and export artifacts. Use this guide as the single entry point when spinning up new science tasks or handing work across platforms.

## 1. Mission Snapshot

- **Goal:** Demonstrate that RG-threshold running of the Planck mass generates the attractor plateau, confront it with Planck 2018 TT,TE,EE+lowE+lensing+BAO, and prepare polished PRD/JCAP-ready deliverables.
- **Active chains:** `l1/chains/asg_chain/*` (ASG) and `l1/chains/alpha_chain4/*` (α-attractor control). Each aims for ≥200k post-burn-in steps with shared likelihood stacks.
- **Primary artifacts:** Markdown source (root + `l1/` mirrors), regenerated DOCX/PDF in `l1/`, JSON/figure outputs in `figures/` and `l1/`.

## 2. Directory Map

| Path | Purpose |
| --- | --- |
| `l1/chains/` | Raw MontePython chain chunks, `.paramnames`, covariance, and restart files synced from the cluster. |
| `l1/scripts/` | Python utilities for chain processing (`process_chain.py`, `compare_asg_alpha.py`, etc.). |
| `figures/` & `figures/comparison/` | Pre-rendered plots (corner plots, ns–r overlays, α-attractor comparisons). |
| `ASG_scientific_report_en.md` & `l1/ASG_scientific_report_en.md` | Main manuscript (keep both copies in sync). |
| `l1/ASG_scientific_report_en_v14.docx/pdf` | Latest exports—regenerate after content updates. |
| `l1/starter.md` | Historical Linux-side ops log; use for deeper MontePython details. |

## 3. Environment Checklist

### Windows workstation (this repo)

- **Shell:** PowerShell 7+ recommended.
- **Tooling:** `pandoc` in PATH, `tectonic.exe` installed at `%LOCALAPPDATA%\tectonic\tectonic.exe` for PDF exports.
- **Python:** Use the repo’s scripts via `python` (system or venv). No conda env required locally.
- **Figures:** Ensure referenced images (e.g., `figures/comparison/asg_vs_alpha_hyperparams.png`) exist to avoid pandoc warnings.

### Linux cluster (MontePython/CLASS runs)

- **Conda env:** `plc311` (see `l1/starter.md` §1) and source `planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh`.
- **Run commands:** Located in `l1/starter.md` (section “How to Restart a Dead Chain”). Always restart with matching `.bestfit` and `.covmat`.
- **Monitoring:** Use `ps aux | grep montepython` plus `awk` snippets in the same starter file to track best-fit log-likelihoods and sample counts.

## 4. Chain Workflow Cheatsheet

1. **Sync latest chains** from the cluster into `l1/chains/` (scp/rsync). Keep filenames with timestamp suffixes.
2. **Process statistics** locally with `python scripts/process_chain.py --chain <path> --out l1/chain_results_regenerated.json` (example path shown in prior sessions).
3. **Document updates:** Edit `ASG_scientific_report_en.md`, replicate changes into `l1/` copy, and record new figures/tables as needed.
4. **Version notes:** Capture quick summaries or TBD items in `plan.md` (session state) and, when appropriate, append to `starter.md`.

## 5. Exporting the Manuscript

From `q/l1/` run:

```powershell
# DOCX (uses resource path to find figures)
pandoc ASG_scientific_report_en.md --resource-path=.;.. -o ASG_scientific_report_en_v14.docx

# PDF (Tectonic engine – ensure path matches install)
pandoc ASG_scientific_report_en.md --resource-path=.;.. `
  --pdf-engine "$env:LOCALAPPDATA\\tectonic\\tectonic.exe" `
  -o ASG_scientific_report_en_v14.pdf
```

Warnings about legacy TeX commands (e.g., `\rm`) are expected until the math is rewritten with `\mathrm{}`. Document any missing figures and fix paths under `figures/`.

## 6. Cross-Platform Tips

- **Line endings:** Keep Markdown in LF to avoid MontePython diffs when syncing back to Linux.
- **Large files:** Chain chunks can exceed 100 MB; avoid committing them. Instead, archive to `zenodo_upload_package/` or shared storage.
- **Backups:** `alpha_chain_prod/`, `asg_chain/`, and `zenodo_upload_package/` hold historic tarballs—leave untouched unless preparing new releases.
- **Session logs:** Update `plan.md` (session state) after major actions so future shifts know current objectives.

## 7. Next Steps Checklist

- Maintain parity between root and `l1/` markdown copies.
- Refresh chain summaries (`l1/chain_results_regenerated.json`) whenever new data arrives.
- Track figure TODOs (two-panel ns–r/ns–αs plot, radar chart, benchmark tables) and note completion status in `plan.md`.
- Export DOCX/PDF after each major textual change and store them under versioned filenames (`_v15`, `_v16`, …).

_Last updated: 2026‑03‑08. Keep this starter concise—expand only with actionable items relevant to onboarding or recurring operations._
