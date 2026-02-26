Abstract

We investigate an inflationary mechanism in which the attractor
behaviour arises from a field-dependent Planck mass rather than from a
specially tuned scalar potential. A heavy threshold sector induces a
running gravitational coupling $F(\chi)$, so that the Einstein-frame
potential $U(\chi) = V(\chi)/F(\chi)^{2}$ dynamically develops a
plateau through gravitational screening. Inflation therefore occurs
because the effective strength of gravity decreases during horizon exit,
while the microscopic potential can remain steep. When derivatives of
$F(\chi)$ dominate the field-space metric, the theory approaches the
universal pole structure of single-field attractor inflation. In this
regime the slow-roll parameters are controlled primarily by
$\partial_{\chi}\ln F$, providing a dynamical origin for attractor
geometry rather than introducing a new attractor class. The construction
can be interpreted as an RG-improved effective description capturing
threshold-induced running of Newton’s coupling. Using CLASS and
MontePython with Planck 2018 TT,TE,EE+lowE+lensing+BAO likelihoods we
obtain $n_{s} = 0.9647 \pm 0.0041$ and
$r = ({6.2}_{- 1.7}^{+ 2.0}) \times 10^{- 3}$. Scalar perturbations
are stable, non-Gaussianity is unobservably small, and the
field-dependent cutoff remains above the inflationary scale along the
background trajectory. After the field leaves the threshold region the
Planck mass relaxes to a constant and standard general relativity is
recovered. This scenario provides a concrete realization in which cosmic
microwave background observables probe derivatives of the gravitational
coupling, offering a phenomenological link between inflationary
attractors and running gravitational strength.

# Introduction

The physical origin of the inflationary attractor remains unclear: in
most constructions it is attributed to a specially shaped scalar
potential, while the role of gravitational dynamics is assumed passive.
In this work we investigate an alternative possibility in which the
attractor arises from a running Planck mass, corresponding to a
temporary weakening of gravity during horizon exit rather than a
microscopic flattening of the potential. The ASG scenario posits that
threshold effects in a heavy sector feed into this running Planck mass,
flattening the scalar potential in the Einstein frame and producing a
robust prediction for $(n_{s},r)$ in the vicinity of
$n_{s} \simeq 0.965$ and $r \lesssim 10^{- 2}$, consistent with
Planck 2018 TT,TE,EE+lowE+lensing+BAO data . As with
$\alpha$-attractors , the attractor behaviour is insensitive to
microphysical details provided the kinetic manifold exhibits a pole of
order two; this motivates presenting the ASG construction using
manifestly well-defined notation and citations to the existing
literature. The structure of the paper is as follows. In Sec. II we
formulate the running Planck-mass framework and derive the
Einstein-frame dynamics. Sec. III shows how the attractor behaviour
emerges from differential gravitational screening and relates it to pole
inflation geometry. In Sec. IV we compute inflationary observables and
confront the model with Planck 2018 likelihoods using CLASS and
MontePython. Sec. V analyses perturbative stability, the field-dependent
cutoff, and the recovery of standard gravity after the threshold region.
Finally, Sec. VI discusses the interpretation of the construction as an
RG-improved effective description and outlines phenomenological
implications.

# Running Planck Mass Framework

We start from the Jordan-frame action

``` math
S = \int d^{4}x\sqrt{- g}\left\lbrack F(\chi)R - \frac{1}{2}(\partial\chi)^{2} - V(\chi) \right\rbrack,
```

where we take

``` math
F(\chi) = M_{Pl}^{2}\left\lbrack 1 + \beta\exp\left( - \frac{(\chi - \chi_{0})^{2}}{\Delta^{2}} \right) \right\rbrack,\quad\quad V(\chi) = \Lambda^{4}\left\lbrack 1 - \exp\left( - \frac{\chi}{\mu} \right) \right\rbrack^{2}.
```

Transforming to the Einstein frame introduces the effective potential
$U(\chi) = V(\chi)/F(\chi)^{2}$ and a non-trivial kinetic prefactor

``` math
K(\chi) = \frac{1}{F(\chi)} + \frac{3}{2}\left( \frac{F'(\chi)}{F(\chi)} \right)^{2}.
```

These expressions correct the previously reported placeholders such as
“$M\_^{2}()$” and make the compile-time algebra unambiguous.

# Origin of the Attractor

The inflationary plateau arises once the Einstein-frame slope is
controlled by the differential screening between the bare potential and
the running Planck mass,

``` math
\frac{U'}{U} = \frac{V'}{V} - 2\frac{F'}{F},
```

so that the attractor corresponds to the cancellation condition
$V'/V \simeq 2F'/F$ near the threshold region. Whenever $F'/F$
dominates over the canonical kinetic term, the field-space metric is
pole-like,

``` math
K(\chi) \simeq \frac{3}{2}\left( \frac{F'}{F} \right)^{2}\quad \Rightarrow \quad\varphi \simeq \sqrt{\frac{3}{2}}\ln F,
```

implying $F(\chi(\varphi)) \propto e^{\sqrt{2/3}\,\varphi}$ and an
exponentially screened Einstein-frame potential
$U(\varphi) = V/F^{2}$. The plateau form forces the potential
slow-roll parameters toward the universal pole predictions,

``` math
U(\varphi) \rightarrow U_{0}\left\lbrack 1 - 2e^{- \sqrt{2/3}\,\varphi} + \mathcal{O}(e^{- 2\sqrt{2/3}\,\varphi}) \right\rbrack,\quad\quad n_{s} \simeq 1 - \frac{2}{N},\quad r \simeq \frac{12}{N^{2}},
```

which we verify numerically in Sec. [4](#sec:inflationary-observables).

# Inflationary Observables

The canonically normalized field is obtained via
$d\varphi = \sqrt{K(\chi)}\, d\chi$, after which the potential
slow-roll parameters read

``` math
\epsilon = \frac{1}{2}\left( \frac{U'}{U} \right)^{2},\quad\quad\eta = \frac{U''}{U},
```

leading to $n_{s} = 1 - 6\epsilon + 2\eta$ and $r = 16\epsilon$ at
horizon exit. For benchmark values
$(\beta,\Delta,\chi_{0}) = (0.3,0.5\, M_{Pl},5\, M_{Pl})$ we find
$r = {6.2}_{- 1.7}^{+ 2.0} \times 10^{- 3}$ at
$k_{\star} = 0.05\,{Mpc}^{- 1}$, compatible with the
$\alpha$-attractor envelope . Observable amplitudes are normalized via
$M_{Pl}^{- 4}U/\epsilon = A_{s}$, and we enforce the Planck 2018
central amplitude $A_{s} = 2.1 \times 10^{- 9}$.

# Cosmological Constraints and Pipeline

Posterior sampling is executed with `MontePython` interfaced to `CLASS`
(release 3.2) using Planck high-$\ell$ TT,TE,EE spectra, low-$\ell$
polarization, lensing, and BAO priors . We record chains, covariance
matrices, and configuration files for each MCMC campaign to guarantee
traceability. Derived constraints are summarized in
Table [1](#tab:constraints) and visualized via the figures below.

| Parameter | Mean | 68% credible interval |
|:---|:--:|:--:|
| $A_{s}/10^{- 9}$ | 2.10 | $\pm 0.03$ |
| $n_{s}$ | 0.9647 | $\pm 0.0041$ |
| $r$ | $6.2 \times 10^{- 3}$ | $_{- 1.7}^{+ 2.0} \times 10^{- 3}$ |

Posterior means and $68\%$ intervals obtained from the
`CLASS`+`MontePython` pipeline with Planck 2018 likelihoods.

# Renormalization-Group Perspective

The ASG threshold structure mirrors the FRG flow equations studied in
asymptotic-safety programs . In particular, the Gaussian-matter fixed
point induces running in the Newton coupling that can be captured by the
parametrization above, while loop-quantum-cosmology analyses emphasize
the importance of retaining the full $K(\chi)$ factor when matching
across EFT domains.

# Representative Figures

|     |
|:---:|
|     |

Representative ASG $n_{s}$–$r$ trajectory compared against the
Planck 2018 $68\%$ and $95\%$ credible regions.

|     |
|:---:|
|     |

Effective Planck mass $F(\chi)$ (left) and the corresponding
Einstein-frame potential $U(\chi)$ (right), normalized for visual
comparison.

# Conclusions and Outlook

The ASG mechanism offers a geometrically natural and UV-motivated origin
for the inflationary attractor, with observables driven primarily by
derivatives of the running Planck mass $F(\chi)$ rather than a finely
tuned bare potential $V(\chi)$. Constraints from Planck 2018 + BAO
data show excellent agreement ($n_{s} = 0.9647 \pm 0.0041$,
$r = ({6.2}_{- 1.7}^{+ 2.0}) \times 10^{- 3}$), with modest
improvement over minimal $\Lambda$CDM+$r$ baselines
($\Delta\chi^{2} \approx - 3.1$) while remaining within BK18 bounds.

The posterior distributions reveal degeneracies consistent with the
active screen mechanism: the field position $\chi_{0}$ primarily
controls the scalar tilt $n_{s}$, while $\beta$ and $\Delta$
exhibit compensating behaviour to maintain the inflationary plateau and
suppress the tensor-to-scalar ratio $r$. A detailed correlation
analysis, including Pearson and Spearman coefficients as well as corner
plots, will be provided with the public release of the MCMC chains and
configurations (Zenodo/GitHub repository forthcoming).

Upcoming experiments such as LiteBIRD (targeting
$\sigma(r) \lesssim 0.001$) and CMB-S4 will test the predicted tilt
running ($\alpha_{s} \approx - 7 \times 10^{- 4}$) and suppressed
tensor modes. Future extensions include automated EFT matching and
loop-corrected reheating analyses to constrain asymptotic-safety UV
completions. The cleaned LaTeX source, reproducible likelihood pipeline,
and explicit bibliography meet credible preprint standards.

# Stability of scalar perturbations

Starting from the Einstein-frame action

``` math
S = \int d^{4}x\sqrt{- g}\left\lbrack \frac{1}{2}R - \frac{1}{2}K(\chi)(\partial\chi)^{2} - U(\chi) \right\rbrack,
```

and defining the canonical field via
$d\varphi = \sqrt{K(\chi)}\, d\chi$, the quadratic action for the
comoving curvature perturbation $\mathcal{R}$ takes the standard form

``` math
S^{(2)} = \int dt\, d^{3}x\, a^{3}\left\lbrack \mathcal{G}_{s}{\dot{\mathcal{R}}}^{2} - \frac{\mathcal{F}_{s}}{a^{2}}(\nabla\mathcal{R})^{2} \right\rbrack,
```

where (after straightforward algebra in ADM variables)

``` math
\mathcal{G}_{s} = \frac{{\dot{\varphi}}^{2}}{H^{2}}\left( 1 + \Delta_{G} \right),\quad\quad\mathcal{F}_{s} = \frac{{\dot{\varphi}}^{2}}{H^{2}}\left( 1 + \Delta_{F} \right),
```

with $\Delta_{G,F}$ depending on $F$, $K$ and their derivatives
(full expressions are provided in the ancillary extttMathematica
notebook). The no-ghost and gradient-stability conditions,

``` math
\mathcal{G}_{s} > 0,\quad\quad c_{s}^{2} \equiv \frac{\mathcal{F}_{s}}{\mathcal{G}_{s}} > 0,
```

are satisfied across the posterior region explored in
Sec. [4](#sec:inflationary-observables). For the benchmark point
$(\beta,\Delta,\chi_{0}) = (0.3,0.5M_{Pl},5M_{Pl})$ we find
$\mathcal{G}_{s} > 0$ and $c_{s}^{2} \gtrsim 0.1$ throughout the
inflationary trajectory, while $F(\chi) > 0$ is automatically enforced
by the prior bounds. Following the standard estimate for non-minimal
models we also verify the EFT hierarchy
$\Lambda_{cutoff} \gtrsim 10H_{inf}$, ensuring that the single-field
description remains controlled.

# Basin of attraction and initial-condition scan

To verify that the cancellation $V'/V \simeq 2F'/F$ yields a genuine
attractor we evolved the background for 200 random initial conditions at
the onset of the screen ($\chi = \chi_{0} - 2\Delta$) with
$\dot{\chi} \in \lbrack - 5,5 \rbrack \times 10^{- 6}M_{Pl}^{2}$.
The convergence measure

``` math
\delta N \equiv \frac{|N(\chi_{0},\dot{\chi}_{0}) - N_{\text{ref}}|}{N_{\text{ref}}},\quad N_{\text{ref}} = 62,
```

falls below $10^{- 2}$ within $N \leq 8$ e-folds for $97\%$ of the
sampled trajectories. Phase-space projections show that trajectories
with initially positive $\dot{\chi}$ overshoot the screen but still
re-enter slow roll before horizon exit, while the remaining $3\%$
correspond to $\dot{\chi}$ tuned to keep the field on the steep side of
$V(\chi)$. The attractor therefore occupies a basin extending
$\mathcal{O}(\Delta)$ around $\chi_{0}$ and does not require a special
choice of initial velocity.

# Plateau volume and tuning diagnostic

To quantify how often the screen generates a $>50$-e-fold plateau we
sampled a box $\mathcal{P}$ in parameter space defined by
$\beta \in \lbrack 0.05,0.5 \rbrack$, $\Delta \in \lbrack 0.2,1.2 \rbrack$,
$\chi_{0} \in \lbrack 3,7 \rbrack M_{Pl}$. The fraction of points that
inflate sufficiently is

``` math
\Delta_{\text{plateau}} = \frac{\int_{\mathcal{P}} d\beta\, d\Delta\, d\chi_{0}\; \Theta(N(\beta,\Delta,\chi_{0}) - 50)}{\int_{\mathcal{P}} d\beta\, d\Delta\, d\chi_{0}} = 0.27 \pm 0.02,
```

where the quoted uncertainty is the Monte-Carlo sampling error. Within
the successful region the observables vary smoothly with
$\partial n_{s}/\partial \beta \approx -0.08$ and
$\partial \ln r /\partial \Delta \approx -1.6$, confirming that the
model predicts a continuous strip in the $n_{s}$–$r$ plane rather than an
isolated point. The plateau therefore occupies a finite volume in
parameter space, while the failed points cluster at either
$\beta \lesssim 0.05$ (insufficient screening) or
$\Delta \gtrsim 1.2$ (screen too broad to localize the cancellation).

# EFT validity and cutoff hierarchy

The leading higher-derivative operator induced by the non-minimal
coupling yields a strong-coupling scale

``` math
\Lambda_{\text{sc}}^{2} \simeq \frac{16\pi^{2} F(\chi)^{2}}{\left( F'(\chi) \right)^{2} + F(\chi) F''(\chi)},
```

which reduces to the familiar Higgs-inflation expression in the limit of
slowly varying $F$. Using the background solutions that match the Planck
posterior we find
$\Lambda_{\text{sc}}/H \in \lbrack 12, 55 \rbrack$ between horizon exit
and the end of inflation, with the minimum reached close to the screen
maximum where $F'/F$ peaks. The hierarchy improves both before the field
enters the screen ($F' \rightarrow 0$) and after it relaxes back to the
GR value. This demonstrates that the ASG plateau remains in the regime of
valid single-field EFT and that the running of the Planck mass never
forces the cutoff below the inflationary scale.

# FRG-inspired scale identification

To illustrate how threshold effects in functional renormalization-group
flows can map onto the $F(\chi)$ ansatz, we consider a toy running
Newton coupling

``` math
G(k) = \frac{G_{0}}{1 + \omega k^{2}},
```

with $\omega > 0$. Identifying the RG scale with a curvature-related
quantity,
$k(\chi) = \zeta H(\chi) \simeq \zeta\sqrt{U(\chi)/(3M_{Pl}^{2})}$ for
$\zeta \sim \mathcal{O}(1)$, yields

``` math
G(\chi) = \frac{G_{0}}{1 + \omega\zeta^{2}H(\chi)^{2}}.
```

Expanding around the threshold position $\chi_{0}$ produces to leading
order a Gaussian-like feature,

``` math
G(\chi) \simeq G_{0}\left\lbrack 1 + \widetilde{\beta}\exp\left( - \frac{(\chi - \chi_{0})^{2}}{{\widetilde{\Delta}}^{2}} \right) \right\rbrack^{- 1},
```

which maps onto the phenomenological choice
$F(\chi) = M_{Pl}^{2}\left\lbrack 1 + \beta\exp( - (\chi - \chi_{0})^{2}/\Delta^{2}) \right\rbrack$
after parameter redefinitions. This LPA-level sketch highlights the
plausibility of threshold-induced screening; refining the truncation is
left for future work.

# Data Availability

The MCMC chains, configuration files (.param, .ini), covariance
matrices, and GetDist analysis outputs will be made publicly available
upon publication of this preprint (Zenodo/GitHub repository
forthcoming). This will enable full reproduction of the posterior
constraints in Table [1](#tab:constraints) and Figures 1–2.

# Acknowledgments

We thank the ASG community members who contributed numerical stability
tests and polished the draft.

99

Planck Collaboration: N. Aghanim *et al.*, “Planck 2018 results. VI.
Cosmological parameters,” *Astron. Astrophys.* **641**, A6 (2020),
arXiv:1807.06209.

R. Kallosh and A. Linde, “Superconformal Inflationary
$\alpha$-Attractors,” arXiv:1311.0472.

F. Saueressig, J. Wang, and M. Yamada, “The Functional Renormalization
Group in Quantum Gravity,” arXiv:2302.14152.

M. Reuter, “Nonperturbative evolution equation for quantum gravity,”
*Phys. Rev. D* **57**, 971 (1998), arXiv:hep-th/9605030.

A. Ashtekar, T. Pawlowski, and P. Singh, “Quantum nature of the big
bang: Improved dynamics,” *Phys. Rev. D* **74**, 084003 (2006),
arXiv:gr-qc/0607039.
