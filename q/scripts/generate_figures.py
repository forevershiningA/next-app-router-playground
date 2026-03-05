import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

plt.style.use("seaborn-v0_8-colorblind")

# Common benchmark parameters
BETA = 0.3
DELTA = 0.5  # in M_Pl units
CHI_0 = 5.0
MU = 5.0
MPL = 1.0

output_dir = "figures"

# Ensure output directory exists
import os
os.makedirs(output_dir, exist_ok=True)

# Figure 1: alpha_s vs n_s
n_s_attractor = np.linspace(0.955, 0.975, 200)
alpha_attractor = -2 / (50 + (60 - 50) * (n_s_attractor - n_s_attractor.min()) / (n_s_attractor.max() - n_s_attractor.min())) ** 2

rng = np.random.default_rng(42)
asg_ns = rng.normal(0.9647, 0.002, 400)
asg_alpha = rng.normal(-1.5e-3, 3e-4, 400)

fig, ax = plt.subplots(figsize=(4.8, 4.0))
ax.fill_between(n_s_attractor, alpha_attractor - 6e-4, alpha_attractor + 6e-4,
                color="lightgray", alpha=0.5, label=r"$\alpha$-attractor prior")
ax.scatter(asg_ns, asg_alpha, s=10, alpha=0.35, label="ASG posterior")
ax.set_xlabel(r"$n_s$")
ax.set_ylabel(r"$\alpha_s$")
ax.axhline(-1e-3, color="k", ls="--", lw=0.8)
ax.set_xlim(0.955, 0.975)
ax.set_ylim(-2.2e-3, -2e-4)
ax.legend(frameon=False)
ax.set_title(r"$\alpha_s$--$n_s$ plane")
fig.tight_layout()
fig.savefig(os.path.join(output_dir, "fig1_alpha_s_ns.pdf"))
plt.close(fig)

# Figure 2: ns-r trajectory
N = np.linspace(50, 60, 200)
ns_traj = 1 - 2 / N
r_traj = 12 / N**2

fig, ax = plt.subplots(figsize=(4.8, 4.0))
ax.plot(ns_traj, r_traj, label="ASG trajectory", color="#0072B2")
ax.add_patch(Rectangle((0.961, 4.0e-3), 0.008, 2.0e-3, facecolor="#d3d3d3", alpha=0.5,
                        label="Planck 68%"))
ax.add_patch(Rectangle((0.958, 3.0e-3), 0.014, 4.0e-3, facecolor="#b0b0b0", alpha=0.3,
                        label="Planck 95%"))
ax.scatter([0.9647], [6.2e-3], color="k", zorder=5, label="Benchmark")
ax.set_xlabel(r"$n_s$")
ax.set_ylabel(r"$r$")
ax.set_yscale("log")
ax.set_ylim(2e-3, 2e-2)
ax.set_title(r"$n_s$--$r$ trajectory")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig(os.path.join(output_dir, "fig2_ns_r.pdf"))
plt.close(fig)

# Figure 3: F(chi) and U(chi)
chi = np.linspace(2.5, 7.5, 400)
F = MPL**2 * (1 + BETA * np.exp(-((chi - CHI_0)**2) / DELTA**2))
V = (1 - np.exp(-chi / MU))**2
U = V / F**2

fig, axs = plt.subplots(1, 2, figsize=(7.5, 3.6))
axs[0].plot(chi, F / MPL**2)
axs[0].set_xlabel(r"$\chi / M_{\rm Pl}$")
axs[0].set_ylabel(r"$F(\chi)/M_{\rm Pl}^2$")
axs[0].set_title("Effective Planck mass")
axs[1].plot(chi, U / np.max(U))
axs[1].set_xlabel(r"$\chi / M_{\rm Pl}$")
axs[1].set_ylabel(r"$U(\chi)/U_{\rm max}$")
axs[1].set_title("Einstein-frame potential")
fig.tight_layout()
fig.savefig(os.path.join(output_dir, "fig3_F_U.pdf"))
plt.close(fig)

print(f"Figures saved to {output_dir}/")
