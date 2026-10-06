package com.kotonekanno.job_hunt_workspace.entities;

import com.kotonekanno.job_hunt_workspace.enums.EventCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "company_id")
  private Company company;

  @Column(nullable = false)
  EventCategory eventCategory = EventCategory.OTHER;

  @Column(nullable = false)
  private String title;

  private String note;

  @Column(name = "is_all_day", nullable = false)
  private boolean isAllDay = false;

  @Column(name = "start_date")
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

  @Column(name = "start_time")
  private LocalDateTime startTime;

  @Column(name = "end_time")
  private LocalDateTime endTime;

  @Column(name = "is_online", nullable = false)
  private boolean isOnline = true;

  @Column(name = "is_attending", nullable = false)
  private boolean isAttending = true;
}
