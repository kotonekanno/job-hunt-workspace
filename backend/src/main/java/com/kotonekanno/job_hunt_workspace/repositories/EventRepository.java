package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Event;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

  Optional<Event> findByIdAndUser_Id(Integer eventId, Integer userId);

  @Query("""
      SELECT e FROM Event e
      LEFT JOIN FETCH e.company
      WHERE e.user.id = :userId
        AND (
          (e.isAllDay = true AND e.startDate < :endDate AND e.endDate >= :startDate)
          OR
          (e.isAllDay = false AND e.startTime < :endTime AND e.endTime > :startTime)
        )
      ORDER BY e.startDate ASC, e.startTime ASC, e.id ASC
      """)
  List<Event> findByUserIdAndMonth(
      @Param("userId") Integer userId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate,
      @Param("startTime") OffsetDateTime startTime,
      @Param("endTime") OffsetDateTime endTime
  );
}
