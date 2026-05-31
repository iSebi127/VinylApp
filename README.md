# 🎵 VinylApp — Music Player cu tematică dinamică

Aplicație web full-stack cu **React + Spring Boot + Docker**.

## Stack

| Layer     | Tehnologie                   |
|-----------|------------------------------|
| Frontend  | React 18, CSS3 Animations    |
| Backend   | Spring Boot 3.2, Java 17     |
| DB        | H2 (fișier persistent)       |
| Build     | Maven, npm                   |
| Deploy    | Docker + Docker Compose      |

---

## Pornire rapidă

```bash
docker compose up --build -d
```

- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8080
- **H2 Console** → http://localhost:8080/h2-console (JDBC: `jdbc:h2:file:/data/musicdb`)

---

## Features

- 🎵 **Player audio** — redare MP3, next/prev, seek, volum
- 💿 **Vinil animat** — disc care se rotește când melodia rulează, braț tonearm
- 🎨 **Tematică dinamică** — fundalul, accentul și gradientele se schimbă cu fiecare melodie
- 📚 **Librărie CRUD** — adaugă, editează, șterge melodii
- 🖼  **Upload MP3 + copertă** — fișiere stocate pe volum Docker
- 🔍 **Căutare** — filtrare după titlu, artist, gen

---

## API REST

| Metodă   | Endpoint              | Descriere                  |
|----------|-----------------------|----------------------------|
| GET      | `/api/songs`          | Toate melodiile            |
| GET      | `/api/songs/{id}`     | O melodie după ID          |
| GET      | `/api/songs/search`   | Căutare `?title=` / `?artist=` |
| POST     | `/api/songs`          | Adaugă melodie (multipart) |
| PUT      | `/api/songs/{id}`     | Actualizează melodie       |
| DELETE   | `/api/songs/{id}`     | Șterge melodie             |
| GET      | `/api/files/audio/{filename}` | Servește fișierul MP3 |
| GET      | `/api/files/covers/{filename}`| Servește imaginea     |

### Exemplu POST (curl)

```bash
curl -X POST http://localhost:8080/api/songs \
  -F "title=Bohemian Rhapsody" \
  -F "artist=Queen" \
  -F "album=A Night at the Opera" \
  -F "year=1975" \
  -F "genre=Rock" \
  -F "themeColor=#0d0d1a" \
  -F "accentColor=#e94560" \
  -F "audioFile=@song.mp3" \
  -F "coverFile=@cover.jpg"
```

---

## Structura proiectului

```
music-app/
├── backend/
│   ├── src/main/java/com/musicapp/
│   │   ├── MusicAppApplication.java
│   │   ├── controller/   (SongController, FileController)
│   │   ├── model/        (Song, SongDTO)
│   │   ├── repository/   (SongRepository)
│   │   ├── service/      (SongService)
│   │   └── config/       (WebConfig)
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   (VinylRecord, PlayerBar, SongCard, SongModal)
│   │   ├── context/      (PlayerContext)
│   │   ├── services/     (api.js)
│   │   ├── App.js / App.css
│   │   └── index.js
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## Oprire

```bash
docker compose down          # oprește containerele
docker compose down -v       # oprește + șterge volumele (date pierdute!)
```
