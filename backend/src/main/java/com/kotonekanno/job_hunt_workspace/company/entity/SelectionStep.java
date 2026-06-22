package com.kotonekanno.job_hunt_workspace.company.entity;

import com.kotonekanno.job_hunt_workspace.company.enums.SelectionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "selection_steps")
@Getter
@Setter
public class SelectionStep {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "selection_id", nullable = false)
  private Selection selection;

  @Column(name = "step_no", nullable = false)
  private int stepNo;

  @Column(nullable = false)
  private String title;

  private String notes;

  @Column(nullable = false)
  private SelectionStatus status;
}
