package dev.portfolio.backend.api.dto;

public record AboutMeDto(
    Long id,
    String headline,
    String bio,
    String tagline,
    String lunaQuote,
    String xpFlavorNote) {

  /** Nota temática XP opcional (solo API pública enriquecida). */
  public AboutMeDto withXpNote(String note) {
    return new AboutMeDto(id, headline, bio, tagline, lunaQuote, note);
  }
}
