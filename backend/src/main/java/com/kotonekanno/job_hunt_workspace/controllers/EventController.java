package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateEventRequest;
import com.example.api.model.CreateEvent201Response;
import com.example.api.model.GetEventsResponse;
import com.example.api.model.UpdateEventRequest;
import com.kotonekanno.job_hunt_workspace.services.EventService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/events")
public class EventController {

  private final EventService service;

  public EventController(EventService service) {
    this.service = service;
  }

  // イベント一覧を取得
  @GetMapping
  public ResponseEntity<GetEventsResponse> getEvents(
      @AuthenticationPrincipal Integer userId,
      @RequestParam(defaultValue = "") String month
  ) {
    return ResponseEntity.ok(service.getAll(userId, month));
  }

  // イベントを追加
  @PostMapping
  public ResponseEntity<CreateEvent201Response> createEvent(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateEventRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userId, request));
  }

  // イベントを部分更新
  @PatchMapping("/{eventId}")
  public ResponseEntity<Void> updateEvent(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer eventId,
      @Valid @RequestBody UpdateEventRequest request
  ) {
    service.update(userId, eventId, request);
    return ResponseEntity.noContent().build();
  }

  // イベントを削除
  @DeleteMapping("/{eventId}")
  public ResponseEntity<Void> deleteEvent(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer eventId
  ) {
    service.delete(userId, eventId);
    return ResponseEntity.noContent().build();
  }
}
