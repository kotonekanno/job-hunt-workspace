package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateDocumentRequest;
import com.example.api.model.Document;
import com.example.api.model.GetDocumentsResponse;
import com.example.api.model.UpdateDocumentRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/documents")
public class DocumentController {

  // 文書一覧を取得
  @GetMapping
  public ResponseEntity<GetDocumentsResponse> getDocuments(
      @AuthenticationPrincipal Integer userId
  ) {}

  // 文書を追加
  @PostMapping
  public ResponseEntity<Void> createDocument(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateDocumentRequest createDocumentRequest
  ) {}

  // 文書を取得
  @GetMapping("/{documentId}")
  public ResponseEntity<Document> getDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId
  ) {}

  // 文書を部分更新
  @PatchMapping("/{documentId}")
  public ResponseEntity<Void> updateDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId,
      @Valid @RequestBody UpdateDocumentRequest updateDocumentRequest
  ) {}

  // 文書を削除
  @DeleteMapping("/{documentId}")
  public ResponseEntity<Void> deleteDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer documentId
  ) {}
}
