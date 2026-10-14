package com.kotonekanno.job_hunt_workspace.exceptions.custom;

public class InvalidCredentialsException extends RuntimeException {
  public InvalidCredentialsException(String message) {
    super(message);
  }
}