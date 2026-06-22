package com.kotonekanno.job_hunt_workspace.auth.entity;

import com.kotonekanno.job_hunt_workspace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="verification_tokens")
@Getter
@Setter
public class VerificationToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false, unique = true)
  private String token;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name="expires_at", nullable = false)
  private LocalDateTime expiresAt;
}
