# Audyt SEO i techniczny — 28 września 2026

**Wniosek: najpierw poprawić integralność płatności i zamówień, zależności bezpieczeństwa oraz niesprawne strony `/products`. Następnie uporządkować indeksowanie i ograniczyć wspólny JavaScript. Projekt ma już działające podstawy SEO; nie wymaga rozpoczynania SEO od zera.**

## Zakres i ograniczenia

- Kod: commit `70f5d44bb87310e312cae1a0a976ccccc1016ded` z istniejącymi lokalnymi zmianami użytkownika. Audyt nie zmienia kodu aplikacji ani tych zmian.
- Produkcja: publiczne żądania GET do `https://forevershining.org`, robots, sitemap, **41 adresów stron** w dwóch próbach (32 + 9), błędne adresy, przekierowania; bez logowania i operacji zapisu. Wynik wdrożenia nie musi odpowiadać lokalnemu commitowi.
- Przeglądarka: Chromium headless, Pixel 7 i desktop 1440 × 900, świeży kontekst dla każdej strony, pięć typów stron na obu urządzeniach. Zrzuty pełnej strony w tym katalogu.
- GSC: istniejący eksport **7 czerwca–6 września 2026**, nie aktualny odczyt konta. `Strony.csv` zawiera 1000 rekordów, więc może być ograniczonym eksportem. Raport skuteczności nie jest raportem stanu indeksowania.
- Płatności: rzeczywiste handlery uruchomione z atrapami bazy, sesji i Stripe. Nie wykonano rzeczywistej płatności, zwrotu, wysyłki wiadomości, usuwania projektu ani migracji bazy.
- To audyt reprezentatywnej próby, nie crawl każdego z 3178 URL-i. Nie wykonano pełnego pentestu, audytu WCAG ani testów całej geometrii konfiguratora.

Priorytety: **P0** — blokada danej ścieżki zakupowej do naprawy; **P1** — pilne ryzyko danych, bezpieczeństwa lub istotny błąd SEO/UX; **P2** — optymalizacja i porządkowanie. Potwierdzenie w kodzie lub atrapach nie oznacza incydentu na produkcji.

## Wyniki kontroli

| Kontrola | Wynik |
| --- | --- |
| `pnpm test` | **104/104**, 10 plików |
| `pnpm type-check` | **PASS** |
| Testy poprzedniego audytu, osobny config | **10/10**, 2 pliki |
| Nowe testy dowodowe płatności | **3/3** — przejście potwierdza opisane błędy |
| `pnpm lint` | **FAIL**, 10 błędów w `old-dyo/Item.js`, `Motif.js`, `Photo.js` |
| Prettier, zakres `app components lib tests .github next.config.ts package.json` | **FAIL**, 322 pliki; kontrola bez zapisu |
| Build produkcyjny | **PASS z ostrzeżeniami**, 115/115 stron statycznych; kompilacja około 6,1 min; log: `build.log` |
| Sitemap na produkcji | HTTP 200; **3178 URL-i**, 1 070 430 bajtów; brak duplikatów URL i przyszłych dat |
| 10 wizyt w przeglądarce | Brak nieobsłużonych wyjątków JS i poziomego overflow; cztery niedziałające linki `/products/bronze-plaque/*` |

Pierwsze uruchomienia pnpm blokował sandbox (`EPERM`); powtórzone kontrole poza sandboxem dały wyniki powyżej. Nie jest to błąd aplikacji. Pełnej kontroli formatowania zasobów `public/` nie powtarzano — wcześniejszy audyt wykazał nadmierny zakres tej bramki. Build ostrzega o `CompressionStream`/`DecompressionStream` w imporcie `jose` do Edge Runtime przez `lib/auth/session.ts`. Obecny kod używa podpisywania/weryfikacji JWT, a nie pokazanej w ostrzeżeniu dekompresji JWE; nie uznajemy tego za potwierdzoną awarię logowania. Sprawdzić zgodność przy aktualizacji zależności.

## Problemy wymagające naprawy

### T01 — P1: Next.js bez aktualnych poprawek bezpieczeństwa

`package.json` i `pnpm-lock.yaml` wskazują **15.5.7**. Wersja nie zawiera m.in. poprawek DoS i ujawnienia kodu Server Functions z grudnia 2025. Na dzień audytu oficjalnie dostępna jest **15.5.26**. Wydanie **15.5.27** zapowiedziano na 30 września; nie traktować go jako już wydanego.

Zalecenie: zaktualizować Next.js w obrębie 15.5 do aktualnego poprawionego wydania, sprawdzić zgodność React, `@next/mdx` i konfiguracji ESLint, wykonać build i regresję płatności/SSR. To nie wymaga automatycznie migracji do Next.js 16.

Źródła: [komunikat z grudnia](https://nextjs.org/blog/security-update-2025-12-11), [wydanie 22 września](https://nextjs.org/blog/nextjs-security-update-september-22-2026), [zapowiedź 30 września](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026). **RCE opisane 22 września dotyczy Next.js 16.2–16.3, nie 15.x**; nie przypisujemy tego konkretnego RCE temu projektowi.

### T02 — P0 dla PayPal: pobranie płatności przed odrzuceniem zamówienia

Miejsca: `app/my-account/designs/[id]/buy/page.tsx:240`, `app/api/orders/route.ts:38`.

Frontend wywołuje `actions.order.capture()`, następnie POST `/api/orders` z `paymentMethod: 'paypal'`. API przyjmuje wyłącznie `stripe` albo `other`; test z dokładnie tym rodzajem payloadu zwraca **400 bez zapisu zamówienia**. SDK PayPal i jego przycisk nadal są w kodzie. Jeśli capture powiedzie się u operatora, klient może zapłacić i otrzymać błąd zapisu.

Naprawa: do czasu implementacji serwerowego tworzenia i potwierdzania PayPal wyłączyć tę metodę; docelowo utworzyć zamówienie przed płatnością, wyceniać na serwerze, weryfikować capture i obsługiwać ponowienia. Samo dodanie `paypal` do dozwolonej listy nie rozwiązuje weryfikacji płatności.

Dowód: `payment-evidence.test.ts`, test T02. Nie wykonano capture na prawdziwym koncie operatora.

### T03 — P1: brak niezmiennej kopii zamówionego projektu, kaskadowe usuwanie

Miejsca: `lib/db/schema.ts:237`, `lib/projects-db.ts:325`, `app/api/projects/route.ts:242`, `app/api/orders/[id]/export-svg/route.ts:83`.

Zamówienie odwołuje się do projektu przez FK z `onDelete: 'cascade'`. Usunięcie własnego projektu nie sprawdza powiązanych zamówień. Eksport SVG pobiera bieżące `projects.designState`, a nie stan z chwili zamówienia. Edycja projektu może zmienić wynik eksportu już kupionego produktu; przy schemacie zgodnym z repo usunięcie projektu usuwa zamówienie i zależne rekordy.

Naprawa: snapshot projektu, wyceny, danych odbiorcy i plików produkcyjnych przy zamówieniu; eksport ze snapshotu; blokada lub soft-delete projektu powiązanego z zamówieniem; zmiana FK i migracja. Faktycznej konfiguracji FK produkcyjnej bazy nie odczytywano.

### T04 — P1: anulowanie nadpisuje także zakończoną płatność

`app/api/orders/[id]/route.ts:28–41` ogranicza zapis do właściciela, ale nie do stanu `pending`. Test właściciela opłaconego zamówienia potwierdza **200**, zmianę `paid → cancelled` i `completed → cancelled`. Handler nie wykonuje zwrotu u operatora.

Naprawa: dozwolone przejścia stanów, anulowanie tylko przed płatnością; zwrot jako osobny proces. Zachować prawdę o pobranych pieniądzach w rekordzie płatności. Test: T04.

### T05 — P1: częściowy zapis webhooka Stripe nie naprawia się przy ponowieniu

`app/api/webhooks/stripe/route.ts:60–99`: najpierw zapisuje `orders.status = paid`, później `payments.status = completed`, bez transakcji. Jeśli drugi zapis zawiedzie, kolejne dostarczenie webhooka nie znajdzie zamówienia, ponieważ wyszukuje tylko `pending`, i zwróci **200** z płatnością nadal `pending`.

Test T05 odtwarza tę sekwencję z awarią wyłącznie zapisu płatności. Naprawa: transakcja i idempotentne uzgadnianie obu rekordów; przechowywanie identyfikatora zdarzenia/sesji. Również utworzenie order/items/payment w `app/api/orders/route.ts:71–105` ma trzy niezależne zapisy i wymaga atomowości.

### T06 — P1: dane dostawy i uwagi z checkoutu nie są utrwalane z zamówieniem

`app/my-account/designs/[id]/buy/page.tsx:309–375`: formularz wymaga adresu, ale POST dla Stripe i `other` wysyła tylko projekt, metodę i flagę testową. `app/api/orders/route.ts` nie zapisuje adresu ani notatki. Pole `orders.notes` istnieje, lecz nie jest wypełniane tą ścieżką.

Naprawa: walidowany snapshot danych dostawy/kontaktu i uwag w API zamówień, odczytywany następnie przez panel, e-mail i dokumenty. Nie opierać realizacji wyłącznie na zmiennym profilu klienta.

### T07 — P1: e-mail zamówienia ma inne kwoty i numer

`app/my-account/designs/[id]/buy/page.tsx:158–184`: e-mail bierze cenę projektu jako subtotal i mnoży total przez **1,1**, zamiast użyć utrwalonej kwoty zamówienia. Używa ID projektu jako `orderId`, tworzy osobny numer `INV-...` i wymusza AUD. Ścieżka `other` nadal wywołuje tę funkcję.

Przykład obliczenia kodu: cena projektu 1100 daje e-mail total 1210. Serwerowe zamówienie jest wyceniane niezależnie. Naprawa: generowanie e-maila na serwerze z zapisanego zamówienia. Nie wysyłano wiadomości; ustalenie dotyczy spójności danych, nie interpretacji przepisów podatkowych.

### T08 — P2: bramki jakości są czerwone, regresje zakupowe poza CI

Lint pada na 10 błędach starego kodu `old-dyo/`; konfiguracja ignoruje `legacy/` i `archive/`, ale nie `old-dyo/`. Kontrola formatowania samego kodu wskazuje 322 pliki. `next.config.ts:7` wyłącza lint podczas buildu, więc zielony build nie zastępuje tej bramki.

CI ma skonfigurowane unit tests, lecz etap ten znajduje się po lint i format-check, więc ich niepowodzenie zatrzymuje job wcześniej. Testy poprzedniego audytu oraz nowe testy płatności leżą w `docs/`, poza `tests/unit/**/*.test.ts`, a Playwright nie jest etapem CI. Naprawa: ustalić zakres lint/format i przenieść testy naprawionych kontraktów do normalnego zestawu. Nie wykonywać masowego formatowania razem z naprawami funkcji.

### S01 — P1: `/products/bronze-plaque` kieruje do czterech 404

Potwierdzone publicznym GET i prefetchami przeglądarki: `/products/bronze-plaque/dedication`, `/memorial`, `/achievement`, `/honor` — wszystkie **404**. `/products` również zwraca 404, a jest linkowane w breadcrumbs szablonu.

Źródło: `app/products/[productSlug]/page.tsx:86–89,154`, breadcrumbs szczegółu szablonu. Naprawa: stworzyć rzeczywiste strony pośrednie albo skierować karty i breadcrumbs do istniejącej galerii. Test akceptacyjny: każdy link głównych kart i CTA prowadzi do właściwej strony 200.

### S02 — P1: dowolny produkt i typ tworzą indeksowalną kopię szablonu

Publicznie oba URL-e zwracają **200, index/follow, tę samą treść szablonu i canonical wskazujący na własny URL**:

```text
/products/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress
/products/audit-invalid-product/audit-invalid-type/the-science-hall/knowledge-is-the-seed-of-progress
```

`app/products/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx:40,58,66` wybiera rekord tylko po venue/inscription. To potwierdzona możliwość tworzenia duplikatów, nie dowód, że Google już zaindeksował takie sztuczne adresy.

Naprawa: walidować pełną kombinację parametrów i generować canonical z rekordu. Nieznane kombinacje powinny zwracać 404 albo trwałe przekierowanie do właściwego adresu. Dowód: `followup-http.json`.

### S03 — P1: niepoprawne adresy w JSON-LD szablonów

Publiczny szablon Science Hall zawiera w `Product.breadcrumb` adresy **`https://yourdomain.com/products...`**. Kod: ten sam plik, linie 494, 500, 506. Cena oferty jest wpisana na stałe jako 1200 USD; jej zgodność z rzeczywistą ofertą wymaga walidacji biznesowej.

Naprawa: prawdziwe, działające URL-e oraz osobny poprawny `BreadcrumbList`; oferta zgodna z widoczną treścią i faktycznym produktem. Następnie Rich Results Test. Parsowanie JSON wykonane w audycie nie zastępuje walidatora kwalifikacji do rich results. [Wymagania Google dla produktów](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

### S04 — P1: strona produktu dziedziczy interfejs konfiguratora

Na `mobile-products-bronze-plaque.png` stały nagłówek pokazuje **Traditional Engraved Headstone 600 × 600 mm** nad treścią Bronze Plaque i zasłania początek nagłówka strony. `ConditionalCanvas.tsx`, `MainContent.tsx` i warunki nawigacji wyłączają strony główne, `/designs`, `/memorials`, lecz nie traktują `/products` jako stron marketingowych.

Naprawa: osobny layout marketingowy albo wspólna, kompletna klasyfikacja tras. Na stronie produktu pokazywać nazwę/ofertę tego produktu; nie montować paneli i sceny edytora. Sprawdzić również CTA `/select-shape`, które nie koduje wyboru Bronze Plaque.

### S05 — P2: www przekierowuje tymczasowo, mimo trwałej reguły w repo

`https://www.forevershining.org/` zwraca na produkcji **307** do wersji bez www. HTTP bez www zwraca 308 do HTTPS. W repo są reguły 308 w middleware i konfiguracji, więc konfiguracja hostingu lub stan wdrożenia wymaga sprawdzenia. Nie ustalono, która warstwa generuje 307.

Naprawa: trwałe 301/308 dla docelowej domeny, zachowanie ścieżki i parametrów. Historyczne GSC zawiera 378 wyświetleń i 3 kliknięcia wariantu www, ale nie dowodzi to obecnego błędu indeksowania. [Interpretacja przekierowań przez Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects).

### S06 — P2: `/seo` jest pustą odpowiedzią 200 przed wykonaniem JS

Potwierdzone HTTP 200, bez H1 i canonicala; `app/seo/page.tsx:11` używa `router.replace('/designs')` w efekcie. Naprawa: trwałe przekierowanie HTTP do `/designs`.

### S07 — P2: sitemap zawiera roboczy etap konfiguratora i niedokładne daty

`/select-size` jest w sitemapie, ale w surowym HTML nie ma H1 ani canonicala i pokazuje metadane „Select Size”. Rozstrzygnąć cel: jeśli to etap narzędzia, usunąć z sitemapy i ustawić noindex; jeśli landing, dodać samodzielną treść i canonical.

**26 URL-i** w sitemapie ma stałą datę `2026-02-13`, w tym później rozwijane landingi i poradniki. Daty szczegółów wynikają z ID projektu, nie czasu ostatniej edycji treści. Używać rzeczywistej daty istotnej aktualizacji albo pominąć `lastmod`, kiedy nie jest wiarygodny. [Wskazówki Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

### S08 — P2: podwójna marka w title i brak obrazów OG na części landingów

Produkcja zwraca np. `... | Forever Shining | DYO Headstones` albo `... | DYO | DYO Headstones`. Wynika to z łączenia tytułów stron z szablonem głównego layoutu. Home, indeks galerii i produkt Bronze Plaque nie mają `og:image` w zbadanym HTML — lokalne obiekty `openGraph` pomijają obraz.

Naprawa: jedna polityka brandingu (`title.absolute` lub tytuły bez własnego sufiksu), wspólny obraz OG lub dedykowane obrazy. To poprawa prezentacji i udostępniania, nie dowód kary rankingowej.

### S09 — P2: robots.txt nie rozstrzyga całej polityki indeksowania paneli

`/login` zwraca 200 bez noindex; robots blokuje crawling tej ścieżki. Sam disallow nie gwarantuje usunięcia URL-a z wyników. Ustalić spójną politykę dla loginu, konta, zamówień i udostępnień; uwzględnić, że crawler musi móc odczytać noindex. Nie mylić tych ustawień z kontrolą dostępu. [Dokumentacja Google](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

### P01 — P2: wspólny JavaScript jest duży także na stronach treściowych

W próbce przeglądarkowej strony galerii i memorials pobierają około **0,95–0,96 MB skompresowanego transferu skryptów**, home około 1,08 MB, `/products/bronze-plaque` około 1,16 MB. Home wykazuje długie zadania na głównym wątku. `ClientShell` montuje dynamiczne loadery edytora globalnie; `ConditionalCanvas` statycznie importuje panele zanim zdecyduje o renderowaniu, a root layout ładuje katalog materiałów/kształtów.

Naprawa: najpierw rozdzielić zależności publicznych landingów i konfiguratora, następnie zmierzyć bundle i koszt HeroCanvas. Nie usuwać renderowanej po stronie serwera treści galerii. Zmiana architektury powinna być oceniona świeżym pomiarem przed/po.

## Pomiar mobilny i desktopowy

Wyniki i szczegółowe transfery: `browser-results.json`. **Całą serię powtórzono po zakończeniu buildu**; poniżej wyniki powtórzenia. Pierwsza seria pozostaje jako `browser-results-during-build.json`. Każda wizyta ma okno obserwacji 5 sekund po `load`, bez interakcji. **To próbka laboratoryjna, nie Lighthouse ani CrUX; emulacja Pixel 7 nie symuluje wolniejszego CPU ani sieci.** `blockingTimeProxyMs` to suma fragmentów długich zadań ponad 50 ms w obserwowanym oknie, a nie standardowe TBT. Nie zmierzono INP. Pojedyncze próbki nie zastępują percentyli rzeczywistych użytkowników.

| Strona | LCP mobile, po buildzie | JS transfer mobile | CLS mobile |
| --- | --- | --- | --- |
| `/` | 3,32 s | 1 084 106 B | 0 |
| `/designs` | 1,79 s | 952 776 B | 0 |
| `/designs/bronze-plaque` | 1,36 s | 952 292 B | 0 |
| `/memorials/plaques` | 0,33 s | 954 201 B | 0 |
| `/products/bronze-plaque` | 0,88 s | 1 161 776 B | 0,00022 |

Brak poziomego overflow i uszkodzonych obrazów w tej próbce nie oznacza pełnej zgodności WCAG. Widoczny problem zasłoniętego nagłówka opisano w S04.

## Co działa poprawnie

- Główna strona, galeria, sprawdzone kategorie, poradnik i szczegóły projektów mają treść oraz H1 w HTML z serwera.
- `/designs?q=butterfly` ma `noindex, follow` i canonical do `/designs`.
- Mała kategoria `/designs/bronze-plaque/nurse-memorial` ma noindex; kategoria teacher-memorial z historycznym ruchem pozostaje dostępna do indeksowania.
- Szczegół projektu z błędnym produktem/kategorią ma canonical do właściwego rekordu oraz sygnał przekierowania Next.js. Nie mylić go z błędem duplikacji szablonów `/products` z S02.
- Nieistniejąca kategoria galerii zwraca strumieniowane 200 z noindex/not-found; nie zgłaszamy jej jako potwierdzonej indeksowalnej soft-404. Zwykła nieistniejąca trasa zwraca 404.
- Sitemap nie ma zduplikowanych URL-i ani przyszłych dat i mieści się w limicie pojedynczej mapy. Nie wymaga podziału tylko z powodu 3178 wpisów.
- Stripe bierze kwotę zamówienia wycenionego po stronie serwera; klient nie może sam ustawić `paid`. Webhook sprawdza podpis, kwotę i walutę.

## Ponowna weryfikacja audytu z 13 września

| Poprzednie ustalenie | Stan 28 września |
| --- | --- |
| A01, A02 — paid od klienta, cena Stripe od klienta | Naprawy potwierdzone testami; T04/T05 dotyczą odrębnych przejść stanów i awarii |
| A03 — dowolny link resetu w publicznym e-mailu | Odrzucanie potwierdzone testem; brak limitowania w handlerze forgot-password nadal wymaga sprawdzenia ochrony infrastruktury |
| A04/A05 — zapis w tle, pricingBreakdown | Testy napraw przechodzą |
| A06 — URL resetu | Testy konfiguracji przechodzą |
| A07 — Next.js | Nadal otwarte, T01 |
| A08 — snapshot z nawigacji | Dwa testy wcześniejszego audytu przechodzą; nie zastępują wizualnej regresji całego 3D |
| A09 — fałszywy sukces checkout | Kod obsługuje nieudany POST; PayPal ma osobny błąd T02 |
| A10 — zmienny/usuwalny projekt zamówienia | Nadal otwarte, T03 |
| A11/A12 — e-mail, dane dostawy | Nadal otwarte, T06/T07 |
| A13 — CI/test dat | Unit tests są w CI i przechodzą; brak bramki E2E oraz czerwony lint/format, T08 |

## GSC: gdzie warto skupić SEO

W badanym okresie: **139 kliknięć / 6758 wyświetleń = 2,06% CTR**. Mobile: **73 kliknięcia**, desktop 59, tablet 7. USA: 80 kliknięć, Australia: 32, Kanada: 10. To mała próbka; nie daje podstaw do prognozowania przychodów ani dowodzenia kanibalizacji.

| Zapytanie | Wyświetlenia | Kliknięcia | Średnia pozycja | Kierunek pracy |
| --- | --- | --- | --- | --- |
| forever shining | 665 | 6 | 5,84 | Spójna marka, domena i snippet strony głównej |
| forever shining memorials | 248 | 15 | 15,28 | Rozpoznawalność marki; analiza kraju i strony docelowej w aktualnym GSC |
| full colour memorial | 62 | 0 | 11,81 | Treść i linkowanie odpowiedniej kategorii |
| butterfly headstone designs | 52 | 0 | 10,35 | Dopracować istniejące galerie butterfly |
| flower headstone engraving designs | 33 | 2 | 9,94 | Rozwinąć użyteczne porównania i opisy floral |
| headstones horse designs | 26 | 2 | 10,62 | Dopasować galerię pet/horse i linkowanie |

Nie tworzyć teraz setek kolejnych wariantów stron. Najpierw naprawić S01–S04 i wykorzystać istniejące galerie z potwierdzonym popytem. Zachować rozróżnienie intencji: `/memorials` — rodzina produktów, `/products` — konkretna oferta, `/designs` — inspiracje i szablony. Samo współistnienie tych sekcji nie dowodzi kanibalizacji.

Do sprawdzenia po wdrożeniu: aktualny raport indeksowania, inspekcja reprezentatywnych URL-i, canonical wybrany przez Google, rich results oraz CWV. Eksport kończy się 6 września i nie pozwala ocenić efektu późniejszych zmian.

## Kolejność napraw i warunki odbioru

1. **Płatności/dane:** zablokować wadliwy PayPal, zamknąć przejścia stanów, zapewnić transakcje i snapshoty. Testy potwierdzają brak capture bez zamówienia, brak kasowania opłaconych rekordów, poprawne ponowienie webhooka i spójne dokumenty.
2. **Bezpieczeństwo/CI:** aktualizacja zależności, zielony lint i odpowiednio ograniczony format-check; testy regresji płatności w normalnym CI.
3. **SEO i produkt:** działające CTA, walidacja tras szablonów, poprawny JSON-LD, usunięcie nakładki konfiguratora z landingów. Crawl po wdrożeniu ma potwierdzić statusy, canonicale i brak 404 w głównym linkowaniu.
4. **Porządki indeksowania:** domena www, `/seo`, sitemap, title/OG, polityka stron konta/narzędzia.
5. **Wydajność i treści:** rozdzielenie JS edytora, pomiary na spokojnym środowisku i danych użytkowników; rozbudowa kilku galerii wskazanych przez GSC.

## Materiały i powtórzenie

- `http-results.json`, `followup-http.json`: odpowiedzi, nagłówki, metadata, linki i JSON-LD.
- `robots.txt`, `sitemap.xml`, `sitemap-summary.json`: zapis stanu publicznego.
- `gsc-summary.json`: agregaty i reprezentatywne wiersze eksportu.
- `browser-results.json`, `mobile-*.png`, `desktop-*.png`: próbka przeglądarkowa.
- `payment-evidence.test.ts`: trzy nowe reprodukcje błędów, bez prawdziwych usług.
- `unit-tests.log`, `type-check.log`, `lint.log`, `format-source.log`, `build.log`: lokalne kontrole.

```powershell
pnpm exec tsx docs/audits/2026-09-28/public-audit.mjs
pnpm exec tsx docs/audits/2026-09-28/public-audit.mjs --followup
pnpm exec tsx docs/audits/2026-09-28/public-audit.mjs --browser
pnpm exec vitest run --config docs/audits/2026-09-28/vitest.config.ts
pnpm exec vitest run --config docs/audits/2026-09-13/vitest.config.ts
```
