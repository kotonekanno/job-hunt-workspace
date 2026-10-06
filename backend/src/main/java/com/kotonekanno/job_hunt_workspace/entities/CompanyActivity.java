package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_activities")
@Getter
@Setter
public class CompanyActivity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  @Column(name = "occurred_at", nullable = false)
  @CreationTimestamp
  private LocalDateTime occurredAt;

  @Column(name = "by_user", nullable = false)
  private boolean byUser = true;

  @Column(nullable = false)
  private String text;
}
