# Etap 3 — standard podglądów i pierwsza próbka

Data: 2026-10-16. **Etap w realizacji. Nie zatwierdzono nowych obrazów do galerii.**

## Wykonane prace

- [Standard podglądów](../../backlog/design-preview-standard.md): pełny produkt, przydatny detal, marginesy, neutralne tło, rozmiary i budżety, kryteria odbioru.
- Nowy generator kandydatów pobiera rzeczywistą konfigurację w tej samej kolejności źródeł co aplikacja. Brakujący wariant zwraca 404; nie jest zastępowany inną konfiguracją pod tym samym URL-em.
- Ładowanie wymaga gotowej geometrii i zakończenia flag `loading` oraz `baseSwapping`. Generator nie wymusza ich wyłączenia. Kamera jest dopasowana do bryły produktu i ustawiona według jego lokalnej osi przodu; widok główny sprawdza pełny obrys produktu.
- Tryb screenshot usuwa scenerię. Zaznaczenia i obrysy edycji są ukrywane bez zmiany projektu. Napisy otrzymują syntetyczne wyrazy o zachowanych długościach; zdjęcia — neutralny portret demonstracyjny. Szerokości glifów nadal mogą się różnić, dlatego anonimizacja nie potwierdza zgodności metryki tekstu.
- Uwzględniono zdjęcia przywracane z `legacy.raw`, pominięte w głównej liście zdjęć konfiguracji. Model obrazu celowo pokazuje ikonę edycji zamiast historycznych uploadów; wariant demonstracyjny korzysta z jawnego kanonicznego URL-a, z zachowaniem mapowania geometrii legacy. To zmiana wyłącznie w przechwyconej lokalnie kopii do renderu.
- Serwer do generowania ma oddzielny katalog kompilacji i port 3002. Pliki robocze powstają poza obserwowanym repozytorium i są kopiowane po zakończeniu partii. Rozwiązuje to problem rekompilacji wywoływanej zapisem kolejnych plików podczas pobierania chunków JS. Nie zmieniono domyślnego katalogu kompilacji zwykłego dev/build.

## Wyniki pierwszej próbki (przed naprawami)

Trzy projekty, dwa ujęcia każdego, po trzy rozmiary: **18 plików WebP**. Wszystkie mieszczą się we wstępnych budżetach 50/150/300 KB dla szerokości 480/960/1600 px. Rzeczywiste wagi zapisano w [raporcie budżetu](preview-candidates/asset-budget.json).

[Porównanie poprzednich obrazów i kandydatów](preview-candidates/comparison.webp) pokazuje faktyczne różnice. Stare obrazy są materiałem diagnostycznym; ich użycie w porównaniu nie zatwierdza treści do ponownej publikacji.

| Projekt | Decyzja | Powód |
| --- | --- | --- |
| `1755892723342` — nagrobek tradycyjny | Odrzucony | Kwiat jest znacznie większy niż na historycznym podglądzie i wystaje ponad kamień. |
| `1657160536159` — nagrobek laserowy | Odrzucony | Portret nachodzi na inskrypcje; napisy mają nierówną kompozycję i słabą czytelność w widoku głównym. |
| `1614353841893` — tablica brązowa | Odrzucony | Portret zasłania produkt. Starszy podgląd również pokazuje motywy i napis poza tablicą. |

[Manifest renderów](preview-candidates/manifest.json) zawiera źródło, wersję konfiguracji, SHA-256 źródła, politykę kamery i treści demonstracyjnej, rolę, wymiary, bajty oraz datę renderu. Automatyczna kontrola wykryła treść dochodzącą do krawędzi dwóch widoków głównych. Dla trzeciego dopiero ocena wizualna wykazała nakładanie elementów — brak błędu automatycznego nie stanowi akceptacji.

[Ocena ręczna](preview-candidates/review.json) oznacza wszystkie trzy widoki jako odrzucone i zapisuje hash ocenianych obrazów. Zbliżenia pozostają niezatwierdzone. Nie zastąpiono plików w `public/screenshots/v2026-3d/`, nie wybrano nowych okładek kategorii i nie wdrożono nowych obrazów publicznie.

Nowszy stan opisuje [raport napraw układu](stage-3-layout-repair.md). Powyższa tabela dokumentuje pierwotne problemy; bieżące obrazy i oceny są w manifeście oraz review.json.

## Pierwotna kolejność dalszych prac

1. Ustalić kontrakt jednostek i położenia motywów/napisów dla tych zapisów legacy. Naprawa ma działać w loaderze lub poprawionej konfiguracji, aby efekt był ten sam w galerii i Designerze. Nie maskować wad nowym kadrem.
2. Naprawić wymiary, osadzenie i maskowanie zdjęć; szczególnie przypadek tablicy zasłoniętej portretem. Potwierdzić rozmiar produktu i właściwą stronę powierzchni.
3. Powtórzyć tę samą próbkę i sprawdzić widok główny przy 480 px oraz przydatność zbliżeń. Zatwierdzić także treści i zasoby demonstracyjne.
4. Dopiero po odbiorze trzech reprezentantów rozszerzyć eksport i ocenę na pozostałe 33 projekty pilotażu, wybrać okładki i przygotować publiczny manifest obrazów.

Są to naprawy ze styku etapów 3 i 5. Ich ujawnienie jest powodem pozostawienia etapu 3 otwartego. Nie wykonano masowego eksportu pozostałych projektów z niesprawdzonym kontraktem.

## Kontrole

Wykonano rzeczywiste lokalne renderowanie trzech projektów i ocenę obrazów; to generowanie zasobów, bez zapisu projektu lub zamówienia. Wykonano ESLint narzędzi, kontrolę TypeScript i zgodność manifestów ze źródłami. Nie uruchamiano testów jednostkowych/E2E ani pełnego buildu. Nie potwierdzono pełnego lejka personalizacji ani danych produkcyjnych.

Polecenia: `pnpm designs:preview:dev`, `pnpm designs:preview:sample`, `pnpm designs:preview:report`. Po naprawie źródeł odtworzyć także manifesty etapu 2 i raport publikacyjny. Weryfikować bieżący `manifest.json`, ponieważ stare pliki kandydatów nie są samodzielnym dowodem aktualnego renderu.
