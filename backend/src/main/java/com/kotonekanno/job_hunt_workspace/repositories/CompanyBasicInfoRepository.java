package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.CompanyBasicInfo;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@NullMarked
@Repository
public interface CompanyBasicInfoRepository extends JpaRepository<CompanyBasicInfo, Integer> {
  Optional<CompanyBasicInfo> findByIdAndCompany_User_Id(
      Integer basicInfoId,
      Integer userId
  );

  @Query("""
    SELECT MAX(b.position)
    FROM CompanyBasicInfo b
    WHERE b.company.id = :companyId
    """)
  Optional<Integer> findMaxPositionByCompanyId(Integer companyId);
}
