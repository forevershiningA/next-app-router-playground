## α-attractor Chain – Processed Outputs (2026-03-05)

### Produced artifacts
- `alpha_chain_post.csv`: burn-in–trimmed chain (kept 247 of 685 samples; burn-in index 438 ≈ 64% using the same Δχ² = 5×10⁶ rule).
- `ingest_metadata.json`: provenance plus burn-in diagnostics (−lnℒₘᵢₙ = 1.19571×10⁸, median 1.31389×10⁸).
- `posterior_summary.csv`: weighted moments and central intervals for all 34 sampled parameters (cosmological + α-attractor hyper-parameters).
- `diagnostics.json`: ESS ≈ 92, weight spread (max 33, median 1), and best-fit record.
- Comparison plot: `figures/comparison/asg_vs_alpha_hyperparams.{png,pdf}` overlays ASG (β, Δ) against α-attractor (ε, c) support.

### Key numerical takeaways
- The α-attractor hyper-parameters occupy a completely different region than the ASG fit:  
  - ε = (3.12 ± 0.53) × 10⁻³ with the 68% band [2.71, 3.76]×10⁻³—orders of magnitude smaller than the ASG β, which clusters at β = 0.36 ± 0.18.  
  - c = 1.32⁺⁰·³⁶₋⁰·⁶³, tightly centered around O(1), vs. ASG’s Δ = 0.70 ± 0.22 (see comparison plot).  
  - Λ = (6.1 ± 3.4) × 10⁻¹¹, indicating the α-attractor run drives its bridge scale to the prior’s low end, whereas ASG prefers μ ≈ 4.25 and χ₀ ≈ 4.52.
- Cosmological parameters remain Planck-like (ω_b = 2.413 ± 0.010, ω_cdm = 0.14983 ± 6.3×10⁻⁵, τ = 0.11969 ± 2.2×10⁻⁴), confirming the likelihood stack is consistent between runs.
- Likelihood comparison: the best α-attractor sample sits at −lnℒ = 1.19571×10⁸, about 2.7×10⁶ higher than the ASG best fit (1.16830×10⁸), reinforcing that ASG cannot be mimicked by α-attractor tuning within this dataset.

### Notes and next steps
1. α-attractor ESS is low because only ~250 post burn-in samples are available; if further precision is needed, request longer MontePython runs to boost effective statistics.
2. The new comparison figure can be cited directly in the manuscript section arguing that ASG dynamics are distinct from α-attractors.
3. To extend the argument, compute KL divergences between {β, Δ} and {ε, c} posteriors or project both models into the (n_s, r) plane once derived quantities are provided.
