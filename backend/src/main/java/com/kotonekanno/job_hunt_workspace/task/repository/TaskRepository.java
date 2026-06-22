package com.kotonekanno.job_hunt_workspace.task.repository;

import com.kotonekanno.job_hunt_workspace.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
}
