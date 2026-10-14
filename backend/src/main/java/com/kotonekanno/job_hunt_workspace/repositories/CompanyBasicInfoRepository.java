package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.CompanyBasicInfo;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
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

  List<CompanyBasicInfo> findByCompany_User_IdOrderByPositionAsc(Integer companyId);

  // 指定した企業に紐づく基本情報をすべて削除する
  void deleteAllByCompany_Id(Integer companyId);
}
