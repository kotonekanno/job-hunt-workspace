package com.kotonekanno.job_hunt_workspace.exceptions.custom;

public class ExternalApiException extends RuntimeException {
  public ExternalApiException(String message, Throwable cause) {
    super(message, cause);
  }
}