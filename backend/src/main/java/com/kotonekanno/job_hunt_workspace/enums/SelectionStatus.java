package com.kotonekanno.job_hunt_workspace.enums;

import lombok.Getter;

@Getter
public enum SelectionStatus {
  NOT_STARTED, // 未受験
  PENDING,     // 結果待ち
  PASSED,      // 合格
  FAILED;      // 不合格

  public static SelectionStatus fromString(String status) {
    return SelectionStatus.valueOf(status.toUpperCase());
  }
}
