import os
import math
from montepython.likelihood_class import Likelihood

# Gaussian penalties to prevent trivially-accepted fast sweeps.
# σ_As_bridge > Planck's σ_As so the posterior is not significantly biased,
# but narrow enough to keep A_s_inf near the Planck window between slow steps.
_A_S_TARGET  = 2.099e-9
_A_S_SIGMA   = 0.1e-9    # ~2x Planck's σ_As; provides restoring force with minimal bias
_N_S_TARGET  = 0.9649
_N_S_SIGMA   = 0.02      # ~5x Planck's σ_ns
_N_STAR      = 60.0


class alpha_bridge(Likelihood):
    """
    Bridge likelihood for the alpha-attractor E-model.

    Reparametrised to sample A_s_inf directly instead of Lambda.
    - A_s_inf is the primordial scalar amplitude (≈ 2.1e-9); directly
      constrained by Planck, so it stays in the right basin without
      needing a degenerate (c, Lambda) random walk.
    - Lambda is derived: Lambda = A_s_inf * 18π²c² / N_STAR²
    - Writes (epsilon, c, Lambda) to alpha_params.txt for alpha_spectrum_class.py
    - Returns Gaussian penalty on (A_s_inf, n_s) so fast sweeps are not
      trivially accepted (zero lnl → MH=1 death spiral).
    """

    def __init__(self, path, data, command_line):
        Likelihood.__init__(self, path, data, command_line)
        self.folder  = command_line.folder
        self.outfile = os.path.join(self.folder, "alpha_params.txt")
        # epsilon and c are fast nuisance params; A_s_inf is now 'cosmo' so
        # it triggers a CLASS recompute and is written via pre_compute().
        self.nuisance = ['epsilon', 'c']
        # Set env var immediately so alpha_spectrum_class.py finds the right file
        # even on the very first cosmo.compute() call (before loglkl is called).
        os.environ["ALPHA_PARAMS_FILE"] = self.outfile

    def pre_compute(self, data):
        """
        Write alpha_params.txt with the CURRENT proposed (epsilon, c, A_s_inf)
        BEFORE CLASS runs.  Called by sampler.compute_lkl() whenever
        need_cosmo_update is True, ensuring CLASS always uses the proposed A_s_inf
        (no bridge-lag offset).
        """
        os.environ["ALPHA_PARAMS_FILE"] = self.outfile

        def cur(name):
            p = data.mcmc_parameters[name]
            return p["current"] * p["scale"]

        epsilon = cur("epsilon")
        c       = cur("c")
        A_s_inf = cur("A_s_inf")

        if c <= 0 or A_s_inf <= 0:
            return

        Lambda = A_s_inf * 18.0 * math.pi**2 * c**2 / _N_STAR**2

        tmp = self.outfile + ".tmp"
        with open(tmp, "w") as f:
            f.write(f"epsilon {epsilon:.16e}\n")
            f.write(f"c       {c:.16e}\n")
            f.write(f"Lambda  {Lambda:.16e}\n")
        os.replace(tmp, self.outfile)

    def loglkl(self, cosmo, data):
        os.environ["ALPHA_PARAMS_FILE"] = self.outfile  # keep in sync if folder changes

        def cur(name):
            p = data.mcmc_parameters[name]
            return p["current"] * p["scale"]

        epsilon  = cur("epsilon")
        c        = cur("c")
        A_s_inf  = cur("A_s_inf")

        if c <= 0 or A_s_inf <= 0:
            return -1e30

        # Bridge penalty on PROPOSED values (correct for Metropolis-Hastings).
        # alpha_params.txt was already written by pre_compute() before CLASS ran.
        n_s = 1.0 - 2.0 / _N_STAR + epsilon

        lnl  = -0.5 * ((A_s_inf - _A_S_TARGET) / _A_S_SIGMA)**2
        lnl -= 0.5 * ((n_s - _N_S_TARGET) / _N_S_SIGMA)**2
        return lnl
