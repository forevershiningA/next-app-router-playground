import os
import numpy as np

# Broad Gaussian penalty widths — >> Planck's actual constraints.
# Keeps inflation params near the observable window during fast sweeps
# without meaningfully biasing the posterior.
_N_S_TARGET = 0.9649
_N_S_SIGMA  = 0.04   # ~10x Planck's actual uncertainty
_R_SIGMA    = 0.10   # broad one-sided penalty; Planck prefers r < 0.065
_N_EFOLDS   = 60.0
_N_GRID     = 5000


def _asg_slow_roll(beta, Delta, chi0, mu):
    """Fast (~0.5 ms) slow-roll computation for the ASG Jordan-frame model.

    Returns (n_s, r) at N_EFOLDS e-folds before end of inflation.
    Returns (None, None) if inflation does not last long enough.
    """
    phi_lo = 0.05
    phi_hi = max(chi0 + 5.0 * Delta, mu * 12.0, 15.0)
    phi = np.linspace(phi_lo, phi_hi, _N_GRID)
    dphi = phi[1] - phi[0]

    e_arg  = np.exp(np.clip(-phi / mu, -700.0, 0.0))
    V_arr  = (1.0 - e_arg) ** 2
    dV_arr = 2.0 * (1.0 - e_arg) * e_arg / mu

    gauss  = np.exp(-((phi - chi0) ** 2) / Delta ** 2)
    F_arr  = 1.0 + beta * gauss
    dF_arr = -2.0 * beta * (phi - chi0) / Delta ** 2 * gauss

    K_arr  = 1.0 / F_arr + 1.5 * (dF_arr / F_arr) ** 2
    U_arr  = V_arr / F_arr ** 2
    dU_arr = dV_arr / F_arr ** 2 - 2.0 * V_arr * dF_arr / F_arr ** 3
    d2U_arr = np.gradient(dU_arr, dphi)

    with np.errstate(divide='ignore', invalid='ignore'):
        eps_arr = np.where(
            (U_arr > 1e-30) & (K_arr > 1e-30),
            dU_arr ** 2 / (2.0 * K_arr * U_arr ** 2),
            1e10,
        )

    # find phi_end (eps = 1 crossing from below)
    phi_end = phi[0]
    for i in range(1, _N_GRID):
        if eps_arr[i - 1] >= 1.0 >= eps_arr[i]:
            t = (1.0 - eps_arr[i - 1]) / (eps_arr[i] - eps_arr[i - 1])
            phi_end = phi[i - 1] + t * dphi
            break
        if eps_arr[i] < 1.0:
            phi_end = phi[i]
            break

    idx_end = int(np.clip(np.searchsorted(phi, phi_end), 1, _N_GRID - 2))

    with np.errstate(divide='ignore', invalid='ignore'):
        dN_dphi = np.where(dU_arr > 1e-30, K_arr * U_arr / dU_arr, 0.0)

    N_cum = np.zeros(_N_GRID)
    for i in range(idx_end + 1, _N_GRID):
        N_cum[i] = N_cum[i - 1] + 0.5 * (dN_dphi[i] + dN_dphi[i - 1]) * dphi

    if N_cum[-1] < _N_EFOLDS:
        return None, None  # not enough e-folds

    phi_star = float(np.interp(_N_EFOLDS, N_cum, phi))
    eps_star = max(float(np.interp(phi_star, phi, eps_arr)), 1e-14)
    K_star   = float(np.interp(phi_star, phi, K_arr))
    U_star   = float(np.interp(phi_star, phi, U_arr))
    d2U_star = float(np.interp(phi_star, phi, d2U_arr))
    eta_star = d2U_star / (max(K_star, 1e-30) * max(U_star, 1e-30))

    n_s = float(np.clip(1.0 - 6.0 * eps_star + 2.0 * eta_star, 0.90, 1.05))
    r   = float(np.clip(16.0 * eps_star, 0.0, 0.5))
    return n_s, r


class ASG_bridge:
    """
    Minimal dummy likelihood compatible with MontePython MCMC loop.
    - Declares nuisance parameters so MontePython accepts them.
    - Writes current ASG parameters to <chain_folder>/asg_params.txt for external_Pk script.
    - Returns a broad Gaussian penalty on (n_s, r) from the inline slow-roll computation
      so that fast sweeps are not trivially accepted (returning 0 causes a death spiral).
    """

    def __init__(self, path, data, command_line):
        self.name = "ASG_bridge"
        self.folder = command_line.folder
        self.outfile = os.path.join(self.folder, "asg_params.txt")

        # MontePython expects these attributes on likelihood objects
        self.nuisance = ['beta', 'Delta', 'chi0', 'mu']
        self.need_update = True
        self.backup_value = 0.0
        self.has_been_calculated = False
        self._current = None

    def loglkl(self, cosmo, data):
        # Make the params file discoverable regardless of working directory
        os.environ["ASG_PARAMS_FILE"] = self.outfile

        def cur(name):
            p = data.mcmc_parameters[name]
            return p["current"] * p["scale"]

        def acc(name):
            # Write last_accepted to file so rejected fast-sweep proposals
            # never corrupt the params that CLASS reads on the next slow step.
            p = data.mcmc_parameters[name]
            return p.get("last_accepted", p["current"]) * p["scale"]

        beta  = cur("beta")
        Delta = cur("Delta")
        chi0  = cur("chi0")
        mu    = cur("mu")

        # Write LAST ACCEPTED params — prevents death spiral from rejected sweeps
        tmp = self.outfile + ".tmp"
        with open(tmp, "w") as f:
            f.write(f"beta {acc('beta'):.16e}\n")
            f.write(f"Delta {acc('Delta'):.16e}\n")
            f.write(f"chi0 {acc('chi0'):.16e}\n")
            f.write(f"mu {acc('mu'):.16e}\n")
        os.replace(tmp, self.outfile)

        self.has_been_calculated = True

        # Fast (~0.5 ms) slow-roll penalty — prevents trivially-accepted fast sweeps.
        n_s, r = _asg_slow_roll(beta, Delta, chi0, mu)
        if n_s is None:
            self.backup_value = -1e10
            return -1e10  # not enough e-folds → hard reject

        lnl = -0.5 * ((n_s - _N_S_TARGET) / _N_S_SIGMA) ** 2
        lnl -= 0.5 * (r / _R_SIGMA) ** 2

        self.backup_value = lnl
        return lnl
