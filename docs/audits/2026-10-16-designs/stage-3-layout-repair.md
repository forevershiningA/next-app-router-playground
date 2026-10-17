# Etap 3 — naprawy importu układu

Data: 2026-10-16. Naprawy potwierdzono na trzech reprezentantach pilotażu. **Etap 3 pozostaje otwarty, a obrazy nadal wymagają zatwierdzenia do publikacji.**

## Wynik

[Porównanie przed i po naprawie](preview-candidates/layout-repair-comparison.webp) pokazuje trzy projekty z tym samym źródłem i treściami demonstracyjnymi. Zachowana poprzednia partia znajduje się w `preview-before-layout-repair/`.

| Projekt | Poprawiony problem | Potwierdzenie w renderze |
| --- | --- | --- |
| `1755892723342` | Milimetry błędnie potraktowane jako piksele; późniejsze przeliczenie nowego układu ze starego kształtu | Kwiat mieści się na kamieniu, a napis pozostaje w środkowej części. |
| `1657160536159` | Nieodczytany rozmiar zdjęcia laserowego, zastąpiony domyślnym 180 × 240 mm | Portret 132,5 × 120 mm mieści się między inskrypcjami. |
| `1614353841893` | Tekstowe wymiary produktu trafiały do setterów oczekujących liczb | Tablica ma 508 × 400 mm zamiast awaryjnych 100 × 60 mm; portret 130 × 180 mm nie zasłania całości. |

Ponowny eksport: 18 wariantów WebP, bez błędów kontroli kadru i zgodności rozmiaru produktu ze źródłem. Wszystkie pliki mieszczą się w budżetach 50/150/300 KB. Dwa większe zbliżenia tablicy wymagają jakości 82 zamiast 86: 960 px — 132832 bajty; 1600 px — 277370 bajtów. Pozostałe warianty zachowują jakość 86. Oceniono także zbliżenie po kompresji.

## Przyczyny i zmiany

### Normalizacja wymiarów na granicy JSON

Źródłowa tablica ma `width_mm: "508"` i tekstową wysokość około 400,05 mm. `Number.isFinite` w setterach store nie uznaje tekstu za liczbę, więc były przyjmowane wartości awaryjne. Dodatkowo tekstowe wymiary mogły zmieniać wynik dodawania w obliczeniach układu.

`normalizeCanonicalDesignSource` zamienia jednoznaczne wartości wymiarów komponentów i canvasu na liczby, odrzucając niefinitywne, puste i ujemne wartości. Nie przelicza współrzędnych ani nie zmienia tekstów. Ta sama normalizacja jest używana w fetcherze, generatorze manifestu oraz audycie. Liczby rekordów dostępnych/wymagających sprawdzenia pozostają bez zmian: 2966/126, z 22 niedostępnymi źródłami.

### Kontrakt companion w milimetrach

Aktualny konwerter opisuje companion `bronze-plaque` jako zapis milimetrów z osią Y w dół. W starym artefakcie pilotażu wysokość motywu i położenie są jednak oznaczone jako `height_px` oraz `x_px/y_px`. Loader powiększał motyw proporcją wysokości kamienia do canvasu.

Korekta w `design-layout-contracts.ts` obejmuje tylko zweryfikowany ID `1755892723342`, katalog companion i wersję 1.45. Jawne pola `_mm` nadal mają pierwszeństwo. Starsza tablica z tego samego katalogu ma inną konwencję; reguły nie rozszerzono automatycznie na cały katalog ani pozostałe 33 wzorce.

### Rozmiary zdjęć i grubość podkładu

Wspólny parser rozmiarów zastąpił osobną implementację w loaderze i generatorze treści demonstracyjnych. Jawne `130 x 180 mm` jest odczytywane bez zgadywania. Dla stałych wariantów ceramiki liczbowa ilość katalogowa `Width + Height` musi mieć jednoznaczne dopasowanie; nie jest indeksem wariantu.

Zdjęcie laserowe typu 21 jest elastycznym obrazem, a nie ceramiką. Dla badanego rekordu fizyczna wysokość 120 mm oraz zapisany bitmapowy stosunek 159/144 dają szerokość 132,5 mm. Odpowiada to proporcjom źródłowych bounds oraz elastycznej konfiguracji typu 21 w `public/xml/en_EN/images.xml`. Ta reguła nie została rozszerzona na niezweryfikowane typy elastyczne.

Grubość podkładu ceramicznego korzysta teraz z osobnego przelicznika głębokości API powierzchni. Jest wyliczana z rzeczywistej głębokości geometrii i nie zależy od skali XY zdjęcia. Warstwa zdjęcia znajduje się przed podkładem, z odsunięciami przeliczonymi w jednostkach osi Z.

### Import a zmiana kształtu

`ShapeSwapper` mógł potraktować świeżo wczytane elementy jako wcześniejszy układ i przeliczyć je ze starego bounding boxa na nowy. `layoutRevision` jest zwiększane przed instalacją kanonicznego układu. Komponent usuwa zadania remapowania ze starszej rewizji oraz ustawia bieżący kształt jako punkt odniesienia.

To rozróżnienie dotyczy importu layoutu. Interaktywna zmiana kształtu nadal korzysta z istniejącego remapowania. Nie wykonano pełnego odbioru wszystkich interakcji projektanta. Inskrypcje mogą następnie zostać prawidłowo przeliczone z `mm-center` na współrzędne geometrii przez `HeadstoneInscription`; same wartości Y w store nie są dowodem przesunięcia.

## Kontrole i ograniczenia

Przeprowadzono lokalne generowanie rzeczywistych renderów i ocenę trzech widoków oraz zbliżenia po kompresji. Przeszły kontrola TypeScript, ESLint zmienionych modułów i zgodność manifestów. Nie uruchamiano testów jednostkowych/E2E ani pełnego buildu.

Manifest przechowuje teraz także fingerprint kodu runtime, ponieważ poprawa loadera zmienia obraz bez zmiany źródłowego JSON-a. Diagnostyka zapisuje rozmiary produktu i układu bez treści inskrypcji oraz URL-i zdjęć. Eksporter odrzuca różnicę rozmiaru produktu większą niż 1 mm względem źródła, uwzględniając zaokrąglenia setterów.

[Bieżąca ocena](preview-candidates/review.json) potwierdza naprawę wskazanych problemów układu, lecz pozostawia publikację jako `pending`. Pozostały: naturalne teksty demonstracyjne, odstępy kompozycji, czytelność małych napisów, wygląd materiału/obramowania, wybór przydatnych zbliżeń i przegląd pozostałych 33 projektów. Podglądy galerii nie zostały automatycznie zastąpione. Naprawy mają zastosowanie w rzeczywistym loaderze aplikacji; nie są retuszem samego obrazu.
