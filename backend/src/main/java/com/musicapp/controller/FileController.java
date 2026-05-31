package com.musicapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Value("${app.upload.dir:/uploads}")
    private String uploadDir;

    @GetMapping("/audio/{filename:.+}")
    public ResponseEntity<Resource> serveAudio(@PathVariable String filename) throws MalformedURLException {
        return serveFile("audio", filename, "audio/mpeg");
    }

    @GetMapping("/covers/{filename:.+}")
    public ResponseEntity<Resource> serveCover(@PathVariable String filename) throws MalformedURLException {
        return serveFile("covers", filename, null);
    }

    private ResponseEntity<Resource> serveFile(String subDir, String filename, String contentType) throws MalformedURLException {
        Path file = Paths.get(uploadDir, subDir, filename);
        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        MediaType media = contentType != null
                ? MediaType.parseMediaType(contentType)
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(media)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
