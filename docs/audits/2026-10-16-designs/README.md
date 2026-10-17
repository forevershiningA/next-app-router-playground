# Etap 1 — punkt wyjścia galerii projektów

Data: 2026-10-16. Plan: [designs-improvement-plan.md](../../backlog/designs-improvement-plan.md).

Etap 1 zakończony jako inwentaryzacja i wybór pilotażu naprawczego. Audyt nie zatwierdza wszystkich projektów do publikacji ani nie oznacza zakończenia napraw. Zmiany w tej partii dotyczą narzędzi audytu i dokumentacji.

## Zakres i dowody

- Inwentaryzacja wszystkich 3114 rekordów z lokalnych metadanych.
- Dekodowanie dużych obrazów i miniatur, kontrola konfiguracji według kolejności loadera, ID produktu, literalnych lokalnych referencji do assetów oraz rozpoznawania slugów.
- Porównanie obrazów przez hash pliku i przybliżone podobieństwo miniatur. Porównanie konfiguracji przez fingerprint produktu, komponentów i elementów; podobieństwo wymaga oceny.
- Analiza nowego eksportu gsc/2026-10-16, obejmującego 2026-07-15–2026-10-14.
- Osiem obserwacji publicznych stron: cztery poziomy galerii na desktopie 1440 × 1000 i mobile 390 × 844.
- Trzy izolowane przejścia strona wzoru → Designer. Nie zapisywano projektów ani nie tworzono zamówień. Ruch telemetryczny audytu był blokowany.
- Ocena wizualna plansz wszystkich 36 kandydatów pilotażu i reprezentatywnych zrzutów stron.

Wyniki: [catalog-inventory.json](catalog-inventory.json), [gsc-baseline.json](gsc-baseline.json), [browser-baseline.json](browser-baseline.json). Wybór projektów: [pilot.json](pilot.json). Ręczne obserwacje: [visual-review.json](visual-review.json).

## Stan katalogu

| Pomiar lokalny                                                                     |   Wynik |
| ---------------------------------------------------------------------------------- | ------: |
| Wszystkie projekty                                                                 |    3114 |
| Typy produktów / nazwy kategorii                                                   | 17 / 35 |
| Pary produkt–kategoria                                                             |     245 |
| Projekty dopuszczone przez aktualne getSeoReadyDesigns()                           |    2967 |
| Projekty z dozwolonym indeksowaniem strony szczegółowej według allowlisty produktu |    3036 |
| Kategorie dopuszczone do indeksowania przez obecną regułę                          |     115 |
| Dostępne i parsowalne konfiguracje wybierane według loadera                        |    3092 |
| Kandydaci bez wykrytych problemów plików, ID i ścieżek w aktualnej galerii         |    2846 |

**2967 i 3036 opisują reguły źródłowe, a nie liczbę stron w indeksie Google.** Rozbieżność dotyczy 69 projektów dopuszczonych przez metadane strony szczegółowej, ale pomijanych przez lokalną regułę galerii z obrazami. Na produkcyjnym /designs licznik pokazuje 3036; na poziomie produktu widać inne filtrowanie. Do sprawdzenia: wspólna polityka publikacji, manifest obrazów w środowisku serwerowym i spójność cache ISR.

| Problem lub sygnał do weryfikacji                           | Cały zbiór | Wśród 2967 projektów aktualnej galerii |
| ----------------------------------------------------------- | ---------: | -------------------------------------: |
| Brak dużego obrazu                                          |         74 |                                      0 |
| Brak miniatury                                              |         74 |                                      0 |
| Brak konfiguracji lub niepoprawny JSON na ścieżkach runtime |         22 |                                      0 |
| Różne ID produktu w metadanych i konfiguracji               |        122 |                                     64 |
| Brak literalnego lokalnego assetu wskazanego w konfiguracji |         70 |                                     55 |
| ID produktu nieobecne w bieżącym katalogu aplikacji         |         59 |                                      1 |
| Slug nie zwraca oczekiwanego rekordu                        |          2 |                                      2 |

Problemy mogą dotyczyć tych samych rekordów. Rozbieżność ID i nieobecna literalna ścieżka są sygnałami do sprawdzenia, nie automatycznym dowodem, że cały projekt nie działa. Loader może mapować stare tekstury lub używać danych legacy. Dostępny JSON nie dowodzi poprawnego renderowania.

Nie wykryto obrazów uznanych za całkowicie puste przez zastosowany próg ani identycznych plików miniatur. Brak identycznego hasha nie wyklucza wizualnej redundancji. Wykryto **81 par podobnych miniatur** przy odległości dHash ≤ 4 w obrębie tego samego produktu i kształtu. To kandydaci do przeglądu, nie podstawa do automatycznego usuwania.

## Tożsamość projektów — pierwsze naprawy

1. Slug serpentine-john-11 występuje dla ID 1679621793652 i 1721004698568 w różnych kategoriach produktu laser-etched-headstone. Globalne wyszukiwanie po samym slugu nie rozróżnia tych projektów.
2. Rekord 1731472392974 również nie jest prawidłowo rozpoznawany przez aktualną mapę slugów. Pełny adres i źródła są w inwentaryzacji.
3. Przykładowe rozbieżności produktu: 1665819192210 ma ID 5 w metadanych i 52 w konfiguracji; 1586758440953 ma odpowiednio 5 i 30. Trzeba odróżnić stare mapowania od faktycznego otwierania innego produktu.
4. Projekt 1683625180618 jest dopuszczony do galerii pets, ale jego ID produktu 102 nie występuje w bieżącym katalogu.

## Aktualne dane wyszukiwania

Eksport dotyczy **wyników tekstowych WWW**. Zestawienia stron, zapytań, urządzeń i krajów obejmują całe trzy miesiące; porównanie 28 dni jest możliwe wyłącznie dla dziennego zestawienia całej witryny.

| Zakres dziennych danych witryny          | Kliknięcia | Wyświetlenia |   CTR |
| ---------------------------------------- | ---------: | -----------: | ----: |
| 2026-07-15–2026-10-14                    |        153 |         7532 | 2,03% |
| Ostatnie 28 dni: 2026-09-17–2026-10-14   |         36 |         2096 | 1,72% |
| Poprzednie 28 dni: 2026-08-20–2026-09-16 |         52 |         2403 | 2,16% |

Ostatnie 28 dni to około 31% mniej kliknięć i 13% mniej wyświetleń całej witryny. Próba jest mała i nie pozwala przypisać przyczyny konkretnej zmianie ani wyprowadzić takiego trendu dla samego /designs.

W dostarczonych 1000 wierszach stron adresy /designs mają 119 kliknięć i 6932 wyświetlenia. Suma wszystkich wierszy stron wynosi 160 kliknięć i 8713 wyświetleń i różni się od agregacji dziennej; tych zestawień nie należy traktować jako równoważnych ani dodawać do siebie.

Największe rynki według całego eksportu: USA 87 kliknięć, Australia 35, Kanada 12. Desktop: 75 kliknięć; mobile: 72; tablet: 6. To dane witryny, nie wyłącznie galerii.

Aktualne zapytania wskazują zainteresowanie motywami floral, butterfly, dove, horse oraz full-colour. Poza pilotażem trzeba zachować uwagę dla istniejących stron o potwierdzonym ruchu, np. nurse, teacher i pets; wybór trzech produktów pilotażowych nie oznacza porzucenia tych kategorii.

**Braki pomiarowe:** brak raportu indeksowania, URL Inspection, eksportu dla typu wyszukiwania Grafika oraz historycznego lejka galeria → projekt → personalizacja → udane otwarcie. Zestawienie wyglądu w wyszukiwarce nie zastępuje Google Images. Dane można uzupełnić w dalszych pracach bez blokowania napraw źródeł i podglądów.

## Obserwacje produkcyjne i wizualne

- Wszystkie osiem badanych stron odpowiedziało HTTP 200; w próbce nie stwierdzono nieobsłużonego błędu JavaScript ani poziomego przewijania.
- Tytuły powtarzają markę, np. … | Forever Shining | Forever Shining.
- Na telefonie pierwszy ekran kategorii floral zawiera nagłówek i opisy; projekty pojawiają się niżej. Warto przenieść rozwiniętą treść pod siatkę.
- Panel boczny ma 400 px na desktopie. Na badanej stronie produktu DOM zawierał około 2440 linków do /designs/, także w nawigacji. To liczba linków, nie unikalnych projektów.
- Ekspozycja, kontrast i skala podglądów są nierówne. Niektóre obrazy mają motywy poza obrysem produktu, bardzo drobny tekst, ikony miejsc na zdjęcia lub ślady przypominające obrys zaznaczenia.
- Strona szczegółowa ukrywa treść SSR. Próbka ma nazwę Square - Flower Flowers Headstone; etykieta materiału podaje technikę grawerowania zamiast konkretnego kamienia.
- Strona projektu pobiera nieobecny plik /database-exports/rollout-full-skipped-ids-20260324-190828.json. Katalog database-exports/ jest wykluczony przez .vercelignore. Potrzebny jest bezpieczny publiczny manifest wymaganych danych, z zachowaniem wykluczenia prywatnych eksportów.
- W próbie desktopowej pojawiały się HTTP 400 z optymalizatora obrazów. Wynik zachowuje docelową ścieżkę obrazu do reprodukcji; wymaga rozróżnienia zasobów widocznych i prefetchu.
- Niedostępne pliki v2026-p3d/\*.json potrafią zwrócić HTTP 200 z HTML; loader następnie pobiera właściwy rollout JSON. Sam HTTP 200 nie potwierdza dostępności JSON.

Zrzuty: [desktop kategorii](desktop-category.png), [karty projektów](desktop-category-below.png), [mobile kategorii](mobile-category.png), [mobile projektu](mobile-detail.png), [desktop produktu](desktop-product.png).

### Przejście do edytora

Trzy próbki dotarły do oczekiwanego typu produktu, pobrały JSON danego ID i utworzyły model. **To nie jest zatwierdzenie zgodności podglądu z konfiguracją.**

| ID / produkt                           | Obserwacja                                                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1755892723342 / traditional-headstone  | Nawigacja i model działają. Na zapisanym ujęciu motyw kwiatu jest znacznie większy niż w galerii i wychodzi poza kamień; wymagana reprodukcja i naprawa zgodności. |
| 1657160536159 / laser-etched-headstone | Nawigacja i model działają, ale pełna bryła nie mieściła się w kadrze w czasie 15-sekundowej kontroli. Zapisano ujęcie błędu kadrowania.                           |
| 1614353841893 / bronze-plaque          | Nawigacja i model działają. Rozmieszczenie elementów na zapisanym ujęciu wymaga dalszej kontroli zgodności z miniaturą.                                            |

Model i kamera są sprawdzane osobno; pierwszy stan płótna może zawierać wyłącznie scenografię, zanim kamera ustawi się na produkcie. Wyniki zachowują początkowe i końcowe granice modelu w kadrze. Kontrola kadrowania zgłasza problem zamiast oznaczać cały przepływ jako poprawny.

Ujęcia: [nagrobek tradycyjny](editor-traditional-headstone.png), [problem kadru laserowego](editor-laser-etched-headstone-failure.png), [tablica brązowa](editor-bronze-plaque.png). Czasy są obserwacjami laboratoryjnymi, nie terenowymi Core Web Vitals ani konwersją użytkowników.

## Pilotaż — 36 projektów do dopracowania

| Produkt                | Kategorie                          | Projekty |
| ---------------------- | ---------------------------------- | -------: |
| Traditional headstone  | floral-memorial, memorial          |       12 |
| Laser-etched headstone | memorial, butterfly-memorial       |       12 |
| Bronze plaque          | music-memorial, religious-memorial |       12 |

Dobór uwzględnia obecne zainteresowanie kategorią i projektami w GSC, dostępność źródeł oraz różnorodność kształtu i motywów. Są to **kandydaci naprawczy**, a nie lista zatwierdzona produkcyjnie.

Plansze: [traditional](pilot-traditional-headstone.png), [laser](pilot-laser-etched-headstone.png), [bronze](pilot-bronze-plaque.png).

Ocena wszystkich 36 miniatur: 7 wymaga naprawy kompozycji lub kadru, 4 dalsze — kontroli czytelności. Pozostałe 25 obejrzano na planszach, ale nie zatwierdzono jeszcze zgodności w Designerze. Szczególnie ID 1650336552725 jest niemal niewidoczny w miniaturze, a kilka tablic ma napisy poza obrysem.

Lista, statusy i powody są w pilot.json i visual-review.json. Duże rendery i zgodność edytora wymagają odbioru w kolejnych etapach.

## Priorytety dalszych prac

| Priorytet | Zadanie                                                                                                         | Etap |
| --------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| P1        | Poprawić tożsamość rekordów i mapę slugów; zachować prawidłowe adresy.                                          | 2    |
| P1        | Wyjaśnić różnice ID produktu i rozbieżności podgląd → edytor.                                                   | 2, 5 |
| P1        | Ujednolicić gotowość do publikacji, metadane i sitemap; usunąć dopuszczanie całego zbioru przy braku manifestu. | 2, 6 |
| P1        | Naprawić 7 podglądów pilotażu i ustalić standard renderów.                                                      | 3    |
| P2        | Przygotować publiczny manifest loadera i zbadać błędy obrazów.                                                  | 2, 5 |
| P2        | Przenieść rozwiniętą treść pod siatkę, poprawić karty i nawigację.                                              | 4    |
| P2        | Ujednolicić widoczną stronę SSR i klienta, poprawić nazwy i etykiety.                                           | 5    |
| P2        | Naprawić powtórzone title i prawdziwe atrybuty w JSON-LD.                                                       | 6    |
| P2        | Przejrzeć 81 par miniatur i potwierdzić anonimizację przykładów.                                                | 2, 3 |
| P2        | Uzupełnić raport indeksowania, Google Images i lejek.                                                           | 6, 8 |

## Powtórzenie i odbiór

Z głównego katalogu repozytorium, z istniejącymi zależnościami projektu i Chromium Playwright:

    pnpm exec tsx scripts/audit-design-catalog.ts
    pnpm exec node scripts/audit-design-pages.mjs
    pnpm exec node scripts/audit-design-pages.mjs --flows-only

Ostatnia komenda ponawia tylko kontrole przejścia do edytora. Inwentaryzacja ponownie tworzy raport i plansze, zachowując ręczne obserwacje. Skrypt przeglądarkowy zapisuje wyniki także przy wykrytym błędzie; kod zakończenia procesu 0 nie oznacza, że wszystkie obserwacje są pozytywne.

Odbiór etapu 1: wszystkie rekordy mają wynik i źródło decyzji; sprawdzono cztery poziomy galerii na dwóch szerokościach; aktualny eksport GSC został użyty z opisem ograniczeń; istnieje lista 36 kandydatów i priorytety. Niezweryfikowane elementy pozostają jawnie oznaczone.
