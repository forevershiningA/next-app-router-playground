# Home Page USA-first — ponowny audyt UX, SEO i design consistency

Data: 2026-10-02  
Zakres: wyłącznie `/` oraz bezpośrednio używane `app/page.tsx`, `app/_ui/HomeSplash.tsx`, `app/_internal/home-content.ts`, `app/layout.tsx`, `styles/globals.css`  
Metoda: review kodu, aktualne Web Interface Guidelines oraz render Chromium 1440×900 i 390×844

## Werdykt

Tak — Home Page jest wyraźnie lepszy. Usunięto wszystkie wcześniejsze blokery P0, skrócono katalog na mobile, uporządkowano CTA, dodano kompletne social metadata i przestawiono język oraz SEO na USA-first. Strona wygląda teraz jak spójny landing produktu, a nie jak sam katalog.

Oceny kierunkowe (poprzednio → teraz):

- UX i konwersja: **6.5 → 7.8/10**
- fundamenty SEO: **7.5 → 8.3/10**
- spójność wizualna: **7.0 → 8.1/10**
- dostępność: **5.0 → 8.5/10**

## Co poprawiono

- `app/_ui/HomeSplash.tsx:197` — prawidłowy landmark `<main>` i działający skip link.
- `styles/globals.css:93` — globalny, widoczny focus dla elementów interaktywnych.
- `app/_ui/HomeSplash.tsx:154` — menu mobilne przenosi i zamyka fokus, obsługuje Escape, trap Tab oraz blokadę scrolla.
- `app/_ui/HomeSplash.tsx:281` — główne CTA pozostaje widoczne na tabletach.
- `app/_ui/HomeSplash.tsx:384` — hero korzysta z `next/image`, ma wymiary responsywne i priorytet LCP.
- `app/_ui/HomeSplash.tsx:623` — mobile pokazuje 6 zamiast 12 kart; pełny katalog pozostaje dostępny z CTA.
- `app/_ui/HomeSplash.tsx:571` — animacje hover respektują `prefers-reduced-motion`.
- `app/_ui/HomeSplash.tsx:930` — FAQ i linki pomocnicze mają prawdziwe, deep-linkowalne cele.
- `app/page.tsx:16` — Open Graph i Twitter mają obraz, tytuł oraz opis.
- `app/page.tsx:6` — język wyszukiwarki, canonical, `en-US` i treść są spójne z kierunkiem USA-first.
- Desktop i mobile nie wykazują poziomego overflow; hierarchia H1–H3 jest logiczna.

## Pozostałe priorytety

### P1 — zaufanie i konwersja na rynek USA

- `app/_ui/HomeSplash.tsx:488` — „since 2005” nadal jest jedynym silnym dowodem zaufania. Dodać weryfikowalne opinie, liczbę wykonanych realizacji, zdjęcia gotowych memorials, gwarancję/material durability albo opis pomocy przy cemetery approval.
- `app/_ui/HomeSplash.tsx:467` — pasek pod hero opisuje funkcje, ale nie redukuje głównych obaw klienta USA: zgodność z wymaganiami cmentarza, dostawa, montaż, czas realizacji i kontakt z człowiekiem.
- `app/_ui/HomeSplash.tsx:983` — główny kontakt North America ma adres w Kanadzie, a profile social prowadzą głównie do kont australijskich. To może osłabiać obietnicę „Forever Shining USA”. Jasno opisać model obsługi USA zamiast sugerować lokalizację, której firma nie ma.

### P1 — dane strukturalne i pozycjonowanie

- `app/page.tsx:107` — `LocalBusiness/Store` wskazuje kanadyjski adres, podczas gdy title i areaServed eksponują USA. Jeżeli `.org` nie ma fizycznej placówki w USA, użyć `Organization`/`OnlineStore` i nie budować lokalnego sygnału na adresie w Ontario.
- `app/page.tsx:6` — title jest trafny, ale długi i może być ucinany. Lepszy wariant testowy: `Custom Headstones & Memorial Plaques | Forever Shining`.
- `app/page.tsx:21` — social image istnieje, lecz jest ogólnym zdjęciem krajobrazu 1920×1139. Przygotować dedykowaną grafikę 1200×630 z produktem, krótką korzyścią i brandingiem.

### P2 — hierarchia i tempo strony

- `app/_ui/HomeSplash.tsx:620` — desktop nadal pokazuje 12 rozbudowanych kart, przez co proces, FAQ i wsparcie są daleko poniżej pierwszego ekranu. Test A/B: 6 najlepiej sprzedających się kategorii również na desktopie.
- `app/_ui/HomeSplash.tsx:436` — CTA w hero mówi „Design Your Memorial in 3D”, kolejne „Start Designing in 3D”, a później „Choose a memorial product”. Ujednolicić główną akcję do jednej etykiety, np. `Start Designing in 3D`.
- `app/_ui/HomeSplash.tsx:686` — jasna sekcja procesu jest czytelna i obecnie wygląda celowo, ale pojawia się tylko raz. Można wykorzystać ten sam jasny surface dla opinii/realizacji, tworząc rytm zamiast pojedynczego przełamania.
- `app/_ui/HomeSplash.tsx:405` — mobilny hero mieści najważniejsze elementy, ale H1, opis, 2 CTA i proof line są ciasno upakowane. Warto przetestować krótsze drugie CTA (`See How It Works`) i przenieść proof line do paska korzyści.

### P2 — zgodność z Web Interface Guidelines

- `app/_ui/HomeSplash.tsx:313` — backdrop dialogu to `<div onClick>`. Zastąpić semantycznym `<button type="button" aria-label="Close menu">` albo obsłużyć przez bibliotekę dialogową.
- `app/_ui/HomeSplash.tsx:848` — skróty tekstowe `IG`, `FB`, `PI`, `YT` są funkcjonalne, ale wizualnie wyglądają jak placeholdery; użyć spójnego zestawu ikon SVG z `aria-hidden` i zachować obecne `aria-label` linków.

## Najlepszy następny krok

Największy potencjalny wzrost nie pochodzi już z kolejnych poprawek layoutu. Następny eksperyment powinien dodać bezpośrednio pod hero jeden blok z prawdziwym dowodem: 3 realizacje dla klientów, zweryfikowana ocena albo mierzalna liczba ukończonych memorials — wraz z jasną informacją, jak działa dostawa i zgodność z wymaganiami cmentarza w USA.

## Kontrola techniczna

- aktualny render: Chromium desktop 1440×900 i mobile 390×844
- wcześniejsza walidacja implementacji: TypeScript OK, ESLint bez błędów, 104/104 testów, produkcyjny build OK
- audyt bazuje na aktualnych Vercel Web Interface Guidelines pobranych 2026-10-02
