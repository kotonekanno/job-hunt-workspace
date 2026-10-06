package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "companies",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"user_id", "priority", "position"}) }
)
@Getter
@Setter
public class Company {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private int priority = 0;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false)
  private String name;

  @Column(name = "show_basic_info_widget", nullable = false)
  private boolean showBasicInfoWidget = false;

  @Column(name = "show_selection_widget", nullable = false)
  private boolean showSelectionWidget = false;

  private String document;
}
