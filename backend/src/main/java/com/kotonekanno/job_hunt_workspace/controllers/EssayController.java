package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateEssayRequest;
import com.example.api.model.UpdateEssayRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/essay-groups/{essayGroupId}/essays")
public class EssayController {

  // ESを追加
  @PostMapping
  public ResponseEntity<Void> createEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId,
      @Valid @RequestBody CreateEssayRequest request
  ) {}

  // ESを部分更新
  @PatchMapping("/{essayId}")
  public ResponseEntity<Void> updateEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId,
      @PathVariable Integer essayId,
      @Valid @RequestBody UpdateEssayRequest request
  ) {}

  // ESを削除
  @DeleteMapping("/{essayId}")
  public ResponseEntity<Void> deleteEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId,
      @PathVariable Integer essayId
  ) {}
}
