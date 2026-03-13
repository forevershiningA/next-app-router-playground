import argparse
import json
from pathlib import Path
from typing import Callable, Dict, Tuple

import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
import numpy as np


def finite_diff(func: Callable[[float], float], x: float, order: int = 1, h: float = 1e-4) -> float:
    if order == 1:
        return (func(x + h) - func(x - h)) / (2 * h)
    if order == 2:
        return (func(x + h) - 2 * func(x) + func(x - h)) / (h**2)
    if order == 3:
        return (func(x + 2 * h) - 2 * func(x + h) + 2 * func(x - h) - func(x - 2 * h)) / (2 * h**3)
    raise ValueError("Unsupported derivative order")


class ASGBackground:
    def __init__(self, beta: float, delta: float, chi0: float, mu: float):
        self.beta = beta
        self.delta = delta
        self.chi0 = chi0
        self.mu = mu

    def F(self, chi):
        return 1.0 + self.beta * np.exp(-((chi - self.chi0) ** 2) / self.delta**2)

    def F_prime(self, chi):
        gauss = np.exp(-((chi - self.chi0) ** 2) / self.delta**2)
        return -2.0 * self.beta * (chi - self.chi0) / self.delta**2 * gauss

    def F_double(self, chi):
        gauss = np.exp(-((chi - self.chi0) ** 2) / self.delta**2)
        term = (4.0 * (chi - self.chi0) ** 2) / self.delta**4 - 2.0 / self.delta**2
        return self.beta * gauss * term

    def V(self, chi: float) -> float:
        exp_term = np.exp(-chi / self.mu)
        return (1.0 - exp_term) ** 2

    def U(self, chi: float) -> float:
        return self.V(chi) / self.F(chi) ** 2

    def K(self, chi: float) -> float:
        F = self.F(chi)
        F_prime = finite_diff(self.F, chi)
        return 1.0 / F + 1.5 * (F_prime / F) ** 2

    def cutoff_ratio(self, chis):
        chis = np.asarray(chis, dtype=float)
        F = self.F(chis)
        F_p = self.F_prime(chis)
        F_pp = self.F_double(chis)
        denom = np.maximum(F_p**2 + F * F_pp, 1e-14)
        lambda_sq = (16.0 * np.pi**2) * F**2 / denom
        H_sq = np.maximum(self.U(chis) / 3.0, 1e-18)
        return np.sqrt(lambda_sq / H_sq)

    def d_by_phi(self, func: Callable[[float], float], chi: float) -> float:
        return finite_diff(func, chi) / np.sqrt(self.K(chi))

    def d2_by_phi2(self, func: Callable[[float], float], chi: float) -> float:
        def first(x: float) -> float:
            return self.d_by_phi(func, x)

        return finite_diff(first, chi) / np.sqrt(self.K(chi))

    def d3_by_phi3(self, func: Callable[[float], float], chi: float) -> float:
        def second(x: float) -> float:
            return self.d2_by_phi2(func, x)

        return finite_diff(second, chi) / np.sqrt(self.K(chi))

    def slow_roll(self, chi: float) -> Dict[str, float]:
        U = self.U(chi)
        U_phi = self.d_by_phi(self.U, chi)
        U_phi_phi = self.d2_by_phi2(self.U, chi)
        U_phi_phi_phi = self.d3_by_phi3(self.U, chi)
        epsilon = 0.5 * (U_phi / U) ** 2
        eta = U_phi_phi / U
        xi = (U_phi * U_phi_phi_phi) / (U**2)
        alpha = 16 * epsilon * eta - 24 * epsilon**2 - 2 * xi
        return {
            "epsilon": float(epsilon),
            "eta": float(eta),
            "xi": float(xi),
            "alpha_s": float(alpha),
        }

    def epsilon(self, chi: float) -> float:
        sr = self.slow_roll(chi)
        return sr["epsilon"]

    def chi_end(self, bracket: Tuple[float, float]) -> float:
        chis = np.linspace(bracket[0], bracket[1], 4000)
        eps = np.array([self.epsilon(c) for c in chis])
        idx = np.where(eps >= 1.0)[0]
        if not len(idx):
            raise RuntimeError("Failed to bracket end of inflation")
        return float(chis[idx[0]])

    def chi_history(self, chi_end: float, chi_max: float, num: int = 4000) -> Tuple[np.ndarray, np.ndarray]:
        chis = np.linspace(chi_end + 1e-3, chi_max, num)
        integrand = []
        for x in chis:
            Uchi = finite_diff(self.U, x)
            if abs(Uchi) < 1e-10:
                Uchi = np.sign(Uchi) * 1e-10 if Uchi != 0 else 1e-10
            value = self.K(x) * self.U(x) / Uchi
            integrand.append(abs(value))
        integrand = np.array(integrand)
        Ns = np.zeros_like(chis)
        diffs = np.diff(chis)
        trapezoids = 0.5 * (integrand[1:] + integrand[:-1]) * diffs
        Ns[1:] = np.cumsum(trapezoids)
        return chis, Ns

    def chi_for_N(self, target_N: float, chis: np.ndarray, Ns: np.ndarray) -> float:
        if target_N > Ns[-1]:
            raise RuntimeError("Grid does not cover target e-folds")
        return float(np.interp(target_N, Ns, chis))

    def phase_portrait(self, output_path: Path, chi_range: Tuple[float, float]) -> None:
        dt = 0.2
        steps = 420
        chis = np.linspace(chi_range[0], chi_range[1], 7)
        velocities = np.linspace(-0.08, 0.08, 7)
        fig, ax = plt.subplots(figsize=(6.2, 4.8))
        norm = plt.Normalize(0.0, 12.0)
        cmap = plt.get_cmap("viridis")

        for chi0 in chis:
            for vel0 in velocities:
                trajectory = np.zeros((steps, 2))
                trajectory[0] = [chi0, vel0]
                efolds = np.zeros(steps)
                for i in range(steps - 1):
                    chi_i, vel_i = trajectory[i]
                    K_val = self.K(chi_i)
                    U_val = self.U(chi_i)
                    H = np.sqrt(max((0.5 * K_val * vel_i**2 + U_val) / 3.0, 1e-12))
                    U_chi = finite_diff(self.U, chi_i)
                    K_chi = finite_diff(self.K, chi_i)
                    acc = -3 * H * vel_i - U_chi / K_val - 0.5 * K_chi / K_val * vel_i**2
                    trajectory[i + 1, 0] = chi_i + dt * vel_i
                    trajectory[i + 1, 1] = vel_i + dt * acc
                    efolds[i + 1] = efolds[i] + H * dt
                segments = np.stack([trajectory[:-1], trajectory[1:]], axis=1)
                lc = LineCollection(segments, cmap=cmap, norm=norm, linewidths=1.1)
                lc.set_array(efolds[:-1])
                lc.set_alpha(0.9)
                ax.add_collection(lc)

        ax.set_xlabel(r"$\chi / M_{\rm Pl}$")
        ax.set_ylabel(r"$\dot{\chi} / M_{\rm Pl}$")
        ax.set_title("ASG attractor phase portrait")
        ax.axvspan(self.chi0 - self.delta, self.chi0 + self.delta, color="#f0f0f0", alpha=0.45, label="screen region")
        ax.legend(loc="upper right", frameon=False)
        sm = plt.cm.ScalarMappable(norm=norm, cmap=cmap)
        sm.set_array([])
        cbar = fig.colorbar(sm, ax=ax, pad=0.01)
        cbar.set_label("e-folds to end of inflation")
        fig.tight_layout()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(output_path.with_suffix(".png"), dpi=250)
        fig.savefig(output_path.with_suffix(".pdf"))
        plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate ASG background diagnostics.")
    parser.add_argument("--diagnostics", type=Path, default=Path("asg_chain/processed_mar09/diagnostics.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("figures"))
    parser.add_argument("--target-N", type=float, default=55.0)
    parser.add_argument("--delta-N", type=float, default=2.0)
    args = parser.parse_args()

    diag = json.loads(args.diagnostics.read_text())
    params = diag["bestfit_params"]
    model = ASGBackground(beta=params["beta"], delta=params["Delta"], chi0=params["chi0"], mu=params["mu"])

    chi_end = model.chi_end((0.2, 1.2))
    chis, Ns = model.chi_history(chi_end, chi_end + 10.0, num=7000)
    chi_star = model.chi_for_N(args.target_N, chis, Ns)

    sr_star = model.slow_roll(chi_star)
    epsilon, eta, alpha_star = sr_star["epsilon"], sr_star["eta"], sr_star["alpha_s"]

    def alpha_at_N(N_val: float) -> float:
        chi_val = model.chi_for_N(N_val, chis, Ns)
        return model.slow_roll(chi_val)["alpha_s"]

    alpha_plus = alpha_at_N(args.target_N + args.delta_N)
    alpha_minus = alpha_at_N(args.target_N - args.delta_N)
    beta_s = -(alpha_plus - alpha_minus) / (2 * args.delta_N)

    model.phase_portrait(args.output_dir / "phase_portrait_asg", (model.chi0 - 1.8 * model.delta, model.chi0 + 1.2 * model.delta))

    ratios = model.cutoff_ratio(chis)
    mask = (Ns >= 0.0) & (Ns <= args.target_N + 5.0)
    fig_ratio, ax_ratio = plt.subplots(figsize=(5.2, 3.6))
    ax_ratio.plot(Ns[mask], ratios[mask], color="#1f78b4", lw=2.2)
    ax_ratio.axhline(10.0, color="k", ls="--", lw=0.8)
    ax_ratio.set_xlabel(r"$N$ to end of inflation")
    ax_ratio.set_ylabel(r"$\Lambda_{\rm sc}/H$")
    ax_ratio.set_ylim(0, max(15, float(np.nanmax(ratios[mask]) * 1.1)))
    ax_ratio.set_title("Cutoff hierarchy along the attractor")
    fig_ratio.tight_layout()
    (args.output_dir / "cutoff_ratio.pdf").parent.mkdir(parents=True, exist_ok=True)
    fig_ratio.savefig(args.output_dir / "cutoff_ratio.pdf")
    fig_ratio.savefig(args.output_dir / "cutoff_ratio.png", dpi=250)
    plt.close(fig_ratio)

    summary = {
        "beta": params["beta"],
        "Delta": params["Delta"],
        "chi0": params["chi0"],
        "mu": params["mu"],
        "chi_end": chi_end,
        "chi_star": chi_star,
        "epsilon_star": epsilon,
        "eta_star": eta,
        "alpha_s_star": alpha_star,
        "beta_s": beta_s,
        "target_N": args.target_N,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "asg_background_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
