package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.BulkDeleteTasksRequest;
import com.example.api.model.CreateTaskRequest;
import com.example.api.model.GetTasksResponse;
import com.example.api.model.UpdateTaskRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/tasks")
public class TaskController {

  // タスク一覧を取得
  @GetMapping
  public ResponseEntity<GetTasksResponse> getTasks(
      @AuthenticationPrincipal Integer userId
  ) {}

  // タスクを追加
  @PostMapping
  public ResponseEntity<Void> createTask(
      @AuthenticationPrincipal Integer userId,
      @RequestBody CreateTaskRequest request
  ) {}

  // タスクを部分更新
  @PatchMapping("/{taskId}")
  public ResponseEntity<Void> updateTask(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer taskId,
      @Valid @RequestBody UpdateTaskRequest request
  ) {}

  // タスクを削除
  @DeleteMapping("/{taskId}")
  public ResponseEntity<Void> deleteTask(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer taskId
  ) {}

  // タスクを一括削除
  @PostMapping("/bulk-delete")
  public ResponseEntity<Void> bulkDeleteTask(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody BulkDeleteTasksRequest request
  ) {}
}
