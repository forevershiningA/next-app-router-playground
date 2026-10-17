# Plan rozwoju galerii `/designs`

Data: 2026-10-16. Status: etapy 1–2 zakończone w zakresie inwentaryzacji, modelu danych i decyzji publikacyjnych; etap 3 w realizacji, etapy 4–8 oczekują na realizację. [Próbka etapu 3](../audits/2026-10-16-designs/stage-3.md), [naprawy układu](../audits/2026-10-16-designs/stage-3-layout-repair.md). Konfiguracje wymagające naprawy mają jawne blokady personalizacji i kolejkę przeglądu. [Postęp etapu 2](../audits/2026-10-16-designs/stage-2.md). [Raport etapu 1](../audits/2026-10-16-designs/README.md) zawiera wyniki, ograniczenia pomiarów i listę pilotażu naprawczego.

Cel: użytkownik znajduje odpowiedni projekt w galerii lub wyszukiwarce, może go dobrze obejrzeć i otworzyć dokładnie ten projekt do personalizacji w 3D Designerze.

Zakres obejmuje cztery poziomy: `/designs`, `/designs/[productType]`, `/designs/[productType]/[category]` i `/designs/[productType]/[category]/[slug]`. Nazwy i treści interfejsu pozostają angielskie, spójne z serwisem. Dotychczasowe zadania operacyjne dotyczące Sentry, CSP, poczty i dokumentów prawnych pozostają w `current.md`.

## Punkt wyjścia sprawdzony w repozytorium

- Metadane zawierają 3114 projektów, 17 typów produktów i 35 kategorii tematycznych. Obecna reguła `getSeoReadyDesigns()` kwalifikuje lokalnie 2967 projektów w 210 parach produkt–kategoria. To stan danych i plików, a nie liczba stron zaindeksowanych przez Google.
- Istnieją już serwerowe strony galerii, metadane, canonicale, breadcrumbs, JSON-LD, sitemap oraz odświeżanie ISR co 24 godziny. Rozwijamy te mechanizmy.
- `lib/design-seo.ts` dopuszcza 11 typów produktów. Zasadą dla kategorii jest minimum 5 projektów, z wyjątkami opartymi na historycznym ruchu GSC. Liczba projektów nie jest pełną oceną jakości kategorii.
- Gotowość projektu sprawdzana jest głównie przez obecność pliku PNG; kod dopuszcza wszystkie projekty z odpowiednich produktów, gdy lista screenshotów jest pusta. Brakuje wspólnego potwierdzenia jakości podglądu i możliwości załadowania projektu.
- Dwa rekordy mają identyczny slug przy różnych pełnych ścieżkach. `getDesignFromSlug()` wyszukuje globalnie po samym slugu; to ryzyko otwarcia lub przekierowania do innego projektu.
- Okładką kategorii jest pierwszy projekt z tablicy. Podkategoria renderuje wszystkie projekty bez paginacji, a siatkę na desktopie ogranicza panel nawigacji o szerokości 400 px.
- `DesignPageClient.tsx` ukrywa serwerowy blok `design-ssr-content` po hydratacji i odtwarza stronę po stronie klienta. Przy wejściu pobiera też projekt i ładuje go do globalnego store edytora. Treść strony i rozpoczęcie edycji wymagają wyraźniejszych granic.
- Istnieje `StartSavedDesignButton.tsx`, korzystający z `loadDesignById()`, oraz generator rzeczywistych podglądów 3D `scripts/batch-screenshot.js` z anonimizacją napisów.
- Repozytorium zawiera historyczne audyty. W etapie 1 użyto nowego eksportu `gsc/2026-10-16`, obejmującego 2026-07-15–2026-10-14, oraz zbadano próbkę publicznych stron. Raport rozdziela pomiary lokalnych danych, obserwacje produkcyjne i brakujące dane indeksowania oraz lejka.

## Etap 1 — Inwentaryzacja i pomiar początkowy

**Cel:** ustalić, które projekty i kategorie wymagają naprawy oraz które mają największy potencjał.

- Zbudować raport wszystkich rekordów: stabilny ID, pełny URL, produkt, kategoria, podgląd, dane do edytora, status publikacji i powód ewentualnego wykluczenia.
- Wykryć powtarzające się slugi, zduplikowane lub niemal identyczne projekty, błędne kategorie, nieaktualne produkty, brakujące i puste obrazy oraz niedostępne dane konfiguracji.
- Sprawdzić wizualnie reprezentatywne strony czterech poziomów na mobile i desktopie. Oddzielić problemy miniatur od problemów układu strony.
- Zebrać aktualne dane GSC: strony i zapytania, kraje, urządzenia, wyniki graficzne oraz raport indeksowania. Porównać ostatnie 28 dni z poprzednimi 28 dniami; przy małym ruchu rozszerzyć okres.
- Zmierzyć obecną ścieżkę galeria → projekt → kliknięcie personalizacji → udane załadowanie edytora. Brak danych oznaczyć jako brak pomiaru.
- Wybrać listę pilotażową z uwzględnieniem ruchu, różnorodności projektów oraz działających danych 3D.

**Rezultat i odbiór:** raport pokrywa wszystkie rekordy, rozdziela wyniki automatyczne od ocen wizualnych i zawiera priorytety oraz listę pilotażu. Potwierdzono aktualne dane GSC albo zapisano ich niedostępność i zakres możliwej pracy bez nich.

## Etap 2 — Tożsamość projektów, dane i struktura kategorii

**Cel:** każdy publiczny adres jednoznacznie opisuje właściwy projekt i prowadzi do właściwej konfiguracji.

- Oprzeć rozpoznawanie projektu na stabilnym ID i pełnym kontekście trasy. Naprawić kolizję slugów oraz sprawdzić metadane, canonical, sitemap i CTA dla obu rekordów.
- Zachować istniejące poprawne URL-e. Dla koniecznych zmian przygotować mapę przekierowań stałych; usunięte adresy oceniać indywidualnie według dostępnego odpowiednika i dotychczasowego ruchu.
- Przygotować wspólny model prezentacyjny: nazwa, krótki opis, rzeczywisty materiał i kształt, motywy, obsługiwane opcje personalizacji, obrazy, wersja konfiguracji, daty rzeczywistych aktualizacji oraz powód wyróżnienia projektu.
- Rozdzielić gotowość do wyświetlenia, personalizacji i indeksowania. Brak manifestu podglądów powinien zgłaszać problem, zamiast automatycznie kwalifikować cały katalog.
- Ustalić kategorię główną i opcjonalne tagi, np. floral, religious, veteran, pets. Przypisanie wielu tagów nie powinno tworzyć wielu stron tego samego projektu.
- Ustalić osobne kryteria dla kategorii: temat, odrębna intencja, jakość projektów, użyteczny opis i dane o zainteresowaniu. Zachować wartościowe małe kategorie z potwierdzonym ruchem.
- Oddzielić opublikowaną konfigurację wzorcową od prywatnego projektu klienta. Publiczne napisy, obrazy i metadane muszą być sprawdzone pod kątem danych osobowych.

**Rezultat i odbiór:** każdy projekt z pilotażu ma jednoznaczny adres, dane i konfigurację. Dla całego zbioru istnieje raport kolizji i decyzji publikacyjnych. Zmiany adresów mają sprawdzoną mapę przekierowań.

## Etap 3 — Podglądy, które pokazują wartość projektu

**Cel:** jakość i spójność obrazów zachęcają do obejrzenia projektu oraz wiernie przedstawiają stan w Designerze.

- Przygotować standard podglądów osobno dla nagrobków, tablic i monumentów: oświetlenie, tło, skala, marginesy, kąt kamery, widoczność podstawy i czytelność napisów.
- Generować obrazy z rzeczywistej konfiguracji 3D. Sprawdzić zgodność materiału, motywów i układu ze stanem otwieranym przez CTA.
- Dla pilotażu wykonać główny widok, zbliżenie detalu i — gdzie daje wartość — dodatkowy kąt. Nie dodawać powtarzalnych ujęć tylko dla zwiększenia liczby zdjęć.
- Wygenerować responsywne rozmiary miniatur i dużych obrazów; ustalić budżet wagi na podstawie jakości i pomiaru. Zachować poprawne proporcje i pełny obrys produktu.
- Dodać manifest obrazów z ID projektu, wersją konfiguracji, wymiarami, rolą ujęcia i datą aktualizacji. Ustalić opisowe, stabilne adresy nowych obrazów oraz naturalny alt.
- Wybierać okładki produktów i kategorii redakcyjnie. Kolejność kart powinna uwzględniać jakość, różnorodność i zgodność z tematem.
- Wykorzystać istniejący generator screenshotów i zautomatyzować wykrywanie pustych lub wadliwych kadrów. Zaplanować dostarczanie obrazów bez niekontrolowanego zwiększania rozmiaru repozytorium i wdrożeń Vercel.

**Rezultat i odbiór:** wszystkie projekty pilotażu mają zatwierdzony podgląd, czytelny na telefonie i zgodny z projektem 3D. Kategorie mają świadomie wybrane okładki. Dostępność pliku nie zastępuje oceny jego jakości.

## Etap 4 — Nowe galerie i odnajdywanie projektów

**Cel:** użytkownik szybko zawęża wybór i rozumie, że każdy prezentowany projekt jest punktem wyjścia do personalizacji.

| Poziom                              | Docelowy układ                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/designs`                          | Krótkie wyjaśnienie personalizacji, wyszukiwarka, wizualne kolekcje według produktu i tematu, wybrane projekty. |
| `/designs/[productType]`            | Najlepsze projekty danego produktu, wizualne kategorie, zwięzła informacja o dostępnych zmianach.               |
| `/designs/[productType]/[category]` | Krótki nagłówek, liczba wyników, filtry, duże miniatury i paginacja; rozwinięty poradnik pod siatką.            |

- Zaprojektować wspólną kartę: duży podgląd, krótka nazwa, konkretna cecha wyróżniająca i informacja o personalizacji. Ograniczyć dominację technicznych etykiet, np. liczby obszarów napisów.
- Główne otwarcie karty prowadzi do strony projektu. Ewentualny skrót do personalizacji jest osobnym kontrolerem i nie tworzy zagnieżdżonych linków lub przycisków.
- Dopasować nawigację boczną do szerokości ekranu; na mobile użyć dostępnego panelu filtrów. Zachować widoczność aktualnego produktu, tematu i breadcrumbs.
- Dodać użyteczne filtry, np. motyw, kształt i miejsce na zdjęcie, zgodnie z rzeczywistymi danymi. Sortowanie cenowe wdrażać wyłącznie przy wiarygodnych, porównywalnych cenach.
- Zachowywać filtr, stronę wyników i pozycję przewijania po powrocie ze strony projektu. Puste wyniki powinny pozwalać łatwo usunąć filtr lub wybrać podobny temat.
- Wprowadzić paginację serwerową, np. 24 projekty na stronę jako parametr do pomiaru. Kolejne strony mają własne URL-e i zwykłe linki; przycisk „Load more” może je uzupełniać.

**Rezultat i odbiór:** zaakceptowane widoki czterech szerokości ekranu, spójne karty i działające filtry. Projekt jest dostępny przez linki kategorii i paginacji bez konieczności wpisywania zapytania lub klikania „Load more”.

## Etap 5 — Strona projektu i wejście do 3D Designer

**Cel:** strona pomaga ocenić projekt, a personalizacja otwiera dokładnie obejrzany wzór.

- Zbudować jeden widoczny szablon serwerowy z małymi komponentami interaktywnymi. Zastąpić ukrywanie i odtwarzanie całej treści po hydratacji.
- Pierwszy ekran: duży podgląd z powiększeniem, krótka nazwa, cechy wzoru, informacja o możliwości zmian i główne CTA „Personalize in 3D”. Na mobile rozważyć stały przycisk bez zasłaniania treści i fokusu.
- Pokazać autentyczny opis układu oraz rzeczywiste parametry: kształt, materiał, motywy i dostępne zmiany. Usunąć wnioskowanie koloru, materiału i wykończenia wyłącznie z ogólnej nazwy produktu.
- Zapewnić treść dostępną bez JavaScript: nazwę, opis, główny obraz, parametry i powiązane projekty. Początek personalizacji ma mieć czytelny stan ładowania, błędu i ponowienia.
- Ładować zależności edytora na żądanie. Samo przeglądanie strony projektu nie powinno zmieniać bieżącego szkicu w globalnym store. Rozpoczęcie nowego projektu uwzględnia ochronę istniejących niezapisanych zmian.
- Zweryfikować zgodność ID, produktu, kształtu, napisów i motywów po uruchomieniu edytora, również przy obsługiwanym odczycie starszych formatów. Nie przechodzić po cichu do projektu domyślnego przy błędzie.
- Dodać kilka trafnych projektów podobnych i link do kategorii. Pokazywać cenę tylko przy sprawdzonym źródle i jasno określonym zakresie; w pozostałych przypadkach wyjaśnić wycenę po personalizacji.

**Rezultat i odbiór:** każdy projekt pilotażu otwiera właściwą konfigurację. Strona jest czytelna przed i po hydratacji, a oglądanie kilku projektów nie nadpisuje szkicu użytkownika.

## Etap 6 — Treści, indeksowanie i wyniki wyszukiwania

**Cel:** wyszukiwarki mogą odkryć właściwe strony i poprawnie rozpoznać ich temat oraz zawartość.

- Przygotować mapę intencji wyszukiwania dla kolekcji, kategorii i wzorów. Wykorzystać istniejące dane GSC; nie zakładać, że każda kombinacja tagów potrzebuje osobnej strony.
- Pisać krótkie, konkretne title, H1 i opisy. Przykładowa nazwa wzoru: „Blue Pearl Headstone with Dove Motif”, pod warunkiem zgodności z konfiguracją. Publiczne slugi pozostają stabilne mimo zmiany nazwy wyświetlanej.
- Rozwinąć przydatne treści kategorii: różnice między wzorami, możliwości personalizacji i wybór układu. Opisy projektów mają odwoływać się do widocznych cech; nie produkować masowo parafraz jednego tekstu.
- Ujednolicić reguły robots, canonical i sitemap ze statusem publikacji. W sitemap umieszczać kanoniczne strony przeznaczone do indeksowania; `lastModified` opierać na rzeczywistych zmianach treści lub konfiguracji.
- Każda prawidłowa strona paginacji ma canonical do siebie. Wewnętrzne wyszukiwanie i kombinacje filtrów mają osobną politykę indeksowania; używać `noindex` tam, gdzie robot może go odczytać. Nie łączyć blokady crawlowania z oczekiwaniem odczytu `noindex`.
- Przygotować linkowanie produkt → kategoria → projekt oraz projekty podobne. Poprawić 404, przekierowania, osierocone strony i sygnały rozbieżne między HTML, JSON-LD i sitemap.
- Zweryfikować `CollectionPage`, `ItemList`, `BreadcrumbList`, `ImageObject` i znaczenie `Product` dla poszczególnych stron. Dane mają odpowiadać widocznej treści; wymiary obrazu i identyfikatory produktu muszą być rzeczywiste.
- Oddzielić poprawny opis semantyczny od kwalifikacji do rozszerzonych wyników produktu. Nie dodawać fikcyjnej ceny, dostępności lub ocen firmy jako ocen pojedynczego wzoru. `Offer` wymaga prawdziwej oferty widocznej na stronie.
- Sprawdzić indeksowalność obrazów, OG, tekst alternatywny i obrazy w sitemap. Metadane nie mogą opisywać materiału lub detalu nieobecnego na podglądzie.

**Rezultat i odbiór:** crawl pilotażu potwierdza właściwe statusy, canonicale, indeksowalność, linkowanie i dostępność obrazów. Wyniki walidacji danych strukturalnych są zapisane wraz z faktycznymi warunkami kwalifikacji do rich results.

Zasady paginacji i filtrów opierają się na [dokumentacji paginacji Google](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) oraz [zarządzania nawigacją fasetową](https://developers.google.com/crawling/docs/faceted-navigation). Obrazy i dane produktu: [Google Images](https://developers.google.com/search/docs/appearance/google-images) i [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

## Etap 7 — Wydajność, dostępność i odbiór funkcjonalny

**Cel:** zapewnić sprawną galerię na telefonie i pewne przejście do personalizacji.

- Zmierzyć JS, obrazy i liczbę żądań czterech typów stron. Sprawdzić, czy dane i moduły 3D są pobierane dopiero tam, gdzie są potrzebne.
- Ustawić prawidłowe `sizes`, proporcje i priorytety obrazów pierwszego ekranu; pozostałe obrazy ładować stopniowo. Ograniczyć przesunięcia układu i oczekiwanie na dane klientowe.
- Sprawdzić klawiaturę, fokus, kontrast, etykiety wyszukiwania i filtrów, breadcrumbs, powiększenie zdjęć oraz komunikaty ładowania i błędu.
- Wykonać testy istotnych reguł: jednoznaczne rozpoznawanie projektu, kwalifikacja do publikacji, paginacja, canonicale i przekierowania. W E2E potwierdzić projekt → 3D Designer, powrót do galerii i ochronę istniejącego szkicu.
- Objąć przypadki: brak obrazu, błędne dane konfiguracji, błąd sieci, niepoprawna strona paginacji, brak wyników, duża i mała kategoria, długie nazwy oraz obsługiwane starsze projekty.
- Docelowe Core Web Vitals: LCP ≤ 2,5 s, INP ≤ 200 ms i CLS ≤ 0,1 w 75. percentylu rzeczywistych wizyt. Przy braku danych terenowych zapisać pomiary laboratoryjne z warunkami pomiaru; nie traktować ich jako potwierdzenia INP ani wyników użytkowników.

**Rezultat i odbiór:** pilotaż przechodzi ustalone kontrole funkcjonalne, SEO i dostępności; brak krytycznych błędów i pogorszenia względem porównywalnego pomiaru początkowego. Budżety wydajności są zapisane dla każdego typu strony.

Progi wydajności: [Web Vitals — web.dev](https://web.dev/articles/vitals).

## Etap 8 — Wdrożenie pilotażu i rozwijanie katalogu

**Cel:** wdrażać sprawdzone rozwiązanie i mierzyć efekt dla wyszukiwania oraz personalizacji.

- Proponowany pilotaż: `traditional-headstone`, `laser-etched-headstone` i `bronze-plaque`; po 2 kategorie i 6 projektów, łącznie 36 projektów. Dobór zależy od etapu 1. W próbce kontroli uwzględnić również małą kategorię oraz potwierdzoną kolizję slugów.
- Wdrożyć wspólne szablony i pilotażowe obrazy/treści z zachowaniem obsługi pozostałych istniejących stron. Zapisać wersję wdrożenia, mapę URL-i i sposób wycofania zmian.
- Po wdrożeniu wykonać kontrolę publicznych URL-i, podglądu mobilnego, personalizacji i sitemap. Użyć URL Inspection dla reprezentatywnych stron oraz monitorować błędy Sentry.
- Rejestrować minimalny lejek: `design_view`, `personalize_click`, `designer_load_success`, `designer_load_error`. Metryki opierać na ID projektu i typie produktu; nie wysyłać napisów klienta ani treści wyszukiwania. Wybrać mechanizm analityki odpowiedni do istniejącej konfiguracji i zgód.
- Oceniać po 14, 28 i 56 dniach: indeksowane docelowe URL-e, canonical wybrany przez Google, wyświetlenia i kliknięcia WWW/Images, CTR z uwzględnieniem pozycji, przejścia do projektu i skuteczne uruchomienia 3D.
- Rozszerzać obrazy i treści partiami według jakości i potencjału wyszukiwania. Przy małej próbie zbierać dane dłużej, zamiast wyciągać wnioski z pojedynczych kliknięć.

**Odbiór pilotażu:** pilotaż działa publicznie, wszystkie 36 ścieżek personalizacji są sprawdzone, pomiar zbiera zdarzenia, a raport po wdrożeniu określa kolejną partię katalogu.

**Domknięcie etapu:** cały opublikowany katalog korzysta z nowych reguł danych, obrazów i prezentacji. Raport obejmuje każdy rekord: zatwierdzony, naprawiony albo wyłączony z publikacji z uzasadnieniem i decyzją dotyczącą starego URL-a. Automatyczna kontrola dostępności i konfiguracji obejmuje wszystkie publikowane projekty, a ocena wizualna oraz testy przeglądarkowe obejmują każdą partię i przypadki podwyższonego ryzyka. Zakończenie techniczne nie oznacza gwarancji indeksacji ani określonej pozycji w Google.

## Kolejność i zasady prowadzenia prac

1. Etapy 1–2 ustalają poprawność danych, adresów i zakres pilotażu.
2. Etap 3 zatwierdza standard obrazów na małej próbce przed większym eksportem.
3. Etapy 4–5 wdrażają galerie i strony projektu na danych pilotażu.
4. Etap 6 domyka treści i SEO przed publikacją.
5. Etap 7 stanowi odbiór, etap 8 obejmuje wdrożenie i pomiar.

Każdy etap kończy się aktualizacją checklisty w `current.md`, zapisaniem wyników i opisem otwartych kwestii. Czas można oszacować po etapie 1, gdy znana będzie liczba wadliwych podglądów i konfiguracji. Ochrona istniejących wartościowych URL-i oraz zgodność podgląd → konfiguracja obowiązują we wszystkich etapach.

## Najważniejsze miejsca w kodzie

| Obszar                  | Pliki                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Galerie i kategorie     | `app/designs/page.tsx`, `app/designs/[productType]/page.tsx`, `app/designs/[productType]/[category]/page.tsx`, `components/designs/`             |
| Strona wzoru i CTA      | `app/designs/[productType]/[category]/[slug]/page.tsx`, `DesignPageClient.tsx`, `StartSavedDesignButton.tsx` w tym samym katalogu                |
| Dane i SEO              | `lib/saved-designs-data.ts`, `lib/saved-designs-data.json`, `lib/design-seo.ts`, `app/sitemap.ts`, `app/robots.ts`                               |
| Personalizacja i obrazy | `components/projects/DefaultDesignLoader.tsx`, `lib/saved-design-loader-utils.ts`, `scripts/batch-screenshot.js`, `public/screenshots/v2026-3d/` |

Historyczne materiały pomocnicze: `docs/audits/2026-09-28/`, w tym raport GSC. Aktualny stan produkcji i bieżące wyniki wyszukiwania wymagają sprawdzenia w etapie 1.
