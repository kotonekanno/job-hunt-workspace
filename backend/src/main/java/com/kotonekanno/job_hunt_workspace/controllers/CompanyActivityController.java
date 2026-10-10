package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateCompanyActivityRequest;
import com.example.api.model.UpdateCompanyActivityRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/activities")
public class CompanyActivityController {

  // やりとり履歴を追加
  @PostMapping
  public ResponseEntity<Void> createCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateCompanyActivityRequest request
  ) {}

  // やりとり履歴を部分更新
  @PatchMapping("/{activityId}")
  public ResponseEntity<Void> updateCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer activityId,
      @Valid @RequestBody UpdateCompanyActivityRequest request
  ) {}

  // やりとり履歴を削除
  @DeleteMapping("{activityId}")
  public ResponseEntity<Void> deleteCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer activityId
  ) {}
}
