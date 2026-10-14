package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "company_id")
  private Company company;

  @Column(nullable = false)
  private String title;

  private String note;

  private LocalDate deadline;

  @Column(nullable = false)
  private boolean done = false;
}
