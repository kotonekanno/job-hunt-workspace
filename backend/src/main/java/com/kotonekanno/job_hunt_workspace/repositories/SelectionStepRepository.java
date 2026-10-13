package com.kotonekanno.job_hunt_workspace.repositories;

import com.example.api.model.SelectionStatus;
import com.kotonekanno.job_hunt_workspace.entities.SelectionStep;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface SelectionStepRepository extends JpaRepository<SelectionStep, Integer> {
  Optional<SelectionStep> findById_AndSelection_Company_User_Id(
      Integer id,
      Integer userId
  );

  // 指定した選考のうち先頭のステップのpositionの値を返す
  @Query("""
      SELECT MIN(ss.position)
      FROM SelectionStep ss
      WHERE ss.selection.id = :selectionId
      """)
  Optional<Integer> findMinPositionBySelectionId(Integer selectionId);

  // 指定した選考ステップの次に大きいpositionの値を返す
  @Query("""
      SELECT MIN(ss.position)
      FROM SelectionStep ss
      WHERE ss.selection.id = :selectionId
        AND ss.position > :position
        AND (:excludeId IS NULL OR ss.id <> :excludeId)
      """)
  Optional<Integer> findNextPosition(
      Integer selectionId,
      Integer position,
      Integer excludeId
  );

  // 指定した選考のステップをposition昇順で取得する
  List<SelectionStep> findBySelection_IdOrderByPositionAscIdAsc(
      Integer selectionId
  );

  // 指定した選考ステップより前のすべてのステップの状態を更新する
  @Modifying
  @Query("""
    UPDATE SelectionStep s
    SET s.status = :status
    WHERE s.selection.id = :selectionId
      AND s.position < :position
      AND s.status <> :status
    """)
  void updateStatusBefore(
      Integer selectionId,
      Integer position,
      SelectionStatus status
  );

  // 指定した選考ステップより後ろのすべてのステップの状態を更新する
  @Modifying
  @Query("""
    UPDATE SelectionStep s
    SET s.status = :status
    WHERE s.selection.id = :selectionId
      AND s.position > :position
      AND s.status <> :status
    """)
  void updateStatusAfter(
      Integer selectionId,
      Integer position,
      SelectionStatus status
  );
}
