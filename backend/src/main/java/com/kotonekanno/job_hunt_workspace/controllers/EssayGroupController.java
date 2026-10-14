package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.services.EssayService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/essay-groups")
public class EssayGroupController {

  private final EssayService service;

  public EssayGroupController(EssayService service) {
    this.service = service;
  }

  // ESグループ一覧を取得
  @GetMapping
  public ResponseEntity<GetEssayGroupsResponse> getEssayGroups(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok(service.getEssayGroups(userId));
  }

  // ESグループを追加
  @PostMapping
  public ResponseEntity<CreateEssayGroup201Response> createEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateEssayGroupRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.createEssayGroup(userId, request)
    );
  }

  // ESグループを部分更新
  @PatchMapping("/{essayGroupId}")
  public ResponseEntity<Void> updateEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @PathVariable String essayGroupId,
      @Valid @RequestBody UpdateEssayGroupRequest request
  ) {
    Integer groupId = Integer.parseInt(essayGroupId);
    service.updateEssayGroup(userId, groupId, request);
    return ResponseEntity.noContent().build();
  }

  // ESグループを削除
  @DeleteMapping("/{essayGroupId}")
  public ResponseEntity<Void> deleteEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @PathVariable String essayGroupId
  ) {
    Integer groupId = Integer.parseInt(essayGroupId);
    service.deleteEssayGroup(userId, groupId);
    return ResponseEntity.noContent().build();
  }

  // ES一覧を取得
  @GetMapping("/{essayGroupId}")
  public ResponseEntity<GetEssaysResponse> getEssays(
      @AuthenticationPrincipal Integer userId,
      @PathVariable String essayGroupId
  ) {
    Integer groupId = essayGroupId.equals("unclassified")
        ? null
        : Integer.valueOf(essayGroupId);

    return ResponseEntity.ok(service.getEssays(userId, groupId));
  }

  // ESグループの並び順を更新
  @PutMapping("/{essayGroupId}")
  public ResponseEntity<Void> reorderEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @PathVariable String essayGroupId,
      @Valid @RequestBody ReorderEssayGroupRequest request
  ) {
    Integer groupId = Integer.parseInt(essayGroupId);
    service.reorderEssayGroups(userId, groupId, request);
    return ResponseEntity.noContent().build();
  }
}
