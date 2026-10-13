package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.example.api.model.EventCategory;
import com.kotonekanno.job_hunt_workspace.entities.Event;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.EventRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;

@Service
public class EventService {

  private final EventRepository repository;
  private final UserRepository userRepository;
  private final CompanyService companyService;

  private static final ZoneId EVENT_ZONE = ZoneId.of("Asia/Tokyo");

  public EventService(
      EventRepository repository,
      UserRepository userRepository,
      CompanyService companyService
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.companyService = companyService;
  }

  // イベント一覧を取得
  @Transactional(readOnly = true)
  public GetEventsResponse getAll(
      Integer userId,
      String month
  ) {
    YearMonth targetMonth;
    try {
      if (month.isEmpty()) {
        targetMonth = YearMonth.now(EVENT_ZONE);
      } else {
        if (!month.matches("[0-9]{4}-(0[1-9]|1[0-2])")) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month");
        }
        targetMonth = YearMonth.parse(month);
      }
    } catch (DateTimeParseException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month", e);
    }

    LocalDate startDate = targetMonth.atDay(1);
    LocalDate endDate = targetMonth.plusMonths(1).atDay(1);

    return new GetEventsResponse()
        .events(
            repository.findByUserIdAndMonth(
                userId,
                startDate,
                endDate,
                startDate.atStartOfDay(EVENT_ZONE).toOffsetDateTime(),
                endDate.atStartOfDay(EVENT_ZONE).toOffsetDateTime()
            ).stream()
                .map(event -> new com.example.api.model.Event()
                    .id(event.getId())
                    .companyName(event.getCompany() == null ? null : event.getCompany().getName())
                    .category(event.getEventCategory())
                    .title(event.getTitle())
                    .note(event.getNote())
                    .isAllDay(event.isAllDay())
                    .startDay(event.getStartDate())
                    .endDay(event.getEndDate())
                    .startTime(event.getStartTime())
                    .endTime(event.getEndTime())
                    .isOnline(event.isOnline())
                    .isAttending(event.getIsAttending())
                )
                .toList()
        );
  }

  // イベントを追加
  @Transactional
  public CreateEvent201Response create(
      Integer userId,
      CreateEventRequest request
  ) {
    Event event = new Event();
    event.setUser(userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found")));

    if (request.getCompanyId() != null) {
      event.setCompany(companyService.getOwnedCompany(request.getCompanyId(), userId));
    }

    event.setEventCategory(request.getCategory());
    event.setTitle(request.getTitle());
    event.setNote(request.getNote());
    event.setAllDay(request.getIsAllDay());
    event.setStartDate(request.getStartDay());
    event.setEndDate(request.getEndDay());
    event.setStartTime(request.getStartTime());
    event.setEndTime(request.getEndTime());
    event.setOnline(request.getIsOnline());
    event.setIsAttending(request.getIsAttending());

    normalizeAndValidate(event);

    return new CreateEvent201Response(repository.save(event).getId());
  }

  // イベントを部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer eventId,
      UpdateEventRequest request
  ) {
    Event event = repository.findByIdAndUser_Id(eventId, userId)
        .orElseThrow(() -> new NotFoundException("Event not found"));

    if (request.getCompanyId() != null) {
      event.setCompany(companyService.getOwnedCompany(request.getCompanyId(), userId));
    }

    if (request.getCategory() != null) {
      event.setEventCategory(request.getCategory());
    }

    if (request.getTitle() != null) {
      event.setTitle(request.getTitle());
    }

    if (request.getNote() != null) {
      event.setNote(request.getNote());
    }

    if (request.getIsAllDay() != null) {
      event.setAllDay(request.getIsAllDay());
    }

    if (request.getStartDay() != null) {
      event.setStartDate(request.getStartDay());
    }

    if (request.getEndDay() != null) {
      event.setEndDate(request.getEndDay());
    }

    if (request.getStartTime() != null) {
      event.setStartTime(request.getStartTime());
    }

    if (request.getEndTime() != null) {
      event.setEndTime(request.getEndTime());
    }

    if (request.getIsOnline() != null) {
      event.setOnline(request.getIsOnline());
    }

    if (request.getIsAttending() != null) {
      event.setIsAttending(request.getIsAttending());
    }

    normalizeAndValidate(event);
    repository.save(event);
  }

  // イベントを削除
  @Transactional
  public void delete(
      Integer userId,
      Integer eventId
  ) {
    Event event = repository.findByIdAndUser_Id(eventId, userId)
        .orElseThrow(() -> new NotFoundException("Event not found"));

    repository.delete(event);
  }

  // 使用しない項目をクリアし、日付・日時の整合性を確認
  private void normalizeAndValidate(Event event) {
    if (event.isAllDay()) {
      event.setStartTime(null);
      event.setEndTime(null);

      if (event.getStartDate() == null || event.getEndDate() == null
          || event.getEndDate().isBefore(event.getStartDate())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid event dates");
      }
    } else {
      event.setStartDate(null);
      event.setEndDate(null);

      if (event.getStartTime() == null || event.getEndTime() == null
          || !event.getEndTime().isAfter(event.getStartTime())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid event times");
      }
    }

    if (event.getEventCategory() == EventCategory.CHAT
        || event.getEventCategory() == EventCategory.INTERVIEW) {
      event.setIsAttending(null);
    }
  }
}
