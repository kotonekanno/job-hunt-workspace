package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.BulkDeleteTasksRequest;
import com.example.api.model.CreateTaskRequest;
import com.kotonekanno.job_hunt_workspace.dtos.task.TaskPatchRequest;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.Task;
import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.AccessDeniedException;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.TaskRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TaskServiceTests {

  private TaskRepository repository;
  private UserRepository userRepository;
  private CompanyService companyService;
  private TaskService service;
  private final JsonMapper mapper = JsonMapper.builder().build();

  @BeforeEach
  void setUp() {
    repository = mock(TaskRepository.class);
    userRepository = mock(UserRepository.class);
    companyService = mock(CompanyService.class);
    service = new TaskService(repository, userRepository, companyService);
  }

  @Test
  void getAllMapsCompanyAndPreservesDeadlineDate() {
    Task task = task();
    when(repository.findByUser_IdOrderByIdAsc(7)).thenReturn(List.of(task));

    var result = service.getAll(7).getTasks().getFirst();

    assertEquals(12, result.getId());
    assertEquals(23, result.getCompanyId());
    assertEquals(task.getDeadline(), result.getDeadline());
    assertEquals(task.getTitle(), result.getTitle());
    assertEquals(task.getNote(), result.getNote());
    assertTrue(result.getDone());
  }

  @Test
  void getAllSupportsNoCompanyOrDeadlineAndEmptyList() {
    Task task = task();
    task.setCompany(null);
    task.setDeadline(null);
    when(repository.findByUser_IdOrderByIdAsc(7)).thenReturn(List.of(task), List.of());

    var result = service.getAll(7).getTasks().getFirst();

    assertNull(result.getCompanyId());
    assertNull(result.getDeadline());
    assertTrue(service.getAll(7).getTasks().isEmpty());
  }

  @Test
  void createChecksCompanyOwnershipAndSavesIncompleteTask() {
    User user = new User();
    Company company = new Company();
    LocalDate deadline = task().getDeadline();
    when(userRepository.findById(7)).thenReturn(Optional.of(user));
    when(companyService.getOwnedCompany(23, 7)).thenReturn(company);
    when(repository.save(any(Task.class))).thenAnswer(invocation -> {
      Task task = invocation.getArgument(0);
      assertSame(user, task.getUser());
      assertSame(company, task.getCompany());
      assertEquals(deadline, task.getDeadline());
      assertFalse(task.isDone());
      task.setId(12);
      return task;
    });

    var response = service.create(7, new CreateTaskRequest()
        .companyId(23).title("ES提出").deadline(deadline));

    assertEquals(12, response.getTaskId());
    verify(companyService).getOwnedCompany(23, 7);
  }

  @Test
  void createRejectsForeignCompanyBeforeSaving() {
    when(userRepository.findById(7)).thenReturn(Optional.of(new User()));
    when(companyService.getOwnedCompany(23, 7)).thenThrow(new NotFoundException("Company not found"));

    assertThrows(NotFoundException.class,
        () -> service.create(7, new CreateTaskRequest().companyId(23).title("ES提出")));

    verify(repository, never()).save(any());
  }

  @Test
  void updateDistinguishesExplicitNullFromOmittedFields() {
    Task task = task();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(task));
    TaskPatchRequest request = mapper.readValue(
        "{\"companyId\":null,\"deadline\":null,\"note\":null}", TaskPatchRequest.class);

    service.update(7, 12, request);

    assertNull(task.getCompany());
    assertNull(task.getDeadline());
    assertNull(task.getNote());
    assertEquals("ES提出", task.getTitle());
    assertTrue(task.isDone());
    verifyNoInteractions(companyService);
  }

  @Test
  void updateFalsePreservesOmittedNullableFields() {
    Task task = task();
    Company company = task.getCompany();
    LocalDate deadline = task.getDeadline();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(task));

    service.update(7, 12, mapper.readValue("{\"done\":false}", TaskPatchRequest.class));

    assertFalse(task.isDone());
    assertSame(company, task.getCompany());
    assertEquals(deadline, task.getDeadline());
    assertEquals("提出前に確認", task.getNote());
  }

  @Test
  void updateAcceptsDeadlineAndChecksNewCompanyOwnership() {
    Task task = task();
    Company company = new Company();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(task));
    when(companyService.getOwnedCompany(24, 7)).thenReturn(company);
    TaskPatchRequest request = mapper.readValue(
        "{\"companyId\":24,\"deadline\":\"2026-10-16\"}", TaskPatchRequest.class);

    service.update(7, 12, request);

    assertSame(company, task.getCompany());
    assertEquals(LocalDate.parse("2026-10-16"),
        task.getDeadline());
    verify(companyService).getOwnedCompany(24, 7);
  }

  @Test
  void updateAndDeleteRejectTasksNotOwnedByUser() {
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class, () -> service.update(7, 12, new TaskPatchRequest()));
    assertThrows(NotFoundException.class, () -> service.delete(7, 12));

    verify(repository, never()).save(any());
    verify(repository, never()).delete(any());
  }

  @Test
  void deleteRemovesOwnedTask() {
    Task task = task();
    when(repository.findByIdAndUser_Id(12, 7)).thenReturn(Optional.of(task));

    service.delete(7, 12);

    verify(repository).delete(task);
  }

  @Test
  void bulkDeleteDeduplicatesIds() {
    List<Task> tasks = List.of(task());
    when(repository.findByIdInAndUser_Id(Set.of(12), 7)).thenReturn(tasks);

    service.bulkDelete(7, new BulkDeleteTasksRequest().taskIds(List.of(12, 12)));

    verify(repository).deleteAll(tasks);
  }

  @Test
  void bulkDeleteRejectsEntireRequestIfAnyTaskIsInaccessible() {
    when(repository.findByIdInAndUser_Id(Set.of(12, 13), 7)).thenReturn(List.of(task()));

    assertThrows(AccessDeniedException.class,
        () -> service.bulkDelete(7, new BulkDeleteTasksRequest().taskIds(List.of(12, 13))));

    verify(repository, never()).deleteAll(any(Iterable.class));
  }

  @Test
  void bulkDeleteEmptyListDoesNothing() {
    service.bulkDelete(7, new BulkDeleteTasksRequest().taskIds(List.of()));

    verifyNoInteractions(repository);
  }

  private Task task() {
    Company company = new Company();
    company.setId(23);
    Task task = new Task();
    task.setId(12);
    task.setCompany(company);
    task.setTitle("ES提出");
    task.setNote("提出前に確認");
    task.setDeadline(LocalDate.parse("2026-10-15"));
    task.setDone(true);
    return task;
  }
}
