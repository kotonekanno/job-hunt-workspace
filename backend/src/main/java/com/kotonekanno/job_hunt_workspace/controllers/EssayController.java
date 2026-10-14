package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateEssay201Response;
import com.example.api.model.CreateEssayRequest;
import com.example.api.model.UpdateEssayRequest;
import com.kotonekanno.job_hunt_workspace.services.EssayService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/essay-groups/{essayGroupId}/essays")
public class EssayController {

  private final EssayService service;

  public EssayController(EssayService service) {
    this.service = service;
  }

  // ESを追加
  @PostMapping
  public ResponseEntity<CreateEssay201Response> createEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable String essayGroupId,
      @Valid @RequestBody CreateEssayRequest request
  ) {
    Integer groupId = essayGroupId.equals("unclassified")
        ? null
        : Integer.valueOf(essayGroupId);

    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.createEssay(userId, groupId, request)
    );
  }

  // ESを部分更新
  @PatchMapping("/{essayId}")
  public ResponseEntity<Void> updateEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayId,
      @Valid @RequestBody UpdateEssayRequest request
  ) {
    service.updateEssay(userId, essayId, request);
    return ResponseEntity.noContent().build();
  }

  // ESを削除
  @DeleteMapping("/{essayId}")
  public ResponseEntity<Void> deleteEssay(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayId
  ) {
    service.deleteEssay(userId, essayId);
    return ResponseEntity.noContent().build();
  }
}
