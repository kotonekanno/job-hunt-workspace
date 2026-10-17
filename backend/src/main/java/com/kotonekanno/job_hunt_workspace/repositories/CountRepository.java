package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.dtos.DashboardCountsProjection;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@NullMarked
@Repository
public interface CountRepository extends JpaRepository<Company, Integer> {
  @Query(value = """
    SELECT
        (SELECT COUNT(*)
         FROM companies
         WHERE user_id = :userId) AS "companies",

        (SELECT COUNT(*)
         FROM tasks
         WHERE user_id = :userId
           AND done = FALSE) AS "undoneTasks",

        (SELECT COUNT(*)
         FROM events
         WHERE user_id = :userId
           AND (
               (is_all_day = TRUE AND end_date >= :today)
               OR
               (is_all_day = FALSE AND start_time >= :startOfToday)
           )) AS "upcomingEvents",

        (SELECT COUNT(*)
         FROM essays
         WHERE user_id = :userId) AS "essays"
    """, nativeQuery = true)
  DashboardCountsProjection getDashboardCounts(
      @Param("userId") Integer userId,
      @Param("today") LocalDate today,
      @Param("startOfToday") OffsetDateTime startOfToday
  );
}
