package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.services.DocumentService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/documents")
public class DocumentController {

  private final DocumentService service;

  public DocumentController(DocumentService service) {
    this.service = service;
  }

  // 文書一覧を取得
  @GetMapping
  public ResponseEntity<GetDocumentsResponse> getDocuments(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok(service.getAll(userId));
  }

  // 文書を追加
  @PostMapping
  public ResponseEntity<CreateDocument201Response> createDocument(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateDocumentRequest createDocumentRequest
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.create(userId, createDocumentRequest
    ));
  }

  // 文書を取得
  @GetMapping("/{documentId}")
  public ResponseEntity<Document> getDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId
  ) {
    return ResponseEntity.ok(service.get(userId, documentId));
  }

  // 文書を部分更新
  @PatchMapping("/{documentId}")
  public ResponseEntity<Void> updateDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId,
      @Valid @RequestBody UpdateDocumentRequest updateDocumentRequest
  ) {
    service.update(userId, documentId, updateDocumentRequest);
    return ResponseEntity.noContent().build();
  }

  // 文書を削除
  @DeleteMapping("/{documentId}")
  public ResponseEntity<Void> deleteDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId
  ) {
    service.delete(userId, documentId);
    return ResponseEntity.noContent().build();
  }

  // 文書の並び順を更新
  @PutMapping("/{documentId}/position")
  public ResponseEntity<Void> updateDocumentPosition(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId,
      @Valid @RequestBody ReorderDocumentRequest request
  ) {
    service.reorder(userId, documentId, request);
    return ResponseEntity.noContent().build();
  }
}
