package com.kotonekanno.job_hunt_workspace.company.entity;

import com.kotonekanno.job_hunt_workspace.user.entity.User;
import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "companies")
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
  private String name;

  @ManyToOne
  @JoinColumn(name = "industry_id", nullable = false)
  private CompanyIndustry industry;

  private int priority;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "basic_info")
  private Map<String, Object> basicInfo;

  private String text;
}
