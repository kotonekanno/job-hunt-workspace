package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.BulkDeleteTasksRequest;
import com.example.api.model.CreateTaskRequest;
import com.example.api.model.CreateTask201Response;
import com.example.api.model.GetTasksResponse;
import com.kotonekanno.job_hunt_workspace.dtos.task.TaskPatchRequest;
import com.kotonekanno.job_hunt_workspace.services.TaskService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/tasks")
public class TaskController {

  private final TaskService service;

  public TaskController(TaskService service) {
    this.service = service;
  }

  // タスク一覧を取得
  @GetMapping
  public ResponseEntity<GetTasksResponse> getTasks(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok(service.getAll(userId, null, null));
  }

  // タスクを追加
  @PostMapping
  public ResponseEntity<CreateTask201Response> createTask(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateTaskRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userId, request));
  }

  // タスクを部分更新
  @PatchMapping("/{taskId}")
  public ResponseEntity<Void> updateTask(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer taskId,
      @Valid @RequestBody TaskPatchRequest request
  ) {
    service.update(userId, taskId, request);
    return ResponseEntity.noContent().build();
  }

  // タスクを削除
  @DeleteMapping("/{taskId}")
  public ResponseEntity<Void> deleteTask(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer taskId
  ) {
    service.delete(userId, taskId);
    return ResponseEntity.noContent().build();
  }

  // タスクを一括削除
  @PostMapping("/bulk-delete")
  public ResponseEntity<Void> bulkDeleteTask(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody BulkDeleteTasksRequest request
  ) {
    service.bulkDelete(userId, request);
    return ResponseEntity.noContent().build();
  }
}
