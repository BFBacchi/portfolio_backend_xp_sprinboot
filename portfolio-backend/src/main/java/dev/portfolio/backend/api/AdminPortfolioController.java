package dev.portfolio.backend.api;

import dev.portfolio.backend.api.dto.AboutMeDto;
import dev.portfolio.backend.api.dto.AboutMeUpdateRequest;
import dev.portfolio.backend.api.dto.EducationDto;
import dev.portfolio.backend.api.dto.EducationRequest;
import dev.portfolio.backend.api.dto.ProjectDto;
import dev.portfolio.backend.api.dto.ProjectRequest;
import dev.portfolio.backend.api.dto.SkillDto;
import dev.portfolio.backend.api.dto.SkillRequest;
import dev.portfolio.backend.api.dto.WorkExperienceDto;
import dev.portfolio.backend.api.dto.WorkExperienceRequest;
import dev.portfolio.backend.security.PortfolioPrincipal;
import dev.portfolio.backend.service.PortfolioContentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminPortfolioController {

  private final PortfolioContentService contentService;

  @GetMapping("/about-me")
  public AboutMeDto getAbout(@AuthenticationPrincipal PortfolioPrincipal principal) {
    return contentService.getAboutMeForAdmin(principal.id());
  }

  @PutMapping("/about-me")
  public AboutMeDto updateAbout(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @Valid @RequestBody AboutMeUpdateRequest request) {
    return contentService.upsertAboutMe(principal.id(), request);
  }

  @GetMapping("/projects")
  public List<ProjectDto> listProjects(@AuthenticationPrincipal PortfolioPrincipal principal) {
    return contentService.listProjectsForUser(principal.id());
  }

  @PostMapping("/projects")
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectDto createProject(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @Valid @RequestBody ProjectRequest request) {
    return contentService.createProject(principal.id(), request);
  }

  @PutMapping("/projects/{id}")
  public ProjectDto updateProject(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody ProjectRequest request) {
    return contentService.updateProject(principal.id(), id, request);
  }

  @DeleteMapping("/projects/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteProject(
      @AuthenticationPrincipal PortfolioPrincipal principal, @PathVariable Long id) {
    contentService.deleteProject(principal.id(), id);
  }

  @GetMapping("/education")
  public List<EducationDto> listEducation(@AuthenticationPrincipal PortfolioPrincipal principal) {
    return contentService.listEducationForUser(principal.id());
  }

  @PostMapping("/education")
  @ResponseStatus(HttpStatus.CREATED)
  public EducationDto createEducation(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @Valid @RequestBody EducationRequest request) {
    return contentService.createEducation(principal.id(), request);
  }

  @PutMapping("/education/{id}")
  public EducationDto updateEducation(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody EducationRequest request) {
    return contentService.updateEducation(principal.id(), id, request);
  }

  @DeleteMapping("/education/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteEducation(
      @AuthenticationPrincipal PortfolioPrincipal principal, @PathVariable Long id) {
    contentService.deleteEducation(principal.id(), id);
  }

  @GetMapping("/skills")
  public List<SkillDto> listSkills(@AuthenticationPrincipal PortfolioPrincipal principal) {
    return contentService.listSkillsForUser(principal.id());
  }

  @PostMapping("/skills")
  @ResponseStatus(HttpStatus.CREATED)
  public SkillDto createSkill(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @Valid @RequestBody SkillRequest request) {
    return contentService.createSkill(principal.id(), request);
  }

  @PutMapping("/skills/{id}")
  public SkillDto updateSkill(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody SkillRequest request) {
    return contentService.updateSkill(principal.id(), id, request);
  }

  @DeleteMapping("/skills/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteSkill(
      @AuthenticationPrincipal PortfolioPrincipal principal, @PathVariable Long id) {
    contentService.deleteSkill(principal.id(), id);
  }

  @GetMapping("/work-experience")
  public List<WorkExperienceDto> listWorkExperience(
      @AuthenticationPrincipal PortfolioPrincipal principal) {
    return contentService.listWorkExperienceForUser(principal.id());
  }

  @PostMapping("/work-experience")
  @ResponseStatus(HttpStatus.CREATED)
  public WorkExperienceDto createWorkExperience(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @Valid @RequestBody WorkExperienceRequest request) {
    return contentService.createWorkExperience(principal.id(), request);
  }

  @PutMapping("/work-experience/{id}")
  public WorkExperienceDto updateWorkExperience(
      @AuthenticationPrincipal PortfolioPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody WorkExperienceRequest request) {
    return contentService.updateWorkExperience(principal.id(), id, request);
  }

  @DeleteMapping("/work-experience/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteWorkExperience(
      @AuthenticationPrincipal PortfolioPrincipal principal, @PathVariable Long id) {
    contentService.deleteWorkExperience(principal.id(), id);
  }
}
