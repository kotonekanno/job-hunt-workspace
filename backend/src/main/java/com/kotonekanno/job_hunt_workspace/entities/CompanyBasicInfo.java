package com.kotonekanno.job_hunt_workspace.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "company_basic_infos",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"company_id", "position"}) }
)
@Getter
@Setter
public class CompanyBasicInfo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false)
  private String title;

  private String text;
}
