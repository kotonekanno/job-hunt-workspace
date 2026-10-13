package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
  Optional<Company> findByIdAndUserId(Integer companyId, Integer userId);
}
