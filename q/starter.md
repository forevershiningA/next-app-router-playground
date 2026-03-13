# Active Screen Gravity — Starter

This repository is the Windows-side control room for the ASG (Active Screen Gravity) inflation campaign. It mirrors the live MontePython/CLASS runs executing on the Linux cluster and hosts the TeX/Markdown manuscripts plus all derived figures, tables, and export artifacts. Use this guide as the single entry point when spinning up new science tasks or handing work across platforms.

## 1. Mission Snapshot

- **Goal:** Demonstrate that RG-threshold running of the Planck mass generates the attractor plateau, confront it with Planck 2018 TT,TE,EE+lowE+lensing+BAO, and deliver a PRD/JCAP-ready manuscript (now maintained as `asg_inflation_v2.tex`).
- **Latest chains:** `l7/chains/asg_chain_mar09_11/*` (ASG posterior used in the paper) and `l7/chains/alpha_chain_mar09_10/*` (α-attractor control). Legacy `l1/` chunks remain for archival comparison.
- **Primary artifacts:** `asg_inflation_v2.tex` + figures in `figures/`, Markdown mirrors (`ASG_scientific_report_en.md` and `l1/` copy), processed diagnostics (`asg_background_summary.json`, `ns_r_summary.json`), and exported DOCX/PDF snapshots (`ASG_scientific_report_en_vXX.*`).

## 2. Directory Map

| Path | Purpose |
| --- | --- |
| `l7/chains/` | Most recent MontePython chains (Mar 09–11); copy from the cluster before processing. |
| `l1/chains/` | Older ASG/α benchmark chains (keep for reference, do not overwrite). |
| `chains/processed_*` & `asg_chain/` | CSV/JSON summaries emitted by `scripts/process_chain.py`. |
| `scripts/` | Python utilities (`process_chain.py`, `asg_background_diagnostics.py`, `ns_r_plane.py`, etc.). |
| `figures/` | Final plots (phase portrait, \(n_s\)–\(r\), cutoff ratio, α-attractor comparison). |
| `ASG_scientific_report_en.md` & `l1/ASG_scientific_report_en.md` | Markdown mirrors of the manuscript. |
| `asg_inflation_v2.tex` | Canonical TeX source (mirrored in `l1/` when needed); compile via `pdflatex`. |
| `ASG_scientific_report_en_vXX.docx/pdf` | Versioned exports; increment suffix when regenerating. |
| `l1/starter.md` | Linux-side ops log (includes MontePython restart recipes). |

## 3. Environment Checklist

### Windows workstation (this repo)

- **Shell:** PowerShell 7+ recommended.
- **Tooling:** `pandoc` (for DOCX), `tectonic.exe` (for pandoc-based PDFs), and MiKTeX/`pdflatex` for `asg_inflation_v2.tex`.
- **Python:** Run diagnostics via `python scripts/...`; no dedicated venv required.
- **Figures:** Confirm every `\includegraphics{figures/...}` file exists before compiling TeX/Markdown exports.

### Linux cluster (MontePython/CLASS runs)

- **Conda env:** `plc311` (see `l1/starter.md` §1) and source `planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh`.
- **Run commands:** Located in `l1/starter.md` (section “How to Restart a Dead Chain”). Always restart with matching `.bestfit` and `.covmat`.
- **Monitoring:** Use `ps aux | grep montepython` plus `awk` snippets in the same starter file to track best-fit log-likelihoods and sample counts.

## 4. Chain Workflow Cheatsheet

1. **Sync latest chains** (`scp`/`rsync`) into `l7/chains/`, preserving timestamps.
2. **Process statistics** with `python scripts/process_chain.py --chain <path> --out <dest_dir>`, which now coercively casts numeric columns and writes CSV/JSON summaries.
3. **Run diagnostics**: `python scripts/asg_background_diagnostics.py` (slow-roll, phase portrait, cutoff) and `python scripts/ns_r_plane.py` (Planck contours, α-band, Starobinsky marker).
4. **Document updates:** Primary text lives in `asg_inflation_v2.tex`; mirror high-level edits back into the Markdown files if they must stay aligned.
5. **Track work:** Use session `plan.md` + SQL todos for day-to-day status.

## 5. Exporting the Manuscript

### TeX pipeline (preferred for arXiv/PRD draft)

```powershell
cd q
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
bibtex asg_inflation_v2   # optional; no-op while using manual bibliography
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
pdflatex -interaction=nonstopmode asg_inflation_v2.tex
```

Resolve any missing figures or undefined references before archiving.

### Markdown → DOCX/PDF (legacy exports)

```powershell
cd q/l1
pandoc ASG_scientific_report_en.md --resource-path=.;.. -o ASG_scientific_report_en_vXX.docx
pandoc ASG_scientific_report_en.md --resource-path=.;.. `
  --pdf-engine "$env:LOCALAPPDATA\\tectonic\\tectonic.exe" `
  -o ASG_scientific_report_en_vXX.pdf
```

## 6. Cross-Platform Tips

- **Line endings:** Keep Markdown in LF to avoid MontePython diffs when syncing back to Linux.
- **Large files:** Chain chunks can exceed 100 MB; avoid committing them. Instead, archive to `zenodo_upload_package/` or shared storage.
- **Backups:** `alpha_chain_prod/`, `asg_chain/`, and `zenodo_upload_package/` hold historic tarballs—leave untouched unless preparing new releases.
- **Session logs:** Update `plan.md` (session state) after major actions so future shifts know current objectives.

## 7. Next Steps Checklist

- Keep `asg_inflation_v2.tex` and Markdown mirrors aligned when making conceptual edits.
- When new chains arrive, process them via the scripted pipeline and refresh `figures/` (phase portrait, \(n_s\)–\(r\), cutoff ratio).
- Before arXiv submission: rerun the full TeX build, verify figure availability, and update the Zenodo package with the latest chains/scripts.
- Maintain endorsement outreach notes separately; once endorsement is confirmed, package `asg_threshold_inflation.tex`, figures, and ancillary files for upload.

_Last updated: 2026‑03‑12. Keep this starter concise—expand only with actionable items relevant to onboarding or recurring operations._
