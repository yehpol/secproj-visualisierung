# SECPROJ // HTB-HSLU Mapping Console

Diese Webseite dient zur interaktiven Visualisierung der Modul- und Kompetenz-Mappings zwischen Hack The Box (HTB) und den Studienmodulen der HSLU (Hochschule Luzern) für das SecProj.

Die Web-App ist im Retro-Cybersecurity / HUD-Design gestaltet und benötigt **kein Backend** oder komplexe Abhängigkeiten.

## 📁 Dateistruktur

* **[index.html](file:///d:/OneDrive%20-%20Hochschule%20Luzern/5.%20Semester/SECPROJ/dev/secproj-visualisierung/index.html)**: Das Hauptgerüst der Konsole, einschliesslich HUD-Statistiken, Filter-Elementen und dem Terminal-Detail-Panel.
* **[style.css](file:///d:/OneDrive%20-%20Hochschule%20Luzern/5.%20Semester/SECPROJ/dev/secproj-visualisierung/style.css)**: Cyberpunk-Design-Tokens, Neonfarben, Scanlines-Überlagerung, glühende Effekte und responsive Layouts.
* **[data.js](file:///d:/OneDrive%20-%20Hochschule%20Luzern/5.%20Semester/SECPROJ/dev/secproj-visualisierung/data.js)**: Die strukturierten Daten der Mappings in einem globalen JavaScript-Array (verhindert lokale CORS-Sicherheitsfehler).
* **[app.js](file:///d:/OneDrive%20-%20Hochschule%20Luzern/5.%20Semester/SECPROJ/dev/secproj-visualisierung/app.js)**: Logik für die Echtzeitsuche, dynamische Filterung, akustisches Web-Audio-Feedback, CSV-Export und die Konsolenprotokollierung.
* **[run-server.bat](file:///d:/OneDrive%20-%20Hochschule%20Luzern/5.%20Semester/SECPROJ/dev/secproj-visualisierung/run-server.bat)**: Eine einfache Windows-Batchdatei zum Starten eines lokalen Python-Webservers.

## 🚀 Lokales Starten

Sie haben zwei einfache Möglichkeiten, diese Webseite auf Ihrem Computer anzuzeigen:

### Methode A: Direktes Öffnen (Keine Installation nötig)
Doppelklicken Sie einfach auf die Datei **`index.html`** in Ihrem Datei-Explorer. Sie öffnet sich sofort im Webbrowser und läuft voll funktionsfähig.

### Methode B: Lokaler Webserver (Empfohlen)
Doppelklicken Sie auf die Datei **`run-server.bat`**. 
Dies führt folgende Aktionen aus:
1. Prüft, ob Python auf Ihrem System installiert ist.
2. Startet einen sicheren Webserver auf Port `8000`, der nur von Ihrem eigenen Computer (`127.0.0.1`) erreichbar ist.
3. Öffnen Sie anschliessend die Adresse [http://127.0.0.1:8000](http://127.0.0.1:8000) in Ihrem Browser.
4. Schliessen Sie das Konsolenfenster, um den Server wieder zu beenden.

---
*Entwickelt für die HSLU - Informatik & Cybersecurity.*
