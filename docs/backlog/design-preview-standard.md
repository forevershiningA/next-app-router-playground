# Standard podglądów `/designs` — wersja robocza 1

Data: 2026-10-16. Dotyczy renderów rzeczywistych konfiguracji 3D. Kandydaci do oceny nie zastępują zatwierdzonych obrazów galerii.

## Ujęcia

| Produkt | Widok główny | Zbliżenie | Dodatkowy kąt |
| --- | --- | --- | --- |
| Nagrobek | Cały kamień i podstawa, widok od przodu zgodny z lokalną orientacją geometrii | Pole napisu i najważniejszy motyw | Tylko gdy pokazuje profil lub konstrukcję |
| Tablica | Cała tablica z obramowaniem i mocowaniami, bez nadmiernej perspektywy | Napis, motyw lub detal obramowania | Tylko gdy wnosi informację o mocowaniu/grubości |
| Monument | Cały zestaw: kamień, podstawa, płyta i obramowanie | Najważniejszy detal układu | Przydatny do pokazania relacji elementów zestawu |

Nie eksportujemy trzeciego zdjęcia wyłącznie dla zwiększenia liczby obrazów. Pierwsza próbka obejmuje nagrobek tradycyjny, laserowy oraz tablicę brązową; monumenty wymagają osobnego odbioru.

## Kadr i kolor

- Wspólny format głównego obrazu: 4:3. Produkt mieści się w całości z wolnym marginesem, nie styka się z brzegiem i jest czytelny przy szerokości 480 px. Rozmiar produktu w kadrze oceniamy także wizualnie; samo spełnienie ograniczeń kamery nie zatwierdza kompozycji.
- Dopasowanie kamery bazuje na rzeczywistej geometrii produktu i jego części. Nie powiększamy kadru na podstawie błędnie rozrzuconych napisów lub motywów. Ich przekroczenia obrysu są problemem konfiguracji do naprawy.
- Zbliżenie może celowo wykraczać poza pełny obrys produktu, lecz musi pokazywać przydatny detal. Centralne powiększenie generatora jest kandydatem, wymagającym oceny przed zatwierdzeniem.
- Zachowujemy materiał i oświetlenie sceny produktu. Tryb screenshot usuwa scenerię; tło renderu jest przezroczyste. Karty docelowo stosują wspólne jasne, neutralne tło. Bez zaznaczeń, uchwytów, UI i przypadkowych elementów scenografii.
- Nie poprawiamy w bitmapie wad geometrii, nie zasłaniamy błędnych napisów kadrem i nie zmieniamy materiału dla atrakcyjności zdjęcia. Podgląd ma odpowiadać konfiguracji otwieranej w Designerze.

## Rozmiary i budżety początkowe

WebP z przezroczystością: 480×360, 960×720 i 1600×1200, jakość startowa 86. Proponowane budżety do oceny próbki: odpowiednio 50 KB, 150 KB i 300 KB. Przekroczenie wymaga świadomej decyzji o jakości lub kompresji; nie jest automatyczną zgodą na większy obraz.

Nie publikujemy jednocześnie pełnych PNG-ów i powtarzalnych formatów bez potrzeby. Stare pliki pozostają do czasu zatwierdzenia oraz podłączenia nowego manifestu. Pliki robocze są w wyłączonym z Vercel katalogu audytu.

## Teksty demonstracyjne i zasoby

- Generator zastępuje inskrypcje kontrolowanymi tekstami przykładowymi. Ich długość może zmienić szerokość napisu, dlatego taki render nie potwierdza zgodności metryki tekstu ani poprawności źródłowych napisów.
- Zdjęcia, także odtwarzane z legacy, otrzymują neutralny portret demonstracyjny z lokalnego SVG. Logotypy wymagają osobnego zatwierdzonego zasobu. Oryginalne URL-e zdjęć nie są używane. Samo zastąpienie zdjęcia nie zatwierdza rozmiaru ani położenia portretu.
- Grafiki i motywy podlegają regułom publikacji. Zatwierdzenie prywatności obejmuje również publiczny źródłowy JSON, nie tylko widoczny obraz.

## Manifest i odbiór

Każdy obraz ma ID projektu, rolę ujęcia, źródło i wersję konfiguracji, SHA-256 źródła, rzeczywiste wymiary pliku, liczbę bajtów, datę wygenerowania i alt opisujący ujęcie. Data renderu nie jest datą aktualizacji treści strony.

Automatyczne warunki: prawidłowe źródło, ukończone ładowanie bez wymuszania flag, obecna i stabilna geometria, kompletny obrys produktu w widoku głównym, niepusty obraz i kontrola pikseli na krawędzi. Kontrola krawędzi wykrywa część problemów; nie zastępuje analizy położenia elementów wewnątrz obrysu.

Warunki ręczne: czytelność na telefonie, dobry margines i skala, właściwy materiał i kształt, motywy oraz napisy w obrysie, przydatność detalu, zgodność z edytorem, zatwierdzone treści i zasoby. Dopiero wtedy obraz otrzymuje zgodę na publikację, a kategoria świadomie wybraną okładkę.

## Renderowanie kandydatów

1. Uruchomić lokalny serwer z osobnym cache: `pnpm designs:preview:dev` (port 3002).
2. Próbka: `pnpm designs:preview:sample`.
3. Cały pilotaż: `pnpm exec node scripts/render-design-preview-candidates.mjs`; uruchomić po naprawie problemów próbki.
4. Porównanie i budżety: `pnpm designs:preview:report`. Oceniać obrazy wraz z `docs/audits/2026-10-16-designs/preview-candidates/manifest.json`.

Generator działa wyłącznie z localhost i identyfikatorami pilotażu. Zapisuje kandydatów do audytu; nie podłącza ich do galerii ani nie zatwierdza automatycznie. Nie zapisuje zamówień ani projektów użytkownika. Manifest zachowuje rekordy wcześniejszych partii i zastępuje ponawiane ID. Przed ponowieniem ocenionej partii należy zachować wcześniejszy raport i obrazy; ocena jest związana z konkretnym SHA-256 obrazu.

Kamera używa lokalnej osi przodu produktu i dopasowania do bryły produktu. Przegląd musi sprawdzić także wystające elementy. Pliki powstają najpierw w katalogu tymczasowym poza repozytorium, aby nie wywoływać Fast Refresh w trakcie partii. Po zakończeniu przeglądarki są kopiowane do audytu. Każdy projekt ma osobną instancję przeglądarki.
