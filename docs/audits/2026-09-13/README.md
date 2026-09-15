# Audyt regresji i gotowości do produkcji — 13 września 2026

**Wniosek: przed uruchomieniem rzeczywistych płatności trzeba usunąć problemy z potwierdzaniem zapłaty, zaufaniem do ceny klienta i trwałością zamówień.** Sam poprawny build nie zapewnia poprawności procesu zakupowego.

Stan bazowy: commit `25ef792ff7`, czysty katalog roboczy przed audytem. Audyt nie zmienia kodu aplikacji ani zależności. Dodano wyłącznie raport i materiały dowodowe w tym katalogu.

## Aktualizacja napraw — 14 września 2026

Po audycie wdrożono pierwszą partię poprawek. **A01, A02, A04, A05, A06 i A08 są naprawione w kodzie dla obsługi Stripe; A03, A09 i A13 są częściowo naprawione.** Genericzny endpoint e-mail odrzuca reset hasła, dedykowany endpoint tworzy własny token i poprawny URL, a testy obejmują tę ścieżkę. Brakuje ograniczenia częstotliwości resetów. Tło uploadu aktualizuje wyłącznie ścieżki plików i wymaga niezmienionego `updatedAt`, więc starsza operacja nie odtwarza starego projektu. Aktualizacja projektu zapisuje również `pricingBreakdown`. Zapis z DesignerNav zaczyna się od wspólnego `captureDesignSnapshot`, zachowując ustawienia płyty/obramowania i pozycjonowanie napisów. Zamówienie Stripe otrzymuje wycenę policzoną na serwerze z danych katalogowych, a webhook sprawdza podpis, kwotę i walutę przed potwierdzeniem płatności. Projekty z obrazami są blokowane w checkout do czasu dodania ich serwerowej wyceny. Checkout zatrzymuje się po nieudanym zapisie zamówienia, a sam parametr powrotu Stripe nie potwierdza już płatności. CI uruchamia Vitest, a test wygasania udostępnienia używa dni kalendarzowych, więc nie zależy od zmiany czasu. `pnpm test` przeszedł: 104 testy w 10 plikach. Playwright nadal nie jest bramką CI.

Zaktualizowane testy w `api-evidence.test.ts` sprawdzają bezpieczne zachowanie A03–A06; nadal potwierdzają pierwotne błędy A01 i A02. Nie wykonano płatności, wysyłki e-mail ani operacji na produkcyjnej bazie.

## Zakres i metoda

Przegląd kodu obejmował zapis i odtwarzanie projektu, wycenę, checkout Stripe/PayPal, zamówienia i eksport SVG, logowanie/reset hasła, udostępnianie, uploady, konfigurację renderera 3D i CI. Wykonano build, lint, kontrolę typów, istniejące testy jednostkowe, izolowane testy błędów i kontrole przeglądarkowe lokalnego buildu produkcyjnego.

Nie wykonywano rzeczywistych płatności, wysyłek e-mail, zmian w bazie ani testów penetracyjnych produkcji. Testy błędów API korzystają z prawdziwych funkcji obsługujących żądania, ale z atrapami bazy, operatora płatności, storage i poczty. Atrapy nie dowodzą działania rzeczywistych ograniczeń SQL, integracji ani autoryzacji między dwoma prawdziwymi kontami.

Priorytety: **P0** — blokada uruchomienia płatności; **P1** — pilna poprawka związana z bezpieczeństwem, utratą danych lub istotną funkcją; **P2** — poprawność danych i automatyzacja. Potwierdzenie w kodzie oznacza prześledzoną ścieżkę; nie oznacza, że problem wystąpił już na produkcji.

## Lista ustaleń

| ID | Priorytet | Problem | Potwierdzenie |
| --- | --- | --- | --- |
| A01 | P0 | Klient może oznaczyć zamówienie i płatność jako opłacone | 2 testy API + test UI |
| A02 | P1 | Cena podana przez klienta trafia bez przeliczenia do Stripe | Test całej ścieżki zapis → checkout |
| A03 | P1 | Publiczny endpoint poczty pozwala wysłać reset hasła z dowolnym linkiem | Test API + szablon |
| A04 | P1 | Starszy zapis w tle nadpisuje nowszy projekt | Test odwróconej kolejności zadań |
| A05 | P2 | Aktualizacja projektu nie aktualizuje szczegółów wyceny | Test funkcji zapisu |
| A06 | P1 | Niepoprawny adres w wiadomości resetującej hasło | 2 testy konfiguracji |
| A07 | P1 | Wersja Next.js nie zawiera opublikowanych poprawek bezpieczeństwa | Build/package.json + oficjalne komunikaty |
| A08 | P1 | Zapis z nawigacji pomija część ustawień pomnika i napisów | 2 testy serializacji/odtworzenia |
| A09 | P1 | Checkout wyświetla sukces mimo błędu zapisu zamówienia | Test UI z odpowiedzią API 500 |
| A10 | P1 | Zamówienie zależy od edytowalnego i usuwalnego projektu | Kod API, eksport, schemat i migracja SQL |
| A11 | P2 | Rachunek e-mail ma inną kwotę i numer niż zamówienie | Przechwycony payload UI + kod API |
| A12 | P1 | Dane dostawy i uwagi nie są zapisywane w zamówieniu | Przechwycony payload UI + kod API |
| A13 | P2 | CI nie uruchamia testów; istniejący test zależy od zmiany czasu | Workflow + wykonanie testów |

### A01 — Klient sam potwierdza zapłatę

Miejsca: `app/api/orders/route.ts:25–79`, `app/api/orders/[id]/route.ts:20–47`, `app/my-account/designs/[id]/buy/page.tsx:64–80`.

Zalogowany właściciel projektu może przesłać `status: "paid"` do POST zamówień albo PATCH własnego zamówienia. API zapisuje status zamówienia `paid` i płatności `completed`, nawet bez `paymentRef`. Nie pobiera potwierdzenia od Stripe/PayPal. W przeszukanych `app/` i `lib/` nie znaleziono webhooka ani serwerowej weryfikacji sesji płatniczej.

Przeglądarka po samym `?payment=success` wyświetla „Order Received!”. Jeśli istnieje `pendingOrderId`, wysyła także PATCH ze statusem opłacenia. Dwa testy wywołujące rzeczywiste handlery potwierdziły zapis opłacenia bez kontaktu z operatorem. Osobny test UI potwierdził fałszywy komunikat sukcesu po zmianie query string.

**Poprawka:** klient może jedynie rozpocząć zakup. Status zapłaty powinien pochodzić z serwerowej weryfikacji operatora, związanej z konkretnym zamówieniem, kwotą, walutą i kontem. Potrzebna jest idempotentna obsługa webhooków. Strona powrotna powinna odczytywać status z serwera.

### A02 — Nieufna cena klienta jest ceną płatności

Miejsca: `app/api/projects/route.ts:88–119`, `app/api/checkout/stripe/route.ts:30–65`, `app/api/orders/route.ts:41–59`.

POST projektu przyjmuje dowolne `totalPriceCents` i walutę z JSON. Checkout pobiera te wartości z projektu, ale ich serwerowe zapisanie nie czyni ich wiarygodnymi. Test zapisał projekt za `100` centów, a następnie potwierdził, że do atrapy Stripe trafiło `unit_amount: 100`. Sprawdzane jest tylko, czy cena jest dodatnia.

**Poprawka:** autorytatywna wycena po stronie serwera na podstawie zwalidowanych parametrów i katalogu, następnie niezmienna wycena zamówienia. Kwota przesłana przez przeglądarkę nie może ustalać należności.

### A03 — Publiczne wysyłanie wiadomości z dowolnym linkiem resetu

Miejsca: `app/api/email/route.ts:27–49`, `lib/email/templates/PasswordResetEmail.tsx:40`.

Typ `password-reset` omija autoryzację. API przekazuje całe ciało żądania do `sendEmail`, a szablon umieszcza `resetUrl` bezpośrednio w przycisku. Osoba niezalogowana wybiera odbiorcę i adres docelowy, nie potrzebując istniejącego tokenu resetu. Test potwierdził przekazanie `https://untrusted.example.invalid/reset` do modułu poczty.

**Skutek:** możliwość nadużywania firmowej poczty i wysyłania wiarygodnie wyglądających wiadomości z obcym linkiem, jeśli SMTP jest skonfigurowane. W audycie żadnej takiej wiadomości nie wysłano.

**Poprawka:** usunąć publiczny dostęp do tego rodzaju wysyłki. Reset powinien być inicjowany wyłącznie przez dedykowany endpoint generujący własny token i adres URL. Dodać ograniczenia częstotliwości.

### A04 — Zadanie w tle może cofnąć zapis projektu

Miejsca: `app/api/projects/route.ts:129–174`, `lib/projects-db.ts:85–115`.

Po szybkiej odpowiedzi POST zadanie `after()` uploaduje pliki, a następnie wywołuje pełne `saveProjectRecord` ze starym tytułem, stanem projektu i ceną. Scenariusz: zapis A, zapis B, zakończenie uploadu B, zakończenie uploadu A. Test potwierdził, że finalny tytuł i napis wracają do A. Także zwykła zmiana nazwy podczas uploadu może zostać cofnięta.

Ponadto zadanie nie przekazuje `materialId`, `shapeId` ani `borderId`, a pełna funkcja zapisu zastępuje brakujące wartości przez `null`.

**Poprawka:** zadanie powinno aktualizować tylko ścieżki plików i tylko dla nadal aktualnej wersji projektu. Użyć wersji/znacznika rewizji i warunkowego UPDATE. Nie zapisywać ponownie pól biznesowych.

### A05 — Szczegóły wyceny pozostają ze starej wersji

Miejsca: `lib/projects-db.ts:80–109`, `lib/projects-db.ts:126–153`, `lib/design-quote.ts:74`.

`pricingBreakdown` jest dodawane przy INSERT, ale nie przy UPDATE. Test zmienił `totalPriceCents` z 110000 na 220000, podczas gdy `pricingBreakdown.total` pozostało równe 1100. Odtworzona wycena lub wiadomość udostępnienia może więc opisywać poprzednią wersję projektu.

**Poprawka:** aktualizować stan, cenę i szczegóły wyceny atomowo w jednej wersji zapisu. Dodać test zmiany istniejącego projektu i ponownego odczytu.

### A06 — Błędne składanie adresu resetu hasła

Miejsce: `app/api/auth/forgot-password/route.ts:48–52`.

Wyrażenie łączące `??` i `?:` jest interpretowane jak `(NEXT_PUBLIC_SITE_URL ?? VERCEL_URL) ? ... : ...`. Przy ustawionym adresie strony i braku `VERCEL_URL` powstaje `https://undefined/reset-password/...`. Gdy oba są ustawione, używany jest host wdrożenia zamiast wskazanego adresu strony. Obie sytuacje odtworzono testami handlera.

**Poprawka:** jawne nawiasy albo oddzielna funkcja wyznaczająca adres bazowy; testy dla konfiguracji lokalnej i produkcyjnej. Przy okazji ujednolicić deklarację ważności linku: API ustala 24 godziny, szablon mówi o jednej godzinie.

### A07 — Brak poprawek bezpieczeństwa frameworka

Miejsca: `package.json` (`next: 15.5.7`, `react/react-dom: 19.1.2`), `next.config.ts`. Uruchomiony build potwierdził Next.js 15.5.7 i użycie App Router.

Oficjalny [komunikat z 11 grudnia 2025](https://nextjs.org/blog/security-update-2025-12-11) opisuje DoS w App Router i ujawnienie kodu funkcji serwerowych; poprawiona wersja tej linii wskazana w komunikacie to 15.5.9. Projekt jest poniżej tego progu. Późniejszy [komunikat z 25 sierpnia 2026](https://nextjs.org/blog/august-2026-security-release) wskazuje kolejne poprawki w 15.5.24, dotyczące m.in. optymalizacji AVIF i określonych wdrożeń Windows.

**Poprawka:** aktualizacja do aktualnej poprawionej wersji obsługiwanej linii, obejmującej co najmniej zestaw poprawek 15.5.24, i ponowne testy. Nie zatrzymywać aktualizacji na grudniowym minimum. Nie wykonywano exploitów ani pełnego skanowania wszystkich zależności. Nie potwierdzono spełnienia wszystkich warunków sierpniowych podatności ani kompromitacji wdrożenia.

### A08 — Zapis z nawigacji nie zachowuje pełnego projektu

Miejsca: `components/DesignerNav.tsx:2328–2386`, `lib/project-serializer.ts:24–128`, `components/HeadstoneInscription.tsx:422–431`.

Nawigacja ręcznie składa inny snapshot niż `captureDesignSnapshot`. Pomija `showLedger`, `showKerbset` i ich wymiary. Przy odtworzeniu brakujące wartości są zastępowane bieżącymi wartościami store. Test zachował w payloadzie zmiany podstawy i mocowania, ale potwierdził utratę ustawień płyty/obramowania pomnika. Odtworzony projekt może zależeć od wcześniej oglądanego produktu.

Ręczne mapowanie napisów pomija `coordinateSpace`, `textAlign` i `layer`. Szczególnie napis na podstawie może nadal używać `mm-center`; po utracie tej informacji te same liczby mają inne znaczenie geometryczne. Test potwierdza utratę pól, nie mierzy fizycznego przesunięcia w każdym modelu.

**Poprawka:** użyć jednego serializatora dla wszystkich przycisków zapisu, zachować pełne dane napisów i stosować wersjonowany schemat. Dodać testy round-trip dla pełnego pomnika, napisu na podstawie i tekstu wyrównanego do lewej.

### A09 — Sukces mimo nieutworzonego zamówienia

Miejsca: `app/my-account/designs/[id]/buy/page.tsx:213–226`, `:256–280`, `:296–308`.

Ścieżka „Pay by Phone / BPAY / Cheque” nie sprawdza `response.ok`; po odpowiedzi 500 wysyła wiadomość i pokazuje „Order Received!”. Test UI lokalnego buildu odtworzył dokładnie ten przypadek. Analogicznie PayPal nie czeka na poprawny zapis przed pokazaniem sukcesu. Ścieżka Stripe może kontynuować tworzenie sesji mimo nieudanego POST zamówienia.

**Poprawka:** jawnie obsłużyć status odpowiedzi, przerwać proces po błędzie i umożliwić bezpieczne ponowienie. Wiadomości transakcyjne powinien wysyłać backend po trwałym zapisie. Powiązać sesję płatności z istniejącym zamówieniem i wprowadzić idempotencję.

### A10 — Brak niezmiennego projektu zamówienia; usunięcie projektu usuwa historię

Miejsca: `lib/db/schema.ts:237–289`, `drizzle/0000_nifty_old_lace.sql:225–229`, `lib/projects-db.ts:265`, `app/api/orders/[id]/export-svg/route.ts:83–95`.

Zamówienie wskazuje żywy rekord projektu. Przy tworzeniu pozycji zapisywana jest nazwa i cena, ale nie kopia stanu projektu. Eksport SVG pobiera aktualne `projects.designState`. Późniejsza edycja może więc zmienić materiał do realizacji istniejącego zamówienia.

Schemat i migracja mają `ON DELETE CASCADE` na powiązaniu projekt → zamówienie, a dalej zamówienie → płatności/pozycje. Endpoint usuwania projektu sprawdza właściciela, ale nie obecność zamówień. Przy bazie zgodnej z migracją usunięcie własnego projektu usuwa również powiązaną historię zakupową. Nie wykonano tego na prawdziwej bazie i nie zweryfikowano schematu produkcji.

**Poprawka:** niezmienny snapshot projektu i wyceny w zamówieniu, ograniczenie usuwania powiązanych danych, archiwizacja zamiast kasowania historii. Eksport powinien korzystać z wersji zatwierdzonej przy zakupie.

### A11 — Rozbieżność kwot i numerów rachunku

Miejsca: `app/my-account/designs/[id]/buy/page.tsx:153–176`, `app/api/orders/route.ts:48–59`.

Przy zapisanej cenie końcowej **1100 AUD** UI pokazuje 1100, ale payload e-mail zawiera subtotal 1100, tax 110 i **total 1210 AUD**. Kwoty przechwycono w przeglądarce bez wysyłania wiadomości. Backend zamówienia dla tego samego totalu zapisuje subtotal 990 i tax 110. To nie odpowiada wcześniejszej wycenie aplikacji, która dodaje 10% do subtotalu (np. 1000 + 100 = 1100).

Frontend ponadto tworzy własny numer `INV-<fragment ID projektu>` zamiast użyć numeru wygenerowanego dla zamówienia, a `orderId` w wiadomości jest ID projektu.

**Poprawka:** wyświetlanie, płatność, e-mail i PDF mają czytać te same utrwalone kwoty i identyfikatory zamówienia. Nie doliczać ponownie podatku do ceny końcowej. To ustalenie o niespójności obliczeń aplikacji, nie ocena prawna zasad podatkowych.

### A12 — Formularz dostawy nie przekazuje danych do zamówienia

Miejsca: `app/my-account/designs/[id]/buy/page.tsx:219–223`, `:256–278`, `:298–305`; `app/api/orders/route.ts:22–80`.

Formularz zbiera imię, telefon, adres i uwagi, ale POST `/api/orders` wysyła tylko projekt i informacje o metodzie/statusie płatności. Test wpisał uwagi i użył przykładowego adresu; przechwycony POST nie zawierał żadnego z tych pól. Adres trafia jedynie do osobnego e-maila w niektórych ścieżkach. Uwagi nie trafiają nawet do tego e-maila. Edycja adresu na stronie zakupowej nie aktualizuje profilu.

**Poprawka:** walidować i zapisywać dane dostawy oraz uwagi jako snapshot zamówienia, odrębny od późniejszych zmian profilu. Wysyłkę wiadomości oprzeć na tym zapisie.

### A13 — Testy nie stanowią bramki CI

Miejsca: `.github/workflows/ci.yml`, `tests/unit/share-flow.test.ts:126`, `app/api/share/create/route.ts:64–65`, `tests/e2e/designer-performance-mobile.spec.ts`.

Workflow wykonuje type-check, lint, formatowanie i build, lecz nie uruchamia Vitest ani Playwright. Istniejący zestaw jednostkowy zakończył się wynikiem **95/96**. Błąd dotyczy limitu 90 dni: kod dodaje dni kalendarzowe przez `setDate`, test porównuje do 90 × 24 godzin. W strefie Europe/Warsaw okres od 13 września przekracza jesienną zmianę czasu i trwa 2161 zamiast 2160 godzin. Ponowne uruchomienie wyłącznie pliku `share-flow.test.ts` z `TZ=UTC` dało **6/6 PASS**, potwierdzając zależność od strefy czasowej. To niestabilność kontraktu/testu dat, nie dowód złamania zabezpieczenia udostępnienia.

Test mobilny zmienia wyłącznie viewport w desktopowym projekcie Chromium. Zbiera m.in. `nonBlank` i błędy konsoli, ale nie asertuje ich oraz nie definiuje budżetu wydajności. Testy API projektów nie sprawdzają round-trip, konkurencyjnych zapisów ani dostępu między dwoma kontami.

Kontrola formatowania wykryła **43 191 plików z niezgodnościami** przed zatrzymaniem skanowania: 42 652 w `public/`, ale również 140 w `app/`, 99 w `components/` i 101 w `lib/`. To istniejący stan repozytorium, nie zmiany audytu. Obecna bramka formatowania wymaga uporządkowania zakresu i baseline; nie wykonano masowego przeformatowania.

**Poprawka:** uruchamiać testy jednostkowe w CI; ustalić i zamrozić czas w testach dat. Dodać deterministyczne E2E z izolowaną bazą i atrapami SMTP/płatności, sprawdzające cały proces oraz scenariusze awarii.

## Wyniki wykonanych sprawdzeń

| Sprawdzenie | Wynik |
| --- | --- |
| `pnpm type-check` | PASS |
| `pnpm lint` | PASS; informacja Babel o dużym generowanym pliku |
| `pnpm build` | PASS; wygenerowano 113 stron statycznych; ostrzeżenia `jose` o CompressionStream/DecompressionStream w Edge Runtime |
| `pnpm test` | 95 PASS, 1 FAIL; szczegóły A13 |
| Diagnostyka `share-flow.test.ts`, `TZ=UTC` | 6/6 PASS |
| Izolowane testy audytu | 10/10 odtworzyło opisane zachowania |
| API bez sesji, lokalny build | 7/7 zwróciło 401: GET/POST/DELETE projektów, POST/PATCH zamówień, Stripe, tworzenie udostępnienia |
| Strona główna, desktop i mobile | HTTP 200, widoczny canvas, brak zaobserwowanych `pageerror`/HTTP ≥400 i poziomego overflow |
| Konfigurator, desktop i mobile | HTTP 200, potwierdzone renderowanie modelu, brak zaobserwowanych `pageerror`/HTTP ≥400 i poziomego overflow |
| Mobilna zmiana projektu | Wybrano African Black, przejście do rozmiaru i zwiększenie szerokości do 610 mm; brak `pageerror` i poziomego overflow |
| Checkout z atrapami API | Potwierdzony fałszywy sukces po HTTP 500 i po samym `payment=success` |
| `pnpm exec prettier --check .` | Wykryto 43 191 niezgodnych plików; dalsze skanowanie zatrzymano. To niepełna lista, nie pozytywny wynik kontroli. [Podsumowanie](format-summary.json); surowy log lokalny `format-check.log` |

W próbie konfiguratora renderer raportował 16 draw calls, 1644 trójkąty, 19 geometrii i 22 tekstury. Na mobile canvas miał 487 × 1055 px dla CSS 390 × 844, zgodnie z ograniczeniem DPR do 1.25. W kodzie działa renderowanie `frameloop="demand"`. To korzystne mechanizmy i wynik dla jednego prostego modelu, nie certyfikat wydajności całego katalogu.

Zrzuty sprawdzono wizualnie. Pierwsza próba testu złapała canvas przed inicjalizacją; poprawiono oczekiwanie na rzeczywiste renderowanie i ponowiono. Test checkout wymagał korekty selektora do aktualnej etykiety „Pay by Phone / BPAY / Cheque”; po korekcie reprodukcja zakończyła się sukcesem.

## Granice audytu i dalsza walidacja

- Nie uruchamiano istniejących E2E zapisujących projekty na rzeczywistym koncie: ich ścieżka uruchamia wysyłkę e-mail. Dla tego audytu zastąpiono takie operacje kontrolowanymi atrapami.
- Brak testu integracyjnego dwóch prawdziwych kont i rzeczywistego PostgreSQL. Filtrowanie właściciela jest obecne w odczycie/edycji/usuwaniu projektów; brak sesji sprawdzono na działającym serwerze.
- Emulacja mobilnego Chromium nie zastępuje iPhone/Safari, fizycznej klawiatury ekranowej ani pomiarów na słabym GPU. Nie mierzono Core Web Vitals na produkcji ani długotrwałego zużycia pamięci wszystkich modeli.
- Eksport SVG przejrzano w kodzie; nie przeprowadzono metrologicznego porównania z każdym modelem, fontem i wariantem produkcyjnym.
- Uploady: aktualny proxy ma limit 8 MB i listę MIME. Starsze `/api/upload/image`, `/api/upload/crop` i `/api/cache-svg` pozostają publicznymi operacjami zapisu plików; używają nazw zależnych od żądania. Warto usunąć nieużywane endpointy lub nadać zapisom właściciela i unikalne identyfikatory. Nie wykonywano prób nadpisania plików. Wdrożenie z systemem plików tylko do odczytu może ograniczać ich działanie.
- Nie wykonano pełnego audytu infrastruktury, polityk retencji danych, konfiguracji SMTP, wszystkich zależności ani kolejnego audytu SEO/GSC. Sprawdzenie A07 dotyczy frameworka i oficjalnych poprawek, nie pełnego `pnpm audit`.
- Skanowanie formatowania przerwano po potwierdzeniu rozległych istniejących niezgodności, przede wszystkim w wygenerowanych zasobach. Nie uzyskano pełnego inwentarza różnic formatowania.

## Zalecana kolejność napraw

1. A01–A03 i A07: potwierdzanie płatności, serwerowa cena, publiczna poczta, aktualizacja frameworka.
2. A04, A08 i A10: wersjonowanie zapisu, pełny snapshot, niezmienne zamówienia.
3. A09, A11 i A12: obsługa awarii checkout, jednolite kwoty/identyfikatory, dane dostawy.
4. A05, A06 i A13: poprawność aktualizacji wyceny, reset hasła, automatyczna ochrona przed regresją. A06 można wykonać niezależnie jako małą pilną poprawkę.

## Materiały dowodowe i odtworzenie

- [Testy API](api-evidence.test.ts) i [testy serializacji](snapshot-evidence.test.ts).
- [Skrypt przeglądarkowy](browser-audit.mjs), [wyniki renderowania i auth](browser-results.json), [wyniki checkout](checkout-results.json).
- [Scenariusz mobilny](mobile-flow.mjs) i [jego wynik](mobile-flow-results.json).
- [Desktop](desktop-designer.png), [mobile](mobile-designer.png), [mobilna zmiana wymiarów](mobile-size.png), [fałszywy sukces checkout](checkout-false-success.png).

```powershell
pnpm exec vitest run --config docs/audits/2026-09-13/vitest.config.ts

# Po ukończeniu builda; uruchomić lokalny serwer w osobnym terminalu:
pnpm exec next start -p 3107
node --input-type=module -e "await import('./docs/audits/2026-09-13/browser-audit.mjs')"
node --input-type=module -e "await import('./docs/audits/2026-09-13/mobile-flow.mjs')"
```

**Ważne dla interpretacji testów audytu:** zielony wynik oznacza odtworzenie obecnego błędu, a nie jego naprawę. Zestaw jest celowo poza standardowym `pnpm test`. Po naprawach należy zastąpić te dowody normalnymi testami oczekiwanego, bezpiecznego zachowania.

Lokalny serwer audytu na porcie 3107 został zatrzymany po zakończeniu prób. Raport nie obejmuje wdrożenia poprawek.
