#!/usr/bin/env python3
"""
generate_figures_v15.py
Generate all 4 updated figures for asg_inflation_v4.tex from the PolyChord v15
equal-weight posterior (1,175 samples, ndead=4876).

Run from q/ :
    python o6/scripts/generate_figures_v15.py

Outputs (all to q/figures/):
    asg_triangle_polychord.{pdf,png}   — corner plot of (beta, Delta, chi0, mu)
    fig_ns_r_plane.{pdf,png}           — n_s–r comparison with Planck + alpha-attractor band
    fig1_alpha_s_ns.{pdf,png}          — alpha_s–n_s plane
    fig3_F_U.{pdf,png}                 — F(chi) and U(chi) at MH best-fit
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Patch
from matplotlib.lines import Line2D
import corner

# ── paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# o6/scripts/ -> o6/ -> q/
ROOT = os.path.normpath(os.path.join(SCRIPT_DIR, "..", ".."))
EW_FILE = os.path.join(
    SCRIPT_DIR, "..", "chains", "asg_polychord_v15",
    "PC", "asg_polychord_v15_equal_weights.txt",
)
FIG_DIR = os.path.join(ROOT, "figures")
os.makedirs(FIG_DIR, exist_ok=True)

try:
    plt.style.use("seaborn-v0_8-colorblind")
except OSError:
    pass  # older matplotlib fallback

# ── load equal-weight posterior ───────────────────────────────────────────────
# column layout (from asg_polychord_v15.paramnames):
#  0 = weight (all 1 for equal-weights), 1 = -2*logL,
#  2 = omega_b, 3 = omega_cdm, 4 = 100*theta_s, 5 = tau_reio,
#  6 = beta,   7 = Delta,      8 = chi0,         9 = mu,
# 10+ = nuisance parameters
print("Loading v15 equal-weight posterior …")
data = np.loadtxt(EW_FILE)
beta_arr  = data[:, 6]
delta_arr = data[:, 7]
chi0_arr  = data[:, 8]
mu_arr    = data[:, 9]
N_samp = len(beta_arr)
print(f"  {N_samp} samples loaded")
print(f"  beta  = {beta_arr.mean():.4f} ± {beta_arr.std():.4f}")
print(f"  Delta = {delta_arr.mean():.4f} ± {delta_arr.std():.4f}")
print(f"  chi0  = {chi0_arr.mean():.4f} ± {chi0_arr.std():.4f}")
print(f"  mu    = {mu_arr.mean():.4f}  ± {mu_arr.std():.4f}")


# ── slow-roll engine (returns n_s, r, alpha_s) ────────────────────────────────
def slow_roll_observables(beta, delta, chi0, mu, N_star=55.0, n_grid=4096):
    """Return (n_s, r, alpha_s) at N_star e-folds before inflation ends,
    or (None, None, None) if the background does not integrate cleanly."""
    if delta <= 0 or mu <= 0:
        return None, None, None

    phi_hi = float(max(chi0 + 5.0 * delta, mu * 12.0, 15.0))
    phi = np.linspace(0.05, phi_hi, n_grid)
    dphi = phi[1] - phi[0]

    e_arg = np.exp(np.clip(-phi / mu, -700.0, 0.0))
    V  = (1.0 - e_arg) ** 2
    dV = 2.0 * (1.0 - e_arg) * e_arg / mu

    gauss = np.exp(-((phi - chi0) ** 2) / delta**2)
    F  = 1.0 + beta * gauss
    dF = -2.0 * beta * (phi - chi0) / delta**2 * gauss

    K   = 1.0 / F + 1.5 * (dF / F) ** 2
    U   = V / F**2
    dU  = dV / F**2 - 2.0 * V * dF / F**3
    d2U = np.gradient(dU, dphi)
    d3U = np.gradient(d2U, dphi)

    with np.errstate(divide="ignore", invalid="ignore"):
        eps_arr = np.where(
            (U > 1e-30) & (K > 1e-30),
            dU**2 / (2.0 * K * U**2),
            1e10,
        )

    # find phi_end where eps = 1
    phi_end = phi[-1]
    for i in range(1, n_grid):
        if eps_arr[i] >= 1.0:
            phi_end = phi[i]
            break
    idx_end = max(1, int(np.searchsorted(phi, phi_end)) - 1)

    with np.errstate(divide="ignore", invalid="ignore"):
        dN_dphi = np.where(dU > 1e-30, K * U / dU, 0.0)

    # integrate e-folds from phi_end outward (phi increasing = rolling toward
    # large phi, but inflation proceeds from large phi to phi_end)
    N_cum = np.zeros(n_grid)
    for i in range(idx_end + 1, n_grid):
        N_cum[i] = N_cum[i - 1] + 0.5 * (dN_dphi[i] + dN_dphi[i - 1]) * dphi

    if N_cum[-1] < N_star:
        return None, None, None

    phi_star = float(np.interp(N_star, N_cum, phi))
    eps   = max(float(np.interp(phi_star, phi, eps_arr)), 1e-14)
    K_s   = max(float(np.interp(phi_star, phi, K)),   1e-30)
    U_s   = max(float(np.interp(phi_star, phi, U)),   1e-30)
    dU_s  = float(np.interp(phi_star, phi, dU))
    d2U_s = float(np.interp(phi_star, phi, d2U))
    d3U_s = float(np.interp(phi_star, phi, d3U))

    eta     = d2U_s / (K_s * U_s)
    xi      = dU_s * d3U_s / (K_s**2 * U_s**2)
    n_s     = float(np.clip(1.0 - 6.0 * eps + 2.0 * eta, 0.90, 1.05))
    r       = float(np.clip(16.0 * eps, 0.0, 0.5))
    alpha_s = float(16.0 * eps * eta - 24.0 * eps**2 - 2.0 * xi)
    return n_s, r, alpha_s


# compute observables across the full posterior
print("Computing (n_s, r, alpha_s) for each sample …")
ns_list, r_list, alpha_list = [], [], []
for i, (b, d, c, m) in enumerate(zip(beta_arr, delta_arr, chi0_arr, mu_arr)):
    if i % 100 == 0:
        sys.stdout.write(f"  {i}/{N_samp}\r")
        sys.stdout.flush()
    ns, r, al = slow_roll_observables(b, d, c, m)
    if ns is not None:
        ns_list.append(ns)
        r_list.append(r)
        alpha_list.append(al)

ns_arr    = np.array(ns_list)
r_arr     = np.array(r_list)
alpha_arr = np.array(alpha_list)
print(f"\n  {len(ns_arr)}/{N_samp} samples converged")
print(f"  n_s    med = {np.median(ns_arr):.4f}")
print(f"  r      med = {np.median(r_arr):.4e}")
print(f"  alpha_s med = {np.median(alpha_arr):.2e}")

# Physics cut for alpha_s plot: discard samples where |alpha_s| > 5e-3
# (85 outliers arise from numerical noise in the triple-gradient ξ term)
alpha_mask   = np.abs(alpha_arr) < 5e-3
ns_phys      = ns_arr[alpha_mask]
r_phys       = r_arr[alpha_mask]
alpha_phys   = alpha_arr[alpha_mask]
print(f"  alpha_s physics cut: {alpha_mask.sum()} / {len(ns_arr)} samples kept")
print(f"  alpha_s [cut] med={np.median(alpha_phys):.2e}  p16={np.percentile(alpha_phys,16):.2e}  p84={np.percentile(alpha_phys,84):.2e}")


# ── Fig A: triangle plot ──────────────────────────────────────────────────────
print("\n[1/4] Triangle plot …")
samples_4d = np.column_stack([beta_arr, delta_arr, chi0_arr, mu_arr])
labels = [
    r"$\beta$",
    r"$\Delta / M_{\rm Pl}$",
    r"$\chi_0 / M_{\rm Pl}$",
    r"$\mu / M_{\rm Pl}$",
]
fig_tri = corner.corner(
    samples_4d,
    labels=labels,
    quantiles=[0.16, 0.50, 0.84],
    show_titles=True,
    title_fmt=".3f",
    title_kwargs={"fontsize": 9},
    smooth=1.0,
    smooth1d=1.0,
    color="#1b9e77",
)
fig_tri.suptitle(
    r"ASG posterior — PolyChord v15  ($n_{\rm live}=200$,  1175 equal-weight samples)",
    y=1.02, fontsize=10,
)
for suf in (".pdf", ".png"):
    fig_tri.savefig(
        os.path.join(FIG_DIR, f"asg_triangle_polychord{suf}"),
        dpi=200, bbox_inches="tight",
    )
plt.close(fig_tri)
print("  -> asg_triangle_polychord.{pdf,png}")


# ── Fig B: n_s–r plane ────────────────────────────────────────────────────────
print("[2/4] n_s–r plane …")
fig, ax = plt.subplots(figsize=(5.4, 4.6))

# Planck 2018 TT,TE,EE+lowE+lensing approximate contours
ns_c, r_c  = 0.9649, 0.004
sig_ns, sig_r = 0.0042, 0.010
for nstd, alpha_v, fc in [(2, 0.45, "#a6bddb"), (1, 0.85, "#cbd5e8")]:
    ax.add_patch(
        Ellipse((ns_c, r_c), 2 * nstd * sig_ns, 2 * nstd * sig_r,
                facecolor=fc, edgecolor="none", alpha=alpha_v)
    )

# α-attractor band (10^-3 ≤ α ≤ 1)
N_aa = np.linspace(50, 60, 256)
ax.fill_between(
    1.0 - 2.0 / N_aa,
    12.0 * 1e-3 / N_aa**2,
    12.0 * 1.0  / N_aa**2,
    color="#fde0dd", alpha=0.65,
)

# ASG v15 posterior cloud
ax.scatter(ns_arr, r_arr, s=8, alpha=0.35, color="#1b9e77", edgecolors="none")

# Starobinsky / universal attractor point
N_s = 55.0
ax.scatter([1.0 - 2.0/N_s], [12.0/N_s**2],
           marker="*", s=160, color="#756bb1",
           edgecolors="black", linewidths=0.6, zorder=5)

handles = [
    Patch(facecolor="#a6bddb", edgecolor="none", alpha=0.45, label="Planck 95%"),
    Patch(facecolor="#cbd5e8", edgecolor="none", alpha=0.85, label="Planck 68%"),
    Patch(facecolor="#fde0dd", edgecolor="none", alpha=0.65, label=r"$\alpha$-attractor band"),
    Line2D([], [], marker="*", color="#756bb1", markerfacecolor="#756bb1",
           markeredgecolor="black", markersize=10, linestyle="None", label="Starobinsky"),
    Line2D([], [], marker="o", color="#1b9e77", markerfacecolor="#1b9e77",
           markersize=6, linestyle="None", label="ASG posterior (v15)"),
]
ax.legend(handles=handles, frameon=False, loc="upper right", fontsize=8)
ax.set_xlabel(r"$n_s$", fontsize=12)
ax.set_ylabel(r"$r$", fontsize=12)
ax.set_xlim(0.955, 0.975)
ax.xaxis.set_major_locator(plt.MultipleLocator(0.005))
ax.set_yscale("log")
ax.set_ylim(5e-4, 0.09)
ax.set_title(r"$n_s$–$r$ comparison (PolyChord v15)", fontsize=11)
ax.grid(True, which="both", ls=":", alpha=0.4)
fig.tight_layout()
for suf in (".pdf", ".png"):
    fig.savefig(os.path.join(FIG_DIR, f"fig_ns_r_plane{suf}"), dpi=300)
plt.close(fig)
print("  -> fig_ns_r_plane.{pdf,png}")


# ── Fig C: alpha_s–n_s plane ──────────────────────────────────────────────────
print("[3/4] alpha_s–n_s plane …")
N_aa2 = np.linspace(50, 60, 256)
ns_aa2    = 1.0 - 2.0 / N_aa2
alpha_aa2 = -2.0 / N_aa2**2   # α-attractor central value

fig, ax = plt.subplots(figsize=(4.8, 4.0))
ax.fill_between(
    ns_aa2, alpha_aa2 - 6e-4, alpha_aa2 + 6e-4,
    color="lightgray", alpha=0.65, label=r"$\alpha$-attractor band ($\pm6\times10^{-4}$)",
)
ax.scatter(
    ns_phys, alpha_phys,
    s=8, alpha=0.40, color="#1b9e77", edgecolors="none",
    label="ASG posterior (v15)",
)
ax.axhline(-1e-3, color="#d62728", ls="--", lw=0.9,
           label=r"$\alpha_s = -10^{-3}$")
ax.set_xlabel(r"$n_s$", fontsize=12)
ax.set_ylabel(r"$\alpha_s$", fontsize=12)
ax.set_xlim(0.955, 0.975)
ax.xaxis.set_major_locator(plt.MultipleLocator(0.005))
ax.set_ylim(-3.5e-3, 1.5e-3)
ax.legend(frameon=False, fontsize=8)
ax.set_title(r"$\alpha_s$–$n_s$ plane (PolyChord v15)", fontsize=11)
ax.grid(True, ls=":", alpha=0.4)
fig.tight_layout()
for suf in (".pdf", ".png"):
    fig.savefig(os.path.join(FIG_DIR, f"fig1_alpha_s_ns{suf}"), dpi=300)
plt.close(fig)
print("  -> fig1_alpha_s_ns.{pdf,png}")


# ── Fig D: F(chi) and U(chi) at MH best-fit ───────────────────────────────────
print("[4/4] F(chi) / U(chi) at best-fit …")
# MH best-fit point (used in Appendix A and Table 1 text)
BETA_BF, DELTA_BF, CHI0_BF, MU_BF = 0.0392, 1.597, 3.807, 2.242

chi = np.linspace(0.5, 10.0, 800)
gauss_bf = np.exp(-((chi - CHI0_BF)**2) / DELTA_BF**2)
F_bf = 1.0 + BETA_BF * gauss_bf
V_bf = (1.0 - np.exp(-chi / MU_BF))**2
U_bf = V_bf / F_bf**2

fig, axs = plt.subplots(1, 2, figsize=(7.5, 3.6))

axs[0].plot(chi, F_bf, color="#0072B2", lw=1.8)
axs[0].axvline(CHI0_BF, ls=":", color="gray", lw=0.9, label=r"$\chi_0$")
axs[0].set_xlabel(r"$\chi \;[M_{\rm Pl}]$", fontsize=11)
axs[0].set_ylabel(r"$F(\chi) / M_{\rm Pl}^2$", fontsize=11)
axs[0].set_title("Effective Planck mass", fontsize=11)
axs[0].legend(frameon=False, fontsize=9)
axs[0].grid(True, ls=":", alpha=0.4)

axs[1].plot(chi, U_bf / np.nanmax(U_bf), color="#d55e00", lw=1.8)
axs[1].axvline(CHI0_BF, ls=":", color="gray", lw=0.9, label=r"$\chi_0$")
axs[1].set_xlabel(r"$\chi \;[M_{\rm Pl}]$", fontsize=11)
axs[1].set_ylabel(r"$U(\chi) / U_{\max}$", fontsize=11)
axs[1].set_title("Einstein-frame potential", fontsize=11)
axs[1].legend(frameon=False, fontsize=9)
axs[1].grid(True, ls=":", alpha=0.4)

fig.suptitle(
    (rf"MH best-fit: $\beta={BETA_BF}$,  $\Delta={DELTA_BF}\,M_{{\rm Pl}}$,"
     rf"  $\chi_0={CHI0_BF}\,M_{{\rm Pl}}$,  $\mu={MU_BF}\,M_{{\rm Pl}}$"),
    fontsize=9, y=1.01,
)
fig.tight_layout()
for suf in (".pdf", ".png"):
    fig.savefig(os.path.join(FIG_DIR, f"fig3_F_U{suf}"), dpi=300)
plt.close(fig)
print("  -> fig3_F_U.{pdf,png}")

print(f"\n✓ All figures written to {FIG_DIR}")
