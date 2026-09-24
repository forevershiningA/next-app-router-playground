# DYO — starter / obecny stan

To jest starsza aplikacja DYO oparta na JavaScript ES modules oraz PHP. Nie jest to repozytorium Next.js ani aplikacja z typowym systemem budowania Node.

## Stan na 23 września 2026 — checkout istniejącego konta oraz SEO/GA4

### Checkout: Proceed to Purchase

`Proceed to Purchase` używa teraz jednej ścieżki zakupu niezależnie od tego, czy Customer został utworzony jako gość, zalogował się po rozpoznaniu istniejącego e-maila, czy był już zalogowany:

```text
Proceed to Purchase
  -> (nowy e-mail) techniczny Customer
     lub (istniejący e-mail) dialog hasła
     lub (zalogowany Customer) bez dodatkowego dialogu
  -> CreateImage()
  -> zapis projektu jako „Online order [data]”
  -> delivery i payment
```

- Nowy e-mail zachowuje bezproblemowy checkout gościa.
- Gdy `guest_customer.php` zwróci `account_exists`, ten sam dialog przechodzi na widok logowania: e-mail jest uzupełniony i tylko do odczytu, widoczne są hasło oraz `Forgot password?`.
- Prawidłowe hasło wywołuje istniejący `login.php`, zapisuje pełną sesję Customer, a następnie zapisuje aktualny projekt i otwiera delivery/payment. Nie otwiera My Account.
- Błędne hasło pozostawia użytkownika w dialogu z komunikatem inline. Reset hasła wysyła link przez istniejący `reset_password.php`.
- Dla już zalogowanego Customer kliknięcie nie otwiera już dialogu `Save Design` i nie prosi o nazwę projektu.
- Loader jest ciągły przez logowanie, screenshot i zapis projektu; jest ukrywany bezpośrednio przed otwarciem modala delivery/Buy.

Najważniejsze pliki: `src/modules/Canvas.js`, `src/modules/Account.js`, `src/Design.js`, `src/Engine.js`. `Engine::setCustomerSession()` jest frontendowym helperem zapisującym dane odpowiedzi `login.php` do `sessionStorage`.

### Metadata, canonicale, H1 i cache

`index_header.php` rozróżnia root od jawnie podanego obsługiwanego `product-id`. Root nadal ładuje domyślny produkt 5 dla aplikacji, ale jego metadata nie dziedziczą już metadata Bronze Plaque.

- Root title: `Design Your Memorial Online | See The Price As You Go | Forever Shining`
- Root description: `Design your own headstone, bronze plaque or pet memorial online. Add photos, motifs and the inscription, see the price as you design, and order from Forever Shining in Perth.`
- Jawne `?product-id5` ma opis Bronze Plaque dostarczony 23 września 2026.
- Pozostałe produkty zachowują istniejące przetłumaczone opisy, a title/H1 używają przetłumaczonej nazwy produktu.
- Wszystkie wartości metadata i H1 są kodowane przez `htmlspecialchars()`.
- Canonical ma na stałe origin `https://www.forevershining.com.au`; zachowuje wyłącznie rozpoznany `product-id`. Root 2D canonicalizuje do `/design/html5/`, a wariant 3D do `/design/html5/index3d.php`.
- `index.php` i `index3d.php` mają widoczne H1 nad canvasem oraz `apple-mobile-web-app-title` ustawione na `Forever Shining Designer`.
- Linki do lokalnych CSS i głównego JS używają `filemtime()` z fallbackiem do bundle’a bazowego, zamiast znacznika czasu z `gmdate()`.

Uwaga: ta reguła canonical celowo kieruje również kopię na `headstonesdesigner.com` do Forever Shining. Jeżeli domena ma być niezależnie indeksowana, trzeba wprowadzić osobną politykę dozwolonych hostów.

### GA4

Universal Analytics `UA-40897187-1` został usunięty. W `index_header.php` znajduje się puste `$ga4_measurement_id`; po otrzymaniu wartości z WordPressa należy wpisać tam Measurement ID, np. `G-XXXXXXXXXX`. Wtedy oba wejścia załadują standardowy tag GA4.

- Po potwierdzonym sukcesie płatności `src/modules/Orders.js::paymentSuccess()` wysyła event `purchase` z `transaction_id`, kwotą, `currency: 'AUD'` i jednym elementem zawierającym nazwę oraz ID produktu.
- Po skutecznym wysłaniu Quick Enquiry `src/Design.js::Send()` wysyła `generate_lead`.
- Eventy są bezpiecznie pomijane, dopóki `window.gtag` nie jest dostępne, więc Measurement ID jest nadal jedynym brakującym elementem aktywacji analityki.

### Weryfikacja bieżących zmian

Wykonano `node --check` dla zmienionych modułów JS oraz `npm run build`. Wygenerowano `dist/js/dyo.min.js` i `dist/js/dyo.min.js.gz`. W środowisku nie ma binarnego `php`, więc po przeniesieniu plików należy uruchomić:

```powershell
php -l index_header.php
php -l index.php
php -l index3d.php
```

Nie wykonano pełnego testu przeglądarkowego z lokalnym backendem ani wdrożenia. Bundle produktowe `product-id…-dyo.min.js`, których używają wejścia PHP, trzeba nadal rozprowadzić standardowym procesem wdrożeniowym (`standalone.bat` ma obecnie zależne od XAMPP ścieżki).

## Stan na 22 września 2026 — przegląd checkoutu i SEO (bez zmian w kodzie)

Ta sekcja jest historycznym zapisem analizy. Jej rekomendacje dotyczące checkoutu, metadata, canonicali, H1, UA i cache zostały zrealizowane lub doprecyzowane w sekcji z 23 września powyżej.

W tej sesji przeanalizowano dwa kolejne zakresy. Nie zmieniano jeszcze plików aplikacji; poniższe punkty są rekomendacjami i kontekstem do następnej implementacji.

### Checkout dla istniejącego adresu e-mail

Aktualny checkout gościa wywołuje `includes-dyo5/guest_customer.php`. Dla nowego adresu endpoint tworzy technicznego `Customer` z losowym hasłem, nie wysyła hasła użytkownikowi i zwraca zapisaną postać poświadczenia do `sessionStorage`. Dzięki temu stare endpointy zapisu projektu i zamówienia mogą nadal uwierzytelniać operacje przez `customer_email` oraz `customer_password`.

Jeśli adres już istnieje, endpoint zwraca `account_exists`, a `src/Design.js` pokazuje jedynie snackbar: „This email address already has an account. Please sign in to continue.” Nie otwiera formularza logowania ani nie wznawia automatycznie checkoutu.

Nie należy pozwalać na przypięcie projektu lub zamówienia do istniejącego konta wyłącznie na podstawie znajomości adresu e-mail. Nie należy też tworzyć drugiego `Customer` z takim samym adresem. Obie opcje powodują problemy odpowiednio z bezpieczeństwem albo duplikacją kont i historii zamówień.

Rekomendowana mała zmiana:

1. Po `account_exists` natychmiast pokazać formularz hasła z uzupełnionym adresem e-mail.
2. Użyć jasnego komunikatu, np. „Welcome back. Enter your password to continue securely to delivery and payment.” oraz widocznego resetu hasła.
3. Po poprawnym logowaniu nie przenosić klienta do My Account. Zapisać bieżący projekt i automatycznie otworzyć istniejący formularz dostawy i płatności.
4. Przy błędnym haśle pozostawić klienta w dialogu checkoutu i wyświetlić komunikat inline.

Istniejący interfejs logowania jest w `src/material/Dialog.js`, a logika w `src/Engine.js::login()`. Przy implementacji trzeba dodać checkoutowy stan/callback, aby po sukcesie wykonać odpowiednik `CreateImage()` → zapis projektu → `Account.orderDesign()`, bez standardowego przejścia przez `Account.open()`.

Długoterminowo właściwy checkout gościa powinien korzystać z wydawanego przez serwer tokenu checkoutu zamiast hasła lub jego zapisanej postaci w przeglądarce. To jest osobna zmiana backendowa, ponieważ obecne `Design::saveDesign()`, `Order::orderDesign()` i endpointy płatnicze są powiązane ze starym modelem poświadczeń.

### Meta dane, canonical, GA4, H1 i cache

`index_header.php` domyślnie ustawia `$productid = 5`, dlatego root `/design/html5/` dziedziczy opis Bronze Plaque. Root i jawne `?product-id5` muszą jednak zostać rozróżnione: root powinien mieć ogólne metadata designera, natomiast jawny produkt 5 powinien zachować metadata Bronze Plaque. Sama zmiana gałęzi `case 5` zmieniłaby błędnie oba adresy.

Rekomendowany wzorzec tytułów:

```text
Root: Design Your Memorial Online | Forever Shining
Produkt: Design [Product Name] - Personalise Your Memorial Online | Forever Shining
```

Docelowy ogólny meta description dla rootu nie został jeszcze dostarczony. Przy generowaniu title, description, H1 i canonical należy kodować wartości przez `htmlspecialchars()`.

Aktualny canonical w `index.php` i `index3d.php` odtwarza cały `REQUEST_URI`, w tym parametry śledzące/cache, oraz może wygenerować `http`. Nie wolno jednak po prostu usuwać całego query stringa, bo identyfikator produktu ma nietypową postać `?product-id5`. Generator canonical powinien:

- wymuszać publiczny origin HTTPS;
- zachowywać tylko poprawny, obsługiwany `product-id`;
- usuwać parametry trackingowe, cache oraz transientne fragmenty ścieżki edycji;
- kierować root do `https://www.forevershining.com.au/design/html5/`;
- stosować tę samą regułę w wariancie 2D i 3D, z właściwym adresem kanonicznym dla każdego wariantu ustalonym przed implementacją.

Na stronie nie ma H1. Należy dodać rzeczywiście widoczny, wizualnie zintegrowany nagłówek, który nie zakłóci pełnoekranowego interfejsu: ogólny na root i oparty na przetłumaczonej nazwie produktu dla stron produktowych.

`index.php` nadal ładuje Universal Analytics `UA-40897187-1`. Zamiana na podstawowy tag GA4 wymaga identyfikatora Measurement ID z WordPressa, który nie został jeszcze dostarczony. Sam tag GA4 zapewni page views, ale nie gwarantuje pomiaru zamówień; do tego trzeba wysłać event `purchase` po potwierdzonym sukcesie płatności/zamówienia, z co najmniej identyfikatorem transakcji, wartością i walutą.

Cache busting przez `?v=<?php echo gmdate("YmdHis") ?>` występuje na głównym bundlu JS w `index.php` i `index3d.php`; lokalne linki CSS nie mają obecnie tego parametru. Zalecane jest `filemtime()` właściwego bundla (z bezpiecznym fallbackiem, gdy pliku brakuje), aby URL zmieniał się tylko po zmianie pliku. Niezależnie od tego `index_header.php` wysyła dla dokumentu HTML `no-store`, historyczne `Expires` i zmienny przy każdym żądaniu `Last-Modified`; politykę cache dokumentu oraz nagłówki statycznych assetów trzeba ocenić osobno.

Mała zmiana tekstowa pozostaje zasadna: w `index.php` zmienić `apple-mobile-web-app-title` z `Design Your Own PWA` na `Forever Shining Designer`. `index3d.php` ma obecnie inną wartość (`Design Your Own`), więc należy zdecydować, czy ujednolicić także wariant 3D.

## Stan na 14 września 2026 — Buy w Check Price

W `src/Engine.js`, w metodzie `checkPrice()`, dodano przycisk `Buy` (`dyo_check_price_buy`) do stopki modala ceny. Jest tworzony przy aktywnym `dyo.accountModule`, a etykieta korzysta z `Translate(Lang.BUY)`.

- `Buy` jest sam po lewej stronie; `Download PDF` i `Close` pozostają po prawej, zgodnie z dotychczasowymi warunkami widoczności.
- Stopka `#resp-footer` ma wymuszony układ flex, a `Buy` automatyczny prawy margines. Lewy odstęp zwiększono dwukrotnie przez podwojenie obliczonego `padding-left` stopki.
- Kliknięcie zamyka i ukrywa modal ceny, następnie wywołuje kliknięcie istniejącego `#dyo_checkout` (`Proceed to Purchase`). Obsługa zakupu pozostaje wspólna: gość otrzymuje dialog e-maila z `Account.guestCheckout()`, a zalogowany Customer przechodzi przez istniejące `Save Design`.

Powyższy ostatni punkt opisuje stan z 14 września; obecnie zalogowany Customer przechodzi bezpośrednio przez checkout opisany na początku dokumentu.

W tej sesji zmieniono kod wyłącznie w `src/Engine.js`; dodatkowo zaktualizowano ten dokument. Nie zmieniano backendu ani metadanych wersji w `src/Dyo.js`. Składnia `Engine.js` została sprawdzona poleceniem PowerShell `Get-Content -Raw src/Engine.js | node --input-type=module --check`.

Nie wykonano testu w przeglądarce, przebudowy bundli ani wdrożenia. Do sprawdzenia po przebudowie: układ stopki na desktopie i telefonie, dwukrotny lewy odstęp oraz przejście z `Buy` dla gościa i zalogowanego użytkownika. Starsze notatki poniżej opisują stan wcześniejszych sesji.

## Uruchomienie i istotne katalogi

- `index.php`, `index3d.php` — wejścia aplikacji 2D i 3D.
- `src/` — frontend DYO.
- `includes-dyo5/` — endpointy PHP i wspólna logika bazodanowa.
- `includes-dyo5/dyo5.php` — klasy `Customer`, `Design`, `Order`, PDF i e-mail.
- `saved-designs/` na serwerze — trwałe pliki projektów: JPG, HTML, XML, JSON i opcjonalnie P3D.

## Dane wymagane przez panel admina

Panel admina opiera się na relacjach:

```text
shine_customer.customer_id
  -> shine_design.design_customerid
  -> shine_order.order_customerid
```

`Design::saveDesign()` zapisuje rekord projektu, pozycje projektu oraz pliki HTML, XML i JSON. JPG jest najpierw zapisywany przez `Design.CreateImage()` do katalogu screenshotów. `Order::orderDesign()` tworzy rekord zamówienia i jego pozycje, dlatego projekt musi już należeć do `Customer`.

## Istniejący zakup dla kont

1. Użytkownik zapisuje projekt.
2. Wybiera zapisany projekt w My Account.
3. `Account.orderDesign()` otwiera istniejący formularz dostawy.
4. `Order()` tworzy dane zamówienia i uruchamia istniejący wariant płatności (w tym Stripe dla odpowiednich krajów).

Główne pliki:

- `src/modules/Account.js` — formularz dostawy i wejście do zakupu.
- `src/modules/Orders.js` — przygotowanie zamówienia, Stripe/PayPal oraz zapis zamówienia.
- `includes-dyo5/order.php` — trwały zapis zamówienia.
- `includes-dyo5/pl/stripe_session.php` — aktualna sesja Stripe dla Polski.

## Quick Enquiry

Quick Enquiry jest źródłem interfejsu i generowania JPG, ale sam w sobie tylko wysyła e-mail/PDF przez `includes-dyo5/send.php`. Nie zapisuje Customer, projektu ani zamówienia w bazie.

## Checkout gościa — dodane zmiany

Przycisk `Proceed to Purchase` działa teraz zależnie od sesji:

- zalogowany Customer: pozostaje dotychczasowe kliknięcie `Save Design`;
- brak Customer w `sessionStorage`: otwierany jest dialog e-maila dla checkoutu gościa.

Przepływ gościa:

```text
Proceed to Purchase
  -> dialog e-maila
  -> includes-dyo5/guest_customer.php
  -> techniczny Customer z losowym hasłem
  -> CreateImage() zapisuje JPG
  -> SaveData() zapisuje projekt i pliki HTML/XML/JSON
  -> Account.orderDesign()
  -> istniejący formularz dostawy i płatności
```

Zmodyfikowane lub dodane pliki:

- `src/Dyo.js` — ścieżka `dyo.path.guest_customer`.
- `src/modules/Canvas.js` — wejście dla przycisku checkout.
- `src/modules/Account.js` — dialog checkoutu gościa oparty na Quick Enquiry.
- `src/Design.js` — utworzenie Customer-gościa, zapis projektu i przejście do istniejącego kroku dostawy.
- `includes-dyo5/guest_customer.php` — tworzenie technicznego Customer bez e-maila rejestracyjnego.

### Zachowanie istniejącego adresu e-mail

`guest_customer.php` nie przypina automatycznie zakupu do istniejącego Customer. Jeśli e-mail już istnieje, zwraca `account_exists`; chroni to przed utworzeniem drugiego Customer lub zamówienia przypiętego do cudzego konta bez logowania. Testuj nową ścieżkę świeżym adresem e-mail.

### Uwaga o haśle technicznym

Stary backend wymaga `customer_email` i `customer_password` także podczas zapisu projektu i zamówienia. Endpoint gościa generuje więc losowe hasło i zwraca do `sessionStorage` jego istniejącą, zahashowaną postać, aby działały niezmienione `Design::saveDesign()`, `Customer::update()` i `Order::orderDesign()`.

To jest rozwiązanie kompatybilnościowe dla starej architektury. Przed wdrożeniem produkcyjnym warto dodać jawne oznaczenie Customer-gościa oraz zastąpić przekazywanie poświadczenia klienta tokenem checkoutu wydawanym przez serwer.

## My Account — pamięć Saved Designs

Lista zapisanych projektów została odciążona bez zmiany backendu:

- pierwsza strona zawiera 12 zamiast 40 projektów (`dyo.design_end`);
- miniatury korzystają z natywnego `loading="lazy"` i `decoding="async"`;
- usunięto nieużywany cache `cache.Designs`, który był tablicą indeksowaną 13-cyfrowym `design_stampid` i gromadził niepotrzebne właściwości;
- kliknięcia kart Saved Designs są delegowane z jednego kontenera, zamiast tworzyć pięć listenerów dla każdej karty przy każdym renderze;
- usunięto przewijanie kontenera do początku wykonywane dla każdej pojedynczej karty.

Cache `Your Orders` również nie miesza już HTML-i faktur z tablicą zamówień i nie używa pollingów co 5 ms. `Design.getOrders()` pobiera oraz renderuje wyłącznie dane listy zamówień; HTML szczegółów pozostaje pobierany dopiero po wybraniu konkretnego zamówienia.

### Stan na koniec dnia — 5 września 2026

Pomimo powyższych optymalizacji My Account nadal potrafi się przyciąć przy większej liczbie Saved Designs. Nie należy zakładać, że przyczyną był wyłącznie cache listy.

Punkt startowy na kolejną sesję:

1. Na localhost otworzyć Chrome DevTools → Performance i nagrać około 30–60 sekund z My Account oraz przewijaniem Saved Designs.
2. Porównać JS heap przed i po wymuszeniu garbage collection w zakładce Memory.
3. Sprawdzić szczególnie koszt dekodowania obrazów, długie taski podczas `List.render()` oraz liczbę węzłów DOM/listenerów.
4. Jeżeli heap rośnie, zrobić dwa heap snapshoty i porównać retained objects — przede wszystkim `HTMLImageElement`, `EventListener`, `Canvas`, `ImageBitmap` i obiekty silnika 2D/3D.

Nie było jeszcze możliwe wykonanie takiego profilu w bieżącym środowisku, ponieważ nie działa tu lokalny serwer aplikacji ani przeglądarka podłączona do testowego backendu.

Stary kod listenerów per karta pozostaje w `Account.events()` jako nieosiągalna gałąź dla `saved-designs`/`my-account`; aktualny widok używa delegacji `handleSavedDesignClick()`.

## Test lokalny

W `src/Dyo.js` konfiguracja dla `localhost` domyślnie wskazuje na `https://www.forevershining.com.au/`. Przed testem trzeba ustawić `dyo.path.forever` na lokalny backend, aby żądania nie trafiły na produkcję.

Minimalny test:

1. Uruchom lokalny serwer PHP wraz z bazą i katalogiem `saved-designs/`.
2. Ustaw lokalny adres backendu w `src/Dyo.js`.
3. Otwórz projekt 2D, wybierz `Proceed to Purchase` i podaj nowy adres e-mail.
4. Potwierdź zapis, sprawdź pojawienie się Customer oraz projektu z JPG/HTML/XML/JSON.
5. Wypełnij istniejący formularz dostawy i potwierdź, że zamówienie jest widoczne w panelu admina.

## Weryfikacja

Składnia zmodyfikowanych plików JavaScript została sprawdzona przez `node --check`. W bieżącym środowisku nie ma binarnego `php`, więc należy uruchomić lokalnie:

```powershell
php -l includes-dyo5/guest_customer.php
```

## Stan na 6 września 2026 — drobne poprawki UX

### Zakres bieżącej sesji

Priorytetem jest oczekujący update `Proceed to Purchase`. Do czasu jego zakończenia wykonujemy tylko małe, lokalne poprawki wizualnego działania aplikacji. Nie zmieniamy checkoutu, endpointów PHP, płatności, autoryzacji, bundlowania ani struktury danych.

Po każdej zmianie kodu frontendu aktualizować w `src/Dyo.js`:

```js
dyo.build_version = '1.47';
dyo.build_date = 20260906;
```

### Skalowanie uchwytami na canvasie

`src/dyo/Item.js` zawiera poprawiony mechanizm przeciągania uchwytów zaznaczonego obiektu:

- Photo, Emblem i Inscription skalują się proporcjonalnie względem punktu rozpoczęcia przeciągania;
- dla długich inskrypcji skala jest wyliczana przez projekcję ruchu na wektor do wybranego uchwytu, co ogranicza odskakiwanie uchwytu od kursora;
- obiekty z dyskretnymi (`fixed`) rozmiarami, np. Ceramic Images, zmieniają rozmiar krokowo co około 24 px przeciągnięcia zamiast przeskakiwać przez wiele rozmiarów;
- po najechaniu na uchwyt kursor to `nwse-resize`; nad obiektem pozostaje `pointer`.

Zmiany są tylko w źródle. Nie wykonywano `npm run build` ani `standalone.bat`.

### Build, gdy będzie potrzebny

Dodano `package.json` oraz `webpack.config.js`. Webpack buduje `src/Dyo.js` do `dist/js/dyo.min.js`, a `standalone.bat` kopiuje ten plik oraz `.gz` do wariantów `product-id…-dyo.min.js` wymaganych przez `index.php` i `index3d.php`.

`standalone.bat` ma bezwzględne ścieżki `C:\xampp\htdocs\dyo`; przed użyciem poza tym środowiskiem należy je uogólnić. Do instalacji zależności wykorzystano `npm ci`; build nie został wykonany.

## SEO — obserwacje live

`https://www.forevershining.com.au/design/html5/` jest indeksowany dla części adresów `product-id` i ma serwerowo generowany title/description/canonical. Crawler widzi jednak przede wszystkim loader, nie treść canvasa; główną wartość SEO powinny nadal budować statyczne strony produktów i poradniki, które linkują do designera.

Do późniejszej, osobnej pracy SEO:

- uzupełnić mapowania metadata dla wszystkich obsługiwanych product ID w `index_header.php` (brakuje co najmniej 6, 31 i 39);
- przejrzeć canonicale oraz dodać Open Graph/Twitter Cards;
- przeanalizować stare wyniki Flash (`/design/dyo.php`) i cienkie warianty URL projektanta;
- pilnie przejrzeć publicznie indeksowane historyczne quote'y w `/design/quotes/`, ponieważ wyniki wyszukiwania ujawniają dane projektów i inskrypcje. Nie zmieniać tego w bieżącej sesji bez osobnej decyzji.

## Audyt bezpieczeństwa — odłożony

Audyt statyczny wskazał krytyczne obszary do osobnej, zaplanowanej pracy: parametryzacja SQL, bezpieczny reset hasła i sesje/tokeny zamiast haseł w `sessionStorage`, ograniczenie CORS, zabezpieczenie uploadu i endpointów odczytu plików oraz usunięcie publicznych plików diagnostycznych, backupów i sekretów. Nie łączyć tych zmian z update'em `Proceed to Purchase`.
