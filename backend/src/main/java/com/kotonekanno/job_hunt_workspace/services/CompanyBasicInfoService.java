package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.CreateCompanyBasicInfo201Response;
import com.example.api.model.CreateCompanyBasicInfoRequest;
import com.example.api.model.UpdateCompanyBasicInfoRequest;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.CompanyBasicInfo;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyBasicInfoRepository;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyBasicInfoService {

  private final CompanyBasicInfoRepository repository;
  private final CompanyRepository companyRepository;

  public CompanyBasicInfoService(
      CompanyBasicInfoRepository repository,
      CompanyRepository companyRepository
  ) {
    this.repository = repository;
    this.companyRepository = companyRepository;
  }

  // 基本情報を追加
  @Transactional
  public CreateCompanyBasicInfo201Response create(
      Integer userId,
      Integer companyId,
      CreateCompanyBasicInfoRequest request
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

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
