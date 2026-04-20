package dev.portfolio.backend.api;

import dev.portfolio.backend.api.dto.AboutMeDto;
import dev.portfolio.backend.api.dto.EducationDto;
import dev.portfolio.backend.api.dto.ProjectDto;
import dev.portfolio.backend.api.dto.SkillDto;
import dev.portfolio.backend.api.dto.WorkExperienceDto;
import dev.portfolio.backend.service.PortfolioContentService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicPortfolioController {

  private static final String XP_FLAVOR =
      "Experiencia inspirada en Windows XP (Luna). Los datos de abajo los edita el administrador tras iniciar sesión.";

  private final PortfolioContentService contentService;

  @GetMapping("/ping")
  public Map<String, String> ping() {
    return Map.of(
        "status",
        "ok",
        "theme",
        "windows-xp-luna",
        "service",
        "portfolio-backend");
  }

  @GetMapping("/about-me")
  public AboutMeDto aboutMe() {
    return contentService.getPublicAboutMe().withoutPrivateFields().withXpNote(XP_FLAVOR);
  }

  @GetMapping("/projects")
  public List<ProjectDto> projects() {
    return contentService.listProjectsPublic();
  }

  @GetMapping("/education")
  public List<EducationDto> education() {
    return contentService.listEducationPublic();
  }

  @GetMapping("/skills")
  public List<SkillDto> skills() {
    return contentService.listSkillsPublic();
  }

  @GetMapping("/work-experience")
  public List<WorkExperienceDto> workExperience() {
    return contentService.listWorkExperiencePublic();
  }
}
