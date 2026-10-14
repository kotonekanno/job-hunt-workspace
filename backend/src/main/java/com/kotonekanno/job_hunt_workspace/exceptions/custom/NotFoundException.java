package com.kotonekanno.job_hunt_workspace.exceptions.custom;

public class NotFoundException extends RuntimeException {
  public NotFoundException(String message) {
    super(message);
  }
}