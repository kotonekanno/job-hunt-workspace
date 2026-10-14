package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.CompanyActivity;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyActivityRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@NullMarked
@Service
public class CompanyActivityService {

  private final CompanyActivityRepository repository;
  private final CompanyService companyService;

  public CompanyActivityService(
      CompanyActivityRepository repository,
      CompanyService companyService
  ) {
    this.repository = repository;
    this.companyService = companyService;
  }

  // やりとり履歴を追加
  @Transactional
  public CreateCompanyActivity201Response create(
      Integer userId,
      Integer companyId,
      CreateCompanyActivityRequest request
  ) {
    Company company = companyService.getOwnedCompany(companyId, userId);

    CompanyActivity activity = new CompanyActivity();
    activity.setCompany(company);
    activity.setOccurredAt(OffsetDateTime.now(ZoneOffset.UTC));
    activity.setByUser(request.getByUser());
    activity.setText(request.getText());

    return new CreateCompanyActivity201Response(
        repository.save(activity).getId()
    );
  }

  // やりとり履歴を取得
  @Transactional(readOnly = true)
  public List<Activity> getPerPage(
      Integer userId,
      Integer companyId,
      Integer page
  ) {
    int pageSize = 20;
    int safePage = Math.max(page, 0);

    Pageable pageable = PageRequest.of(
        safePage,
        pageSize,
        Sort.by(Sort.Direction.DESC, "occurredAt")
            .and(Sort.by(Sort.Direction.DESC, "id"))
    );

    Slice<CompanyActivity> activities =
        repository.findByCompany_User_Id(companyId, userId, pageable);

    List<Activity> activityList = new ArrayList<>();
    for (CompanyActivity activity : activities) {
      activityList.add(
          new Activity()
              .id(activity.getId())
              .occurredAt(activity.getOccurredAt())
              .byUser(activity.isByUser())
              .text(activity.getText())
      );
    }

    return activityList;
  }

  // やりとり履歴を部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer activityId,
      UpdateCompanyActivityRequest request
  ) {
    CompanyActivity activity = repository
        .findByIdAndCompany_User_Id(activityId, userId)
        .orElseThrow(() -> new NotFoundException("Activity not found"));

    if (request.getOccurredAt() != null) {
      activity.setOccurredAt(request.getOccurredAt());
    }

    if (request.getByUser() != null) {
      activity.setByUser(request.getByUser());
    }

    if (request.getText() != null) {
      activity.setText(request.getText());
    }

    repository.save(activity);
  }

  // やりとり履歴を削除
  @Transactional
  public void delete(
      Integer userId,
      Integer activityId
  ) {
    CompanyActivity activity = repository
        .findByIdAndCompany_User_Id(activityId, userId)
        .orElseThrow(() -> new NotFoundException("Activity not found"));

    repository.delete(activity);
  }
}
