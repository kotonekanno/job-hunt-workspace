package com.kotonekanno.job_hunt_workspace.company.repository;

import com.kotonekanno.job_hunt_workspace.company.entity.CompanyUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SelectionStepRepository extends JpaRepository<CompanyUrl, Integer> {
}
