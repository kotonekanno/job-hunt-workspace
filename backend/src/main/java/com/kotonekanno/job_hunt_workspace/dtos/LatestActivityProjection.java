package com.kotonekanno.job_hunt_workspace.dtos;

public interface LatestActivityProjection {
  Integer getCompanyId();
  Boolean getByUser();
  String getText();
}