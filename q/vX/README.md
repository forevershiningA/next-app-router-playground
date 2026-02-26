# ASG MCMC Reproducibility Repository

Repozytorium wspomagające preprint:
**Active Screen Gravity: Running Planck Mass as the Origin of the Inflationary Attractor**
(ASG Research Collective, 2026-02-25)

Zawartość repozytorium:
- `mcmc_configs/` – pliki konfiguracyjne MontePython (.param, .ini)
- `chains/` – przykładowe łańcuchy MCMC (ASCII format)
- `analysis/` – przykładowe wyniki GetDist (margestats.dat itp.)

## Uruchomienie MontePython (przykład)
1. Zainstaluj MontePython v3.5+ i CLASS v3.2+
2. Skopiuj pliki do odpowiednich katalogów MontePython
3. Uruchom:
   ```
   montepython -p base_ASG.param -o chains/ASG_run -N 500000 --update 100
   ```
4. Analiza wyników (GetDist):
   ```
   getdist chains/ASG_run*.txt --ignore_rows 0.2
   ```

Konwergencja (placeholder):
- Gelman-Rubin R-1 < 0.01
- Neff > 1700–2500 na parametr
- Acceptance rate ~24%
- Burn-in 20%

Licencja: CC-BY-4.0
Kontakt: asg.contact@research.org
Zenodo DOI: [do uzupełnienia]
