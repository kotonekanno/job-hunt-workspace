package com.kotonekanno.job_hunt_workspace.entities;

import com.kotonekanno.job_hunt_workspace.enums.SelectionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "selection_steps",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"selection_id", "position"}) }
)
@Getter
@Setter
public class SelectionStep {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "selection_id", nullable = false)
  private Selection selection;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false)
  private SelectionStatus status = SelectionStatus.NOT_STARTED;

  @Column(nullable = false)
  private String name;

  private String text;
}
