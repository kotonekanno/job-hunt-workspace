package com.kotonekanno.job_hunt_workspace.exceptions.custom;

public class AlreadyExistsException extends RuntimeException {
  public AlreadyExistsException(String message) {
    super(message);
  }
}
