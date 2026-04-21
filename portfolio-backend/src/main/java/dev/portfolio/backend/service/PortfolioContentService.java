package dev.portfolio.backend.service;

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
import dev.portfolio.backend.domain.AboutMe;
import dev.portfolio.backend.domain.AboutMeRepository;
import dev.portfolio.backend.domain.Education;
import dev.portfolio.backend.domain.EducationRepository;
import dev.portfolio.backend.domain.PortfolioUser;
import dev.portfolio.backend.domain.PortfolioUserRepository;
import dev.portfolio.backend.domain.Project;
import dev.portfolio.backend.domain.ProjectRepository;
import dev.portfolio.backend.domain.Skill;
import dev.portfolio.backend.domain.SkillRepository;
import dev.portfolio.backend.domain.WorkExperience;
import dev.portfolio.backend.domain.WorkExperienceRepository;
import dev.portfolio.backend.error.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioContentService {

  private final PortfolioUserRepository userRepository;
  private final AboutMeRepository aboutMeRepository;
  private final ProjectRepository projectRepository;
  private final EducationRepository educationRepository;
  private final SkillRepository skillRepository;
  private final WorkExperienceRepository workExperienceRepository;

  @Transactional(readOnly = true)
  public Long getOwnerUserId() {
    return userRepository
        .findFirstByOrderByIdAsc()
        .map(PortfolioUser::getId)
        .orElseThrow(
            () ->
                new ResourceNotFoundException(
                    "No hay usuario de portfolio. Ejecute la aplicación para crear el administrador inicial."));
  }

  @Transactional(readOnly = true)
  public AboutMeDto getPublicAboutMe() {
    Long uid = getOwnerUserId();
    return aboutMeRepository
        .findByUserId(uid)
        .map(this::toAboutDto)
        .orElseGet(
            () ->
                new AboutMeDto(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null));
  }

  @Transactional(readOnly = true)
  public AboutMeDto getAboutMeForAdmin(Long userId) {
    ensureUserExists(userId);
    return aboutMeRepository.findByUserId(userId).map(this::toAboutDto).orElse(toAboutDto(null));
  }

  private AboutMeDto toAboutDto(AboutMe a) {
    if (a == null) {
      return new AboutMeDto(null, null, null, null, null, null, null);
    }
    return new AboutMeDto(
        a.getId(),
        a.getHeadline(),
        a.getBio(),
        a.getCvText(),
        a.getTagline(),
        a.getLunaQuote(),
        null);
  }

  @Transactional
  public AboutMeDto upsertAboutMe(Long userId, AboutMeUpdateRequest req) {
    PortfolioUser user =
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    AboutMe am =
        aboutMeRepository
            .findByUserId(userId)
            .orElseGet(
                () -> {
                  AboutMe n = new AboutMe();
                  n.setUser(user);
                  return n;
                });
    if (req.headline() != null) {
      am.setHeadline(req.headline());
    }
    if (req.bio() != null) {
      am.setBio(req.bio());
    }
    if (req.cvText() != null) {
      am.setCvText(req.cvText());
    }
    if (req.tagline() != null) {
      am.setTagline(req.tagline());
    }
    if (req.lunaQuote() != null) {
      am.setLunaQuote(req.lunaQuote());
    }
    am.setUpdatedAt(Instant.now());
    return toAboutDto(aboutMeRepository.save(am));
  }

  @Transactional(readOnly = true)
  public List<ProjectDto> listProjectsPublic() {
    return listProjectsForUser(getOwnerUserId());
  }

  @Transactional(readOnly = true)
  public List<ProjectDto> listProjectsForUser(Long userId) {
    return projectRepository.findByUserIdOrderBySortOrderAscIdAsc(userId).stream()
        .map(this::toProjectDto)
        .toList();
  }

  @Transactional
  public ProjectDto createProject(Long userId, ProjectRequest req) {
    PortfolioUser user =
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    Project p = new Project();
    p.setUser(user);
    applyProject(p, req);
    p.setCreatedAt(Instant.now());
    p.setUpdatedAt(Instant.now());
    return toProjectDto(projectRepository.save(p));
  }

  @Transactional
  public ProjectDto updateProject(Long userId, Long projectId, ProjectRequest req) {
    Project p = loadProject(userId, projectId);
    applyProject(p, req);
    p.setUpdatedAt(Instant.now());
    return toProjectDto(projectRepository.save(p));
  }

  @Transactional
  public void deleteProject(Long userId, Long projectId) {
    Project p = loadProject(userId, projectId);
    projectRepository.delete(p);
  }

  private Project loadProject(Long userId, Long projectId) {
    if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
      throw new ResourceNotFoundException("Proyecto no encontrado.");
    }
    return projectRepository.findById(projectId).orElseThrow();
  }

  private void applyProject(Project p, ProjectRequest req) {
    p.setTitle(req.title());
    p.setDescription(req.description());
    p.setProjectUrl(req.projectUrl());
    p.setImageUrl1(req.imageUrl1());
    p.setImageUrl2(req.imageUrl2());
    p.setTechnologies(req.technologies());
    p.setSortOrder(req.sortOrder());
  }

  private ProjectDto toProjectDto(Project p) {
    return new ProjectDto(
        p.getId(),
        p.getTitle(),
        p.getDescription(),
        p.getProjectUrl(),
        p.getImageUrl1(),
        p.getImageUrl2(),
        p.getTechnologies(),
        p.getSortOrder());
  }

  @Transactional(readOnly = true)
  public List<EducationDto> listEducationPublic() {
    return listEducationForUser(getOwnerUserId());
  }

  @Transactional(readOnly = true)
  public List<EducationDto> listEducationForUser(Long userId) {
    return educationRepository.findByUserIdOrderBySortOrderAscIdAsc(userId).stream()
        .map(this::toEducationDto)
        .toList();
  }

  @Transactional
  public EducationDto createEducation(Long userId, EducationRequest req) {
    PortfolioUser user =
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    Education e = new Education();
    e.setUser(user);
    applyEducation(e, req);
    return toEducationDto(educationRepository.save(e));
  }

  @Transactional
  public EducationDto updateEducation(Long userId, Long id, EducationRequest req) {
    Education e = loadEducation(userId, id);
    applyEducation(e, req);
    return toEducationDto(educationRepository.save(e));
  }

  @Transactional
  public void deleteEducation(Long userId, Long id) {
    Education e = loadEducation(userId, id);
    educationRepository.delete(e);
  }

  private Education loadEducation(Long userId, Long id) {
    if (!educationRepository.existsByIdAndUserId(id, userId)) {
      throw new ResourceNotFoundException("Educación no encontrada.");
    }
    return educationRepository.findById(id).orElseThrow();
  }

  private void applyEducation(Education e, EducationRequest req) {
    e.setInstitution(req.institution());
    e.setDegree(req.degree());
    e.setPeriodLabel(req.periodLabel());
    e.setDescription(req.description());
    e.setCertificateUrl(req.certificateUrl());
    e.setSortOrder(req.sortOrder());
  }

  private EducationDto toEducationDto(Education e) {
    return new EducationDto(
        e.getId(),
        e.getInstitution(),
        e.getDegree(),
        e.getPeriodLabel(),
        e.getDescription(),
        e.getCertificateUrl(),
        e.getSortOrder());
  }

  @Transactional(readOnly = true)
  public List<SkillDto> listSkillsPublic() {
    return listSkillsForUser(getOwnerUserId());
  }

  @Transactional(readOnly = true)
  public List<SkillDto> listSkillsForUser(Long userId) {
    return skillRepository.findByUserIdOrderBySortOrderAscIdAsc(userId).stream()
        .map(this::toSkillDto)
        .toList();
  }

  @Transactional
  public SkillDto createSkill(Long userId, SkillRequest req) {
    PortfolioUser user =
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    Skill s = new Skill();
    s.setUser(user);
    applySkill(s, req);
    return toSkillDto(skillRepository.save(s));
  }

  @Transactional
  public SkillDto updateSkill(Long userId, Long id, SkillRequest req) {
    Skill s = loadSkill(userId, id);
    applySkill(s, req);
    return toSkillDto(skillRepository.save(s));
  }

  @Transactional
  public void deleteSkill(Long userId, Long id) {
    Skill s = loadSkill(userId, id);
    skillRepository.delete(s);
  }

  private Skill loadSkill(Long userId, Long id) {
    if (!skillRepository.existsByIdAndUserId(id, userId)) {
      throw new ResourceNotFoundException("Skill no encontrada.");
    }
    return skillRepository.findById(id).orElseThrow();
  }

  private void applySkill(Skill s, SkillRequest req) {
    s.setName(req.name());
    s.setCategory(req.category());
    s.setNotes(req.notes());
    s.setSortOrder(req.sortOrder());
  }

  private SkillDto toSkillDto(Skill s) {
    return new SkillDto(s.getId(), s.getName(), s.getCategory(), s.getNotes(), s.getSortOrder());
  }

  @Transactional(readOnly = true)
  public List<WorkExperienceDto> listWorkExperiencePublic() {
    return listWorkExperienceForUser(getOwnerUserId());
  }

  @Transactional(readOnly = true)
  public List<WorkExperienceDto> listWorkExperienceForUser(Long userId) {
    return workExperienceRepository.findByUserIdOrderBySortOrderAscIdAsc(userId).stream()
        .map(this::toWorkExperienceDto)
        .toList();
  }

  @Transactional
  public WorkExperienceDto createWorkExperience(Long userId, WorkExperienceRequest req) {
    PortfolioUser user =
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    WorkExperience w = new WorkExperience();
    w.setUser(user);
    applyWorkExperience(w, req);
    return toWorkExperienceDto(workExperienceRepository.save(w));
  }

  @Transactional
  public WorkExperienceDto updateWorkExperience(Long userId, Long id, WorkExperienceRequest req) {
    WorkExperience w = loadWorkExperience(userId, id);
    applyWorkExperience(w, req);
    return toWorkExperienceDto(workExperienceRepository.save(w));
  }

  @Transactional
  public void deleteWorkExperience(Long userId, Long id) {
    WorkExperience w = loadWorkExperience(userId, id);
    workExperienceRepository.delete(w);
  }

  private WorkExperience loadWorkExperience(Long userId, Long id) {
    if (!workExperienceRepository.existsByIdAndUserId(id, userId)) {
      throw new ResourceNotFoundException("Experiencia laboral no encontrada.");
    }
    return workExperienceRepository.findById(id).orElseThrow();
  }

  private void applyWorkExperience(WorkExperience w, WorkExperienceRequest req) {
    w.setCompany(req.company());
    w.setRoleTitle(req.roleTitle());
    w.setPeriodLabel(req.periodLabel());
    w.setDescription(req.description());
    w.setSortOrder(req.sortOrder());
  }

  private WorkExperienceDto toWorkExperienceDto(WorkExperience w) {
    return new WorkExperienceDto(
        w.getId(),
        w.getCompany(),
        w.getRoleTitle(),
        w.getPeriodLabel(),
        w.getDescription(),
        w.getSortOrder());
  }

  private void ensureUserExists(Long userId) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("Usuario no encontrado.");
    }
  }
}
