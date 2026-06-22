package com.kotonekanno.job_hunt_workspace.task.entity;

import com.kotonekanno.job_hunt_workspace.company.entity.Company;
import com.kotonekanno.job_hunt_workspace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class Task {
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

  private String details;

  private LocalDateTime deadline;

  @Column(nullable = false)
  private boolean done = false;
}
