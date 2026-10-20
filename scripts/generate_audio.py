#!/usr/bin/env python3
"""Genera gli audiolibri MP3 dai riassunti in data/summaries con Piper TTS.

Per ogni libro produce audio/<id>.mp3 e audio/<id>.json (durata, inizio dei
capitoli e hash del contenuto). I libri il cui testo e le cui impostazioni non
sono cambiati vengono saltati, così la cache della CI evita di rigenerarli.

Uso:
    python scripts/generate_audio.py --model voices/it_IT-paola-medium.onnx
"""

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SUMMARIES = ROOT / "data" / "summaries"
CATALOG = ROOT / "data" / "books.json"


def parse_chapters(markdown):
    """Divide il riassunto in capitoli [(titolo, [paragrafi])] usando le intestazioni '## '."""
    chapters = []
    for line in markdown.splitlines():
        line = line.strip()
        if not line or line.startswith("# "):
            continue
        if line.startswith("## "):
            chapters.append((line[3:].strip(), []))
        elif chapters:
            chapters[-1][1].append(clean(line))
    return chapters


def clean(text):
    text = re.sub(r"^[-*]\s+", "", text)
    return text.replace("**", "").replace("_", "")


def spoken_chapters(book, chapters):
    """Testo da leggere per ciascun capitolo; il primo si apre con titolo e autore."""
    result = []
    for i, (title, paragraphs) in enumerate(chapters):
        lines = []
        if i == 0:
            lines.append(f"{book['title']}, di {book['author']}.")
        lines.append(title + ".")
        lines.extend(paragraphs)
        result.append((title, lines))
    return result


def synthesize(voice, syn_config, chapters, wav_path, sentence_silence, chapter_silence):
    """Scrive un unico WAV e restituisce l'istante di inizio (in secondi) di ogni capitolo."""
    starts = []
    frames = 0
    with wave.open(str(wav_path), "wb") as wav:
        rate = voice.config.sample_rate
        wav.setframerate(rate)
        wav.setsampwidth(2)
        wav.setnchannels(1)

        def silence(seconds):
            nonlocal frames
            n = int(rate * seconds)
            wav.writeframes(b"\x00\x00" * n)
            frames += n

        for title, lines in chapters:
            starts.append({"title": title, "start": round(frames / rate, 2)})
            for idx, line in enumerate(lines):
                for chunk in voice.synthesize(line, syn_config=syn_config):
                    audio = chunk.audio_int16_bytes
                    wav.writeframes(audio)
                    frames += len(audio) // 2
                    silence(sentence_silence)
                if idx == 0:
                    silence(0.4)
            silence(chapter_silence)
    return starts, round(frames / rate, 2)


def encode_mp3(wav_path, mp3_path, bitrate):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
         "-ac", "1", "-codec:a", "libmp3lame", "-b:a", bitrate, str(mp3_path)],
        check=True,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--model", required=True, help="Modello vocale Piper (.onnx)")
    parser.add_argument("--out", default=str(ROOT / "audio"), help="Cartella di destinazione")
    parser.add_argument("--length-scale", type=float, default=1.15, help="> 1 parla più lentamente")
    parser.add_argument("--sentence-silence", type=float, default=0.45)
    parser.add_argument("--chapter-silence", type=float, default=1.2)
    parser.add_argument("--bitrate", default="48k")
    parser.add_argument("--only", nargs="*", help="Genera solo questi id")
    args = parser.parse_args()

    from piper import PiperVoice, SynthesisConfig

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    books = {b["id"]: b for b in json.loads(CATALOG.read_text(encoding="utf-8"))["books"]}
    settings = f"{Path(args.model).name}|{args.length_scale}|{args.sentence_silence}|{args.chapter_silence}|{args.bitrate}"

    voice = None
    for book_id, book in books.items():
        if args.only and book_id not in args.only:
            continue
        source = SUMMARIES / f"{book_id}.md"
        markdown = source.read_text(encoding="utf-8")
        digest = hashlib.sha256(f"{settings}\n{book['title']}\n{book['author']}\n{markdown}".encode()).hexdigest()[:16]
        mp3_path, meta_path = out / f"{book_id}.mp3", out / f"{book_id}.json"
        if mp3_path.exists() and meta_path.exists():
            if json.loads(meta_path.read_text()).get("hash") == digest:
                print(f"= {book_id}: invariato")
                continue

        if voice is None:
            voice = PiperVoice.load(args.model)
            syn_config = SynthesisConfig(length_scale=args.length_scale)

        print(f"> {book_id}: sintesi in corso...", flush=True)
        chapters = spoken_chapters(book, parse_chapters(markdown))
        with tempfile.TemporaryDirectory() as tmp:
            wav_path = Path(tmp) / "book.wav"
            starts, duration = synthesize(voice, syn_config, chapters, wav_path,
                                          args.sentence_silence, args.chapter_silence)
            encode_mp3(wav_path, mp3_path, args.bitrate)
        meta = {"hash": digest, "duration": duration, "chapters": starts}
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"  {book_id}: {duration / 60:.1f} minuti, {mp3_path.stat().st_size / 1e6:.1f} MB")

    # Indice letto dall'app: un solo file con durata e capitoli di ogni audio disponibile.
    index = {}
    for book_id in books:
        meta_path = out / f"{book_id}.json"
        if meta_path.exists() and (out / f"{book_id}.mp3").exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            index[book_id] = {"duration": meta["duration"], "chapters": meta["chapters"], "hash": meta["hash"]}
    (out / "index.json").write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
