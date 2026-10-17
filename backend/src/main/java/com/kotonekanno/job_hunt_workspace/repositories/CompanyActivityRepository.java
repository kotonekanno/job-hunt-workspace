package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.dtos.LatestActivityProjection;
import com.kotonekanno.job_hunt_workspace.entities.CompanyActivity;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface CompanyActivityRepository extends JpaRepository<CompanyActivity, Integer> {

  // 指定したページのやりとり履歴を取得する
  Page<CompanyActivity> findByCompany_IdAndCompany_User_Id(
      Integer companyId,
      Integer userId,
      Pageable pageable
  );

  Optional<CompanyActivity> findByIdAndCompany_User_Id(
      Integer id,
      Integer userId
  );

  // 指定したすべての企業の最新のやりとり履歴を取得する
  @Query(value = """
    SELECT
        c.id AS "companyId",
        a.by_user AS "byUser",
        a.text AS "text"
    FROM companies c
    JOIN LATERAL (
        SELECT
            ca.by_user,
            ca.text
        FROM company_activities ca
        WHERE ca.company_id = c.id
        ORDER BY ca.occurred_at DESC, ca.id DESC
        LIMIT 1
    ) a ON TRUE
    WHERE c.user_id = :userId
      AND c.id IN (:companyIds)
      AND c.priority != 7
    """, nativeQuery = true)
  List<LatestActivityProjection> findLatestActivities(
      @Param("userId") Integer userId,
      @Param("companyIds") List<Integer> companyIds
  );
}
