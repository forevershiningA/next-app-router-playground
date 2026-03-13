#!/usr/bin/env python3
"""
rg_spectrum_class.py — primordial P_s(k), P_t(k) for the ASG inflation model.

ASG Jordan-frame action:
  S = integral d^4x sqrt(-g) [ F(phi) R - 0.5*(d phi)^2 - V(phi) ]
  V(phi) = (1 - exp(-phi/mu))^2        (Starobinsky-like plateau, mu in M_Pl)
  F(phi) = 1 + beta*exp(-(phi-chi0)^2 / Delta^2)  (Gaussian RG screen)

Slow-roll observables are computed by numerical integration in the Einstein frame.
Outputs: k [1/Mpc]  P_s(k)  P_t(k)  one triplet per line to stdout.
"""
import os
import sys
import numpy as np

# ── parameter I/O ──────────────────────────────────────────────────────────────
def _read_params(fname):
    d = {}
    try:
        with open(fname) as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                parts = line.split()
                if len(parts) >= 2:
                    try:
                        d[parts[0]] = float(parts[1])
                    except ValueError:
                        pass
    except FileNotFoundError:
        pass
    return d


# defaults from zenodo best-fit (properly converged run)
beta, Delta, chi0, mu = 0.042, 0.847, 5.612, 5.0
A_s_ref = 2.1e-9   # Planck 2018 amplitude (fixed normalisation)
N_EFOLDS = 60.0    # e-folds before end of inflation

for _fname in [
    os.environ.get('ASG_PARAMS_FILE', ''),
    sys.argv[1] if len(sys.argv) > 1 and os.path.exists(sys.argv[1]) else '',
    'asg_params.txt',
    'chains/asg_chain/asg_params.txt',
]:
    if _fname and os.path.exists(_fname):
        _p = _read_params(_fname)
        beta  = _p.get('beta',  beta)
        Delta = _p.get('Delta', Delta)
        chi0  = _p.get('chi0',  chi0)
        mu    = _p.get('mu',    mu)
        break

# ── ASG potential and geometry ─────────────────────────────────────────────────
# Work with phi on a dense grid [phi_lo, phi_hi]
phi_lo = 0.05
phi_hi = max(chi0 + 5.0 * Delta, mu * 12.0, 15.0)
N_grid = 5000
phi = np.linspace(phi_lo, phi_hi, N_grid)
dphi = phi[1] - phi[0]

# V and derivatives (safe for large phi/mu)
def _safe_exp(x):
    return np.exp(np.clip(x, -700.0, 0.0))

e_arg = _safe_exp(-phi / mu)
V_arr  = (1.0 - e_arg) ** 2
dV_arr = 2.0 * (1.0 - e_arg) * e_arg / mu

# F and derivatives
gauss  = np.exp(-((phi - chi0) ** 2) / Delta ** 2)
F_arr  = 1.0 + beta * gauss
dF_arr = -2.0 * beta * (phi - chi0) / Delta ** 2 * gauss

# Kinetic function K = (d chi / d phi)^2  [Einstein frame canonical normalisation]
#   K = 1/F + (3/2)*(F'/F)^2
K_arr = 1.0 / F_arr + 1.5 * (dF_arr / F_arr) ** 2

# Einstein-frame potential U = V / F^2
U_arr  = V_arr / F_arr ** 2
dU_arr = dV_arr / F_arr ** 2 - 2.0 * V_arr * dF_arr / F_arr ** 3

# Second derivative of U (for eta)
d2U_arr = np.gradient(dU_arr, dphi)

# Slow-roll epsilon in Einstein frame:  eps = (dU/dchi)^2 / (2 U^2)
#   dU/dchi = (dU/dphi) / sqrt(K)  =>  eps = (dU/dphi)^2 / (2 K U^2)
with np.errstate(divide='ignore', invalid='ignore'):
    eps_arr = np.where(
        (U_arr > 1e-30) & (K_arr > 1e-30),
        dU_arr ** 2 / (2.0 * K_arr * U_arr ** 2),
        1e10,
    )

# ── find phi_end where eps = 1 ─────────────────────────────────────────────────
# inflation ends at small phi where potential steepens
# scan from left (small phi) and find first crossing eps < 1 → phi_end
phi_end = phi[0]
for i in range(1, N_grid):
    if eps_arr[i - 1] >= 1.0 >= eps_arr[i]:
        # linear interpolation
        t = (1.0 - eps_arr[i - 1]) / (eps_arr[i] - eps_arr[i - 1])
        phi_end = phi[i - 1] + t * dphi
        break
    if eps_arr[i] < 1.0:
        phi_end = phi[i]
        break

idx_end = np.searchsorted(phi, phi_end)
idx_end = int(np.clip(idx_end, 1, N_grid - 2))

# ── integrate N from phi_end upward to find phi_star ──────────────────────────
# dN/dphi = K * U / (dU/dphi)   [positive since dU/dphi > 0 and field rolls down]
with np.errstate(divide='ignore', invalid='ignore'):
    dN_dphi = np.where(
        dU_arr > 1e-30,
        K_arr * U_arr / dU_arr,
        0.0,
    )

# cumulative integral from idx_end
N_cum = np.zeros(N_grid)
for i in range(idx_end + 1, N_grid):
    N_cum[i] = N_cum[i - 1] + 0.5 * (dN_dphi[i] + dN_dphi[i - 1]) * dphi
N_cum[:idx_end + 1] = 0.0

if N_cum[-1] < N_EFOLDS:
    # not enough e-folds → use max available (chain penalised by bad Planck lkl)
    phi_star = phi[-1]
else:
    phi_star = float(np.interp(N_EFOLDS, N_cum, phi))

# ── slow-roll observables at phi_star ─────────────────────────────────────────
eps_star  = float(np.interp(phi_star, phi, eps_arr))
eps_star  = max(eps_star, 1e-14)

K_star    = float(np.interp(phi_star, phi, K_arr))
U_star    = float(np.interp(phi_star, phi, U_arr))
d2U_star  = float(np.interp(phi_star, phi, d2U_arr))
# eta = d2U/dchi^2 / U ≈ d2U/dphi^2 / (K * U)  [leading order in slowly varying K]
eta_star  = d2U_star / (max(K_star, 1e-30) * max(U_star, 1e-30))

n_s = float(np.clip(1.0 - 6.0 * eps_star + 2.0 * eta_star, 0.90, 1.05))
r   = float(np.clip(16.0 * eps_star, 0.0, 0.5))
n_t = -r / 8.0   # inflationary consistency relation

# ── output power spectrum ─────────────────────────────────────────────────────
k_pivot = 0.05   # Mpc^{-1}
k_arr   = np.logspace(-7, 1, 2000)   # 1e-7 to 10 Mpc^{-1}

P_s = A_s_ref * (k_arr / k_pivot) ** (n_s - 1.0)
P_t = r * A_s_ref * (k_arr / k_pivot) ** n_t

for ki, ps, pt in zip(k_arr, P_s, P_t):
    sys.stdout.write(f"{ki:.12e} {ps:.12e} {pt:.12e}\n")
