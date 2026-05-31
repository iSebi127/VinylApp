package com.musicapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String artist;

    private String album;

    @Column(name = "release_year")
    private Integer releaseYear;

    private String genre;

    private String audioFileName;

    private String coverFileName;

    private String themeColor;

    private String accentColor;

    private Long durationSeconds;
}