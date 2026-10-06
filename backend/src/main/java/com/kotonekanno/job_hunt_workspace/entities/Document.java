package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "documents",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"user_id", "position"}) }
)
@Getter
@Setter
public class Document {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String text;
}
