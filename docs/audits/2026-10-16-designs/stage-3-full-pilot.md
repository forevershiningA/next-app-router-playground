# Etap 3 — przegląd całego pilotażu

Data: 2026-10-16. **Etap pozostaje w toku. Żaden nowy obraz nie został zatwierdzony ani podłączony do galerii.**

## Wyniki

Przetworzono pozostałe 33 projekty i zachowano wcześniejszą próbkę trzech. Po naprawie gotowości podstawy 34 z 36 projektów mają po sześć wariantów WebP: 204 pliki, 15 656 216 bajtów. Dwa eksporty zatrzymała kontrola wymiarów produktu. Jeden detal przekracza budżet rozmiaru pliku, jeden projekt ma błąd krawędzi kadru, a jeden z wygenerowanych projektów zarejestrował dwa błędy `Failed to fetch`.

Obejrzano wszystkie 34 widoki główne na planszach przy szerokości około 480 px. To przegląd kandydatów z tekstami syntetycznymi, nie odbiór zgodności metryki oryginalnych napisów ani pełnego Designer flow.

| Wynik oceny | Projekty |
| --- | ---: |
| Naprawa kompozycji | 20 |
| Dokładniejszy przegląd kompozycji | 4 |
| Przegląd detalu | 8 |
| Przegląd czytelności | 2 |
| Eksport zablokowany przez wymiary | 2 |

Ocena każdego ID, skróty źródeł/runtime/obrazów i błędy: [review.json](preview-candidates/review.json). Zachowana poprzednia ocena próbki: [review-three-project-sample.json](preview-candidates/review-three-project-sample.json).

Plansze: [1](preview-candidates/review-sheet-1.webp), [2](preview-candidates/review-sheet-2.webp), [3](preview-candidates/review-sheet-3.webp), [4](preview-candidates/review-sheet-4.webp), [5](preview-candidates/review-sheet-5.webp), [6](preview-candidates/review-sheet-6.webp). [Porównanie ze starymi podglądami](preview-candidates/comparison.webp). Plansze zawierają wyłącznie projekty z obrazami, dwa zatrzymane ID są w raporcie JSON.

## Naprawa gotowości podstawy

Pięć projektów zatrzymywało się z `loading: false`, lecz `baseSwapping: true`: 1746812049290, 1735640054602, 1742241960304, 1754588883155, 1739156026915. Setter materiału oznaczał zmianę jako rozpoczętą również przy niezmienionej teksturze i ukrytej podstawie. W takich sytuacjach nie ma nowego ładowania, które mogłoby zakończyć oczekiwanie.

Setter zachowuje oczekującą rzeczywistą zmianę, ale nie rozpoczyna jej ponownie dla tego samego URL-a. Ukryta podstawa nie zgłasza oczekiwania; jej wyłączenie kończy oczekiwanie na nieobecny komponent. Ponowne renderowanie wszystkich pięciu projektów zakończyło się poprawnie bez wymuszania flag przez generator.

Fingerprint runtime obejmuje teraz również oba zmienione moduły store. Manifest zachowuje rekordy poprzednich partii i zastępuje tylko ponawiane ID; poszczególne rekordy mogą wskazywać różne wersje runtime. Bieżący przegląd jest powiązany z konkretnym obrazem przez SHA-256.

## Kolejka napraw

1. Wystające napisy, motywy i portrety: ustalić przyczynę na podstawie źródła i zachowania edytora. Zastępcze słowa nie mają identycznych szerokości glifów; nie każda kolizja dowodzi błędu źródłowego projektu. Nie zmniejszać automatycznie wszystkiego do obrysu.
2. Dwie tablice: 1699465479477 ma źródłową wysokość 406,4 mm, a 1667393544888 — 432 mm. Obie po załadowaniu mają 400 mm. Sprawdzić limity/wybór kształtu i kolejność importu; nie omijać ograniczeń produktu bez ustalenia przyczyny.
3. Sprawdzić mapowanie orientacji tablic nazwanych landscape, które w renderze wyglądają pionowo (1681861707101, 1665542626618, 1681860302781).
4. 1650336552725: portret nad kamieniem i krawędzią kadru. 1715466300935: wystające napisy oraz dwa błędy pobierania wymagające rozpoznania zasobu.
5. 1718041672695: detal 1600 px przekracza 300 KB nawet po próbach kompresji; zmienić wybór detalu lub świadomie ocenić jakość, zachowując źródłowy obraz.
6. Naturalne teksty demonstracyjne, kontrast, materiały, przydatne zbliżenia, prywatność źródeł i zgodność z Designerem nadal wymagają odbioru. Dopiero potem wybór okładek kategorii i publikacja.

Kontrola TypeScript, ESLint obu modułów store oraz obu skryptów (z `--no-ignore`) i `git diff --check` zakończyły się poprawnie. Nie uruchamiano testów jednostkowych/E2E ani pełnego buildu. Lokalny serwer renderujący zatrzymano po wykonaniu partii.
