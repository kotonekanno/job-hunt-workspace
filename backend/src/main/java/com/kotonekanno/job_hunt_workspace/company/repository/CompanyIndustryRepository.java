package com.kotonekanno.job_hunt_workspace.company.repository;

import com.kotonekanno.job_hunt_workspace.company.entity.CompanyIndustry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyIndustryRepository extends JpaRepository<CompanyIndustry, Integer> {
}
