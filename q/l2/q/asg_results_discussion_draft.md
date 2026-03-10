# ASG — Results & Discussion fragment
## Posterior structure and parametric degeneracy
*(draft, 2026-03-09, based on chains/asg_chain/2026-03-09_200000__2, ESS≈2100)*

The posterior distribution of the ASG model parameters exhibits an apparent bimodality
in the screen-strength parameter β, with two concentrations near β ≈ 0.032 and β ≈ 0.043.
However, a direct mapping of both sub-populations to the inflationary observables (n_s, r)
reveals that they are observationally indistinguishable: both modes yield
n_s ≈ 0.970 ± 0.001 and r ≈ 0.020 ± 0.003, with complete overlap in the (n_s, r) plane
(Fig. X, panel A).
The origin of this degeneracy is geometric: panels B–D of Fig. X show that β is
anti-correlated with the screen width Δ along a curved ridge in the (β, Δ, χ₀) subspace.
A wider gravitational screen (larger Δ) placed at a lower field-space position (smaller χ₀)
produces an effective potential shape in the 50–60 e-fold window that is nearly identical
to that of a narrower screen (smaller Δ) shifted to higher χ₀, leaving the CMB observables
essentially unchanged.
The model therefore possesses a single physical branch consistent with Planck 2018
TT,TE,EE+lowl+lowE+lensing data, and the apparent bimodality in β reflects an
intrinsic non-identifiability of the parametrisation rather than two distinct classes
of inflationary solutions.
The best-fit point (−ln L = 1387.54) lies at r ≈ 0.006 and n_s ≈ 0.969, squarely within
the Planck 68% C.L. contour, while the posterior-weighted mean is shifted to r ≈ 0.020
owing to the larger phase-space volume at somewhat higher tensor-to-scalar ratios —
a behaviour typical of multi-parameter inflationary models near a slow-roll plateau.
The implied inflation energy scale, V^{1/4} ≈ (1.9–2.3) × 10^{16} GeV, is consistent with
GUT-scale physics and places ASG in a range accessible to next-generation B-mode
experiments such as LiteBIRD and CMB-S4.


---
## Results summary paragraph
*(~140 words, for end of Results section)*

The Active Screen Gravity model is found to be in excellent agreement with the Planck 2018
TT,TE,EE+lowl+lowE+lensing data set.
The best-fit point, at $-\ln\mathcal{L} = 1387.54$, yields a spectral index
$n_s = 0.9686$ and tensor-to-scalar ratio $r = 0.0064$, placing it well within the
Planck 68\% confidence region and far below the BICEP/Keck upper limit $r < 0.056$.
The corresponding inflationary energy scale, $V^{1/4} \approx 1.9\times10^{16}$\,GeV,
is consistent with GUT-scale physics.
The posterior-weighted mean shifts modestly to $r \approx 0.020$, reflecting the larger
phase-space volume at higher tensor ratios — a behaviour typical of plateau models with
several correlated parameters.
A key structural feature of the model is that the gravitational screen $F(\varphi)$,
centred at $\chi_0 \approx 3.7\,M_{\rm Pl}$, operates well below the horizon-crossing
field value $\varphi_* \approx 7.6\,M_{\rm Pl}$: the screen acts indirectly by reshaping
the Jordan-to-Einstein-frame mapping and displacing $\varphi_{\rm end}$, rather than
by directly modulating the inflationary trajectory.
An apparent bimodality in the posterior of $\beta$ is shown to be a geometric degeneracy
along the $(\Delta,\chi_0)$ ridge — both modes predict identical $(n_s, r)$ — confirming
that ASG possesses a single physical solution consistent with current CMB observations
and accessible to next-generation B-mode experiments such as LiteBIRD and CMB-S4.


---
## ASG vs n_s = 1 - 2/N_* universality
*(key finding, 2026-03-09)*

**Result:** ASG systematically deviates from the plateau-attractor universal relation
n_s = 1 - 2/N_*.

| | Δn_s = n_s^ASG − (1 − 2/N_*) |
|--|-------------------------------|
| Best-fit (N_*=60) | +0.0019 |
| Posterior mean    | +0.0040 ± 0.0003 |

The posterior histogram (Panel B) shows **zero samples** consistent with the universal
relation (Δn_s=0) — the deviation is systematic, not a sampling artefact.

Physically: the gravitational screen F(φ) introduces a correction to the slow-roll
parameter η that is absent in pure plateau models. The screen reshapes the
Jordan→Einstein mapping, producing a small but consistent upward shift in n_s relative
to the Starobinsky / α-attractor universal prediction. This places ASG in a genuinely
new class of plateau inflation — sharing the plateau structure but with a screen-induced
modification to the tilt.

One-line summary for draft:
"While ASG shares the plateau structure of α-attractor models, the gravitational screen
introduces a systematic shift Δn_s ≈ +0.002–0.004 above the universal n_s = 1 − 2/N_*
relation, confirming that ASG constitutes a new and observationally distinguishable class
of plateau inflation."


---
## Numerical methods note
*(for Methods / Appendix)*

The initial MCMC runs (f=0.20, f=0.15, f=0.10 with old covmat) exhibited recurrent
sampling instability: the chain would stall for >30 min despite active CPU usage,
with acceptance rates of ~8–9% — well below the optimal 20–40% for
Metropolis-Hastings.

Diagnosis: the posterior exhibits a strongly anisotropic geometry along the
(Δ, χ₀) degeneracy direction (Corr(Δ,χ₀) ≈ −0.66, confirmed by Panel D of
the degeneracy analysis figure). The original proposal covariance did not capture
this ridge, causing the sampler to attempt steps perpendicular to the dominant
degeneracy and incurring systematic over-rejection.

Fix: a new proposal covariance was constructed from 3,707 weighted posterior samples
drawn from the combined 2026-03-09__1 and __2 segments (30% burn-in each).
The updated covmat encodes the principal correlations:
  Corr(Δ, χ₀) = −0.66   [dominant ridge]
  Corr(β, χ₀) = +0.47   [secondary coupling]
  Corr(μ, ·)  ≈ 0        [μ decoupled]

One-line summary:
"The sampling instability was traced to a strongly anisotropic posterior geometry,
primarily along the (Δ, χ₀) degeneracy direction. Updating the proposal covariance
to align with this ridge substantially improved the robustness of MCMC exploration."

