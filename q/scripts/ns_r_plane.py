import argparse
import json
from pathlib import Path
from typing import Tuple

import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Patch
from matplotlib.lines import Line2D
import numpy as np
import pandas as pd


def slow_roll_ns_r(
    beta: float,
    delta: float,
    chi0: float,
    mu: float,
    n_efolds: float,
    n_grid: int = 4096,
) -> Tuple[float, float] | Tuple[None, None]:
    """Return (n_s, r) for the ASG model N e-folds before the end of inflation."""
    if any(val <= 0 for val in (delta, mu)):
        return None, None
    phi_lo = 0.05
    phi_hi = float(max(chi0 + 5.0 * delta, mu * 12.0, 15.0))
    phi = np.linspace(phi_lo, phi_hi, n_grid)
    dphi = phi[1] - phi[0]

    e_arg = np.exp(np.clip(-phi / mu, -700.0, 0.0))
    V_arr = (1.0 - e_arg) ** 2
    dV_arr = 2.0 * (1.0 - e_arg) * e_arg / mu

    gauss = np.exp(-((phi - chi0) ** 2) / delta**2)
    F_arr = 1.0 + beta * gauss
    dF_arr = -2.0 * beta * (phi - chi0) / delta**2 * gauss

    K_arr = 1.0 / F_arr + 1.5 * (dF_arr / F_arr) ** 2
    U_arr = V_arr / F_arr**2
    dU_arr = dV_arr / F_arr**2 - 2.0 * V_arr * dF_arr / F_arr**3
    d2U_arr = np.gradient(dU_arr, dphi)

    with np.errstate(divide="ignore", invalid="ignore"):
        eps_arr = np.where(
            (U_arr > 1e-30) & (K_arr > 1e-30),
            dU_arr**2 / (2.0 * K_arr * U_arr**2),
            1e10,
        )

    phi_end = phi[0]
    for i in range(1, n_grid):
        if eps_arr[i - 1] >= 1.0 >= eps_arr[i]:
            t = (1.0 - eps_arr[i - 1]) / (eps_arr[i] - eps_arr[i - 1])
            phi_end = phi[i - 1] + t * dphi
            break
        if eps_arr[i] < 1.0:
            phi_end = phi[i]
            break
    idx_end = int(np.clip(np.searchsorted(phi, phi_end), 1, n_grid - 2))

    with np.errstate(divide="ignore", invalid="ignore"):
        dN_dphi = np.where(dU_arr > 1e-30, K_arr * U_arr / dU_arr, 0.0)

    N_cum = np.zeros(n_grid)
    for i in range(idx_end + 1, n_grid):
        N_cum[i] = N_cum[i - 1] + 0.5 * (dN_dphi[i] + dN_dphi[i - 1]) * dphi

    if N_cum[-1] < n_efolds:
        return None, None

    phi_star = float(np.interp(n_efolds, N_cum, phi))
    eps_star = max(float(np.interp(phi_star, phi, eps_arr)), 1e-14)
    K_star = float(np.interp(phi_star, phi, K_arr))
    U_star = float(np.interp(phi_star, phi, U_arr))
    d2U_star = float(np.interp(phi_star, phi, d2U_arr))
    eta_star = d2U_star / (max(K_star, 1e-30) * max(U_star, 1e-30))

    n_s = float(np.clip(1.0 - 6.0 * eps_star + 2.0 * eta_star, 0.90, 1.05))
    r = float(np.clip(16.0 * eps_star, 0.0, 0.5))
    return n_s, r


def weighted_resample(df: pd.DataFrame, n_samples: int = 2500, seed: int = 41) -> pd.DataFrame:
    weights = df["weight"].to_numpy(dtype=float)
    probs = weights / weights.sum()
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(df), size=min(len(df), n_samples), replace=True, p=probs)
    return df.iloc[idx].reset_index(drop=True)


def add_planck_contours(ax: plt.Axes) -> None:
    ns_center = 0.9649
    r_center = 0.004
    sigma_ns = 0.0042
    sigma_r = 0.01
    ell_68 = Ellipse(
        (ns_center, r_center),
        width=2 * sigma_ns,
        height=2 * sigma_r,
        angle=0,
        facecolor="#cbd5e8",
        edgecolor="none",
        alpha=0.8,
        label="Planck 68%",
    )
    ell_95 = Ellipse(
        (ns_center, r_center),
        width=4 * sigma_ns,
        height=4 * sigma_r,
        angle=0,
        facecolor="#a6bddb",
        edgecolor="none",
        alpha=0.5,
        label="Planck 95%",
    )
    ax.add_patch(ell_95)
    ax.add_patch(ell_68)


def add_alpha_band(ax: plt.Axes) -> None:
    N = np.linspace(50.0, 60.0, 256)
    ns = 1.0 - 2.0 / N
    alpha_min, alpha_max = 1e-3, 1.0
    r_low = 12.0 * alpha_min / (N**2)
    r_high = 12.0 * alpha_max / (N**2)
    ax.fill_between(
        ns,
        r_low,
        r_high,
        color="#fde0dd",
        alpha=0.6,
        label=r"$\alpha$-attractor band",
    )


def plot_ns_r(args: argparse.Namespace) -> None:
    asg_df = pd.read_csv(args.asg_chain)
    samples = weighted_resample(asg_df, n_samples=args.n_samples, seed=42)

    ns_vals = []
    r_vals = []
    for _, row in samples.iterrows():
        ns, r = slow_roll_ns_r(
            beta=row["beta"],
            delta=row["Delta"],
            chi0=row["chi0"],
            mu=row["mu"],
            n_efolds=args.n_efolds,
        )
        if ns is None:
            continue
        ns_vals.append(ns)
        r_vals.append(r)
    ns_arr = np.asarray(ns_vals)
    r_arr = np.asarray(r_vals)

    if len(ns_arr) == 0:
        raise RuntimeError("Failed to evaluate any slow-roll points for the ASG posterior.")

    fig, ax = plt.subplots(figsize=(5.4, 4.6))
    add_planck_contours(ax)
    add_alpha_band(ax)

    posterior_scatter = ax.scatter(
        ns_arr,
        r_arr,
        s=10,
        alpha=0.35,
        color="#1b9e77",
        edgecolors="none",
    )

    N_star = 55.0
    ns_star = 1.0 - 2.0 / N_star
    r_star = 12.0 / (N_star**2)
    star_marker = ax.scatter(
        [ns_star],
        [r_star],
        marker="*",
        s=160,
        color="#756bb1",
        edgecolors="black",
        linewidths=0.6,
        zorder=5,
    )

    ax.set_xlabel(r"$n_s$")
    ax.set_ylabel(r"$r$")
    ax.set_xlim(0.955, 0.975)
    ax.set_yscale("log")
    ax.set_ylim(5e-4, 0.03)
    handles = [
        Patch(facecolor="#a6bddb", edgecolor="none", alpha=0.5, label="Planck 95%"),
        Patch(facecolor="#cbd5e8", edgecolor="none", alpha=0.8, label="Planck 68%"),
        Patch(facecolor="#fde0dd", edgecolor="none", alpha=0.6, label=r"$\alpha$-attractor band"),
        Line2D([], [], marker="*", color="#756bb1", markerfacecolor="#756bb1", markeredgecolor="black", markersize=10, linestyle="None", label="Starobinsky"),
        Line2D([], [], marker="o", color="#1b9e77", markerfacecolor="#1b9e77", markersize=6, linestyle="None", label="ASG posterior"),
    ]
    ax.legend(handles=handles, frameon=False, loc="upper right")
    ax.set_title(r"$n_s$–$r$ comparison")
    ax.grid(True, which="both", ls=":", alpha=0.4)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    for suffix in (".pdf", ".png"):
        fig.savefig(args.output.with_suffix(suffix), dpi=300)
    plt.close(fig)

    quantiles = np.percentile(ns_arr, [16, 50, 84]), np.percentile(r_arr, [16, 50, 84])
    summary = {
        "ns": {
            "p16": float(quantiles[0][0]),
            "p50": float(quantiles[0][1]),
            "p84": float(quantiles[0][2]),
        },
        "r": {
            "p16": float(quantiles[1][0]),
            "p50": float(quantiles[1][1]),
            "p84": float(quantiles[1][2]),
        },
        "n_samples_used": int(len(ns_arr)),
        "n_efolds": args.n_efolds,
    }
    args.output.parent.joinpath("ns_r_summary.json").write_text(json.dumps(summary, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the $n_s$–$r$ comparison figure.")
    parser.add_argument(
        "--asg-chain",
        type=Path,
        default=Path("asg_chain/processed_mar11/asg_chain_mar11_post.csv"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("figures/fig_ns_r_plane"),
        help="Output filename stem (without extension).",
    )
    parser.add_argument("--n-efolds", type=float, default=55.0)
    parser.add_argument("--n-samples", type=int, default=2000)
    args = parser.parse_args()
    plot_ns_r(args)


if __name__ == "__main__":
    main()
