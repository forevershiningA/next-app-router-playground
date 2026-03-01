## Running the RG-threshold model in CLASS

This repository allows a complete reproduction of the inflationary observables presented in the paper. The goal is to verify that the enhanced running arises from the full Mukhanov–Sasaki evolution rather than from the slow-roll approximation.

---

### 1. Install CLASS

```bash
git clone https://github.com/lesgourg/class_public.git
cd class_public
make -j
```

---

### 2. Add the potential

Copy the provided patch:

```
class_patch/primordial_RG_threshold.c
```

into

```
source/primordial.c
```

inside the function

```
primordial_inflation_potential(...)
```

Recompile:

```bash
make clean
make -j
```

---

### 3. Run the benchmark point

```bash
./class params_RG.ini
```

---

### 4. Expected output

CLASS prints:

```
n_s ≈ 0.959
r ≈ 4×10^-3
alpha_s ≈ −(1.5–2.0)×10^-3
```

Agreement at the level Δα_s ≲ 10^-4 with the analytical prediction confirms that the large running originates from the RG-threshold dynamics.
