package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.*;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies")
public class CompanyController {

  // 企業一覧を取得
  @GetMapping
  public ResponseEntity<GetCompaniesResponse> getCompanies(
      @AuthenticationPrincipal Integer userId
  ) {}

  // 企業を追加
  @PostMapping
  public ResponseEntity<Void> createCompany(
      @AuthenticationPrincipal Integer userId,
      @Valid @RequestBody CreateCompanyRequest request
  ) {}

  // 企業の詳細情報を取得
  @GetMapping("/{companyId}")
  public ResponseEntity<GetCompanyResponse> getCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId
  ){}

  // 企業情報を部分更新
  @PatchMapping("/{companyId}")
  public ResponseEntity<Void> updateCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyRequest request
  ) {}

  // 企業を削除
  @DeleteMapping("/{companyId}")
  public ResponseEntity<Void> deleteCompany(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId
  ) {}

  // 企業の志望度・並び順を更新
  @PatchMapping("/{companyId}/priority")
  public ResponseEntity<Void> updateCompanyPriority(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyPriorityRequest request
  ) {}

  // 企業の文書を更新
  @PutMapping("/{companyId}/document")
  public ResponseEntity<Void> updateCompanyDocument(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody PutCompanyDocumentRequest request
  ) {}

  // 企業のウィジェット表示設定を更新
  @PatchMapping("/{companyId}/widgets")
  public ResponseEntity<Void> updateCompanyWidget(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody UpdateCompanyWidgetRequest request
  ) {}
}
