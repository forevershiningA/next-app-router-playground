## ASG Chain – Processed Outputs (2026-03-04)

### Produced artifacts
- `asg_chain_post.csv`: burn-in–trimmed MontePython chain (rows kept: 21 406 of 21 909, burn-in index 503 ≈ 2.3%).
- `ingest_metadata.json`: provenance (column order, burn-in rule, likelihood min/median).
- `posterior_summary.csv`: weighted means, σ, and 68/95% central intervals for all 35 sampled parameters.
- `diagnostics.json`: effective sample size (ESS), weight stats, and best-fit sample record (−lnℒ = 1.1683×10⁸ at row 20 848).
- Figures:  
  - `figures/asg_chain/fig_cosmo_1d.{png,pdf}` (ω_b, ω_cdm, 100θ_s, τ_reio KDEs with 68/95% bands)  
  - `figures/asg_chain/fig_asg_1d.{png,pdf}` (β, Δ, χ₀, μ KDEs)  
  - `figures/asg_chain/corner_asg.{png,pdf}` (pairwise ASG correlations using weighted subsampling).

### Key numerical takeaways
- ESS ≈ 6.6k for the trimmed chain (total weight 1.97×10⁵, max weight 70, median 1).
- ASG hyper-parameter posteriors (mean ± σ):
  - β = 0.362 ± 0.177 (long upper tail up to ≈0.76 at 97.5%).
  - Δ = 0.704 ± 0.220 (68% band: 0.43–0.94).
  - χ₀ = 4.52 ± 1.14, μ = 4.25 ± 0.93 (both extend to ≈6 at 97.5%).
- Cosmological block sits near Planck baselines: e.g., ω_b = 2.489±0.004, ω_cdm = 0.14966±0.00014, τ_reio tightly peaked at 0.1199.

### Next steps / requirements
1. **α-attractor comparison chain:** To quantify overlap/KL estimates, run MontePython with the same likelihood stack for the α-attractor ensemble. Once `chains/alpha_chain/*` is available, reuse the current pipeline (`ingest -> stats -> plots`) for apples-to-apples contours.
2. **Joint visualizations:** After both chains exist, produce combined corner plots and Δχ² tables (e.g., overlay ASG vs α posteriors for (n_s, r, β) derived parameters).
3. **Additional diagnostics:** If convergence questions arise, consider splitting the ASG chain by chunk (weights) to compute Gelman–Rubin or time-series ESS; metadata already supplies per-sample weights for such checks.
4. **Manuscript integration:** `posterior_summary.csv` can feed tables; cite the figure files above for PRD-ready visuals. Update them if new chains or priors are introduced.

For any rerun, regenerate the artifacts via the scripts in `.copilot/session-state/.../` (see `posterior_stats.py` & `make_asg_plots.py`) or port them into repository-local tooling.
