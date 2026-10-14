package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Task;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {

  @EntityGraph(attributePaths = "company")
  List<Task> findByUser_IdOrderByIdAsc(Integer userId);

  Optional<Task> findByIdAndUser_Id(Integer taskId, Integer userId);

  List<Task> findByIdInAndUser_Id(Collection<Integer> taskIds, Integer userId);

  @Query("""
    SELECT t
    FROM Task t
    WHERE t.company.id = :companyId
    ORDER BY t.deadline ASC NULLS LAST, t.id ASC
    """)
  List<Task> findAllByCompanyIdOrderByDeadlineAsc(
      @Param("companyId") Integer companyId
  );
}
