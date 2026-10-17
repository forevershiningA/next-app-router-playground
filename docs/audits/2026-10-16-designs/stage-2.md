# Etap 2 — identyfikacja i reguły publikacji

Data: 2026-10-16. Zakończono model danych i reguły etapu 2. Dla niezgodnych i niedostępnych źródeł zapisano decyzję: zachować URL i wstrzymać personalizację do naprawy. Nie oznacza to zatwierdzenia podglądów ani naprawienia wszystkich konfiguracji.

## Zmiany

- Bieżące metadane są źródłem prawdy dla slugów. Rozpoznawanie uwzględnia produkt i kategorię; niejednoznaczny slug bez kontekstu zwraca brak wyniku. Oba rekordy `serpentine-john-11` pozostają pod dotychczasowymi adresami. Brakujący wcześniej wpis `1731472392974` jest rozpoznawany bez historycznej mapy.
- Zachowano obsługę historycznych aliasów i adresów z timestampem. Istniejący mechanizm strony nadal przekierowuje do pełnej ścieżki kanonicznej. Nie zmieniano slugów ani przypisań produktów.
- Galeria, nawigacja klientowa, sitemap i robots szczegółów korzystają z jednej reguły produktu i obecności podglądu. Manifest obrazów jest wejściem do wdrożenia; brak katalogu w runtime nie rozszerza publikacji. Generator zgłasza błąd, jeśli katalog źródłowy nie istnieje.
- Osobny manifest konfiguracji zapisuje rzeczywisty produkt, kształt i ścieżkę tekstury. Model prezentacyjny oddziela kwalifikację do galerii i indeksowania od dostępności konfiguracji oraz zatwierdzenia wizualnego i prywatności.
- Loader i generator korzystają z tej samej kolejności źródeł i walidacji struktury oraz ID. Loader odrzuca HTML, błędne JSON-y i konfigurację innego projektu, próbując kolejnego źródła.
- Usunięto pobieranie wyłączonego z wdrożenia artefaktu `database-exports/rollout-full-skipped-ids-20260324-190828.json`. Nie wpływał na wybór trybu ładowania: dotychczas wszystkie wyniki i tak wybierały `canonical`.

## Wyniki lokalne

| Kontrola | Wynik |
| --- | ---: |
| Rekordy | 3114 |
| Nierozpoznane pełne ścieżki | 0 |
| Projekty dopuszczone do galerii i indeksowania | 2967 |
| Rekordy z pełnym podglądem, niezależnie od produktu | 3040 |
| Konfiguracje strukturalnie dostępne, bez wykrytej rozbieżności produktu | 2966 |
| Konfiguracje wymagające sprawdzenia produktu | 126 |
| Konfiguracje niedostępne lub nieprawidłowe | 22 |

[Raport wszystkich rekordów](stage-2-publication.json) zawiera decyzję publikacyjną, pełną ścieżkę, źródło i powody wymaganej kontroli. `source-ready` potwierdza dostępność i podstawową spójność danych; nie potwierdza kadru, współrzędnych motywów, kompletności wszystkich assetów ani działania całej personalizacji.

Liczba 126 obejmuje niezgodne ID i nieznane produkty, dlatego różni się od 122 samych rozbieżności ID w inwentaryzacji. Nie nadpisywano automatycznie tych danych. Zachowano istniejące dostępne strony; ich indeksowalność nie oznacza zatwierdzenia konfiguracji. Kategorie z udokumentowanym ruchem GSC zachowują dotychczasowe wyjątki od progu liczebności.

## Aktualizacja danych

Po zmianie metadanych, konfiguracji lub podglądów:

1. `pnpm designs:manifests`
2. `pnpm designs:manifests:check`
3. `pnpm designs:publication-report`
4. Dołączyć zmienione manifesty do commita.

Manifesty pozostają w `lib/`; nie zależą od wyłączanych z Vercel katalogów audytu. Plik pełnych konfiguracji nie jest importowany do nawigacji klientowej. Raport etapu 1 pozostaje historycznym pomiarem; skrypt audytu obsługuje `--out=...` dla kolejnych pomiarów.

## Kontrole i pozostałe prace

Przeszły: kontrola typów TypeScript, ESLint zmienionych modułów, zgodność manifestów ze źródłami oraz raport rozpoznawania wszystkich 3114 tras. Nie wykonano pełnego buildu ani nowych kontroli przeglądarkowych produkcji.

## Uzupełnienie: dowody i egzekwowanie decyzji

Model źródła obejmuje wersję konfiguracji, rzeczywiste wymiary, liczby elementów układu oraz nazwę materiału tylko przy dokładnym dopasowaniu tekstury do katalogu. Brak potwierdzenia oznacza `null`. Daty aktualizacji treści i powody wyróżnienia pozostają nieznane, zamiast być wyprowadzane z timestampu ID. Liczba istniejących zdjęć czy motywów nie oznacza zatwierdzenia wszystkich opcji edytora. Opis modelu jest szkicem; nie został automatycznie opublikowany jako nowy tekst SEO.

Porównano pierwszy rekord oryginalnego zapisu legacy z konfiguracją i katalogiem produktów. Kierunki przeglądu:

- 45 rekordów: oryginał zgadza się z konfiguracją, sprawdzić metadane.
- 73 rekordy: oryginał zgadza się z metadanymi, sprawdzić konwersję.
- 8 rekordów: produkt lub relacja źródeł pozostaje niejednoznaczna.
- 22 rekordy: brak dostępnej, prawidłowej konfiguracji.

Nie są to automatyczne werdykty o właściwym produkcie: historyczne produkty mogły zostać zastąpione. [Kolejka przeglądu](stage-2-review-queue.json) zapisuje dowody i decyzję dla wszystkich 148 rekordów.

Blokada jest egzekwowana przez CTA strony przed i po hydratacji oraz wspólny `loadDesignById`, także dla popupu Load Design. Nieznane ID nie uzyskuje domyślnej zgody. Przy otwieraniu strony dodatkowo porównywany jest produkt faktycznie pobranego JSON-a z produktem strony przed zmianą store; analogiczna kontrola dotyczy fallbacku legacy. Pełny manifest źródeł pozostaje po stronie serwera, a klient dostaje kompaktowy manifest statusów.

Spośród projektów w galerii wstrzymano personalizację 64 rekordów. Wszystkie 36 rekordów pilotażu zachowuje jednoznaczną trasę i status dostępnego źródła; nie jest to potwierdzenie poprawnego renderowania.

[Reguły publikacji](../../backlog/design-publication-policy.md) określają osobno kategorię główną, tagi, zachowanie istniejących URL-i, personalizację, treści demonstracyjne i przegląd prywatności. Dotychczasowa publikacja nie otrzymała automatycznej akceptacji prywatności. Publiczne źródłowe JSON-y także wymagają przeglądu przed zatwierdzeniem nowej wersji wzorca.

## Dalsze etapy

Etap 3: podglądy i zasoby demonstracyjne pilotażu. Etap 5: naprawy danych i zgodność z edytorem, w tym zamknięcie kolejki wstrzymanych rekordów. Etap 6: zatwierdzone opisy, metadane i parametry publiczne. Nie zdejmować blokad samą edycją manifestu. Przed produkcją pozostaje odbiór funkcjonalny z etapu 7; w tej aktualizacji wykonano kontrole statyczne i raport danych, bez uruchamiania testów przeglądarkowych ani pełnego buildu.
