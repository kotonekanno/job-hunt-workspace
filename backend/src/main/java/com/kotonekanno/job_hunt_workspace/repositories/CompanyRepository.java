package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Company;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@NullMarked
@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
  Optional<Company> findByIdAndUserId(Integer companyId, Integer userId);
}
