package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Essay;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface EssayRepository extends JpaRepository<Essay, Integer> {

  Optional<Essay> findByIdAndUser_Id(
      Integer id,
      Integer userId
  );

  List<Essay> findByUser_IdAndEssayGroupIsNull(Integer userId);

  List<Essay> findByEssayGroup_IdAndUser_Id(
      Integer essayGroupId,
      Integer userId
  );

  // ESグループごとに紐づくESの件数を取得する（[ESグループID, 件数]）
  @Query("""
    SELECT e.essayGroup.id, COUNT(e)
    FROM Essay e
    WHERE e.user.id = :userId
      AND e.essayGroup IS NOT NULL
    GROUP BY e.essayGroup.id
    """)
  List<Object[]> countByEssayGroup(Integer userId);

  // ESグループに所属していないESの件数を取得する
  long countByUser_IdAndEssayGroupIdNull(Integer userId);
}
