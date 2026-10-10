package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateEventRequest;
import com.example.api.model.GetEventsResponse;
import com.example.api.model.UpdateEventRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/events")
public class EventController {

  // イベント一覧を取得
  @GetMapping
  public ResponseEntity<GetEventsResponse> getEvents(
      @AuthenticationPrincipal Integer userId
  ) {}

  // イベントを追加
  @PostMapping
  public ResponseEntity<Void> createEvent(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateEventRequest request
  ) {}

  // イベントを部分更新
  @PatchMapping("/{eventId}")
  public ResponseEntity<Void> updateEvent(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer eventId,
      @Valid @RequestBody UpdateEventRequest request
  ) {}

  // イベントを削除
  @DeleteMapping("/{eventId}")
  public ResponseEntity<Void> deleteEvent(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer eventId
  ) {}
}
