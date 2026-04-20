package dev.portfolio.backend.api.dto;

public record AboutMeDto(
    Long id,
    String headline,
    String bio,
    String cvText,
    String tagline,
    String lunaQuote,
    String xpFlavorNote) {

  /** Nota temática XP opcional (solo API pública enriquecida). */
  public AboutMeDto withXpNote(String note) {
    return new AboutMeDto(id, headline, bio, cvText, tagline, lunaQuote, note);
  }

  /** Oculta campos sensibles/no públicos en respuestas anónimas. */
  public AboutMeDto withoutPrivateFields() {
    return new AboutMeDto(id, headline, bio, null, tagline, lunaQuote, xpFlavorNote);
  }
}
