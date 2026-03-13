#!/usr/bin/env python3
"""
alpha_spectrum_class.py — primordial P_s(k), P_t(k) for the alpha-attractor E-model.

E-model potential (Einstein frame, canonical field phi, M_Pl = 1):
  V(phi) = Lambda * (1 - exp(-phi / sqrt(6*alpha)))^2
  alpha  = c^2        (Kahler curvature; c sampled by MontePython)
  Lambda = potential plateau amplitude (sampled, units M_Pl^4)
  epsilon = small tilt correction: n_s -> n_s + epsilon

Universal slow-roll predictions for large N:
  n_s = 1 - 2/N + epsilon
  r   = 12*c^2 / N^2
  A_s = Lambda * N^2 / (3 * pi^2 * c^2)

Outputs: k [1/Mpc]  P_s(k)  P_t(k)  one triplet per line to stdout.
"""
import os
import sys
import numpy as np


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


# defaults from alpha-chain best-fit
epsilon = 2.28e-3   # tilt correction
c       = 0.796     # sqrt(alpha), alpha = c^2
Lambda  = 4.22e-11  # potential amplitude in M_Pl^4
N_EFOLDS = 60.0

for _fname in [
    os.environ.get('ALPHA_PARAMS_FILE', ''),
    sys.argv[1] if len(sys.argv) > 1 and os.path.exists(sys.argv[1]) else '',
    'alpha_params.txt',
    'chains/alpha_chain/alpha_params.txt',
]:
    if _fname and os.path.exists(_fname):
        _p = _read_params(_fname)
        epsilon = _p.get('epsilon', epsilon)
        c       = _p.get('c',       c)
        Lambda  = _p.get('Lambda',  Lambda)
        break

# ── observables ───────────────────────────────────────────────────────────────
c_eff = max(abs(c), 1e-4)

n_s = float(np.clip(1.0 - 2.0 / N_EFOLDS + epsilon, 0.90, 1.05))
r   = float(np.clip(12.0 * c_eff ** 2 / N_EFOLDS ** 2, 0.0, 0.5))
n_t = -r / 8.0

# A_s from slow-roll: A_s = V_star/(24pi^2*eps_V) = Lambda*N^2/(18*pi^2*c^2)
# (eps_V = 3*c^2/(4*N^2) from r=12c^2/N^2=16*eps_V, V_star~Lambda at large N)
A_s_computed = Lambda * N_EFOLDS ** 2 / (18.0 * np.pi ** 2 * c_eff ** 2)
A_s = float(np.clip(A_s_computed, 1e-10, 5e-8))

# ── output power spectrum ─────────────────────────────────────────────────────
k_pivot = 0.05   # Mpc^{-1}
k_arr   = np.logspace(-7, 1, 2000)

P_s = A_s * (k_arr / k_pivot) ** (n_s - 1.0)
P_t = r * A_s * (k_arr / k_pivot) ** n_t

try:
    for ki, ps, pt in zip(k_arr, P_s, P_t):
        sys.stdout.write(f"{ki:.12e} {ps:.12e} {pt:.12e}\n")
except BrokenPipeError:
    pass
