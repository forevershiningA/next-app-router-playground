# Reguły publikacji wzorców `/designs`

Stan: 2026-10-16. Reguły dotyczą katalogu publicznych szablonów i pracy nad jego nową prezentacją.

## Tożsamość i kategorie

- Stabilnym identyfikatorem pozostaje ID projektu. Bieżąca pełna ścieżka produktu, kategorii i slugu jest adresem kanonicznym. Tagi są filtrami i nie tworzą drugiej kanonicznej strony tego samego projektu.
- Zachowujemy istniejące ścieżki podczas przeglądu danych. Zmiana produktu wymaga potwierdzenia konfiguracji oraz osobnej decyzji o przekierowaniu ze starego URL-a.
- Oryginał legacy, konfiguracja przekonwertowana i katalog są trzema źródłami dowodów. Ich zgodność wskazuje kierunek kontroli, ale nie uzasadnia automatycznej zmiany produktu. Przykładowo historyczny produkt mógł zostać zastąpiony przez nowszy.
- Dla kategorii pozostają reguły z `design-seo.ts`: uprawniony produkt, próg liczby wzorców oraz wyjątki potwierdzone historycznym ruchem GSC. Nowy tag nie jest wystarczającym powodem utworzenia indeksowalnej kategorii.

## Trzy osobne decyzje

1. **Galeria i indeksowanie:** dotychczasowy uprawniony typ produktu i istniejący pełny podgląd w manifeście. Zachowanie istniejącej publikacji nie oznacza zatwierdzenia jakości ani prywatności.
2. **Personalizacja:** wymaga dostępnej strukturalnie konfiguracji z właściwym ID i zgodnym, istniejącym produktem. Rozbieżności oraz brak konfiguracji blokują otwarcie publicznego wzorca. Komunikat odsyła do innych projektów z kolekcji. Nieznane ID w manifeście nie uzyskuje domyślnie zgody.
3. **Nowa prezentacja zatwierdzona do wdrożenia:** wymaga przeglądu podglądu, zgodności z Designerem, publicznych treści i pochodzenia użytych grafik. Status `source-ready` nie zastępuje tych kontroli.

Status blokady personalizacji nie usuwa starego URL-a ani nie zmienia samodzielnie jego indeksowalności. Naprawa rekordu wymaga odtworzenia manifestów; nie zwalniamy blokady ręczną zmianą samego pliku statusów.

## Treści publiczne i prywatne projekty

- Nowe opisy powstają z potwierdzonych cech układu i zatwierdzonych określeń produktu, a nie z treści napisów klienta. Brakujące dane pozostają nieznane. Nie wyprowadzamy materiału, ceny, daty aktualizacji ani uprawnień do grafiki z nazwy kategorii.
- Manifest konfiguracji przechowuje ID, parametry, liczby elementów oraz dowody zgodności produktu. Nie kopiuje tekstów inskrypcji, danych kontaktowych ani zawartości zdjęć. Wymiary opisują konfigurację, nie gwarantowany rozmiar handlowy.
- Nowe publiczne wzorce i podglądy powinny zawierać teksty demonstracyjne. Zdjęcia, logotypy i inne elementy identyfikujące osobę lub organizację wymagają potwierdzonego dopuszczenia do publicznego wzorca albo zastąpienia zasobem demonstracyjnym.
- Istniejący generator anonimizuje tekst na potrzeby renderu, lecz sam ten krok nie zatwierdza fotografii, logotypów, metadanych ani publicznego źródłowego JSON-a.
- Nowej wersji nie uznajemy za zatwierdzoną, dopóki nie przejrzano także plików konfiguracji faktycznie dostępnych przez publiczne URL-e. Ewentualna wersja publiczna jest osobnym wzorcem; nie nadpisuje prywatnego projektu klienta.

## Przegląd i odbiór

Każdy rekord ma wynik w `stage-2-publication.json`. Rekordy wstrzymane mają dodatkowo wpis w `stage-2-review-queue.json` z powodem i dowodami. Kolejne partie otrzymują jawne wyniki przeglądu wizualnego, treści i zgodności z edytorem; brak wyniku pozostaje `pending`.

Pilotaż 36 projektów przechodzi kontrolę tożsamości i podstawowej dostępności źródeł. Zatwierdzenie renderów, treści oraz kompletnej personalizacji pozostaje odbiorem etapów 3, 5 i 6.
