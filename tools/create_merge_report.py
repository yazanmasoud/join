from datetime import datetime
from pathlib import Path
import subprocess

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "reports"
OUT_FILE = OUT_DIR / "merge-bericht-refactor-firebase-v9-in-dev.pdf"


def git(*args):
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return result.stdout.strip()


def collect_merge_data():
    merge_commit = git("rev-parse", "--short", "HEAD")
    full_commit = git("rev-parse", "HEAD")
    commit_subject = git("log", "-1", "--pretty=%s")
    author = git("log", "-1", "--pretty=%an <%ae>")
    commit_date = git("log", "-1", "--date=format:%d.%m.%Y %H:%M", "--pretty=%ad")
    parents = git("show", "--no-patch", "--pretty=%P", "HEAD").split()
    parent_short = [p[:7] for p in parents]
    stats = git("show", "--stat", "--summary", "--format=", "--no-renames", "HEAD")
    changed_files = git("diff", "--name-status", "HEAD^1", "HEAD").splitlines()
    return {
        "merge_commit": merge_commit,
        "full_commit": full_commit,
        "commit_subject": commit_subject,
        "author": author,
        "commit_date": commit_date,
        "parents": parent_short,
        "stats": stats,
        "changed_files": changed_files,
    }


def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=27,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1F2A44"),
            spaceAfter=7 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#576070"),
            spaceAfter=9 * mm,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#24324B"),
            spaceBefore=4 * mm,
            spaceAfter=3 * mm,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.8,
            leading=13.5,
            textColor=colors.HexColor("#222222"),
            spaceAfter=2.5 * mm,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#333333"),
        ),
        "cell": ParagraphStyle(
            "Cell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=11.2,
            textColor=colors.HexColor("#222222"),
        ),
        "cell_bold": ParagraphStyle(
            "CellBold",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.7,
            leading=11.2,
            textColor=colors.HexColor("#222222"),
        ),
    }


def p(text, style):
    return Paragraph(text, style)


def section(story, title, styles):
    story.append(Spacer(1, 2 * mm))
    story.append(p(title, styles["h1"]))


def add_key_table(story, rows, styles):
    table_data = [
        [p(label, styles["cell_bold"]), p(value, styles["cell"])]
        for label, value in rows
    ]
    table = Table(table_data, colWidths=[38 * mm, 118 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EEF2F7")),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CFD6E0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 4 * mm))


def add_conflict_table(story, styles):
    rows = [
        [
            p("Datei", styles["cell_bold"]),
            p("Konflikt", styles["cell_bold"]),
            p("Entscheidung", styles["cell_bold"]),
        ],
        [
            p("css/contacts.css", styles["cell"]),
            p("Content-Konflikt zwischen dev-Styles und Firebase-v9-Styles.", styles["cell"]),
            p("Firebase-v9-Version uebernommen und Formatierung bereinigt. Enthalten sind aktive Kontaktzustande, Toast-Styles und Delete-Dialog-Styles.", styles["cell"]),
        ],
        [
            p("pages/contacts.html", styles["cell"]),
            p("Content-Konflikt im Contact-Dialog und in der Detailsektion.", styles["cell"]),
            p("Firebase-v9-Struktur uebernommen, doppelte Contact-Details-Sektion entfernt und Create-Button auf handleCreateContact() angepasst.", styles["cell"]),
        ],
        [
            p("js/contact.js", styles["cell"]),
            p("Modify/Delete-Konflikt: dev hatte die Datei geaendert, refactor/firebase-v9 loescht sie.", styles["cell"]),
            p("Loeschung beibehalten. Die Logik liegt jetzt in js/contacts.js und js/contacts-service.js.", styles["cell"]),
        ],
    ]
    table = Table(rows, colWidths=[34 * mm, 55 * mm, 67 * mm], repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#24324B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CFD6E0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FBFCFE")),
            ]
        )
    )
    story.append(table)


def add_file_summary(story, changed_files, styles):
    buckets = {
        "Neu": [],
        "Geaendert": [],
        "Geloescht": [],
    }
    for line in changed_files:
        if not line.strip():
            continue
        status, path = line.split("\t", 1)
        if status == "A":
            buckets["Neu"].append(path)
        elif status == "D":
            buckets["Geloescht"].append(path)
        else:
            buckets["Geaendert"].append(path)

    rows = [[p("Kategorie", styles["cell_bold"]), p("Dateien", styles["cell_bold"])]]
    for label, files in buckets.items():
        rows.append(
            [
                p(f"{label} ({len(files)})", styles["cell_bold"]),
                p("<br/>".join(files) if files else "-", styles["cell"]),
            ]
        )
    table = Table(rows, colWidths=[35 * mm, 121 * mm], repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#24324B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CFD6E0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)


def build_pdf():
    OUT_DIR.mkdir(exist_ok=True)
    data = collect_merge_data()
    styles = make_styles()
    story = []

    story.append(p("Merge-Bericht", styles["title"]))
    story.append(
        p(
            "Branch refactor/firebase-v9 wurde in dev integriert und nach origin/dev gepusht.",
            styles["subtitle"],
        )
    )

    add_key_table(
        story,
        [
            ("Ziel-Branch", "dev / origin/dev"),
            ("Quell-Branch", "refactor/firebase-v9 / origin/refactor/firebase-v9"),
            ("Merge-Commit", f"{data['merge_commit']} ({data['full_commit']})"),
            ("Commit-Nachricht", data["commit_subject"]),
            ("Eltern-Commits", " / ".join(data["parents"])),
            ("Autor", data["author"]),
            ("Datum", data["commit_date"]),
            ("Bericht erstellt", datetime.now().strftime("%d.%m.%Y %H:%M")),
        ],
        styles,
    )

    section(story, "Kurzfassung", styles)
    story.append(
        p(
            "Der Firebase-v9-Refactor ist erfolgreich in dev gemerged. Der Fokus des Merges liegt auf der Umstellung der Datenzugriffe auf modulare Services, insbesondere fuer Auth, Contacts und Tasks. Die alte Contact-Logik wurde durch neue Module ersetzt.",
            styles["body"],
        )
    )
    story.append(
        p(
            "Der lokale dev-Branch wurde anschliessend nach GitHub gepusht. Der finale Status war sauber: dev und origin/dev zeigen auf denselben Merge-Commit.",
            styles["body"],
        )
    )

    section(story, "Konflikte und Entscheidungen", styles)
    add_conflict_table(story, styles)

    section(story, "Technische Auswirkungen", styles)
    impacts = [
        "Firebase-Integration wurde auf modulare Service-Dateien verteilt.",
        "Contacts nutzt nun js/contacts.js und js/contacts-service.js statt js/contact.js.",
        "Neue Service-Dateien fuer Auth und Tasks wurden eingefuehrt.",
        "Contacts-UI wurde um Delete-Dialog, Toast-Messages und aktive Kontaktmarkierung erweitert.",
        "Mehrere Layout-, Board-, Auth- und Template-Dateien wurden im Rahmen des Refactors angepasst.",
    ]
    for item in impacts:
        story.append(p(f"- {item}", styles["body"]))

    section(story, "Geaenderte Dateien nach Kategorie", styles)
    add_file_summary(story, data["changed_files"], styles)

    section(story, "Empfehlung fuer das Team", styles)
    recommendations = [
        "Nach dem Pull von dev sollte jedes Teammitglied den eigenen lokalen Stand aktualisieren und alte contact.js-Referenzen vermeiden.",
        "Neue Contact-Funktionen sollten gegen js/contacts.js und js/contacts-service.js entwickelt werden.",
        "Vor weiteren Feature-Merges bitte besonders Contacts, Auth, Board und Task-Erstellung kurz im Browser testen.",
        "Falls lokale Branches noch auf dem alten dev basieren, empfiehlt sich ein Rebase oder Merge mit aktuellem origin/dev.",
    ]
    for item in recommendations:
        story.append(p(f"- {item}", styles["body"]))

    doc = SimpleDocTemplate(
        str(OUT_FILE),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Merge-Bericht refactor/firebase-v9 in dev",
        author="Codex",
    )
    doc.build(story)
    return OUT_FILE


if __name__ == "__main__":
    print(build_pdf())
