package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.CreateCompanyBasicInfoRequest;
import com.example.api.model.UpdateCompanyBasicInfoRequest;
import jakarta.validation.Valid;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@NullMarked
@RestController
@RequestMapping("/companies/{companyId}/basic_infos")
public class CompanyBasicInfoController {

  // 基本情報を追加
  @PostMapping()
  public ResponseEntity<Void> createCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @Valid @RequestBody CreateCompanyBasicInfoRequest request
  ) {}

  // 基本情報を部分更新
  @PatchMapping("/{basicInfoId}")
  public ResponseEntity<Void> updateCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer basicInfoId,
      @Valid @RequestBody UpdateCompanyBasicInfoRequest request
  ) {}

  // 基本情報を削除
  @DeleteMapping("/{basicInfoId}")
  public ResponseEntity<Void> deleteCompanyBasicInfo(
      @AuthenticationPrincipal Integer userId,
      @PathVariable Integer companyId,
      @PathVariable Integer basicInfoId
  ) {}
}
