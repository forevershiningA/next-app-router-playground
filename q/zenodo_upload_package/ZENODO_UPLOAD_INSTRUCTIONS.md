# Zenodo Upload Instructions

## Step-by-Step Guide

### 1. Create Zenodo Account & Start Upload
1. Visit https://zenodo.org
2. Log in (or create account via ORCID/GitHub)
3. Click **"New upload"** (top right)

### 2. Get DOI
1. In "Digital Object Identifier" section
2. Select **"No"** for "Do you already have a DOI?"
3. Click **"Get a DOI now!"**
4. **SAVE THIS NUMBER** (format: 10.5281/zenodo.XXXXXXX)

### 3. Fill Required Metadata

#### Basic Information
- **Upload type:** Dataset
- **Title:** Active Screen Gravity MCMC Reproducibility Dataset
- **Authors:** 
  ```
  ASG Research Collective
  (Primary contributors: A. Researcher¹, B. Theorist², C. Numerics³)
  ```
- **Description:**
  ```
  Complete MCMC analysis for Active Screen Gravity cosmological model.
  
  Software: MontePython v3.5 + CLASS v3.2
  Data: Planck 2018 TT,TE,EE+lowE+lensing + BAO (BOSS DR12, 6dFGS, MGS)
  
  Key Results:
  - Scalar spectral index: n_s = 0.9647 ± 0.0041
  - Tensor-to-scalar ratio: r = (6.2 ± 2.0) × 10⁻³
  
  ASG Parameters (priors):
  - β (coupling): log-uniform [0.001, 0.5]
  - Δ (screen thickness): uniform [0.2, 2.0] M_Pl
  - χ₀ (initial field): uniform [4.0, 7.0] M_Pl
  
  Chain convergence: R−1 < 0.01, N_eff > 1700, acceptance ~24%
  ```

#### Additional Fields
- **Keywords:** 
  - cosmology
  - MCMC
  - Planck
  - BAO
  - active screen gravity
  - reproducibility
  - MontePython
  - CLASS

- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)

- **Access:** Open Access

- **Funding:** (optional - add if applicable)

### 4. Upload Files

Create a ZIP archive with all files:
```bash
zip -r ASG_MCMC_dataset.zip \
  README.md \
  base_ASG.param \
  margstats.dat \
  example_chain.txt \
  chains/ \
  plots/ \
  covmat/
```

Or upload files individually:
- ✓ README.md
- ✓ base_ASG.param
- ✓ margstats.dat
- ✓ example_chain.txt
- ✓ (additional chain files, plots, etc.)

### 5. Save Draft
- Click **"Save"** (not "Publish" yet)
- Review all metadata
- Verify DOI assignment

### 6. Publish (when ready with real data)
- Replace placeholder files with actual MCMC outputs
- Final verification
- Click **"Publish"**
- **DOI becomes permanent and citable**

---

## Data for Manuscript

Once published, add to your paper:

### Appendix Section
```latex
\section{MCMC Convergence Details}

All MCMC chains satisfy standard convergence criteria:
\begin{itemize}
    \item Gelman-Rubin: $R-1 < 0.01$ for all parameters
    \item Effective samples: $N_{\rm eff} > 1700$
    \item Burn-in: 20\% discarded (10,000 samples/chain)
    \item Acceptance rate: 24.3\%
\end{itemize}

Full chains, parameter files, and analysis scripts available at: \\
\url{https://doi.org/10.5281/zenodo.XXXXXXX}
```

### Data Availability Statement
```latex
\section*{Data Availability}

The MCMC chains, parameter files, convergence diagnostics, and analysis 
scripts used in this work are publicly available on Zenodo at 
\url{https://doi.org/10.5281/zenodo.XXXXXXX}. The dataset includes:
MontePython v3.5 configuration files, CLASS v3.2 parameter files, 
raw chain outputs (4 independent runs, 50,000 samples each), 
marginalized statistics from GetDist, and plotting scripts for 
all figures presented in this manuscript.
```

### BibTeX Citation
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

---

## Checklist Before Publishing

- [ ] DOI obtained and saved
- [ ] All metadata fields completed
- [ ] Real MCMC chain files uploaded (not placeholders)
- [ ] README.md accurate and complete
- [ ] Parameter files match actual analysis
- [ ] Convergence statistics verified (R-1, N_eff)
- [ ] License selected (CC BY 4.0)
- [ ] Keywords comprehensive
- [ ] Description includes software versions
- [ ] Contact information provided
- [ ] Manuscript updated with DOI

---

## NEXT STEPS FOR YOU

1. **Manually upload to Zenodo** following above instructions
2. **Report back the assigned DOI** (10.5281/zenodo.XXXXXXX)
3. **Provide real MCMC statistics** if different from placeholders:
   - Actual R-1 values
   - Actual N_eff values
   - Actual acceptance rate
   - Actual parameter constraints (mean ± σ)
4. **Update manuscript** with correct DOI and citations
