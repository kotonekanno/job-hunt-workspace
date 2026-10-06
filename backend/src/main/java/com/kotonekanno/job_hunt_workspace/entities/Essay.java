package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "essays")
@Getter
@Setter
public class Essay {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "company_id")
  private Company company;

  @ManyToOne
  @JoinColumn(name = "essay_group_id", nullable = false)
  private EssayGroup essayGroup;

  @Column(nullable = false)
  private String question;

  private String answer;
}
