package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateCompanyBasicInfo201Response;
import com.example.api.model.CreateCompanyBasicInfoRequest;
import com.example.api.model.UpdateCompanyBasicInfoRequest;
import com.kotonekanno.job_hunt_workspace.services.CompanyBasicInfoService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/basic_infos")
public class CompanyBasicInfoController {

  private final CompanyBasicInfoService service;

  public CompanyBasicInfoController(CompanyBasicInfoService service) {
    this.service = service;
  }

  // 基本情報を追加
  @PostMapping()
  public ResponseEntity<CreateCompanyBasicInfo201Response> createCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateCompanyBasicInfoRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userId, companyId, request));
  }

  // 基本情報を部分更新
  @PatchMapping("/{basicInfoId}")
  public ResponseEntity<Void> updateCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer basicInfoId,
      @Valid @RequestBody UpdateCompanyBasicInfoRequest request
  ) {
    service.update(userId, basicInfoId, request);
    return ResponseEntity.noContent().build();
  }

  // 基本情報を削除
  @DeleteMapping("/{basicInfoId}")
  public ResponseEntity<Void> deleteCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer basicInfoId
  ) {
    service.delete(userId, basicInfoId);
    return ResponseEntity.noContent().build();
  }
}
