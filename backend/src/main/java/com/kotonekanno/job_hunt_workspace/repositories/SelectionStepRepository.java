package com.kotonekanno.job_hunt_workspace.repositories;

import com.example.api.model.SelectionStatus;
import com.kotonekanno.job_hunt_workspace.entities.SelectionStep;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@NullMarked
@Repository
public interface SelectionStepRepository extends JpaRepository<SelectionStep, Integer> {
  Optional<SelectionStep> findById_AndSelection_Company_User_Id(
      Integer id,
      Integer userId
  );

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
