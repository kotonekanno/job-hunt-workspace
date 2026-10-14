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

  // 指定した月の予定を取得する
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

  // 指定した企業に紐づく予定のうち、今日以降の開催されるものを取得する
  @Query("""
    SELECT e
    FROM Event e
    WHERE e.company.id = :companyId
      AND (
          (e.isAllDay = true AND e.endDate >= :today)
          OR
          (e.isAllDay = false AND e.endTime >= :startOfToday)
      )
    ORDER BY
        CASE
            WHEN e.isAllDay = true THEN e.startDate
            ELSE CAST(e.startTime AS LocalDate)
        END ASC
    """)
  List<Event> findUpcomingByCompanyId(
      @Param("companyId") Integer companyId,
      @Param("today") LocalDate today,
      @Param("startOfToday") OffsetDateTime startOfToday
  );
}
