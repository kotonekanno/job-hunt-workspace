package com.kotonekanno.job_hunt_workspace.dtos;

import com.example.api.model.SelectionStatus;

public interface CurrentSelectionProjection {
  Integer getCompanyId();
  String getTitle();
  Integer getStepId();
  String getStepName();
  SelectionStatus getStepStatus();
}