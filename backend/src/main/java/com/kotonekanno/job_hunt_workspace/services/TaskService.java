package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.dtos.task.TaskPatchRequest;
import com.kotonekanno.job_hunt_workspace.entities.Task;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.AccessDeniedException;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.TaskRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TaskService {

  private final TaskRepository repository;
  private final UserRepository userRepository;
  private final CompanyService companyService;

  public TaskService(
      TaskRepository repository,
      UserRepository userRepository,
      CompanyService companyService
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.companyService = companyService;
  }

  // タスク一覧を取得
  @Transactional(readOnly = true)
  public GetTasksResponse getAll(Integer userId) {
    return new GetTasksResponse()
        .tasks(
            repository.findByUser_IdOrderByIdAsc(userId).stream()
                .map(task -> new com.example.api.model.Task()
                    .id(task.getId())
                    .companyName(task.getCompany() == null ? null : task.getCompany().getName())
                    .title(task.getTitle())
                    .note(task.getNote())
                    .deadline(task.getDeadline())
                    .done(task.isDone())
                )
                .toList()
        );
  }

  // タスクを追加
  @Transactional
  public CreateTask201Response create(
      Integer userId,
      CreateTaskRequest request
  ) {
    Task task = new Task();
    task.setUser(userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found")));

    if (request.getCompanyId() != null) {
      task.setCompany(companyService.getOwnedCompany(request.getCompanyId(), userId));
    }

    task.setTitle(request.getTitle());
    task.setNote(request.getNote());
    task.setDeadline(request.getDeadline());

    return new CreateTask201Response(repository.save(task).getId());
  }

  // タスクを部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer taskId,
      TaskPatchRequest request
  ) {
    Task task = repository.findByIdAndUser_Id(taskId, userId)
        .orElseThrow(() -> new NotFoundException("Task not found"));

    if (request.hasCompanyId()) {
      task.setCompany(request.getCompanyId() == null ? null
          : companyService.getOwnedCompany(request.getCompanyId(), userId));
    }

    if (request.getTitle() != null) {
      task.setTitle(request.getTitle());
    }

    if (request.hasNote()) {
      task.setNote(request.getNote());
    }

    if (request.hasDeadline()) {
      task.setDeadline(request.getDeadline());
    }

    if (request.getDone() != null) {
      task.setDone(request.getDone());
    }

    repository.save(task);
  }

  // タスクを削除
  @Transactional
  public void delete(
      Integer userId,
      Integer taskId
  ) {
    Task task = repository.findByIdAndUser_Id(taskId, userId)
        .orElseThrow(() -> new NotFoundException("Task not found"));

    repository.delete(task);
  }

  // タスクを一括削除
  @Transactional
  public void bulkDelete(
      Integer userId,
      BulkDeleteTasksRequest request
  ) {
    Set<Integer> taskIds = new HashSet<>(request.getTaskIds());
    if (taskIds.isEmpty()) {
      return;
    }

    List<Task> tasks = repository.findByIdInAndUser_Id(taskIds, userId);
    if (tasks.size() != taskIds.size()) {
      throw new AccessDeniedException("Some tasks are not accessible");
    }

    repository.deleteAll(tasks);
  }
}
