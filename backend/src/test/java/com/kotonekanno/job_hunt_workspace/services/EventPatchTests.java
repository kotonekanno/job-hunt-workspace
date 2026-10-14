package com.kotonekanno.job_hunt_workspace.services;

import com.kotonekanno.job_hunt_workspace.controllers.EventController;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.Event;
import com.kotonekanno.job_hunt_workspace.exceptions.handler.GlobalExceptionHandler;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyRepository;
import com.kotonekanno.job_hunt_workspace.repositories.EventRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EventPatchTests {

  private EventRepository repository;
  private CompanyRepository companyRepository;
  private MockMvc mvc;
  private Event event;
  private Company originalCompany;

  @BeforeEach
  void setUp() {
    repository = mock(EventRepository.class);
    companyRepository = mock(CompanyRepository.class);
    var service = new EventService(repository, mock(UserRepository.class), companyRepository);
    mvc = MockMvcBuilders.standaloneSetup(new EventController(service))
        .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
    SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken(7, null, List.of()));

    originalCompany = new Company();
    originalCompany.setId(23);
    event = new Event();
    event.setId(12);
    event.setCompany(originalCompany);
    event.setTitle("説明会");
    event.setStartTime(OffsetDateTime.parse("2026-10-15T10:00:00+09:00"));
    event.setEndTime(OffsetDateTime.parse("2026-10-15T11:00:00+09:00"));
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(event));
  }

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void explicitNullRemovesCompanyAssociation() throws Exception {
    mvc.perform(patch("/events/12").contentType(MediaType.APPLICATION_JSON)
            .content("{\"companyId\":null}"))
        .andExpect(status().isNoContent());

    assertNull(event.getCompany());
    assertEquals("説明会", event.getTitle());
    verifyNoInteractions(companyRepository);
    verify(repository).save(event);
  }

  @Test
  void omittedCompanyPreservesAssociation() throws Exception {
    mvc.perform(patch("/events/12").contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"変更後\"}"))
        .andExpect(status().isNoContent());

    assertSame(originalCompany, event.getCompany());
    assertEquals("変更後", event.getTitle());
    verifyNoInteractions(companyRepository);
    verify(repository).save(event);
  }

  @Test
  void acceptsCompanyOwnedByCurrentUser() throws Exception {
    Company replacement = new Company();
    replacement.setId(24);
    when(companyRepository.findByIdAndUserId(24, 7)).thenReturn(Optional.of(replacement));

    mvc.perform(patch("/events/12").contentType(MediaType.APPLICATION_JSON)
            .content("{\"companyId\":24}"))
        .andExpect(status().isNoContent());

    assertSame(replacement, event.getCompany());
    verify(companyRepository).findByIdAndUserId(24, 7);
    verify(repository).save(event);
  }

  @Test
  void rejectsCompanyNotOwnedByCurrentUser() throws Exception {
    when(companyRepository.findByIdAndUserId(99, 7)).thenReturn(Optional.empty());

    mvc.perform(patch("/events/12").contentType(MediaType.APPLICATION_JSON)
            .content("{\"companyId\":99}"))
        .andExpect(status().isNotFound());

    assertSame(originalCompany, event.getCompany());
    verify(repository, never()).save(any());
  }

  @Test
  void cannotClearCompanyOnAnotherUsersEvent() throws Exception {
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.empty());

    mvc.perform(patch("/events/12").contentType(MediaType.APPLICATION_JSON)
            .content("{\"companyId\":null}"))
        .andExpect(status().isNotFound());

    assertSame(originalCompany, event.getCompany());
    verifyNoInteractions(companyRepository);
    verify(repository, never()).save(any());
  }
}
