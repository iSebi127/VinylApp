package com.musicapp.controller;

import com.musicapp.model.SongDTO;
import com.musicapp.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SongController {

    private final SongService songService;

    @GetMapping
    public ResponseEntity<List<SongDTO>> getAllSongs() {
        return ResponseEntity.ok(songService.getAllSongs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongDTO> getSongById(@PathVariable Long id) {
        return ResponseEntity.ok(songService.getSongById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SongDTO>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist) {
        if (title != null) return ResponseEntity.ok(songService.searchByTitle(title));
        if (artist != null) return ResponseEntity.ok(songService.searchByArtist(artist));
        return ResponseEntity.ok(songService.getAllSongs());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDTO> createSong(
            @RequestParam String title,
            @RequestParam String artist,
            @RequestParam(required = false) String album,
            @RequestParam(required = false) Integer releaseYear,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String themeColor,
            @RequestParam(required = false) String accentColor,
            @RequestPart("audioFile") MultipartFile audioFile,
            @RequestPart(value = "coverFile", required = false) MultipartFile coverFile
    ) throws IOException {
        SongDTO created = songService.createSong(
                title, artist, album, releaseYear, genre,
                themeColor, accentColor, audioFile, coverFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDTO> updateSong(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist,
            @RequestParam(required = false) String album,
            @RequestParam(required = false) Integer releaseYear,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String themeColor,
            @RequestParam(required = false) String accentColor,
            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestPart(value = "coverFile", required = false) MultipartFile coverFile
    ) throws IOException {
        return ResponseEntity.ok(songService.updateSong(
                id, title, artist, album, releaseYear, genre,
                themeColor, accentColor, audioFile, coverFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
