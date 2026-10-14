package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateCompanyActivity201Response;
import com.example.api.model.CreateCompanyActivityRequest;
import com.example.api.model.GetCompanyActivitiesResponse;
import com.example.api.model.UpdateCompanyActivityRequest;
import com.kotonekanno.job_hunt_workspace.services.CompanyActivityService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/activities")
public class CompanyActivityController {

  private final CompanyActivityService service;

  public CompanyActivityController(CompanyActivityService companyActivityService) {
    this.service = companyActivityService;
  }

  // やりとり履歴を追加
  @PostMapping
  public ResponseEntity<CreateCompanyActivity201Response> createCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateCompanyActivityRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userId, companyId, request));
  }

  // やりとり履歴を取得
  @GetMapping
  public ResponseEntity<GetCompanyActivitiesResponse> getCompanyActivities(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @RequestParam(defaultValue = "0") Integer page
  ) {
    return ResponseEntity.ok(new GetCompanyActivitiesResponse()
        .activities(service.getPerPage(userId, companyId, page))
    );
  }

  // やりとり履歴を部分更新
  @PatchMapping("/{activityId}")
  public ResponseEntity<Void> updateCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer activityId,
      @Valid @RequestBody UpdateCompanyActivityRequest request
  ) {
    service.update(userId, activityId, request);
    return ResponseEntity.noContent().build();
  }

  // やりとり履歴を削除
  @DeleteMapping("{activityId}")
  public ResponseEntity<Void> deleteCompanyActivity(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer activityId
  ) {
    service.delete(userId, activityId);
    return ResponseEntity.noContent().build();
  }
}
