package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.services.CompanyService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies")
public class CompanyController {

  private final CompanyService service;

  public CompanyController(CompanyService service) {
    this.service = service;
  }

  // 企業一覧を取得
  @GetMapping
  public ResponseEntity<GetCompaniesResponse> getCompanies(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok(service.getList(userId, null));
  }

  // 企業を追加
  @PostMapping
  public ResponseEntity<CreateCompany201Response> createCompany(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateCompanyRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
        service.create(userId, request)
    );
  }

  // 検索用の企業一覧を取得する
  @GetMapping("/lookup")
  public ResponseEntity<GetCompanyLookupResponse> getCompaniesLookup(
      @AuthenticationPrincipal Integer userId
  ) {
    return ResponseEntity.ok(
        service.getCompaniesLookup(userId)
    );
  }

  // 企業の詳細情報を取得
  @GetMapping("/{companyId}")
  public ResponseEntity<GetCompanyResponse> getCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId
  ) {
    return ResponseEntity.ok(
        service.get(userId, companyId)
    );
  }

  // 企業情報を部分更新
  @PatchMapping("/{companyId}")
  public ResponseEntity<Void> updateCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyRequest request
  ) {
    service.update(userId, companyId, request);
    return ResponseEntity.noContent().build();
  }

  // 企業を削除
  @DeleteMapping("/{companyId}")
  public ResponseEntity<Void> deleteCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId
  ) {
    service.delete(userId, companyId);
    return ResponseEntity.noContent().build();
  }

  // 企業の志望度・並び順を更新
  @PatchMapping("/{companyId}/priority")
  public ResponseEntity<Void> updateCompanyPriority(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyPriorityRequest request
  ) {
    service.updatePriority(userId, companyId, request);
    return ResponseEntity.noContent().build();
  }

  // 企業の文書を更新
  @PutMapping("/{companyId}/document")
  public ResponseEntity<Void> updateCompanyDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody PutCompanyDocumentRequest request
  ) {
    service.updateDocument(userId, companyId, request);
    return ResponseEntity.noContent().build();
  }

  // 企業のウィジェット表示設定を更新
  @PatchMapping("/{companyId}/widgets")
  public ResponseEntity<Void> updateCompanyWidget(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyWidgetRequest request
  ) {
    service.updateWidget(userId, companyId, request);
    return ResponseEntity.noContent().build();
  }
}
