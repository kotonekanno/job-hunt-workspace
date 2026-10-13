package com.kotonekanno.job_hunt_workspace.services;

import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyRepository;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

  private final CompanyRepository companyRepository;

  public CompanyService(
      CompanyRepository companyRepository
  ) {
    this.companyRepository = companyRepository;
  }

  // CompanyがUserのものであることを確認
  public Company getOwnedCompany(Integer companyId, Integer userId) {
    return companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));
  }
}
