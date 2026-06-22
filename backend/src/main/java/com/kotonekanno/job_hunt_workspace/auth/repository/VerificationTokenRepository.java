package com.kotonekanno.job_hunt_workspace.auth.repository;

import com.kotonekanno.job_hunt_workspace.auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Integer> {
}
