package com.musicapp.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongDTO {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private Integer releaseYear;
    private String genre;
    private String audioUrl;
    private String coverUrl;
    private String themeColor;
    private String accentColor;
    private Long durationSeconds;
}
