package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.entities.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Integer> {
  Optional<VerificationToken> findByToken(String token);

  @Modifying
  @Transactional
  @Query("""
      DELETE FROM VerificationToken vt
      WHERE vt.user = :user
      """)
  void deleteByUser(User user);
}
