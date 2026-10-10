package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/selections")
public class CompanySelectionController {

  // 選考を追加
  @PostMapping
  public ResponseEntity<CreateSelectionResponse> createSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateSelectionRequest request
  ) {}

  // 選考タイトルを更新
  @PatchMapping("/{selectionId}")
  public ResponseEntity<Void> updateSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody PatchSelectionRequest request
  ) {}

  // 選考を削除
  @DeleteMapping("/{selectionId}")
  public ResponseEntity<Void> deleteSelection(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer selectionId
  ) {}

  // 選考ステップを追加
  @PostMapping("/{selectionId}")
  public ResponseEntity<CreateSelectionStepResponse> createSelectionStep(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody CreateSelectionStepRequest request
  ) {}

  // 進行中の選考を更新
  @PutMapping("/{selectionId}/is-active")
  public ResponseEntity<Void> updateSelectionIsActive(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer selectionId,
      @Valid @RequestBody PutSelectionIsActiveRequest request
  ) {}
}
