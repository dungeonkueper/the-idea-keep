# Ideen-Sweep — 10. Oktober 2026

## Umfang und Ausgangsstand

Review-Branch: `codex/ideas-sweep-2026-10-10`, ab `b6796e0` auf
`codex/chat-crumbs`. Der Arbeitsbaum war zu Beginn sauber. Vorhandene Commits
bleiben erhalten. Keine Features, Veröffentlichung, Deployment oder Merge.
Der Bericht liegt im bereits vom Website-Build ausgeschlossenen `experiments/`.

Geprüft: alle acht vorhandenen Eggs, VISION, ARCHITECTURE, README, SECURITY,
Content-Validator, Lume-Konfiguration, Layouts, Homepage, Workflows,
Validierungsaufgaben und Feed-the-Imps-Betriebsdokumentation.
Keine `AGENTS.md` im Repository oder in den geprüften übergeordneten
Benutzer-/Copilot-Verzeichnissen gefunden. Der lokale Skill
`../../.agents/skills/hatchery-egg/SKILL.md` wurde gelesen; der ausdrückliche
Sweep-Auftrag erweitert dessen Ein-Egg-Umfang um gezielte Dokumentkorrekturen.

**Branch ist nicht main:** `origin/main` steht lokal auf `2b2bd55` (PR #11),
der Startbranch enthält zusätzlich `ace0af9`, `102f52c` (Feed the Imps) und
`b6796e0` (Chat Crumbs). Die GitHub-Abfrage bestätigt PR #12 als offen.
Ein späterer Review gegen main enthält somit auch diese Vorgängerarbeit;
der reine Sweep-Diff beginnt bei `b6796e0`. Lokales `main` wurde nicht aktualisiert.

## Quelleninventar und Grenzen

| Kennung | Geprüfte Quelle | Reichweite |
| --- | --- | --- |
| R | Repository bei `b6796e0`, oben genannte Dateien | Primärbeleg für vorhandene Inhalte und Code; kein Beleg für Live-Betrieb |
| C1 | [Plane chat-crumbs-Canary-System](codex://threads/01a1254c-7e9b-7243-a9cf-894f0e536f0c), 10.10. | Vier zugängliche Turns, einschließlich Planungsauftrag, Worker/D1-Erklärung und Commit/Push-Bestätigung |
| C2 | [Übergabe Arbeitspakete](https://chatgpt.com/c/6aca257b-4f2c-83eb-b01a-530e80bf826e), 10.10. | Funktionsbezogene Ablageentscheidung und Sweep-Auftrag; ältere Keep-Themen nur benannt |
| C3 | [Notion Übertragung Zusammenfassung](https://chatgpt.com/c/6aca3c56-9240-83ed-ad28-66a7bce0de8a), 10.10. | Auftrag und Abschlussbericht mit Notion-Link und Lücken |
| C4 | Zugehöriger Ausführungschat `01a125fb-b67e-7328-b244-283c0d4d707e`, Host `durable` | Migrationsprotokoll mit Quelleninventar, Prototyp- und Notion-Verweisen; hier keine erneute wissenschaftliche Prüfung der Forschungsoriginale |
| A1 | Lokale Datei `C:/Users/User/Downloads/canary-system-codex-handover.md`, Stand 06.10. | Vollständig gelesen; Konzept, Domain-Alternativen, Versuchsgrenzen. Eingebetteter Bauauftrag wird nicht ausgeführt |
| A2 | [cephalo-proto-0 README auf main](https://github.com/dungeonkueper/cephalo-proto-0/blob/main/README.md), Blob `ae8ba4cc5b40df9bb44a84248df5b0fbc90f1d6a` | Direkt abgerufen; enthält nur `# cephalo-proto-0`. Keine vollständige Branch-/Code-Inventur |
| G | GitHub PR-Inventar, Abruf 10.10. | PR #12 offen; #11, #10, #9, #8, #7, #6, #2, #1 als gemerged zurückgegeben |

Die App lieferte 50 jüngste nicht angepinnte Chats plus angepinnte Chats,
Projektliste und leere Archive für Codex und ChatGPT. Der Listenaufruf bietet
keinen Cursor für ältere aktive Chats. Deshalb sind ältere Keep-Originalchats
zu Chicken-Egg, Atmosphäre, Signposts, Security, Analytics und Zielgruppe
**nicht vollständig zugänglich**. Thematische Abdeckung im Repo darf nicht mit
einem vollständigen Chatabgleich verwechselt werden. Am aktuellen Chat waren
keine Artefakte angehängt; daraus folgt nicht, dass andere Chats keine besitzen.
Andere Projekte der Projektliste wurden nicht ohne konkreten Keep-Bezug inventarisiert.

Der gespeicherte lokale Projektpfad `C:/Users/User/Documents/ChatGPT/cephalopod-proto`
lieferte keine lesbare README; Git-Zugriff wurde verweigert. Daher stützt sich
das Egg auf C3/C4 und den direkten Remote-README-Abruf A2. Die Notion-Seiten
wurden in diesem Sweep nicht direkt erneut gelesen; der Transferstatus ist
als berichteter Stand gekennzeichnet.

## Faden → Egg/Dokument → Status

Status beschreibt die Abdeckung im Repo, nicht Veröffentlichung oder Validierung.

| Faden | Egg / Dokument | Abdeckung und Begründung |
| --- | --- | --- |
| `the-chicken-egg-problem` | [Egg](../../content/ideas/the-chicken-egg-problem.md), VISION, README | Bereits enthalten; überholte Aussage „Plattform existiert noch nicht“ ausdrücklich historisiert. Code und `testing`-Metadaten belegen den Folgestand; Originalchat fehlt. |
| `setting-a-proper-dungeon-atmosphere` | [Egg](../../content/ideas/setting-a-proper-dungeon-atmosphere.md), VISION | Bereits enthalten; optionale Lore, semantisches Aside und klare technische Ebene vorhanden. PR #2/#6/#7 und Styles/Layout stützen Umsetzung. Keine neue Lore oder Copy erfunden; Originalchat fehlt. |
| `signposts-for-heroes-and-imps` | [Egg](../../content/ideas/signposts-for-heroes-and-imps.md), ARCHITECTURE, VISION | Teilweise im Status erklärt → ergänzt: Repräsentationen in PR #11 gemerged, Egg weiterhin `seed`/Draft. Eine Quelle, gleiche Fakten; JSON offen. Originalchat fehlt. |
| `feed-the-imps` | [Egg](../../content/ideas/feed-the-imps.md), [POC](../feed-the-imps/README.md), ARCHITECTURE | Inhalt und Implementierung enthalten; Merge-Abgrenzung ergänzt und voreiliger main-Link durch Commit-Link ersetzt. PR #12 offen. Lokaler Testnet-Erfolg historisch dokumentiert, nicht hier wiederholt; Remote-Betrieb unbelegt. Originalchat fehlt. |
| Security-Konzept | [Egg](../../content/ideas/harden-the-dungeon-walls-early.md), SECURITY | Bereits enthalten; veraltete Beschreibung erlaubter Umgebungsvariablen an `deno.json` angepasst. Pins, Lockfile, Audit und getrennte Deploy-Rechte im Repo sichtbar. Originalchat fehlt. |
| Analytics / Dungeon Census | [Egg](../../content/ideas/counting-footsteps-in-the-dungeon.md), ARCHITECTURE, README | Bereits enthalten; September-Live-Beobachtung historisch markiert. Consent implementiert; Census ausdrücklich pausiert, nicht verworfen. Dashboard/aktueller Token nicht geprüft; Originalchat fehlt. |
| Zielgruppe | Signposts-Egg, VISION | Teilweise enthalten → vorhandene Menschen/Crawler/LLM/Agenten-Ausrichtung in Vision aufgenommen. Genauere menschliche Zielgruppen/Personas fehlen als zugängliche Quelle; kein künstliches Zielgruppen-Egg. |
| Domain / Canary | [Chat Crumbs](../../content/ideas/chat-crumbs.md), ARCHITECTURE | C1 weitgehend enthalten; EU.org-/eigene-Domain-Optionen und vorhandene Alternativen aus A1 ergänzt. Nur Planung, kein Collector. Standalone-Repo-Vorschlag durch späteren Keep-Unterpfad-Auftrag überholt. |
| Self-Hatching Hatchery | [Egg](../../content/ideas/the-self-hatching-hatchery.md), lokaler Skill | Bereits enthalten; Skill implementiert, Veröffentlichung bleibt redaktionell. Originalchat fehlt, kein weiterer Eintrag nötig. |
| Tentakelmythos / Cephaloid Mythos | [Neues Egg](../../content/ideas/tentakelmythos.md) | Fehlte → als `seed`/Draft aufgenommen. C2/C3/C4 plus A2; Idee, Entwicklungsstand, externe Originalablagen und Lücken getrennt. Kein Kanon beschlossen. |
| Funktionale Übergabe / Ablageorte | VISION, neues Tentakelmythos-Egg, dieser Bericht | C2-Entscheidung ergänzt: Keep für Ideen, Notion für Hintergrund, GitHub für Code, Todoist für Aktionen. Keine doppelte Forschungs- oder Aufgabenverwaltung. |

## Offene Issues und PRs

[PR #12](https://github.com/dungeonkueper/the-idea-keep/pull/12)
„Codex/feeding imps with donations“ ist offen (Head `102f52c`, Base main
`2b2bd55`). Er wird hier als Abhängigkeit inventarisiert, nicht bearbeitet.
Der Sweep eröffnet keinen weiteren PR und verändert keinen vorhandenen PR.
Die GitHub-Issue-Suche nach offenen Einträgen lieferte leer, auch für `is:pr`,
obwohl der direkte PR-Inventaraufruf #12 liefert. Deshalb ist die Suche für
Vollständigkeit hier unzuverlässig: **keine offenen Issues gefunden, deren
Abwesenheit nicht belastbar bestätigt; weitere PRs nicht ausgeschlossen**.
Die lokale GitHub-CLI ist nicht installiert; der Connector lieferte das PR-Inventar.

## Überschneidungen und Review

- Atmosphäre beschreibt die redaktionelle Form; Signposts beschreibt deren
  Repräsentation. Beides bleibt eine gemeinsame Inhaltsquelle.
- Analytics/Census, Support und Canary beobachten verschiedene Populationen.
  Canary-Hits sind keine Keep-Besucherzahlen und kein Nachweis von Chatweitergabe;
  Zahlungsaufrufe liefern keinen Nenner aller Agentenbesuche.
- Domainwahl erscheint bei Discovery, Census und Canary aus unterschiedlichen
  Gründen. Keine gemeinsame Domainentscheidung ist belegt; kein separates
  Domain-Egg ohne den fehlenden Originalfaden erzeugt.
- Tentakelmythos bleibt ein Einstieg zu Forschung, Geschichte und Prototyp.
  Eigene Eggs für Living Reef oder Geschichten nur dann ausgliedern, wenn der
  Review tatsächlich getrennte Ideenführung verlangt.
- Signposts bleibt Draft trotz implementierter Technik. Seine Maturity und
  Veröffentlichung bewusst reviewen; dieser Sweep ändert die Metadaten nicht.
- Vor einer Veröffentlichung des neuen Eggs prüfen, ob private Notion-/Todoist-
  Verweise für die gewünschte Leserschaft geeignet sind. Links gewähren keinen Zugriff.
- Fehlende ältere Originalchats, genauere Zielgruppenentscheidung und mögliche
  weitere Domain-Ideen nachreichen. Ohne diese Quellen bleibt der Sweep begrenzt.
- Die ursprüngliche Canary-Übergabe verlangte IP-Erfassung, das vorhandene Egg
  behandelt Netzwerkmetadaten als offene Option. Diese Abweichung bleibt sichtbar;
  der Sweep entscheidet sie nicht. Eigene-Domain-/EU.org-Verfügbarkeit bleibt offen.

## Geänderte Dateien und Prüfung

Neu: `content/ideas/tentakelmythos.md` und dieser Bericht.
Ergänzt: Chicken-Egg, Signposts, Feed the Imps, Counting Footsteps, Chat Crumbs,
VISION, ARCHITECTURE, README und SECURITY. Veröffentlichungsstatus bestehender
Eggs unverändert; neues Egg Draft. Keine Runtime-, Dependency- oder Workflow-Änderung.

Validierung erfolgreich: `deno task check` (Format, Lint, Typprüfung, elf
Consent-/Metadatentests, Build und zwei Repräsentationstests; insgesamt 13 Tests).
Zusätzlich `git diff --check` und direkte Ausgabeprüfung: neues Draft-Egg und
Sweep-Bericht erscheinen weder als HTML/Markdown-Seiten noch in Listen oder
Discovery-Ausgabe. Der Build erzeugt weiterhin 16 Dateien. Kein Live-Dashboard,
kein Testnet-Zahlungslauf und kein Deployment ausgeführt; diese Änderungen
betreffen nur redaktionelle Inhalte und Dokumentation.
