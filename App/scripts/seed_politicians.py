#!/usr/bin/env python3
"""Seed politician records into Firestore users collection.

Usage examples:
  python scripts/seed_politicians.py --credentials path/to/service-account.json
  python scripts/seed_politicians.py --credentials path/to/service-account.json --dry-run
  python scripts/seed_politicians.py --credentials path/to/service-account.json --overwrite

Required:
  - Firebase service account JSON path via --credentials or FIREBASE_SERVICE_ACCOUNT_PATH
  - pip install firebase-admin
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass, asdict
from typing import Iterable

import firebase_admin
from firebase_admin import credentials, firestore


COLLECTION_NAME = "users"


@dataclass(frozen=True)
class PoliticianRecord:
    username: str
    email: str
    password: str
    name: str
    phone: str
    constituency: str
    party: str
    post: str
    district: str
    ministerType: str = "cabinet"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def get_seed_records() -> list[PoliticianRecord]:
    return [
        PoliticianRecord(
            username="dr_rajesh_kumar",
            email="rajesh.kumar@gov.in",
            password="pass@123",
            name="Dr. Rajesh Kumar",
            phone="+91 80 2222 3333",
            constituency="Bengaluru Central",
            party="Indian National Congress",
            post="Chief Minister",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="meera_iyengar",
            email="meera.iyengar@gov.in",
            password="pass@123",
            name="Meera Iyengar",
            phone="+91 80 2230 1101",
            constituency='Bengaluru South',
            party="Indian National Congress",
            post="Minister of Education",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="rakesh_hegde",
            email="rakesh.hegde@gov.in",
            password="pass@123",
            name="Rakesh Hegde",
            phone="+91 80 2230 1102",
            constituency="Bengaluru North",
            party="Bharatiya Janata Party",
            post="Minister of Urban Development",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="ananya_prasad",
            email="ananya.prasad@gov.in",
            password="pass@123",
            name="Ananya Prasad",
            phone="+91 80 2230 1103",
            constituency="Bengaluru East",
            party="Janata Dal (Secular)",
            post="Minister of Women & Child Development",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="shyam_menon",
            email="shyam.menon@gov.in",
            password="pass@123",
            name="Shyam Menon",
            phone="+91 80 2230 1104",
            constituency="Bengaluru Central",
            party="Indian National Congress",
            post="Minister of Health & Family Welfare",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="deepa_narayan",
            email="deepa.narayan@gov.in",
            password="pass@123",
            name="Deepa Narayan",
            phone="+91 80 2230 1105",
            constituency="Jayanagar",
            party="Bharatiya Janata Party",
            post="State Minister for Public Works",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="ashwin_reddy",
            email="ashwin.reddy@gov.in",
            password="pass@123",
            name="Ashwin Reddy",
            phone="+91 80 2230 1106",
            constituency="Rajajinagar",
            party="Indian National Congress",
            post="Minister of Transport",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="pooja_shetty",
            email="pooja.shetty@gov.in",
            password="pass@123",
            name="Pooja Shetty",
            phone="+91 80 2230 1107",
            constituency="Malleshwaram",
            party="Bharatiya Janata Party",
            post="Minister of Finance",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="vinay_murthy",
            email="vinay.murthy@gov.in",
            password="pass@123",
            name="Vinay Murthy",
            phone="+91 80 2230 1108",
            constituency="Hebbal",
            party="Janata Dal (Secular)",
            post="State Minister for IT & BT",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="sahana_dev",
            email="sahana.dev@gov.in",
            password="pass@123",
            name="Sahana Dev",
            phone="+91 80 2230 1109",
            constituency="Yelahanka",
            party="Indian National Congress",
            post="State Minister for Environment",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="naveen_bhat",
            email="naveen.bhat@gov.in",
            password="pass@123",
            name="Naveen Bhat",
            phone="+91 80 2230 1110",
            constituency="Mahadevapura",
            party="Bharatiya Janata Party",
            post="Minister of Industries",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="kavya_manjunath",
            email="kavya.manjunath@gov.in",
            password="pass@123",
            name="Kavya Manjunath",
            phone="+91 80 2230 1111",
            constituency="Dasarahalli",
            party="Indian National Congress",
            post="State Minister for Labour",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="rohith_gowda",
            email="rohith.gowda@gov.in",
            password="pass@123",
            name="Rohith Gowda",
            phone="+91 80 2230 1112",
            constituency="Anekal",
            party="Janata Dal (Secular)",
            post="State Minister for Housing",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="farah_khan",
            email="farah.khan@gov.in",
            password="pass@123",
            name="Farah Khan",
            phone="+91 80 2230 1113",
            constituency="Shivajinagar",
            party="Indian National Congress",
            post="Minister of Minority Welfare",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="harish_naik",
            email="harish.naik@gov.in",
            password="pass@123",
            name="Harish Naik",
            phone="+91 80 2230 1114",
            constituency="Bommanahalli",
            party="Bharatiya Janata Party",
            post="State Minister for Commerce",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="tejaswini_rao",
            email="tejaswini.rao@gov.in",
            password="pass@123",
            name="Tejaswini Rao",
            phone="+91 80 2230 1115",
            constituency="Pulakeshinagar",
            party="Indian National Congress",
            post="State Minister for Social Justice",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="manoj_kulkarni",
            email="manoj.kulkarni@gov.in",
            password="pass@123",
            name="Manoj Kulkarni",
            phone="+91 80 2230 1116",
            constituency="KR Pura",
            party="Bharatiya Janata Party",
            post="Minister of Revenue",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="neha_subramani",
            email="neha.subramani@gov.in",
            password="pass@123",
            name="Neha Subramani",
            phone="+91 80 2230 1117",
            constituency="Chickpet",
            party="Janata Dal (Secular)",
            post="State Minister for Tourism",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="girish_shekar",
            email="girish.shekar@gov.in",
            password="pass@123",
            name="Girish Shekar",
            phone="+91 80 2230 1118",
            constituency="Vijayanagar",
            party="Indian National Congress",
            post="Minister of Food & Civil Supplies",
            district="Bengaluru Urban",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="aarti_chandran",
            email="aarti.chandran@gov.in",
            password="pass@123",
            name="Aarti Chandran",
            phone="+91 80 2230 1119",
            constituency="Sarvagnanagar",
            party="Bharatiya Janata Party",
            post="State Minister for Skill Development",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="darshan_joseph",
            email="darshan.joseph@gov.in",
            password="pass@123",
            name="Darshan Joseph",
            phone="+91 80 2230 1120",
            constituency="Byatarayanapura",
            party="Indian National Congress",
            post="State Minister for Youth Affairs",
            district="Bengaluru Urban",
            ministerType="state",
        ),
        PoliticianRecord(
            username="bhavana_aras",
            email="bhavana.aras@gov.in",
            password="pass@123",
            name="Bhavana Aras",
            phone="+91 80 2230 1121",
            constituency="Nelamangala",
            party="Janata Dal (Secular)",
            post="State Minister for Rural Interfaces",
            district="Bengaluru Rural",
            ministerType="state",
        ),
        PoliticianRecord(
            username="sanjay_devraj",
            email="sanjay.devraj@gov.in",
            password="pass@123",
            name="Sanjay Devraj",
            phone="+91 80 2230 1122",
            constituency="Devanahalli",
            party="Bharatiya Janata Party",
            post="Minister of Civil Aviation & Infrastructure",
            district="Bengaluru Rural",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="priya_sharma",
            email="priya.sharma@gov.in",
            password="pass@123",
            name="Priya Sharma",
            phone="+91 80 2222 4444",
            constituency="Mysuru North",
            party="Bharatiya Janata Party",
            post="Minister of Education Outreach",
            district="Mysuru",
            ministerType="cabinet",
        ),
        PoliticianRecord(
            username="suresh_patel",
            email="suresh.patel@gov.in",
            password="pass@123",
            name="Suresh Patel",
            phone="+91 80 2222 5555",
            constituency="Hubli-Dharwad",
            party="Janata Dal (Secular)",
            post="Minister of Health Field Operations",
            district="Dharwad",
            ministerType="cabinet",
        ),
    ]


def init_firestore(credentials_path: str, project_id: str | None) -> firestore.Client:
    if not os.path.isfile(credentials_path):
        raise FileNotFoundError(f"Service account JSON not found: {credentials_path}")

    if not firebase_admin._apps:
        cred = credentials.Certificate(credentials_path)
        firebase_admin.initialize_app(cred, {"projectId": project_id} if project_id else None)

    return firestore.client()


def to_user_payload(record: PoliticianRecord) -> dict:
    data = asdict(record)
    data.update(
        {
            "userType": "politician",
            "role": "politician",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }
    )
    return data


def iter_seed_docs(records: Iterable[PoliticianRecord]):
    for record in records:
        doc_id = f"seed-pol-{slugify(record.username)}"
        yield doc_id, record


def seed_politicians(db: firestore.Client, overwrite: bool, dry_run: bool) -> None:
    users = db.collection(COLLECTION_NAME)
    created = 0
    updated = 0
    skipped = 0

    for doc_id, record in iter_seed_docs(get_seed_records()):
        ref = users.document(doc_id)
        exists = ref.get().exists
        payload = to_user_payload(record)

        if exists and not overwrite:
            skipped += 1
            print(f"SKIP   {doc_id} ({record.name}) already exists")
            continue

        action = "UPDATE" if exists else "CREATE"
        if dry_run:
            print(f"DRYRUN {action:<6} {doc_id} -> {record.name}")
            continue

        ref.set(payload, merge=overwrite)
        if exists:
            updated += 1
            print(f"UPDATE {doc_id} ({record.name})")
        else:
            created += 1
            print(f"CREATE {doc_id} ({record.name})")

    print("\nDone seeding politicians")
    print(f"Created: {created}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed politician data into Firestore users collection")
    parser.add_argument(
        "--credentials",
        default=os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", ""),
        help="Path to Firebase service account JSON (or set FIREBASE_SERVICE_ACCOUNT_PATH)",
    )
    parser.add_argument(
        "--project-id",
        default=os.getenv("REACT_APP_FIREBASE_PROJECT_ID", ""),
        help="Firebase project id (optional if present in service account)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing seeded docs",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show actions without writing to Firestore",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.credentials:
        raise ValueError(
            "Missing credentials path. Pass --credentials or set FIREBASE_SERVICE_ACCOUNT_PATH."
        )

    db = init_firestore(args.credentials, args.project_id or None)
    seed_politicians(db, overwrite=args.overwrite, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
