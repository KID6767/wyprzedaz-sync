# WYPRZEDAŻ SYNC

Nowoczesny katalog prywatnej wyprzedaży oparty o GitHub Pages.

## Co już jest

- responsywna strona bez frameworków i bez procesu build,
- dynamiczny katalog z `data/products.json`,
- filtrowanie i wyszukiwarka,
- modal produktu,
- przyciski Allegro / Vinted / OLX,
- statusy Dostępne / Sprzedane,
- custom cursor na desktopie,
- animowane tło, aurora, scanlines, marquee,
- animacje reveal i 3D tilt kart,
- „magnetic buttons”,
- generatywny soundscape WebAudio uruchamiany przez użytkownika,
- obsługa `prefers-reduced-motion`,
- gotowe pod GitHub Pages.

## Uruchomienie lokalne

Najprościej przez prosty serwer HTTP.

### PowerShell

```powershell
cd C:\Projects\wyprzedaz-sync
py -m http.server 8080
```

Następnie otwórz:

`http://localhost:8080`

> Nie otwieraj `index.html` przez `file://`, bo przeglądarka może zablokować `fetch()` pliku `products.json`.

## GitHub Pages

Po wypchnięciu plików na branch `main`:

1. Wejdź w **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`.
4. Folder: `/ (root)`.
5. Save.

Docelowy adres:

`https://kid6767.github.io/wyprzedaz-sync/`

## Dodawanie produktu

Edytujesz tylko `data/products.json`.

Przykład:

```json
{
  "id": "produkt-001",
  "name": "Koszulka Levi's",
  "brand": "Levi's",
  "category": "ubrania",
  "size": "M",
  "condition": "bardzo dobry",
  "price": 30,
  "status": "available",
  "image": "./assets/img/levis-001.jpg",
  "description": "Opis produktu.",
  "links": {
    "allegro": "https://allegro.pl/oferta/...",
    "vinted": "https://www.vinted.pl/items/...",
    "olx": ""
  }
}
```

Dopuszczalne statusy:
- `available`
- `sold`

Kategorie używane w filtrach:
- `ubrania`
- `buty`
- `dodatki`

## Bezpieczeństwo

**NIGDY NIE COMMITUJ:**
- Client Secret Allegro,
- access tokenów,
- refresh tokenów,
- plików `%LOCALAPPDATA%\WyprzedazSync`,
- `.env`,
- prywatnych kluczy.

Sekrety aplikacji Allegro powinny pozostać wyłącznie lokalnie.

## Kierunek v2

- automatyczny zapis linku po publikacji oferty Allegro,
- automatyczna zmiana `status` po sprzedaży,
- generowanie kart produktów z lokalnego panelu,
- galeria wielu zdjęć,
- sortowanie / tagi,
- licznik wyświetleń po dołożeniu zewnętrznej analityki,
- opcjonalny custom domain.
