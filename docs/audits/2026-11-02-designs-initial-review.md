# Wstępny przegląd publicznej galerii Designs

Data: 2026-11-02. Celem jest przygotowanie kolejki do oceny jakości i decyzji o naprawie lub wycofaniu. To nie jest kompletny audyt wszystkich projektów i nie zatwierdza publikacji, usunięcia ani pochodzenia treści.

## Zakres i metoda

- Strona `/designs` podaje 3036 wzorców; jest to wartość z pobranej wersji strony, która może być cache'owana. Wcześniejszy lokalny raport etapu 2 obejmował 3114 rekordów ogółem i 2967 kwalifikowanych do galerii — liczby pochodzą z różnych pomiarów i nie należy ich bezpośrednio porównywać.
- Obejrzano sześć plików podglądów pobranych 2026-11-02 z produkcyjnego `/screenshots/v2026-3d/`, wskazanych w istniejącym audycie. Dla trzech pierwszych adresy stron zwróciły HTTP 200. To wybór ryzyka, nie losowa próbka i nie pełna kontrola działania edytora.
- Wcześniejszy [raport etapu 2](2026-10-16-designs/stage-2.md) odnotował 126 konfiguracji wymagających kontroli produktu, 22 niedostępne lub nieprawidłowe oraz 64 projekty galerii z wstrzymaną personalizacją. Dane są historyczne, wymagają ponownego przeliczenia. Wcześniejszy [pilotaż podglądów](2026-10-16-designs/stage-3-full-pilot.md) nie zatwierdził nowych obrazów do publikacji.
- Skan tytułów i pełnych ścieżek w historycznym lokalnym raporcie nie wykazał słów `test`, `testing`, `demo`, `sample`, `dummy` jako osobnych słów. Nie jest to dowód, że testowych projektów nie ma: nazwy mogły zostać znormalizowane, a konfiguracji i treści nie przeszukano.

## Wstępna kolejka

| ID | Publiczna strona | Ocena bieżącego obrazu | Następny krok |
| --- | --- | --- | --- |
| 1757967597026 | [Serpentine — Duck Swan](https://forevershining.org/designs/traditional-headstone/memorial/serpentine-duck-swan) | Widoczne narożne znaczniki zaznaczenia; dekoracja dochodzi do krawędzi. Obraz zawiera dane wyglądające na osobowe. | Naprawić eksport i sprawdzić zgodność motywów; zweryfikować pochodzenie tekstu. |
| 1650336552725 | [Headstone 2 — Butterflies](https://forevershining.org/designs/laser-etched-headstone/butterfly-memorial/headstone-2-butterflies) | Produkt jest bardzo mały; liczne napisy i elementy znajdują się poza nim i kadrem. | Wysoki priorytet naprawy: porównać źródło, wymiary, render i otwarcie w edytorze. |
| 1614353841893 | [Bronze Plaque — Music](https://forevershining.org/designs/bronze-plaque/music-memorial/bronze-plaque-music) | Tekst i dekoracje poza tablicą; w środku widoczna ikona edycji/obrazu. | Sprawdzić mapowanie i zasoby, wyrenderować bez kontrolek, porównać z edytorem. |
| 1712990964652 | [Serpentine — Together Forever](https://forevershining.org/designs/traditional-headstone/floral-memorial/serpentine-together-forever-4) | Słaby kontrast napisu; widoczne znaczniki zaznaczenia. Treść wygląda na osobową lub przykładową. | Poprawić kontrast i eksport; zweryfikować treść i uprawnienia. |
| 1652673924623 | [Headstone 27 — Teddy Bear](https://forevershining.org/designs/traditional-headstone/memorial/headstone-27-teddy-bear) | Mała inskrypcja, ikona edycji obrazu i narożniki zaznaczenia. Treść wygląda na osobową lub przykładową. | Sprawdzić czytelność, wykluczyć kontrolki z renderu i zweryfikować treść. |
| 1681860302781 | [Rectangle Landscape — In Loving Memory](https://forevershining.org/designs/bronze-plaque/music-memorial/rectangle-landscape-in-loving-memory-98) | Tekst wychodzi poza obrys, po prawej jest ucięty; widoczne znaczniki zaznaczenia. | Wysoki priorytet naprawy układu i porównania z oryginalną konfiguracją. |

Oceny dotyczą pobranych podglądów, nie dowodzą, że sam zapis projektu jest nienaprawialny. W tych sześciu przypadkach nie ustalono, że projekt jest testowy, ani podstawy do usunięcia.

## Dalsza praca

1. Zaktualizować inwentaryzację na podstawie bieżących danych i określić, które adresy, obrazy i konfiguracje są rzeczywiście publiczne. Nie nadpisywać historycznych raportów bez zachowania pomiaru.
2. Utworzyć kolejkę z ID, adresem, obrazem, wynikiem automatycznych kontroli i miejscem na ocenę wizualną oraz powód decyzji. Oddzielić: poprawny, do naprawy, potencjalnie testowy/do decyzji, niewystarczające dane.
3. Weryfikować obrazy partiami i porównywać problematyczne przypadki z konfiguracją oraz Designerem. Tekst demonstracyjny nie potwierdza praw do fotografii ani innych assetów; podgląd i źródłowy JSON sprawdzać osobno.
4. Dopiero po przeglądzie przygotować konkretne propozycje napraw, ukrycia lub usunięcia; zachować oryginały oraz uwzględnić istniejące URL-e i personalizację.

## Kolejna partia — 48 podglądów

Wykonano nowe, lokalne przeliczenie `audit-design-catalog.ts --out=docs/audits/2026-11-02-designs-current`. Wynik: 3114 rekordów, 2967 spełnia lokalną regułę galerii, 122 ma rozbieżność ID produktu, 22 ma niedostępną lub nieprawidłową konfigurację, a 70 wskazuje brakujące zasoby lokalne. Kategorie problemów mogą się nakładać. To wynik bieżącego kodu i lokalnych plików, nie bezpośredni dowód stanu wszystkich konfiguracji produkcji. Dołączony przez skrypt raport GSC pozostaje historycznym eksportem 2026-07-15–2026-10-14.

Wybrano 48 projektów przekrojowo z 11 typów produktów, bez losowania; to wstępny przegląd wizualny plansz. Wszystkie 48 obrazów pobrano z produkcyjnych ścieżek podglądu i porównano SHA-256 z lokalnymi odpowiednikami — wszystkie były identyczne. Suma obrazu i indywidualne uwagi znajdują się w [kolejce](2026-11-02-designs-review-queue.json). Nie pobierano ani nie sprawdzano 48 stron detali lub ścieżek personalizacji.

- 33 z 48 mają obserwację wymagającą naprawy, dokładniejszej oceny lub sprawdzenia pochodzenia. Kategorie obejmują przepełnienie, ikony edycji/zdjęć, drobny tekst, puste kompozycje oraz fotografie wymagające sprawdzenia. To liczba obserwacji na planszy, nie estymacja jakości całej galerii.
- Trzy wyraźne przepełnienia są w kolejce z wysokim priorytetem: [1761770619202](https://forevershining.org/designs/bronze-plaque/memorial/rectangle-landscape-rectangle-landscape-rectangle-landscape-rectangle), [1746485882995](https://forevershining.org/designs/laser-etched-headstone/dove-memorial/curved-top-in-loving-memory) oraz [1760087039135](https://forevershining.org/designs/bronze-plaque/memorial/rectangle-landscape-rectangle-landscape-rectangle-landscape-rectangle-plaque).
- [1666246500829](https://forevershining.org/designs/full-colour-plaque/memorial/full-colour-plaque-bird) ma nietypową treść i jest kandydatem do **sprawdzenia**, czy był projektem testowym. Sama treść nie dowodzi testowego pochodzenia ani nie stanowi decyzji o usunięciu.
- W [1746192025545](https://forevershining.org/designs/traditional-monument/memorial/serpentine-memorial-monument) i innych widać portrety; należy sprawdzić ich źródła i uprawnienia. Nie ustalono ich charakteru ani tożsamości.
- Pozostałych 15 nie wykazuje oczywistej usterki na planszy; nadal wymagają obejrzenia pełnego obrazu oraz oceny danych, praw do zasobów i personalizacji. Żaden nie został zatwierdzony jako gotowy.

W kolejce pozostaje 2913 rekordów bez przeglądu podglądu z historycznych 2967; sześć wcześniej ocenionych i 48 z tej partii nie pokrywają się. Wyłączenie, usunięcie lub publikacja poprawek nie zostały wykonane.

## Następna partia — 64 podglądy

Obejrzano kolejne 64 różne obrazy produkcyjne na planszach; każdy pobrany plik miał SHA-256 identyczny z lokalnym odpowiednikiem. Dobór przekrojowy według typu produktu nie jest próbą losową. Sześć obrazów ma wysoki priorytet, a 50 z 64 otrzymało obserwację do naprawy lub dokładniejszej weryfikacji. Pozostałych 14 nie jest zatwierdzonych: wymagają oceny pełnego obrazu, danych i działania edytora.

Mocni kandydaci do weryfikacji jako projekty testowe:

- [1587099984019](https://forevershining.org/designs/pets/pet-memorial/square-cat) — na obrazie wprost widnieje `testing` oraz pięć ikon edycji. To silna przesłanka, lecz pochodzenie rekordu i decyzja o wycofaniu wymagają osobnego potwierdzenia.
- [1587100139869](https://forevershining.org/designs/pets/pet-memorial/square-cat-plaque) — podobny obraz z ikonami, motywem kota i częściowo zasłoniętym tekstem przypominającym `testing`; sprawdzić źródło i relację do poprzedniego wzoru.
- [1721026727443](https://forevershining.org/designs/mini-headstone/dove-memorial/half-round-bird) — pozornie losowy ciąg znaków na kamieniu i kontrolki zaznaczenia; kandydat do weryfikacji, nie potwierdzony test.

[1597645134539](https://forevershining.org/designs/laser-monument/biblical-memorial/cropped-peak-much-loved) ma szczególnie poważną wadę renderu: nakładające się wielkie litery zasłaniają niemal cały produkt i wychodzą poza kadr. Inne powtarzalne problemy to ikony edycji, niewielkie napisy, przepełnienia i portrety wymagające sprawdzenia pochodzenia.

Łącznie w kolejce: sześć wcześniejszych ocen pełnego podglądu, 112 obrazów wstępnie ocenionych na planszach i 2849 rekordów oczekujących. Wszystkie oceny dotyczą obrazu, a nie potwierdzenia konfiguracji, praw do materiałów lub działania Designer. Nie wykonano żadnego usunięcia ani wyłączenia publicznego adresu.

## Kolejna partia — 64 podglądy i treść wymagająca pilnej oceny

Obejrzano kolejne 64 obrazy produkcyjne na planszach; wszystkie 64 miały SHA-256 identyczny z lokalnymi odpowiednikami. Dobór jest przekrojowy, nie losowy. Dla 59 zapisano uwagi o wymaganej naprawie, czytelności lub dalszej weryfikacji; pozostałych pięć także wymaga pełnej oceny. Nie należy uogólniać tych proporcji na całą galerię.

- [1760755328062](https://forevershining.org/designs/laser-etched-headstone/memorial/headstone-19-memorial) — publiczny podgląd zawiera obraźliwy angielski napis i ikonę edycji. Adres zwraca HTTP 200. **Pilnie zweryfikować pochodzenie i zdecydować o wycofaniu lub poprawieniu**; nie ustalono charakteru ani własności zapisu.
- [1747809177601](https://forevershining.org/designs/laser-monument/father-memorial/serpentine-in-loving-memory-34) — pobrany plik podglądu ma tylko 19 × 19 px i nie pozwala rozpoznać produktu; strona zwraca HTTP 200. Sprawdzić źródło, wygenerować poprawny obraz i zweryfikować Designer.
- [1738607735696](https://forevershining.org/designs/pets/memorial/rectangle-125x175-cat) — obraz zawiera tekst odnoszący się do fontu i znaków japońskich. Jest kandydatem do sprawdzenia jako wzór testowy; cel i pochodzenie nie są potwierdzone. Strona zwraca HTTP 200.
- [1759879432601](https://forevershining.org/designs/traditional-headstone/memorial/serpentine-memorial) — dwie grupy napisów nakładają się na siebie.
- [1584914887160](https://forevershining.org/designs/traditional-headstone/biblical-memorial/curved-top-in-loving-memory-headstone) — duża część ornamentów wypada poza obrys nagrobka; widoczna jest ikona edycji.

Łącznie w kolejce: sześć wcześniejszych ocen pełnego podglądu, 176 obrazów wstępnie ocenionych na planszach i 2785 rekordów oczekujących. Nadal nie sprawdzono wszystkich źródeł, uprawnień ani personalizacji; nie usunięto ani nie wyłączono publicznych projektów.

## Kolejna partia — 64 podglądy

Obejrzano kolejne 64 obrazy produkcyjne; wszystkie mają SHA-256 identyczny z lokalnymi plikami. Dobór jest przekrojowy i nielosowy. Dla 51 zapisano uwagi o wadzie lub potrzebie dodatkowego sprawdzenia, a 13 pozostawiono do oceny pełnego obrazu, danych i edytora. Żaden rekord nie został zatwierdzony do publikacji na podstawie samej planszy.

- [1603089056252](https://forevershining.org/designs/pets/memorial/curved-gable-cat) — pozornie losowy ciąg liter i ikona edycji. Mocny kandydat do sprawdzenia jako projekt testowy; pochodzenie nie jest ustalone. Strona zwraca HTTP 200.
- [1716716632597](https://forevershining.org/designs/laser-etched-headstone/daughter-memorial/serpentine-in-loving-memory-headstone) — wielki napis wybiega poza kamień i kadr; strona zwraca HTTP 200.
- [1752870923677](https://forevershining.org/designs/laser-etched-headstone/biblical-memorial/headstone-27-john-3-16) — duży napis wychodzi poza obrys kamienia.
- [1704165449390](https://forevershining.org/designs/full-colour-plaque/biblical-memorial/full-colour-plaque-in-loving-memory-5) — jasny napis na jasnej powierzchni jest słabo widoczny, a motywy i ikona edycji zasłaniają treść; strona zwraca HTTP 200.
- [1589777070282](https://forevershining.org/designs/traditional-headstone/mother-memorial/left-wave-forever-in-our-hearts) — ozdoby wypadają poza kamień, a w podglądzie widoczna jest ikona edycji.

Łącznie: sześć wcześniejszych ocen pełnego podglądu, 240 ocen wstępnych na planszach i 2721 rekordów oczekujących. Liczby dotyczą lokalnej kolejki 2967 rekordów; nie stanowią pomiaru jakości lub dostępności całej produkcji. Żadnego rekordu nie usunięto ani nie wyłączono.

## Kolejna partia — 64 podglądy

Obejrzano kolejne 64 obrazy produkcyjne, wszystkie z SHA-256 zgodnym z lokalnymi plikami. Próba jest przekrojowa, nie losowa. Dla 60 zapisano uwagę o wadzie albo potrzebie dalszej weryfikacji; cztery bez oczywistej usterki na planszy nadal wymagają pełnej oceny. Dane i obrazy osobowe, uprawnienia oraz możliwość otwarcia edytora nie zostały zatwierdzone.

- [1669371905639](https://forevershining.org/designs/pets/memorial/serpentine-horse) — na podglądzie widnieje powtarzalny przypadkowy ciąg liter i kontrolki zaznaczenia. Mocny kandydat do sprawdzenia jako projekt testowy, jednak jego pochodzenie nie jest potwierdzone.
- [1758487617306](https://forevershining.org/designs/laser-etched-headstone/biblical-memorial/curved-top-beloved-brother) — większość tekstu i część motywów wychodzi poza nagrobek i kadr, widoczna jest ikona edycji.
- [1720067803745](https://forevershining.org/designs/bronze-plaque/memorial/rectangle-landscape-bird) — treść wygląda na demonstrację różnic między emblematem 3D i motywem 2D. Może być celowym materiałem edukacyjnym; przed zmianą lub wycofaniem sprawdzić jego przeznaczenie.
- [1674656681479](https://forevershining.org/designs/mini-headstone/religious-memorial/right-wave-bird) — w obrazie widoczna jest ikona edycji i techniczna stopka z nazwą przeglądarki.
- [1696474720191](https://forevershining.org/designs/stainless-steel-plaque/garden-memorial/stainless-steel-plaque-flower) — motyw nakłada się na tekst.

Pierwsze trzy adresy powyżej zwróciły HTTP 200 przy kontroli. Łącznie w kolejce jest sześć wcześniejszych ocen pełnego podglądu, 304 oceny wstępne na planszach oraz 2657 rekordów oczekujących. Żadnego rekordu nie usunięto ani nie wyłączono.

## Kolejna partia — 64 podglądy

Obejrzano kolejnych 64 obrazów pobranych z produkcji; wszystkie miały SHA-256 zgodny z lokalnym podglądem. Dobór był przekrojowy, nielosowy. Dla 59 zapisano uwagi o wadzie lub potrzebie sprawdzenia; pozostałe pięć nadal wymaga pełnego przeglądu. Wyników tej partii nie należy przenosić na cały katalog.

- [1666079814705](https://forevershining.org/designs/pets/memorial/rectangle-landscape-cat-3) — liczne przypadkowe ciągi liter i ikona edycji. Silny kandydat do weryfikacji jako projekt testowy, bez potwierdzenia pochodzenia.
- [1679044149041](https://forevershining.org/designs/laser-monument/rest-in-peace/square-in-loving-memory-monument) — na obrazie widoczny jest pusty ciemny nagrobek; trzeba ustalić, czy brak treści jest celowy, czy wynika z niekompletnego renderu.
- [1715217127941](https://forevershining.org/designs/bronze-plaque/son-memorial/rectangle-landscape-james) — napis znajduje się ponad górną krawędzią tablicy.
- [1738283808152](https://forevershining.org/designs/bronze-plaque/memorial/rectangle-landscape-cat) — data wypada poza dolną krawędzią tablicy.
- [1595853995561](https://forevershining.org/designs/traditional-headstone/wife-memorial/left-wave-much-loved) — ornamenty oraz część tekstu znajdują się poza produktem; widoczna jest ikona edycji.

Pierwsze trzy adresy zwróciły HTTP 200. Łącznie kolejka obejmuje sześć wcześniejszych ocen pełnego podglądu, 368 wstępnych ocen na planszach oraz 2593 rekordy oczekujące. Żadnego projektu nie usunięto ani nie wyłączono.

## Decyzja: pierwsze ukrycia — przygotowane lokalnie

Po decyzji o ukryciu najbardziej problematycznych wzorców przygotowano odwracalną listę w `lib/design-hidden.ts`. Zawiera 15 pozycji:

- Treść obraźliwa: `1760755328062`.
- Silne przesłanki treści testowej: `1587099984019`, `1587100139869`, `1721026727443`, `1603089056252`, `1669371905639`, `1666079814705`. Pochodzenie wymaga sprawdzenia; są ukrywane do przeglądu, nie usuwane jako udowodnione testy.
- Nieużywalne podglądy do naprawy: `1650336552725`, `1614353841893`, `1681860302781`, `1597645134539`, `1747809177601`, `1716716632597`, `1758487617306`, `1759879432601`.

Mechanizm wyłącza te ID z katalogu, nawigacji, wyszukiwania, powiązanych propozycji i mapy strony; kanoniczne strony detali zwracają 404 już na poziomie middleware, a odczyt rekordu w stronie ma dodatkową blokadę. Oryginalne dane i pliki nie są usuwane. **Bezpośrednie adresy statycznych obrazów i danych nadal mogą być publicznie dostępne**: ukrycie katalogowe nie jest ochroną prywatności ani usunięciem z pamięci wyszukiwarek. Osobno należy ocenić źródłowe zasoby i ewentualne działania na CDN.

Lista jest lokalna, nie została wdrożona na produkcję. Usunięcie wpisu z `lib/design-hidden-manifest.json` po weryfikacji lub naprawie przywraca możliwość publikacji zgodnie z pozostałymi regułami. Każdy rekord ma odpowiednią `proposedAction` w kolejce, status `local-only-not-deployed`. Nie ukryto automatycznie wszystkich rekordów z uwagami ani potencjalnie celowych projektów edukacyjnych.

Kontrole: test jednostkowy sprawdził wszystkie 15 rekordów w galerii i sitemapie oraz zachowanie źródłowych danych; Playwright na lokalnej instancji sprawdził trzy kanoniczne adresy 404, kategorię, poprawny wzorzec i zachowanie istniejącego pliku obrazu. Przeszły kontrola typów, ESLint i `git diff --check`; istnieją ostrzeżenia ESLint w starszych komponentach. Nie wykonano buildu produkcyjnego ani wdrożenia.
