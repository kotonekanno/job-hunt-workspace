package com.kotonekanno.job_hunt_workspace.dtos;

public interface DashboardCountsProjection {
  Integer getCompanies();
  Integer getUndoneTasks();
  Integer getUpcomingEvents();
  Integer getEssays();
}