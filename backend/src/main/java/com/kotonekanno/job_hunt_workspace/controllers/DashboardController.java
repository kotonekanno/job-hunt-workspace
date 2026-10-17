package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.GetDashboardResponse;
import com.kotonekanno.job_hunt_workspace.services.DashboardService;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@NullMarked
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

  private final DashboardService service;

  public DashboardController(
      DashboardService service
  ) {
    this.service = service;
  }

  // ホーム画面の情報を取得
  @GetMapping
  public ResponseEntity<GetDashboardResponse> getDashboard(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok().body(
        service.get(userId)
    );
  }
}
