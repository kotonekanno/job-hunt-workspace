package com.kotonekanno.job_hunt_workspace.enums;

public enum EventCategory {
  SESSION,    // 説明会
  CHAT,       // カジュアル面談
  INTERVIEW,  // 面接
  INTERNSHIP, // インターン
  OTHER;      // その他

  public static EventCategory fromString(String status) {
    return EventCategory.valueOf(status.toUpperCase());
  }

}
