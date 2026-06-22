package com.kotonekanno.job_hunt_workspace.user.repository;

import com.kotonekanno.job_hunt_workspace.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}
