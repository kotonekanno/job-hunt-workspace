package com.kotonekanno.job_hunt_workspace.event.entity;

import com.kotonekanno.job_hunt_workspace.company.entity.Company;
import com.kotonekanno.job_hunt_workspace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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
  private String title;

  private String notes;

  @Column(name = "starts_at", nullable = false)
  private LocalDateTime startsAt;

  @Column(name = "ends_at", nullable = false)
  private LocalDateTime endsAt;

  @Column(name = "is_online", nullable = false)
  private boolean isOnline = true;

  @Column(name = "is_attending", nullable = false)
  private boolean isAttending = true;
}
