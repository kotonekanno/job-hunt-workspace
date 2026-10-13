package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Selection;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@NullMarked
@Repository
public interface SelectionRepository extends JpaRepository<Selection, Integer> {
  Optional<Selection> findById_Company_User_Id(
      Integer id,
      Integer user_id
  );

  // 指定した企業に進行中の選考が存在するかどうか
  boolean existsByCompany_IdAndIsActiveTrue(Integer companyId);

  // 指定した企業の進行中の選考を返す
  Optional<Selection> findByCompany_IdAndIsActiveTrue(Integer companyId);
}
