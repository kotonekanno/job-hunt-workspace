package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.services.SelectionService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/selections")
public class CompanySelectionController {

  private final SelectionService service;

  public CompanySelectionController(SelectionService service) {
    this.service = service;
  }

  // 選考を追加
  @PostMapping
  public ResponseEntity<CreateSelectionResponse> createSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateSelectionRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.createSelection(userId, companyId, request)
    );
  }

  // 選考を部分更新
  @PatchMapping("/{selectionId}")
  public ResponseEntity<Void> updateSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody PatchSelectionRequest request
  ) {
    service.updateSelection(userId, selectionId, request);
    return ResponseEntity.noContent().build();
  }

  // 選考を削除
  @DeleteMapping("/{selectionId}")
  public ResponseEntity<Void> deleteSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionId
  ) {
    service.deleteSelection(userId, selectionId);
    return ResponseEntity.noContent().build();
  }

  // 選考ステップを追加
  @PostMapping("/{selectionId}")
  public ResponseEntity<CreateSelectionStep201Response> createSelectionStep(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody CreateSelectionStepRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.createSelectionStep(userId, selectionId, request)
    );
  }

  // 進行中の選考を更新
  @PutMapping("/{selectionId}/is-active")
  public ResponseEntity<Void> updateSelectionIsActive(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody PutSelectionIsActiveRequest request
  ) {
    service.updateActiveSelection(userId, selectionId, request);
    return ResponseEntity.noContent().build();
  }
}
