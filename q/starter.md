# Active Screen Gravity — Starter

This repository is the Windows-side control room for the ASG (Active Screen Gravity) inflation campaign. It mirrors the live MontePython/CLASS runs executing on the Linux cluster and hosts the TeX/Markdown manuscripts plus all derived figures, tables, and export artifacts. Use this guide as the single entry point when spinning up new science tasks or handing work across platforms.

## 1. Mission Snapshot

- **Goal:** Demonstrate that RG-threshold running of the Planck mass generates the attractor plateau, confront it with Planck 2018 TT,TE,EE+lowE+lensing+BAO, and deliver a PRD/JCAP-ready manuscript.
- **Active manuscript (English):** `o6/asg_inflation_v4.tex` — fully updated with v15 PolyChord results; compiled PDF at `o6/asg_inflation_v4.pdf`.
- **Active manuscript (Polish):** `o5-theory/asg_inflation_v2_pl.tex` — synced with v15 on 2026-05-09; compiled PDF at `o5-theory/asg_inflation_v2_pl.pdf`.
- **Latest chains:** `o6/chains/asg_polychord_v15/` — PolyChord v1.22.3, nlive=200, ε=0.04, completed 2026-05-09. Legacy MH chains in `l7/chains/` retained for archival comparison.
- **Primary artifacts:** `o6/asg_inflation_v4.tex` + figures in `q/figures/` (junction `o6/figures` → `q/figures`), figure generation script `o6/scripts/generate_figures_v15.py`.

## 2. Directory Map

| Path | Purpose |
| --- | --- |
| `o6/chains/asg_polychord_v15/` | **Current:** PolyChord v15 nested sampling (nlive=200, ε=0.04, 2026-05-09). |
| `o6/asg_inflation_v4.tex` | **Current English manuscript** — v15 posteriors, SO added, author Robert Szymański. |
| `o5-theory/asg_inflation_v2_pl.tex` | **Current Polish manuscript** — synced with v15 on 2026-05-09. |
| `o6/scripts/generate_figures_v15.py` | Figure generation (run from `q/`): physics cut |α_s|<5×10⁻³, ylim fixed. |
| `q/figures/` | All current figures (PDF + PNG). Junction `o6/figures` → `q/figures` required for pdflatex. |
| `l7/chains/` | Legacy MH chains (Mar 09–11); archival reference only. |
| `l1/chains/` | Older ASG/α benchmark chains; do not overwrite. |
| `scripts/` | Legacy Python utilities (`process_chain.py`, `asg_background_diagnostics.py`, `ns_r_plane.py`). |
| `l1/starter.md` | Linux-side ops log (includes MontePython restart recipes). |

## 3. Environment Checklist

### Windows workstation (this repo)

- **Shell:** PowerShell 7+ recommended.
- **Tooling:** `pandoc` (for DOCX), `tectonic.exe` (for pandoc-based PDFs), and MiKTeX/`pdflatex` for `o6/asg_inflation_v4.tex` and `o5-theory/asg_inflation_v2_pl.tex`.
- **Python:** Run diagnostics via `python scripts/...`; no dedicated venv required.
- **Figures:** Confirm every `\includegraphics{figures/...}` file exists before compiling TeX/Markdown exports.

### Linux cluster (MontePython/CLASS runs)

- **Conda env:** `plc311` (see `l1/starter.md` §1) and source `planck_likelihoods_2018/code/plc_3.0/plc-3.01/bin/clik_profile.sh`.
- **Run commands:** Located in `l1/starter.md` (section “How to Restart a Dead Chain”). Always restart with matching `.bestfit` and `.covmat`.
- **Monitoring:** Use `ps aux | grep montepython` plus `awk` snippets in the same starter file to track best-fit log-likelihoods and sample counts.

## 4. Chain Workflow Cheatsheet

1. **Regenerate figures** from PolyChord v15 chain: `python o6/scripts/generate_figures_v15.py` (run from `q/`).
2. **Compile English PDF:** `cd q/o6 && pdflatex -interaction=nonstopmode asg_inflation_v4.tex` (repeat 2× for cross-refs).
3. **Compile Polish PDF:** `cd q/o5-theory && pdflatex -interaction=nonstopmode asg_inflation_v2_pl.tex`.
4. **Junction check:** `o6/figures` and `o5-theory/figures` must both be directory junctions pointing to `q/figures/`. Re-create with `cmd /c "mklink /J <abs_target> <abs_source>"`.
5. **Track work:** Use session `plan.md` + SQL todos for day-to-day status.

## 5. Exporting the Manuscript

### English manuscript (arXiv/PRD draft)

```powershell
cd q/o6
pdflatex -interaction=nonstopmode asg_inflation_v4.tex
pdflatex -interaction=nonstopmode asg_inflation_v4.tex
```

### Polish manuscript

```powershell
cd q/o5-theory
pdflatex -interaction=nonstopmode asg_inflation_v2_pl.tex
pdflatex -interaction=nonstopmode asg_inflation_v2_pl.tex
```

Resolve any missing figures or undefined references before archiving.

## 6. Cross-Platform Tips

- **Line endings:** Keep Markdown in LF to avoid MontePython diffs when syncing back to Linux.
- **Large files:** Chain chunks can exceed 100 MB; avoid committing them. Instead, archive to `zenodo_upload_package/` or shared storage.
- **Backups:** `alpha_chain_prod/`, `asg_chain/`, and `zenodo_upload_package/` hold historic tarballs—leave untouched unless preparing new releases.
- **Session logs:** Update `plan.md` (session state) after major actions so future shifts know current objectives.

## 7. Next Steps Checklist

- **arXiv submission:** Compile both `o6/asg_inflation_v4.tex` and `o5-theory/asg_inflation_v2_pl.tex` cleanly; verify all `figures/` files present; update Zenodo package.
- **Next experiment to watch:** Simons Observatory (2027) — first realistic chance at α_s detection (σ~6×10⁻⁴, S/N~2.5 for ASG median).
- **Future theoretical work:** Identify UV completion linking the F(χ) Gaussian threshold to SM particle spectrum (top quark / Higgs sector connection).
- **If new chains arrive:** Regenerate all 4 figures with `generate_figures_v15.py` (update script paths/parameters first), then recompile both PDFs.

---

## 8. Analiza fizyczna — dlaczego ASG zmienia paradygmat (2026-04-09)

### Zmiana paradygmatu: Grawitacja z tła staje się aktorem
W konwencjonalnym modelu inflacji grawitacja Einsteina jest sztywnym rusztowaniem, na którym "rozpinamy" potencjał inflatonu. Problem polega na tym, że ten potencjał musi być nienaturalnie płaski (*fine-tuning*).

Propozycja ASG (zgodna z nurtem Asymptotic Safety i grawitacji indukowanej) odwraca tę logikę: **Potencjał może być stromy i "brzydki", ale to dynamika grawitacji go "wygładza"**. Mechanizm, w którym efektywny potencjał w ramie Einsteina $U = V/F^2$ dąży do plateau dzięki rosnącej masie Plancka $F(\chi)$, jest matematycznie znacznie bardziej odporny na poprawki kwantowe niż klasyczny inflaton.

### Warunek atraktora ($V'/V \approx 2F'/F$)
Inflacja nie jest "wypadkiem przy pracy" pola skalarnego, ale **punktem równowagi między spadkiem gęstości energii materii a wzrostem sztywności czasoprzestrzeni**. Jeśli ten warunek rzeczywiście wynika z dynamiki FRG (Functional Renormalization Group), to inflacja staje się generyczną cechą grawitacji kwantowej, a nie modelem dodanym "ad hoc" do wyjaśnienia płaskości Wszechświata.

### Most EFT i "odfiltrowanie" ciężkich sektorów
Integrowanie ciężkiego sektora $\xi(\chi)R$ pozwala uniknąć problemu "pustej" grawitacji kwantowej. Jeśli masywne pola (np. z teorii wielkiej unifikacji — GUT) sprzęgają się z krzywizną, to ich wpływ na "biegnięcie" grawitacji jest obliczalny w ramach Efektywnej Teorii Pola. To daje konkretne przewidywania zamiast wolnych parametrów branych "z sufitu".

### CMB jako mikroskop grawitacji kwantowej
Jeśli spectral tilt ($n_s$) i running ($\alpha_s$) to de facto pochodne biegnącej stałej Newtona $G(\mu)$:
- **Dane z Planck/LiteBIRD stają się laboratoriami fizyki wysokich energii**, niedostępnymi dla LHC.
- Zamiast mierzyć "kształt pola", mierzymy **funkcję beta grawitacji**.
- Grawitacja kwantowa nie jest ukryta w skali Plancka — jej ślady są "rozsmarowane" po całym niebie w postaci fluktuacji temperatury.

### Otwarte pytania i wyzwania
1. **Degeneracja modeli:** Kluczem do odróżnienia ASG od α-attraktorów jest **running of running** $\beta_s \simeq -4.2 \times 10^{-5}$ (o rząd większe niż w α-attraktorach). Brak sygnału w $f_{NL}$ przy obecności silnego $\beta_s$ byłby dyskryminującym wzorcem.
2. **Problem progu:** Skala, przy której masa Plancka zaczyna gwałtownie "biec", zależy od spektrum materii. FRG mapping sugeruje, że punkt stały AS *organizuje* biegnięcie, ale konkretna skala progu wymaga modelu cząstek — najsłabsze ogniwo.
3. **Uniwersalność:** Warunek $V'/V \approx 2F'/F$ jest niezależny od formy $\xi$ (geometryczny warunek na pole-structure), ale siła efektu zależy od sprzężenia — stąd multimodalność w posteriorach MCMC ($\bar\beta = 0.02, 0.04, 0.06$).

### Werdykt
Bardzo mocna, spójna fizycznie i inspirująca wizja. Jeśli CMB koduje pochodne stałej Newtona, to nie potrzebujemy akceleratora o energii Plancka — niebo *jest* tym akceleratorem, a fluktuacje temperatury to jego dane eksperymentalne. Kierunek, w którym fizyka teoretyczna musi iść, jeśli chce pozostać nauką empiryczną.

---

## 9. PolyChord v15 — Wyniki (ukończone 2026-05-09)

- **Sampler:** PolyChord v1.22.3, nlive=200, ε=0.04, grade_frac=[2,8], klastrowanie włączone
- **Wyniki:** ln(Z)=-1409.95±0.26, 4876 martwych punktów, ~357k ewaluacji, 1175 równoważonych próbek
- **Klastry:** Dominujący ln(Z₂)=-1409.95±0.26 (μ>3 M_Pl, 99.3% wagi) + drugi ln(Z₁)=-1419.58±0.65 (μ≈2.24, 0.7%)
- **Parametry ASG:** β=0.191±0.017, Δ=0.682±0.157 M_Pl, χ₀=5.887±0.389 M_Pl, μ=5.082±0.905 M_Pl
- **Kara Ockhama:** -20.3 natów; H=14.1 natów; σ=√(H/nlive)=0.266 (spójne z raportowanym ±0.26)
- **ln B:** ≈-10 do -14 vs ΛCDM (silna dyskryminacja na skali Jeffreysa), zgodne z ΔAIC≈13

_Last updated: 2026-05-09. Keep this starter concise—expand only with actionable items relevant to onboarding or recurring operations._
