#!/usr/bin/env python3
"""Scarica le copertine dei libri in covers/<id>.jpg.

Cerca ogni libro su Open Library (titolo originale + autore) e, se non trova
nulla, su Google Books. In books.json un libro può indicare "coverIsbn" per
forzare un'edizione precisa. Scrive covers/index.json con i libri che hanno una
copertina: l'app usa le altre con la copertina grafica generata.

Uso:
    python scripts/fetch_covers.py [--force]
"""

import argparse
import hashlib
import json
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


def get(url, timeout=30):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as res:
        return res.read()


def surname(author):
    first = author.split(" e ")[0].split(",")[0]
    return first.split()[-1]


def openlibrary_urls(book):
    if book.get("coverIsbn"):
        yield f"https://covers.openlibrary.org/b/isbn/{book['coverIsbn']}-L.jpg?default=false"
    query = urllib.parse.urlencode({
        "title": book["originalTitle"],
        "author": surname(book["author"]),
        "fields": "title,cover_i",
        "limit": 5,
    })
    docs = json.loads(get(f"https://openlibrary.org/search.json?{query}")).get("docs", [])
    wanted = book["originalTitle"].lower()
    docs.sort(key=lambda d: d.get("title", "").lower() != wanted)  # titolo esatto per primo
    for doc in docs:
        if doc.get("cover_i"):
            yield f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg?default=false"


def googlebooks_urls(book):
    q = f'intitle:"{book["originalTitle"]}" inauthor:{surname(book["author"])}'
    data = json.loads(get("https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode({"q": q, "maxResults": 5})))
    for item in data.get("items", []):
        links = item.get("volumeInfo", {}).get("imageLinks", {})
        url = links.get("thumbnail") or links.get("smallThumbnail")
        if url:
            yield url.replace("http://", "https://").replace("&edge=curl", "").replace("zoom=1", "zoom=2")


def fetch_cover(book):
    for source in (openlibrary_urls, googlebooks_urls):
        try:
            for url in source(book):
                try:
                    data = get(url)
                except Exception:
                    continue
                if len(data) >= MIN_BYTES and data[:3] == b"\xff\xd8\xff":
                    return data, url
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
    index = {}
    for book in books:
        path = OUT / f"{book['id']}.jpg"
        if path.exists() and not args.force:
            print(f"= {book['id']}: già presente")
        else:
            data, url = fetch_cover(book)
            if not data:
                print(f"! {book['id']}: nessuna copertina trovata, uso quella generata")
                continue
            path.write_bytes(data)
            print(f"+ {book['id']}: {len(data) // 1024} KB da {url}")
        index[book["id"]] = hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    (OUT / "index.json").write_text(json.dumps(index), encoding="utf-8")
    print(f"Copertine: {len(index)}/{len(books)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
