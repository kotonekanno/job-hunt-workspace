package com.kotonekanno.job_hunt_workspace.essay.entity;

import com.kotonekanno.job_hunt_workspace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "essay_groups",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"user_id", "name"}) }
)
@Getter
@Setter
public class EssayGroup {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private String name;
}
