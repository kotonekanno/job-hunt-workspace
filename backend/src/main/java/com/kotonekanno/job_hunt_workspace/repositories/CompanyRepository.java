package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Company;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
  Optional<Company> findByIdAndUserId(Integer companyId, Integer userId);

  // 指定したユーザーの企業を志望度昇順、志望度内ではposition昇順で返す
  List<Company> findAllByUserIdOrderByPriorityAscPositionAsc(Integer userId);

  // 指定した志望度内で最大のpositionを返す
  @Query("""
    SELECT MAX(c.position)
    FROM Company c
    WHERE c.user.id = :userId
      AND c.priority = :priority
    """)
  Optional<Integer> findMaxPositionByUserIdAndPriority(
      Integer userId,
      Integer priority
  );

  // 指定した企業と同じ志望度内で次に小さいpositionの値を返す
  @Query("""
      SELECT MAX(c.position)
      FROM Company c
      WHERE c.user.id = :userId
        AND c.priority = :priority
        AND c.position < :position
        AND (:excludeId IS NULL OR c.id <> :excludeId)
      """)
  Optional<Integer> findPreviousPosition(
      Integer userId,
      Integer priority,
      Integer position,
      Integer excludeId
  );

  List<Company> findByUser_IdAndPriorityOrderByPositionAsc(
      Integer userId,
      Integer priority
  );
}
