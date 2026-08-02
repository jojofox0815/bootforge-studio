# BootForge Studio

BootForge Studio ist eine modulare Grundlage für Multi-Boot-Medien und automatisierte Windows-/Linux-Installationen. Der Standardmodus stellt Antwortdateien dynamisch bereit; Original-ISOs bleiben unverändert.

## Aktueller MVP

- Klickbare, responsive React/TypeScript-Oberfläche mit Hell-/Dunkelmodus
- Lokale, versionierte Profilpersistenz im Browser; SQLite ist für die Desktop-Laufzeit modelliert
- Echte Zod-Schemavalidierung und Preflight-Regeln
- Struktur-basierte Erkennung für Windows, Ubuntu, Debian, Fedora und Arch
- Getrennte Windows-Unattend- und Ubuntu-Autoinstall-Adapter
- USB-Systemlaufwerkschutz mit gerätegebundenem Bestätigungstext
- Nachvollziehbarer Build-Plan, strukturierte Jobs und maskierbare Logs
- Mock-Adapter für Ventoy/QEMU und privilegierte Host-Zugriffe, sichtbar in der UI
- Tauri-/Rust-Struktur für die nächste Implementierungsstufe

## Start

Voraussetzung: Node.js 22.13 oder neuer.

```bash
npm install
npm run dev
```

Prüfungen:

```bash
npm test
npm run lint
npm run build
```

Die Desktop-Hülle benötigt zusätzlich Rust, Tauri-Systemabhängigkeiten und die Tauri CLI:

```bash
npm run tauri dev
```

## Modulgrenzen

Geschäftslogik lebt in `src/core`, Beispieldaten in `src/data`, die UI in `components`, die spätere privilegierte Desktop-Laufzeit in `src-tauri`. OS-Regeln werden nicht im Frontend hart codiert; die UI rendert Fähigkeiten und Validierungsergebnisse der Kernmodule.

Die Architekturentscheidung, Datenmodelle, Profilformat, Sicherheitsmodell, Risiken und Entwicklungsreihenfolge stehen in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Recht und Distribution

Das Projekt enthält keine Betriebssystem-Images, Produktschlüssel, proprietären Treiber oder nicht frei verteilbaren Dateien. Ventoy ist ausschließlich als externes Backend vorgesehen. Eine Verteilung muss alle Drittanbieter-Lizenzen prüfen und GPL-Komponenten prozess- und paketgrenzenscharf behandeln.

## Bekannte Grenzen

- ISO-Analyse arbeitet im Web-Prototyp gegen strukturierte Probes; echtes Mounten/Lesen erfolgt erst im Rust-Hostadapter.
- USB-Schreiben, QEMU-Start, WIM-/ESD-Servicing und Secret-Keychain sind sichere Mock-Grenzen.
- Die Web-Persistenz dient der klickbaren Arbeitsoberfläche. Tauri nutzt im nächsten Schritt SQLite und OS-Keychain.
- Manuelle Änderungen an generierten XML/YAML-Dateien sind im MVP schreibgeschützt, damit Regeneration nichts unbemerkt überschreibt.
