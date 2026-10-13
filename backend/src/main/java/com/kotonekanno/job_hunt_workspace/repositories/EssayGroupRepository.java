package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.EssayGroup;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface EssayGroupRepository extends JpaRepository<EssayGroup, Integer> {

  Optional<EssayGroup> findByIdAndUser_Id(
      Integer id,
      Integer userId
  );

  List<EssayGroup> findByUser_IdOrderByPositionAsc(Integer userId);

  // 指定したユーザーで最も大きいpositionの値を返す
  Optional<Integer> findMaxPositionByUser_Id(Integer userId);

  // 指定したESグループの次に小さいpositionの値を返す
  @Query("""
      SELECT MAX(eg.position)
      FROM EssayGroup eg
      WHERE eg.user.id = :userId
        AND eg.position < :position
        AND (:excludeId IS NULL OR eg.id <> : excludeId)
      """)
  Optional<Integer> findPreviousPosition(
      Integer userId,
      Integer position,
      Integer excludeId
  );
}
