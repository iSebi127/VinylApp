package com.musicapp.service;

import com.musicapp.model.Song;
import com.musicapp.model.SongDTO;
import com.musicapp.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongService {

    private final SongRepository songRepository;

    @Value("${app.upload.dir:/uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public List<SongDTO> getAllSongs() {
        return songRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SongDTO getSongById(Long id) {
        return songRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
    }

    public SongDTO createSong(String title, String artist, String album,
                              Integer releaseYear, String genre,
                              String themeColor, String accentColor,
                              MultipartFile audioFile, MultipartFile coverFile) throws IOException {
        String audioFileName = saveFile(audioFile, "audio");
        String coverFileName = saveFile(coverFile, "covers");

        Song song = Song.builder()
                .title(title)
                .artist(artist)
                .album(album)
                .releaseYear(releaseYear)
                .genre(genre)
                .themeColor(themeColor != null ? themeColor : "#1a1a2e")
                .accentColor(accentColor != null ? accentColor : "#e94560")
                .audioFileName(audioFileName)
                .coverFileName(coverFileName)
                .build();

        return toDTO(songRepository.save(song));
    }

    public SongDTO updateSong(Long id, String title, String artist, String album,
                              Integer releaseYear, String genre,
                              String themeColor, String accentColor,
                              MultipartFile audioFile, MultipartFile coverFile) throws IOException {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));

        if (title != null) song.setTitle(title);
        if (artist != null) song.setArtist(artist);
        if (album != null) song.setAlbum(album);
        if (releaseYear != null) song.setReleaseYear(releaseYear);
        if (genre != null) song.setGenre(genre);
        if (themeColor != null) song.setThemeColor(themeColor);
        if (accentColor != null) song.setAccentColor(accentColor);

        if (audioFile != null && !audioFile.isEmpty()) {
            deleteFile("audio", song.getAudioFileName());
            song.setAudioFileName(saveFile(audioFile, "audio"));
        }
        if (coverFile != null && !coverFile.isEmpty()) {
            deleteFile("covers", song.getCoverFileName());
            song.setCoverFileName(saveFile(coverFile, "covers"));
        }

        return toDTO(songRepository.save(song));
    }

    public void deleteSong(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
        deleteFile("audio", song.getAudioFileName());
        deleteFile("covers", song.getCoverFileName());
        songRepository.deleteById(id);
    }

    public List<SongDTO> searchByTitle(String title) {
        return songRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<SongDTO> searchByArtist(String artist) {
        return songRepository.findByArtistContainingIgnoreCase(artist).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    // --- helpers ---

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        if (file == null || file.isEmpty()) return null;
        Path dir = Paths.get(uploadDir, subDir);
        Files.createDirectories(dir);
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    private void deleteFile(String subDir, String filename) {
        if (filename == null) return;
        try {
            Files.deleteIfExists(Paths.get(uploadDir, subDir, filename));
        } catch (IOException ignored) {}
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }

    private SongDTO toDTO(Song song) {
        return SongDTO.builder()
                .id(song.getId())
                .title(song.getTitle())
                .artist(song.getArtist())
                .album(song.getAlbum())
                .releaseYear(song.getReleaseYear())
                .genre(song.getGenre())
                .audioUrl(song.getAudioFileName() != null
                        ? baseUrl + "/api/files/audio/" + song.getAudioFileName() : null)
                .coverUrl(song.getCoverFileName() != null
                        ? baseUrl + "/api/files/covers/" + song.getCoverFileName() : null)
                .themeColor(song.getThemeColor())
                .accentColor(song.getAccentColor())
                .durationSeconds(song.getDurationSeconds())
                .build();
    }
}
