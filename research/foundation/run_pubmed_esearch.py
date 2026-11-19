#!/usr/bin/env python3
"""Reproducible PubMed ESearch export for Clinical AI Safety research (NOT an engine tool).

Run with ordinary internet connectivity:
    python3 research/foundation/run_pubmed_esearch.py \
        --output-dir pubmed-search-2026-11-19

Reads frozen query file pubmed-queries-v1.1.json in the same directory.
Exports per-query original ESearch response, query translation, counts,
all PMIDs up to the NCBI ESearch ceiling, and PMID union with provenance.

Never substitutes ranked paper-index results for a PubMed fielded search.
Does not identify eligible studies, make clinical judgments, or claim a
MEDLINE-only search distinct from PubMed.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
CEILING = 9999  # conservative PubMed ESearch limit; do not truncate silently
TOOL = "clinical_ai_safety_evidence_map"
BASE = pathlib.Path(__file__).resolve().parent


def atomic_json(path: pathlib.Path, obj: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(path)


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def esearch(query: str, retmax: int) -> tuple[dict, str]:
    parameters = {"db": "pubmed", "term": query, "retmode": "json",
                  "retmax": str(retmax), "sort": "pub date", "tool": TOOL}
    url = API + "?" + urllib.parse.urlencode(parameters)
    req = urllib.request.Request(url, headers={"User-Agent": TOOL + "/1.0 (research)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                raw = response.read()
            obj = json.loads(raw)
            if "esearchresult" not in obj:
                raise ValueError("No esearchresult in returned ESearch data")
            return obj, hashlib.sha256(raw).hexdigest()
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
        time.sleep(1.0 * (attempt + 1))
    raise RuntimeError("ESearch never returned a usable response")


def search_one(record: dict, outdir: pathlib.Path) -> tuple[dict, list[str]]:
    label = record["id"]
    query = record["query"]
    started = utc_now()
    report = {"queryId": label, "sourceSection": record["sourceSection"],
              "queryExactlyAsSubmitted": query, "startedUTC": started,
              "provider": "NCBI ESearch, database=pubmed",
              "status": "failed-or-incomplete", "reportedHitCount": None,
              "queryTranslation": None, "pmidCount": None, "pmidSha256": None,
              "accessError": None}
    try:
        count_obj, count_hash = esearch(query, retmax=0)
        atomic_json(outdir / f"{label}-esearch-count-response.json", count_obj)
        result = count_obj["esearchresult"]
        report["countResponseSha256"] = count_hash
        report["reportedHitCount"] = int(result["count"])
        report["queryTranslation"] = result.get("querytranslation")
        report["warningList"] = result.get("warninglist")
        report["errorList"] = result.get("errorlist")
        if result.get("errorlist"):
            raise ValueError("PubMed query reported an error: " + str(result["errorlist"]))
        count = report["reportedHitCount"]
        if count > CEILING:
            report["status"] = "reported-count-exceeds-pubmed-esearch-uid-ceiling"
            report["accessError"] = (
                f"Found {count} records. ESearch UID export restricted to {CEILING}; "
                "split by publication-date windows or use an approved complete retrieval route. "
                "No partial PMID export claimed as complete."
            )
            return report, []
        if count == 0:
            report["status"] = "complete-zero-results"
            report["pmidCount"] = 0
            report["pmidSha256"] = hashlib.sha256(b"").hexdigest()
            return report, []

        time.sleep(0.45)  # stay below NCBI's unauthenticated request rate limit
        ids_obj, ids_hash = esearch(query, retmax=count)
        atomic_json(outdir / f"{label}-esearch-ids-response.json", ids_obj)
        ids_result = ids_obj["esearchresult"]
        ids = ids_result.get("idlist", [])
        if int(ids_result["count"]) != count or len(ids) != count:
            raise ValueError(
                f"Count/UID inconsistency ({count} first, {ids_result.get('count')} "
                f"second, {len(ids)} returned); do not report complete export"
            )
        if len(set(ids)) != len(ids):
            raise ValueError("Duplicate PMIDs in ESearch ID response")
        csv_path = outdir / f"{label}-pmids.csv"
        with csv_path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["pmid", "queryId"])
            writer.writerows([[p, label] for p in ids])
        report["pmidCount"] = len(ids)
        report["pmidSha256"] = hashlib.sha256(csv_path.read_bytes()).hexdigest()
        report["idResponseSha256"] = ids_hash
        report["status"] = "complete-pubmed-esearch-uid-export"
        return report, ids
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        report["accessError"] = f"{type(exc).__name__}: {exc}"
        return report, []
    finally:
        report["finishedUTC"] = utc_now()
        atomic_json(outdir / f"{label}-audit.json", report)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query-file", type=pathlib.Path,
                        default=BASE / "pubmed-queries-v1.1.json")
    parser.add_argument("--output-dir", type=pathlib.Path, required=True)
    parser.add_argument("--include-optional", action="store_true")
    args = parser.parse_args()
    config = json.loads(args.query_file.read_text(encoding="utf-8"))
    if config.get("queryStatus") != "proposed-not-executed-in-NLM-interface":
        raise SystemExit("Unexpected query config state; review provenance first")
    ids = [x["id"] for x in config["queries"]]
    if len(ids) != len(set(ids)):
        raise SystemExit("Repeated query identifiers")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    audits = []
    provenance = {}
    incomplete = False
    for record in config["queries"]:
        if record.get("defaultRun") is False and not args.include_optional:
            continue
        print(f"Searching {record['id']}...", flush=True)
        result, pmids = search_one(record, args.output_dir)
        audits.append(result)
        if not result["status"].startswith("complete-"):
            incomplete = True
        for pmid in pmids:
            provenance.setdefault(pmid, set()).add(record["id"])
        time.sleep(0.45)
    union_path = args.output_dir / "pubmed-pmid-union.csv"
    if not incomplete:
        with union_path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["pmid", "retrievedByQueryIds"])
            for pmid in sorted(provenance, key=int):
                writer.writerow([pmid, ";".join(sorted(provenance[pmid]))])
    manifest = {"createdUTC": utc_now(), "database": "PubMed (including MEDLINE)",
                "platform": "NCBI ESearch E-utilities",
                "queryConfig": str(args.query_file), "queryConfigSha256":
                hashlib.sha256(args.query_file.read_bytes()).hexdigest(),
                "queryRuns": audits, "allDefaultQueriesComplete": not incomplete,
                "unionUniquePMIDs": len(provenance) if not incomplete else None,
                "unionExportSha256": hashlib.sha256(union_path.read_bytes()).hexdigest()
                if not incomplete else None,
                "screenedRecords": None, "includedStudies": None,
                "notClaimed": [
                    "Independently validated MeSH choices",
                    "Completed Embase/Cochrane/IEEE/ACM retrieval",
                    "Study-level eligibility or patient safety performance",
                    "Retrospective coverage of records unavailable on execution date"
                ]}
    atomic_json(args.output_dir / "pubmed-run-manifest.json", manifest)
    if incomplete:
        print("INCOMPLETE: review per-query audit and access errors; no union declared.", file=sys.stderr)
        return 2
    print(f"COMPLETE ESearch PMID export: {len(provenance)} unique PMIDs. "
          f"Manifest: {args.output_dir / 'pubmed-run-manifest.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
