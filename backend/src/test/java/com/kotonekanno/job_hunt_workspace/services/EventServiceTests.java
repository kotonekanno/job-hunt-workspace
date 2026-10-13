package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.CreateEventRequest;
import com.example.api.model.UpdateEventRequest;
import com.kotonekanno.job_hunt_workspace.entities.Event;
import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.enums.EventCategory;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.EventRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EventServiceTests {

  private EventRepository repository;
  private UserRepository userRepository;
  private CompanyService companyService;
  private EventService service;

  @BeforeEach
  void setUp() {
    repository = mock(EventRepository.class);
    userRepository = mock(UserRepository.class);
    companyService = mock(CompanyService.class);
    service = new EventService(repository, userRepository, companyService);
  }

  @Test
  void getAllUsesJapaneseMonthBoundariesAndMapsEventsWithoutCompany() {
    Event event = timedEvent();
    when(repository.findByUserIdAndMonth(
        7, LocalDate.parse("2026-10-01"), LocalDate.parse("2026-11-01"),
        OffsetDateTime.parse("2026-10-01T00:00:00+09:00"),
        OffsetDateTime.parse("2026-11-01T00:00:00+09:00")
    )).thenReturn(List.of(event));

    var result = service.getAll(7, "2026-10").getEvents();

    assertEquals(1, result.size());
    assertNull(result.getFirst().getCompanyName());
    assertEquals(event.getStartTime(), result.getFirst().getStartTime());
    assertEquals(com.example.api.model.EventCategory.OTHER, result.getFirst().getCategory());
  }

  @Test
  void invalidMonthReturnsBadRequest() {
    var exception = assertThrows(ResponseStatusException.class,
        () -> service.getAll(7, "2026-13"));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verifyNoInteractions(repository);
  }

  @Test
  void createInterviewReturnsIdAndClearsAttendance() {
    when(userRepository.findById(7)).thenReturn(Optional.of(new User()));
    when(repository.save(any(Event.class))).thenAnswer(invocation -> {
      Event event = invocation.getArgument(0);
      assertNull(event.getIsAttending());
      assertNull(event.getStartDate());
      event.setId(12);
      return event;
    });

    var request = new CreateEventRequest()
        .category(com.example.api.model.EventCategory.INTERVIEW)
        .title("面接").isAllDay(false).isOnline(true)
        .startTime(OffsetDateTime.parse("2026-10-15T10:00:00+09:00"))
        .endTime(OffsetDateTime.parse("2026-10-15T11:00:00+09:00"));

    assertEquals(12, service.create(7, request).getEventId());
  }

  @Test
  void updateToAllDayClearsTimesAndPreservesOmittedFields() {
    Event event = timedEvent();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(event));

    service.update(7, 12, new UpdateEventRequest()
        .isAllDay(true).startDay(LocalDate.parse("2026-10-15"))
        .endDay(LocalDate.parse("2026-10-15")).isOnline(false).isAttending(false));

    assertTrue(event.isAllDay());
    assertNull(event.getStartTime());
    assertNull(event.getEndTime());
    assertEquals("説明会", event.getTitle());
    assertFalse(event.isOnline());
    assertEquals(false, event.getIsAttending());
    verify(repository).save(event);
  }

  @Test
  void updateRejectsEndAtStart() {
    Event event = timedEvent();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(event));

    var exception = assertThrows(ResponseStatusException.class,
        () -> service.update(7, 12, new UpdateEventRequest().endTime(event.getStartTime())));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(repository, never()).save(any());
  }

  @Test
  void updateRejectsCompanyOwnedByAnotherUser() {
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(timedEvent()));
    when(companyService.getOwnedCompany(99, 7)).thenThrow(new NotFoundException("Company not found"));

    assertThrows(NotFoundException.class,
        () -> service.update(7, 12, new UpdateEventRequest().companyId(99)));
    verify(repository, never()).save(any());
  }

  @Test
  void updateAndDeleteRejectEventsNotOwnedByUser() {
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class,
        () -> service.update(7, 12, new UpdateEventRequest().title("変更")));
    assertThrows(NotFoundException.class, () -> service.delete(7, 12));
    verify(repository, never()).save(any());
    verify(repository, never()).delete(any());
  }

  @Test
  void deleteRemovesOwnedEvent() {
    Event event = timedEvent();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(event));

    service.delete(7, 12);

    verify(repository).delete(event);
  }

  private Event timedEvent() {
    Event event = new Event();
    event.setId(12);
    event.setTitle("説明会");
    event.setEventCategory(EventCategory.OTHER);
    event.setStartTime(OffsetDateTime.parse("2026-10-15T10:00:00+09:00"));
    event.setEndTime(OffsetDateTime.parse("2026-10-15T11:00:00+09:00"));
    return event;
  }
}
