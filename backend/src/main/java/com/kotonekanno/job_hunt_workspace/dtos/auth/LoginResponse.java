package com.kotonekanno.job_hunt_workspace.dtos.auth;

public record LoginResponse(
    String accessToken,
    String refreshToken
) {}
