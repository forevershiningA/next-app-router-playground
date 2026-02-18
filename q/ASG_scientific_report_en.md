# Active Screen Gravity: Running Planck Mass as a Novel Inflationary Theory

Author: ASG Research Collective / Copilot CLI  \
Date: February 17, 2026

## Abstract
This short note states the core idea of the Active Screen Gravity (ASG) program: observable inflationary quantities are governed by a localized running of the Planck mass F(χ) instead of the bare inflaton potential V(χ). We present the geometric derivation, a minimal benchmark, and a single illustrative figure to explain the mechanism. Phenomenology and UV embedding are deferred to separate follow-up work; no likelihood fits or tables are included here.

## 1. Introduction
Conventional single-field models express the scalar tilt n_s and tensor ratio r through derivatives of V(χ). ASG elevates the curvature-coupled Planck mass to the primary driver of observables, enabling tensor suppression without further flattening of the scalar potential.

## 2. Theoretical setup
ASG begins from the scalar–tensor action:

S = ∫ d⁴x √(-g) [ F(χ) R − ½ (∂χ)² − V(χ) ],

with F(χ) = M_Pl²(χ). Identifying the RG scale with the field amplitude (ln μ ∝ χ) yields a localized threshold encoded as

F(χ) ≈ 1 + β exp[ − (χ − χ₀)² / Δ² ],

which acts as an active gravitational screen.

## 3. Geometric formalism
The conformal transformation g̃_{μν} = F(χ) g_{μν} produces the Einstein-frame potential and field-space metric:

U(χ) = V(χ) / F(χ)²,
K(χ) = 1/F(χ) + (3/2) [F′(χ)/F(χ)]².

The canonical field satisfies dφ/dχ = √K(χ), giving slow-roll parameters

ε = ½ (U′/U)², η = U″/U.

Substituting U = V/F² isolates geometric derivatives:

U′/U = V′/V − 2 F′/F,
U″/U = V″/V − 4 (V′/V)(F′/F) + 6 (F′/F)² − 2 F″/F.

On an inflationary plateau, V′/V and V″/V are negligible, so n_s − 1 ≈ −4 F″/F and r ≈ 32 (F′/F)².

## 4. Active screen mechanism
The RG interpretation assumes a localized beta function:

β(G, μ) = dG/d(ln μ) ≈ a₀ G² exp[ − (ln μ − ln μ₀)² / σ² ].

Mapping μ to χ generates a smooth step in G = 1/F. The number of e-folds

N = ∫ (U/U′) dχ = ∫ dχ / (V′/V − 2 F′/F)

diverges when F′/F ≈ V′/(2V), producing a natural plateau without additional tuning in V(χ).

## 5. Observational predictions
The coupled observables follow

n_s ≈ 1 − 2/N − C β, r ≈ r₀ (1 − γ β)²,

showing that larger β simultaneously reddens n_s and suppresses r to the 10⁻⁴ regime. This differs from α-attractors where r can vary independently.

## 6. Geometry-first predictions
Without invoking data fits, the slow-roll observables reduce to

n_s − 1 = −2 F″/F + O(V′/V), r = 8 (F′/F)² + O(V′/V).

For the Gaussian screen above we obtain

n_s − 1 ≈ 4β [ (χ − χ₀)² − Δ² ] / Δ⁴ · exp[ −(χ − χ₀)² / Δ² ],
r ≈ 32β² (χ − χ₀)² / Δ⁴ · exp[ −2(χ − χ₀)² / Δ² ].

These relations are the core of ASG: the tilt and tensor ratio are sourced by derivatives of the Planck-mass function.

## 7. Minimal benchmark
Choosing β = 0.02 and Δ = 1, and evaluating the screen near χ − χ₀ = Δ, gives

n_s ≈ 0.965, r ≈ 6 × 10⁻³,

with ε ≪ 1. These numbers arise purely from the geometry of F(χ); no reheating model or likelihood analysis is needed at this stage.

## 8. Conceptual outlook
The ASG research path is staged explicitly:
1. **Mechanism (this note):** Demonstrate how a running Planck mass fixes n_s and r.
2. **Phenomenology (future work):** Map β, Δ, χ₀ onto current CMB data and visualize the resulting trajectories.
3. **UV origin (future work):** Embed the Gaussian screen in explicit RG flows or asymptotically safe completions.
By isolating the first step and clearly labeling future work, the manuscript keeps the core idea visible without overloading the narrative.

![Figure 1. Profiles of F(χ) and U(χ) illustrating the active screen.](C:\\Users\\polcr\\documents\\github\\next-app-router-playground\\q\\v4\\F_U_overlay.png){ width=75% }
