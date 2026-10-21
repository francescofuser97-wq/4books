#!/usr/bin/env python3
"""Scarica le copertine dei libri in covers/<id>.jpg, preferendo le edizioni italiane.

Ordine di ricerca per ogni libro:
1. "coverIsbn" in books.json, se indicato (forza un'edizione precisa);
2. un'edizione in italiano su Open Library, tra le edizioni dell'opera;
3. un'edizione in italiano su Google Books, cercando per titolo italiano
   ("titleIt" o "title"), titolo originale e autore;
4. l'edizione originale, su Open Library (copertina dell'opera o di una sua
   edizione) e poi su Google Books.

Se è impostata la variabile GOOGLE_BOOKS_API_KEY, le richieste a Google Books
usano quella chiave: senza chiave il limite giornaliero è condiviso e spesso esaurito.

Scrive covers/index.json (libri con copertina, letto dall'app) e
covers/sources.json (da dove arriva ogni copertina e in che lingua).

Uso:
    python scripts/fetch_covers.py [--force]
"""

import argparse
import functools
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "data" / "books.json"
OUT = ROOT / "covers"
UA = {"User-Agent": "manager-in-15/1.0 (https://github.com/francescofuser97-wq/4books)"}
MIN_BYTES = 4000  # sotto questa soglia è un segnaposto, non una copertina
STRATEGY = 2      # va incrementato quando cambia il criterio di scelta, per riscaricare tutto


def get(url, timeout=30):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as res:
        return res.read()


def get_json(url):
    return json.loads(get(url))


def surname(author):
    first = author.split(" e ")[0].split(",")[0]
    return first.split()[-1]


def short_title(book):
    # I sottotitoli lunghi fanno fallire le ricerche: basta il titolo principale.
    return book["originalTitle"].split(":")[0].strip()


@functools.lru_cache(maxsize=None)
def openlibrary_search(title, author):
    query = urllib.parse.urlencode({"title": title, "author": author, "fields": "key,title,cover_i", "limit": 5})
    docs = get_json(f"https://openlibrary.org/search.json?{query}").get("docs", [])
    docs.sort(key=lambda d: d.get("title", "").lower() != title.lower())  # titolo esatto per primo
    return docs


def openlibrary_works(book):
    return openlibrary_search(short_title(book), surname(book["author"]))


@functools.lru_cache(maxsize=None)
def openlibrary_editions(work_key):
    """Edizioni con copertina dell'opera: (lingue, anno, id copertina, titolo), le più recenti per prime."""
    data = get_json(f"https://openlibrary.org{work_key}/editions.json?limit=500")
    editions = []
    for ed in data.get("entries", []):
        covers = [c for c in ed.get("covers", []) if c and c > 0]
        if covers:
            langs = frozenset(lang.get("key", "").rsplit("/", 1)[-1] for lang in ed.get("languages", []))
            year = re.search(r"\d{4}", ed.get("publish_date", ""))
            editions.append((langs, int(year.group()) if year else 0, covers[0], ed.get("title", "")))
    return sorted(editions, key=lambda e: e[1], reverse=True)


def openlibrary_cover(cover_id):
    return f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg?default=false"


def openlibrary_italian(book):
    for work in openlibrary_works(book)[:2]:
        for langs, _, cover, title in openlibrary_editions(work["key"]):
            if "ita" in langs:
                yield openlibrary_cover(cover), f"Open Library, «{title}»"


def googlebooks_items(q, **params):
    if os.environ.get("GOOGLE_BOOKS_API_KEY"):
        params["key"] = os.environ["GOOGLE_BOOKS_API_KEY"]
    data = get_json("https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode({"q": q, "maxResults": 10, "printType": "books", **params}))
    return data.get("items", [])


def googlebooks_image(info):
    links = info.get("imageLinks", {})
    url = links.get("thumbnail") or links.get("smallThumbnail")
    if not url:
        return []
    url = url.replace("http://", "https://").replace("&edge=curl", "")
    return [url + "&fife=w480-h720", url]  # prima la versione grande, poi la miniatura


def googlebooks_italian(book):
    name = surname(book["author"]).lower()
    titles = dict.fromkeys(t for t in (book.get("titleIt"), book["title"], short_title(book)) if t)
    for title in titles:
        for item in googlebooks_items(f'intitle:"{title}" inauthor:{surname(book["author"])}', langRestrict="it"):
            info = item.get("volumeInfo", {})
            authors = " ".join(info.get("authors", [])).lower()
            if info.get("language") == "it" and name in authors:
                for url in googlebooks_image(info):
                    yield url, f"Google Books, «{info.get('title', '')}»"
        time.sleep(1)


def original_edition(book):
    works = openlibrary_works(book)
    for doc in works:
        if doc.get("cover_i"):
            yield openlibrary_cover(doc["cover_i"]), f"Open Library, «{doc.get('title', '')}»"
    for work in works[:2]:  # nessuna copertina sull'opera: proviamo le edizioni, inglese per prima
        for langs, _, cover, title in sorted(openlibrary_editions(work["key"]), key=lambda e: "eng" not in e[0]):
            yield openlibrary_cover(cover), f"Open Library, «{title}»"
    for item in googlebooks_items(f'intitle:"{short_title(book)}" inauthor:{surname(book["author"])}'):
        for url in googlebooks_image(item.get("volumeInfo", {})):
            yield url, f"Google Books, «{item['volumeInfo'].get('title', '')}»"


def explicit_isbn(book):
    if book.get("coverIsbn"):
        yield f"https://covers.openlibrary.org/b/isbn/{book['coverIsbn']}-L.jpg?default=false", f"ISBN {book['coverIsbn']}"


def fetch_cover(book):
    sources = [(explicit_isbn, "isbn"), (openlibrary_italian, "it"), (googlebooks_italian, "it"), (original_edition, "originale")]
    for source, lang in sources:
        try:
            for url, label in source(book):
                try:
                    data = get(url)
                except Exception:
                    continue
                if len(data) >= MIN_BYTES and data[:3] == b"\xff\xd8\xff":
                    return data, {"lang": lang, "from": label, "url": url}
        except Exception as exc:  # una fonte non raggiungibile non deve fermare le altre
            print(f"  {book['id']}: {source.__name__} non disponibile ({exc})")
        time.sleep(1)
    return None, None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="Riscarica anche le copertine già presenti")
    args = parser.parse_args()

    OUT.mkdir(exist_ok=True)
    books = json.loads(CATALOG.read_text(encoding="utf-8"))["books"]
    sources_path = OUT / "sources.json"
    sources = json.loads(sources_path.read_text(encoding="utf-8")) if sources_path.exists() else {}
    index = {}
    for book in books:
        path = OUT / f"{book['id']}.jpg"
        known = sources.get(book["id"], {})
        up_to_date = known.get("v") == STRATEGY and known.get("isbn") == book.get("coverIsbn")
        if path.exists() and up_to_date and not args.force:
            print(f"= {book['id']}: già presente ({known.get('lang')})")
        else:
            data, meta = fetch_cover(book)
            if not data:
                print(f"! {book['id']}: nessuna copertina trovata, uso quella grafica")
                path.unlink(missing_ok=True)
                sources.pop(book["id"], None)
                continue
            path.write_bytes(data)
            sources[book["id"]] = {**meta, "v": STRATEGY, "isbn": book.get("coverIsbn")}
            print(f"+ {book['id']}: edizione {meta['lang']}, {len(data) // 1024} KB, {meta['from']}")
        index[book["id"]] = hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    (OUT / "index.json").write_text(json.dumps(index), encoding="utf-8")
    sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=1), encoding="utf-8")
    italian = sum(1 for s in sources.values() if s.get("lang") == "it")
    print(f"Copertine: {len(index)}/{len(books)}, di cui {italian} di edizioni italiane")
    return 0


if __name__ == "__main__":
    sys.exit(main())
