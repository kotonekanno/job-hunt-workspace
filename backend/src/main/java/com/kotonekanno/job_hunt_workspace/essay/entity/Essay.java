package com.kotonekanno.job_hunt_workspace.essay.entity;

import com.kotonekanno.job_hunt_workspace.company.entity.Company;
import com.kotonekanno.job_hunt_workspace.user.entity.User;
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
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  @Column(nullable = false)
  private String question = "";

  @Column(nullable = false)
  private String answer = "";

  @ManyToOne
  @JoinColumn(name = "essay_group_id", nullable = false)
  private EssayGroup essayGroup;
}
