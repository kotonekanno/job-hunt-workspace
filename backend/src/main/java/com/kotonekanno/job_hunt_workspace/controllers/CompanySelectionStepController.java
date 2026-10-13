package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.PutSelectionIsActiveRequest;
import com.example.api.model.PutSelectionStepStatusRequest;
import com.example.api.model.UpdateSelectionStepRequest;
import com.kotonekanno.job_hunt_workspace.services.CompanySelectionStepService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/selections/{selectionId}/steps/{selectionStepId}")
public class CompanySelectionStepController {

  private final CompanySelectionStepService service;

  public CompanySelectionStepController(CompanySelectionStepService service) {
    this.service = service;
  }

  // 選考ステップを部分更新
  @PatchMapping
  public ResponseEntity<Void> updateSelectionStep(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionStepId,
      @Valid @RequestBody UpdateSelectionStepRequest request
  ) {
   service.update(userId, selectionStepId, request);
   return ResponseEntity.noContent().build();
  }

  // 選考ステップを削除
  @DeleteMapping
  public ResponseEntity<Void> deleteSelectionStep(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionStepId
  ) {
    service.delete(userId, selectionStepId);
    return ResponseEntity.noContent().build();
  }

  // 選考ステップの状態を更新
  @PutMapping("/status")
  public ResponseEntity<Void> updateSelectionStepStatus(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionStepId,
      @Valid @RequestBody PutSelectionStepStatusRequest request
  ) {
    service.updateStatus(userId, selectionStepId, request);
    return ResponseEntity.noContent().build();
  }
}
