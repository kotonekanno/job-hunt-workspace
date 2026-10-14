package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "essay_groups",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "name"}),
        @UniqueConstraint(columnNames = {"user_id", "position"}),
    }
)
@Getter
@Setter
public class EssayGroup {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false)
  private String name;
}
