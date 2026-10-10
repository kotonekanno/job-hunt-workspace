package com.kotonekanno.job_hunt_workspace.exceptions.custom;

public class AccessDeniedException extends RuntimeException {
  public AccessDeniedException(String message) {
    super(message);
  }
}
