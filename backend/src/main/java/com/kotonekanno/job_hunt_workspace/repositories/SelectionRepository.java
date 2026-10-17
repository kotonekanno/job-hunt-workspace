package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.dtos.SelectionWithStepProjection;
import com.kotonekanno.job_hunt_workspace.entities.Selection;
import com.kotonekanno.job_hunt_workspace.dtos.CurrentSelectionProjection;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface SelectionRepository extends JpaRepository<Selection, Integer> {
  Optional<Selection> findByIdAndCompany_User_Id(
      Integer id,
      Integer user_id
  );

  // 指定した企業に紐づく選考をすべて削除する
  void deleteAllByCompany_Id(Integer companyId);

  // 指定した企業に進行中の選考が存在するかどうか
  boolean existsByCompany_IdAndIsActiveTrue(Integer companyId);

  // 指定した企業の進行中の選考を返す
  Optional<Selection> findByCompany_IdAndIsActiveTrue(Integer companyId);

  // 指定した企業の選考と選考ステップをすべて取得する
  @Query(value = """
    SELECT
        s.id AS "selectionId",
        s.title AS "selectionTitle",
        s.is_active AS "isActive",
        st.id AS "stepId",
        st.position AS "stepPosition",
        st.name AS "stepName",
        st.status AS "stepStatus",
        st.note AS "stepNote"
    FROM selections s
    LEFT JOIN selection_steps st
        ON st.selection_id = s.id
    JOIN companies c
        ON c.id = s.company_id
    WHERE s.company_id = :companyId
      AND c.user_id = :userId
    ORDER BY s.id ASC, st.position ASC
    """, nativeQuery = true)
  List<SelectionWithStepProjection> findAllWithSteps(
      @Param("userId") Integer userId,
      @Param("companyId") Integer companyId
  );

  // 指定したすべての企業の進行中の選考情報を取得する
  @Query(value = """
    SELECT
        c.id AS "companyId",
        s.title AS "title",
        st.id AS "stepId",
        st.name AS "stepName",
        st.status AS "stepStatus"
    FROM companies c
    JOIN selections s
        ON s.company_id = c.id
        AND s.is_active = TRUE
    LEFT JOIN LATERAL (
        SELECT
            ss.id,
            ss.name,
            ss.status
        FROM selection_steps ss
        WHERE ss.selection_id = s.id
        ORDER BY
            CASE WHEN ss.status != 'PASSED' THEN 0 ELSE 1 END ASC,
            CASE WHEN ss.status != 'PASSED' THEN ss.position END ASC,
            CASE WHEN ss.status = 'PASSED' THEN ss.position END DESC
        LIMIT 1
    ) st ON TRUE
    WHERE c.user_id = :userId
      AND c.id IN (:companyIds)
      AND c.priority != 7
    """, nativeQuery = true)
  List<CurrentSelectionProjection> findCurrentSelections(
      @Param("userId") Integer userId,
      @Param("companyIds") List<Integer> companyIds
  );
}