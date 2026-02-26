# Active Screen Gravity MCMC Reproducibility Dataset

**DOI:** 10.5281/zenodo.XXXXXXX (to be assigned upon upload)

## Dataset Description

This repository contains the full MCMC analysis for the Active Screen Gravity (ASG) cosmological model, enabling complete reproducibility of results presented in our manuscript.

### Analysis Software
- **MontePython v3.5** (MCMC sampler)
- **CLASS v3.2** (Boltzmann solver)

### Observational Constraints
- Planck 2018 TT,TE,EE+lowE+lensing
- BAO (BOSS DR12, 6dFGS, MGS)

### Key Results Reproduced
- Scalar spectral index: n_s = 0.9647 ± 0.0041
- Tensor-to-scalar ratio: r = (6.2 ± 2.0) × 10⁻³

## ASG Model Parameters & Priors

| Parameter | Prior Type | Range | Physical Meaning |
|-----------|------------|-------|------------------|
| β | log-uniform | [0.001, 0.5] | Coupling strength |
| Δ | uniform | [0.2, 2.0] M_Pl | Screen thickness |
| χ₀ | uniform | [4.0, 7.0] M_Pl | Initial field value |

### Standard ΛCDM Parameters
- Ω_b h² (baryon density): [0.005, 0.1]
- Ω_c h² (CDM density): [0.001, 0.99]
- 100θ_s (angular size): [0.5, 10]
- τ_reio (optical depth): [0.01, 0.8]
- ln(10¹⁰ A_s) (amplitude): [1.61, 3.91]
- n_s (spectral index): [0.8, 1.2]

## MCMC Chain Statistics

| Metric | Value | Target |
|--------|-------|--------|
| R−1 (Gelman-Rubin) | <0.01 | <0.01 |
| N_eff (Effective samples) | >1700 | >1000 |
| Burn-in fraction | 20% | — |
| Acceptance rate | ~24% | 20-30% |
| Total samples | 50,000 | — |
| Chains | 4 | — |

## Files Included

1. `base_ASG.param` - MontePython parameter file with priors
2. `chains/` - Raw MCMC chains (4 independent runs)
3. `margstats.dat` - Marginalized statistics from GetDist
4. `covmat/` - Covariance matrices for proposal updates
5. `plots/` - Triangle plots and 1D/2D posteriors
6. `log.param` - Full analysis configuration

## Running the Analysis

```bash
# Install dependencies
pip install montepython class-code getdist

# Run MCMC (example for single chain)
python montepython/MontePython.py run \
  -o chains/ASG_chain_1 \
  -p input/base_ASG.param \
  -N 50000

# Analyze chains with GetDist
python -c "from getdist import loadMCSamples; \
           samples = loadMCSamples('chains/ASG_chain'); \
           samples.getTable().write('margstats.dat')"
```

## Citation

If you use this dataset, please cite:

```bibtex
@dataset{asg_mcmc_2026,
  author       = {{ASG Research Collective}},
  title        = {{Active Screen Gravity MCMC Reproducibility Dataset}},
  year         = 2026,
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.XXXXXXX},
  url          = {https://doi.org/10.5281/zenodo.XXXXXXX}
}
```

## Contact

For questions regarding this dataset, please open an issue or contact: [your-email]

## License

CC BY 4.0 - Attribution required for reuse
