import argparse
from pathlib import Path
from typing import Dict, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def weighted_resample(df: pd.DataFrame, weights: np.ndarray, n_samples: int = 3000) -> pd.DataFrame:
    probs = weights / weights.sum()
    n = min(len(df), n_samples)
    rng = np.random.default_rng(42)
    indices = rng.choice(len(df), size=n, replace=True, p=probs)
    return df.iloc[indices].reset_index(drop=True)


def weighted_interval(values: np.ndarray, weights: np.ndarray) -> Tuple[float, float, float]:
    order = np.argsort(values)
    v = values[order]
    w = weights[order]
    total = w.sum()
    cdf = (np.cumsum(w) - 0.5 * w) / total
    cdf = np.concatenate(([0.0], cdf, [1.0]))
    v = np.concatenate(([v[0]], v, [v[-1]]))
    q16, median, q84 = np.interp([0.16, 0.5, 0.84], cdf, v)
    return float(q16), float(median), float(q84)


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare ASG and alpha-attractor chains.")
    parser.add_argument("--asg-chain", type=Path, default=Path("asg_chain/processed/asg_chain_post.csv"))
    parser.add_argument("--alpha-chain", type=Path, default=Path("alpha_chain_prod/processed/alpha_chain_post.csv"))
    parser.add_argument("--output-dir", type=Path, default=Path("figures/comparison"))
    parser.add_argument("--basename", default="asg_vs_alpha_hyperparams")
    args = parser.parse_args()

    asg_df = pd.read_csv(args.asg_chain)
    alpha_df = pd.read_csv(args.alpha_chain)

    args.output_dir.mkdir(parents=True, exist_ok=True)

    asg_sample = weighted_resample(asg_df, asg_df["weight"].to_numpy())
    alpha_sample = weighted_resample(alpha_df, alpha_df["weight"].to_numpy(), n_samples=1000)

    fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))

    axes[0].scatter(
        asg_sample["beta"],
        asg_sample["Delta"],
        s=10,
        alpha=0.35,
        color="#1b9e77",
        edgecolors="none",
    )
    axes[0].set_xlabel(r"$\beta$")
    axes[0].set_ylabel(r"$\Delta$")
    axes[0].set_title("ASG hyper-parameters")

    axes[1].scatter(
        alpha_sample["epsilon"],
        alpha_sample["c"],
        s=14,
        alpha=0.5,
        color="#d95f02",
        edgecolors="none",
    )
    axes[1].set_xscale("log")
    axes[1].set_xlabel(r"$\epsilon$")
    axes[1].set_ylabel(r"$c$")
    axes[1].set_title(r"$\alpha$-attractor hyper-parameters")

    asg_weights = asg_df["weight"].to_numpy()
    alpha_weights = alpha_df["weight"].to_numpy()
    q_beta = weighted_interval(asg_df["beta"].to_numpy(), asg_weights)
    q_delta = weighted_interval(asg_df["Delta"].to_numpy(), asg_weights)
    q_eps = weighted_interval(alpha_df["epsilon"].to_numpy(), alpha_weights)
    q_c = weighted_interval(alpha_df["c"].to_numpy(), alpha_weights)

    axes[0].text(
        0.05,
        0.95,
        rf"$\beta$: {q_beta[1]:.3f}$_{{-{q_beta[1]-q_beta[0]:.3f}}}^{{+{q_beta[2]-q_beta[1]:.3f}}}$"
        + "\n"
        + rf"$\Delta$: {q_delta[1]:.3f}$_{{-{q_delta[1]-q_delta[0]:.3f}}}^{{+{q_delta[2]-q_delta[1]:.3f}}}$",
        ha="left",
        va="top",
        transform=axes[0].transAxes,
        fontsize=9,
        bbox=dict(boxstyle="round,pad=0.2", facecolor="white", alpha=0.7),
    )
    axes[1].text(
        0.05,
        0.95,
        rf"$\epsilon$: {q_eps[1]:.3e}$_{{-{q_eps[1]-q_eps[0]:.3e}}}^{{+{q_eps[2]-q_eps[1]:.3e}}}$"
        + "\n"
        + rf"$c$: {q_c[1]:.2f}$_{{-{q_c[1]-q_c[0]:.2f}}}^{{+{q_c[2]-q_c[1]:.2f}}}$",
        ha="left",
        va="top",
        transform=axes[1].transAxes,
        fontsize=9,
        bbox=dict(boxstyle="round,pad=0.2", facecolor="white", alpha=0.7),
    )

    fig.suptitle("ASG vs. $\\alpha$-attractor hyper-parameter support")
    fig.tight_layout(rect=[0, 0, 1, 0.96])

    png_path = args.output_dir / f"{args.basename}.png"
    pdf_path = args.output_dir / f"{args.basename}.pdf"
    fig.savefig(png_path, dpi=200)
    fig.savefig(pdf_path)
    plt.close(fig)

    print(f"Wrote {png_path} and {pdf_path}")


if __name__ == "__main__":
    main()
