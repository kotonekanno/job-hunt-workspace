package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.dtos.DashboardCountsProjection;
import com.kotonekanno.job_hunt_workspace.entities.Event;
import com.kotonekanno.job_hunt_workspace.repositories.CountRepository;
import com.kotonekanno.job_hunt_workspace.repositories.EventRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class DashboardService {

  UserRepository userRepository;
  CountRepository countRepository;
  TaskService taskService;
  CompanyService companyService;
  EventRepository eventRepository;

  public DashboardService(
      UserRepository userRepository,
      CountRepository countRepository,
      TaskService taskService,
      CompanyService companyService,
      EventRepository eventRepository
  ) {
    this.userRepository = userRepository;
    this.countRepository = countRepository;
    this.taskService = taskService;
    this.companyService = companyService;
    this.eventRepository = eventRepository;
  }

  private static final ZoneId EVENT_ZONE = ZoneId.of("Asia/Tokyo");

  // ホーム画面の情報を取得
  @Transactional(readOnly = true)
  public GetDashboardResponse get(
      Integer userId
  ) {
    GetTasksResponse tasks = taskService.getAll(userId, false, 3);

    GetCompaniesResponse companies = companyService.getList(userId, 5);

    LocalDate today = LocalDate.now(EVENT_ZONE);

    List<Event> events = eventRepository.findUpcomingEvents(
        userId,
        today,
        today.atStartOfDay(EVENT_ZONE).toOffsetDateTime(),
        EVENT_ZONE.getId()
    );

    GetEventsResponse upcomingEvents = new GetEventsResponse()
        .events(
            events.stream()
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

    DashboardCountsProjection counts = countRepository.getDashboardCounts(
        userId,
        today,
        today.atStartOfDay(EVENT_ZONE).toOffsetDateTime()
    );

    return new GetDashboardResponse()
        .counts(new GetDashboardResponseCounts()
            .companies(counts.getCompanies())
            .undoneTasks(counts.getUndoneTasks())
            .upcomingEvents(counts.getUpcomingEvents())
            .essays(counts.getEssays())
        )
        .tasks(tasks.getTasks())
        .companies(companies.getCompanies())
        .events(upcomingEvents.getEvents());
  }
}
