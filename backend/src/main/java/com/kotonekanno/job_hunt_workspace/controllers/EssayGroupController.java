package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateEssayGroupRequest;
import com.example.api.model.GetEssayGroupsResponse;
import com.example.api.model.GetEssaysResponse;
import com.example.api.model.UpdateEssayGroupRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/essay-groups")
public class EssayGroupController {

  // ESグループ一覧を取得
  @GetMapping
  public ResponseEntity<GetEssayGroupsResponse> getEssayGroups(
      @AuthenticationPrincipal Integer userId
  ) {}

  // ESグループを追加
  @PostMapping
  public ResponseEntity<Void> createEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateEssayGroupRequest request
  ) {}

  // ESグループを部分更新
  @PatchMapping("{/essayGroupId}")
  public ResponseEntity<Void> updateEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId,
      @Valid @RequestBody UpdateEssayGroupRequest request
  ) {}

  // ESグループを削除
  @DeleteMapping("/essayGroupId")
  public ResponseEntity<Void> deleteEssayGroup(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId
  )

  // ES一覧を取得
  @GetMapping("/{essayGroupId}")
  public ResponseEntity<GetEssaysResponse> getEssays(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer essayGroupId
  ) {}
}
