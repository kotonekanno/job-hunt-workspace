package com.kotonekanno.job_hunt_workspace.dtos;

import com.example.api.model.SelectionStatus;

public interface SelectionWithStepProjection {
  Integer getSelectionId();
  String getSelectionTitle();
  Boolean getIsActive();

  Integer getStepId();
  Integer getStepPosition();
  String getStepName();
  SelectionStatus getStepStatus();
  String getStepNote();
}