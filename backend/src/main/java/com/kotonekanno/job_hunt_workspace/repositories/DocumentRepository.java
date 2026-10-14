package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Document;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

  List<Document> findByUser_IdOrderByPositionAsc(Integer userId);

  Optional<Document> findByIdAndUser_Id(Integer documentId, Integer userId);

  // 指定したユーザーで最大のpositionの値を返す
  Optional<Integer> findMaxPositionByUser_Id(Integer userId);

  // 指定したドキュメントの次に小さいpositionの値を返す
  @Query("""
      SELECt MAX(d.position)
      FROM Document d
      WHERE d.user.id = :userId
        AND d.position < :position
        AND (:excludeId IS NULL OR d.id <> : excludeId)
      """)
  Optional<Integer> findPreviousPosition(
      Integer userId,
      Integer position,
      Integer excludeId
  );
}
