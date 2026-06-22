package com.kotonekanno.job_hunt_workspace.essay.repository;

import com.kotonekanno.job_hunt_workspace.essay.entity.EssayGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EssayGroupRepository extends JpaRepository<EssayGroup, Integer> {
}
