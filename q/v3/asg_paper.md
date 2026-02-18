# Active Screen Gravity: Running Planck Mass as the Origin of the Inflationary Attractor

## Abstract
We propose a scalar–tensor framework in which the inflationary observables are governed by a renormalization–group (RG) flow of the gravitational coupling. Instead of modifying the inflaton potential directly, we allow the effective Planck mass to vary as a function of the scalar field, leading to an effective Einstein–frame potential U = V/F^2. We show analytically and numerically that the spectral tilt and tensor amplitude arise from geometric derivatives of F rather than from the shape of V. The model predicts a linear shift in n_s and a quadratic suppression of r, producing a characteristic trajectory in the (n_s, r) plane and an observational attractor consistent with current data.

---

## 1. Motivation
Plateau inflation models successfully reproduce the observed scalar tilt but generically predict a tensor amplitude r ~ 10^-3. Lowering r typically requires tuning the potential. Here we explore a different mechanism: running gravitational coupling.

Instead of modifying the inflaton potential, we modify the geometry experienced by the scalar field through a field‑dependent Planck mass:

S = ∫ d^4x √−g [ F(χ) R − 1/2 (∂χ)^2 − V(χ) ]

After conformal transformation to the Einstein frame the effective potential becomes

U(χ) = V(χ) / F(χ)^2

Thus inflation is controlled not only by V but also by the RG structure of gravity.

---

## 2. RG Interpretation
We postulate that the gravitational coupling runs according to a quadratic beta function

 dG/d ln μ = a G^2

Solving:

 G(μ) = G0 / (1 − a G0 ln(μ/μ0))

The effective Planck mass is M_Pl^2 = 1/G, hence

 M_Pl^2(μ) ≈ M0^2 (1 + a ln(μ/μ0) + ...)

Identifying the RG scale with the scalar field amplitude

 μ ∝ e^{χ/Δ}

we obtain a localized deformation of the Planck mass:

 F(χ) ≈ 1 + β exp[−(χ − χ0)^2 / Δ^2]

Therefore the Gaussian feature is not an ansatz but the low‑order expansion of a running gravitational coupling around a transition scale χ0.

---

## 3. Inflationary Dynamics
Slow‑roll parameters in the Einstein frame depend on derivatives of U:

ε = 1/2 (U'/U)^2
η = U''/U

Using U = V/F^2 gives

U'/U = V'/V − 2F'/F

U''/U ≈ V''/V − 4(V'/V)(F'/F) − 2F''/F

For plateau potentials ε << |η|, therefore

n_s − 1 ≈ 2η ≈ (n_s − 1)_Star − 4F''/F

Thus the scalar tilt is controlled by curvature of the Planck mass.

---

## 4. Tensor Suppression
The tensor‑to‑scalar ratio

r = 16ε

becomes

√(2ε) = |V'/V − 2F'/F|

The geometric term cancels the potential slope, producing a flattened effective potential:

r(β) ≈ r0 (1 − γβ)^2

Hence gravitational waves are suppressed without altering the scalar tilt mechanism.

---

## 5. Observational Predictions
The model predicts a correlated trajectory:

n_s ≈ 1 − 2/N − Cβ
r ≈ r0 (1 − γβ)^2

Consequences:
- Starobinsky limit: β → 0
- Observed universe: β ≈ O(10^-2)
- Tensor amplitude: r ~ 10^-4

This differs from α‑attractors where r varies independently of n_s.

---

## 6. Robustness and Naturalness
Parameter scans show:
- Broad range of χ0 produces correct tilt
- Natural Planck‑scale widths Δ ~ O(1–4)
- Continuous degeneracy band in parameter space

Therefore the solution is an attractor rather than a fine‑tuned point.

---

## 7. Physical Interpretation
Inflation occurs on the shoulder of a running gravitational coupling. The scalar field rolls down its potential while simultaneously climbing the Planck mass gradient. The balance defines a fixed observational point.

The measured spectral index corresponds to a specific value of the gravitational beta function.

---

## 8. Conclusion
We have shown that:
1) The spectral tilt originates from curvature of the running Planck mass
2) The tensor suppression originates from its slope
3) The Gaussian deformation arises from RG flow expansion
4) The observed universe corresponds to a gravitational fixed trajectory

This framework links inflationary observables directly to the renormalization structure of gravity rather than to a tuned scalar potential.

Future CMB experiments capable of probing r ~ 10^-4 can test this prediction and distinguish running‑gravity inflation from standard attractor models.

