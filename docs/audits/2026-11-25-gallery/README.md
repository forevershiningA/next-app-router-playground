# Galeria projektów i otwarcie personalizacji

25 listopada 2026, produkcja forevershining.org. Pomiar w Chromium przez Playwright, na ekranie 1440 × 900 i w emulacji Pixel 7, 412 × 839 pikseli CSS. Każda ścieżka zaczynała się w nowej sesji. Dobór wzorów wynikał z [przeglądu z 2 listopada](../2026-11-02-designs-initial-review.md). Wyniki opisują tę próbkę.

## Co widzi użytkownik

| Wzór | Wynik przejścia z kategorii do personalizacji |
| --- | --- |
| Serpentine – Duck Swan, ID 1757967597026 | Edytor otwiera właściwy typ nagrobka i kształt. Daty, ptaki i drzewa odpowiadają podglądowi, ale główny napis zawiera inne imię i nazwisko. W obu widokach drzewa wychodzą poza obrys kamienia. Przyczyna różnicy w tekście wymaga porównania źródła użytego do eksportu PNG z konfiguracją otwieraną przez edytor. [Podgląd](duck-desktop-preview.png) · [Edytor](duck-desktop-editor.png) |
| Heart – Butterflies, ID 1724894260777 | Aktywny wzór zastępczy z kategorii Butterfly Memorial. W obu rozmiarach ekranu edytor otworzył czarny nagrobek w kształcie serca. Imię, lata, dolna inskrypcja i rozmieszczenie motyli odpowiadają podglądowi. Część motyli wystaje poza kamień w obu widokach. [Podgląd](butterfly-desktop-preview.png) · [Edytor](butterfly-desktop-editor.png) |
| Square – Music, ID 1610531526906 | Karta kategorii oferuje „Personalize in 3D” i „Customize”. Na stronie projektu personalizacja jest wyłączona na obu urządzeniach. W manifeście wzór ma status `requires-review`. Kategoria powinna informować o tym już podczas wyboru wzoru. |
| Rectangle Landscape – Music, ID 1680284761282 | Dostępny wzór z tej samej kategorii tablic. Otwiera edytor tablicy 305 × 108 mm. W publicznym PNG widoczne są cztery środkowe wiersze inskrypcji. Edytor na komputerze pokazuje także początek i zakończenie. Na telefonie po 15 sekundach od pojawienia się płótna 3D widać samą tablicę. [Podgląd](plaque-desktop-preview.png) · [Komputer](plaque-desktop-editor.png) · [Emulacja telefonu](plaque-mobile-editor.png) |

Próbę mobilną Rectangle Landscape – Music powtórzono w nowej sesji. Po 15 sekundach i ponownie po 60 sekundach powierzchnia tablicy pozostawała bez napisów. Obserwacja dotyczy widoku na etapie wyboru rozmiaru w emulowanym Chromium. [Zrzut po minucie](plaque-mobile-editor-60s.png)

Historyczne strony Headstone 2 – Butterflies (1650336552725) i Bronze Plaque – Music (1614353841893) zwracały HTTP 404. Żadna nie wystąpiła w mapie witryny ani w linkach swojej kategorii. Oba wyniki odpowiadają wpisom `unusable-preview` w [manifeście ukrytych projektów](../../../lib/design-hidden-manifest.json).

## SEO i powrót do galerii

- Sprawdzono 11 publicznych adresów. Indeks galerii, trzy strony typów produktów, trzy kategorie i cztery strony projektów zwracały HTTP 200 i figurowały w mapie witryny. Linki wewnętrzne łączyły kolejne poziomy.
- W osobnej próbie na komputerze każdy z czterech projektów miał pojedynczy canonical wskazujący na własny URL zarówno po wejściu z kategorii, jak i po odświeżeniu. W części wcześniejszych prób po przejściu wewnętrznym w DOM pozostawał canonical kategorii, w tym w dwóch odczytach po oczekiwaniu do 10 sekund. Wynik zależał od przebiegu nawigacji. Nie sprawdzano kanonicznego URL wybranego przez Google. [Porównanie po kliknięciu i odświeżeniu](canonical.json)
- Przycisk Wstecz przywrócił kategorię, fokus na wybranej karcie i poprzednią pozycję przewinięcia w 8 z 8 kombinacji wzoru i urządzenia. Na telefonie przy Duck Swan przeglądarka wróciła do pozycji 11 319 px. Ponowne kliknięcie karty działało. [Pomiary przeglądarkowe](browser.json)

## Kolejność dalszych prac

1. Sprawdzić renderowanie inskrypcji tablicy na fizycznym telefonie i porównać z emulacją. Kryterium odbioru to czytelna, pełna treść po otwarciu projektu.
2. Ustalić wspólną wersję danych dla podglądu i edytora Duck Swan oraz poprawić eksport tablicy Rectangle Landscape – Music. Rozszerzyć porównanie PNG i edytora na próbkę tych dwóch typów produktów.
3. Powiązać opis akcji na karcie kategorii ze statusem personalizacji. Wzór w trakcie weryfikacji powinien mieć dostępną akcję obejrzenia szczegółów.
