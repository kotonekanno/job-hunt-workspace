package com.kotonekanno.job_hunt_workspace.company.enums;

import lombok.Getter;

@Getter
public enum SelectionStatus {
  PENDING,
  PASSED,
  FAILED;

  public static SelectionStatus fromString(String status) {
    return SelectionStatus.valueOf(status.toUpperCase());
  }
}
