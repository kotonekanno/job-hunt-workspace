package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.CompanyActivity;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.util.Optional;

@NullMarked
@Repository
public interface CompanyActivityRepository extends JpaRepository<CompanyActivity, Integer> {
  Page<CompanyActivity> findByCompanyId(Integer companyId, Pageable pageable);

  Optional<CompanyActivity> findByIdAndCompany_User_Id(
      Integer id,
      Integer userId
  );
}
