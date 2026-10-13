package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.CreateCompanyBasicInfo201Response;
import com.example.api.model.CreateCompanyBasicInfoRequest;
import com.example.api.model.UpdateCompanyBasicInfoRequest;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.CompanyBasicInfo;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyBasicInfoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyBasicInfoService {

  private final CompanyBasicInfoRepository repository;
  private final CompanyService companyService;

  public CompanyBasicInfoService(
      CompanyBasicInfoRepository repository,
      CompanyService companyService
  ) {
    this.repository = repository;
    this.companyService = companyService;
  }

  // 基本情報を追加
  @Transactional
  public CreateCompanyBasicInfo201Response create(
      Integer userId,
      Integer companyId,
      CreateCompanyBasicInfoRequest request
  ) {
    Company company = companyService.getOwnedCompany(userId, companyId);

    int position = repository.findMaxPositionByCompanyId(companyId)
        .map(max -> max + 1000)
        .orElse(1000);

    CompanyBasicInfo basicInfo = new CompanyBasicInfo();
    basicInfo.setCompany(company);
    basicInfo.setPosition(position);
    basicInfo.setTitle(request.getTitle());
    basicInfo.setText(request.getText());

    return new CreateCompanyBasicInfo201Response(
        repository.save(basicInfo).getId()
    );
  }

  // 基本情報を部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer basicInfoId,
      UpdateCompanyBasicInfoRequest request
  ) {
    CompanyBasicInfo basicInfo = repository
        .findByIdAndCompany_User_Id(basicInfoId, userId)
        .orElseThrow(() -> new NotFoundException("BasicInfo not found"));

    if (request.getTitle() != null) {
      basicInfo.setTitle(request.getTitle());
    }

    if (request.getText() != null) {
      basicInfo.setText(request.getText());
    }

    repository.save(basicInfo);
  }

  // 基本情報を削除
  @Transactional
  public void delete(
      Integer userId,
      Integer basicInfoId
  ) {
    CompanyBasicInfo basicInfo = repository
        .findByIdAndCompany_User_Id(basicInfoId, userId)
        .orElseThrow(() -> new NotFoundException("BasicInfo not found"));

    repository.delete(basicInfo);
  }
}
