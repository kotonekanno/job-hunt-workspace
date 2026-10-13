package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.PutSelectionStepStatusRequest;
import com.example.api.model.SelectionStatus;
import com.example.api.model.UpdateSelectionStepRequest;
import com.kotonekanno.job_hunt_workspace.entities.SelectionStep;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.SelectionStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanySelectionStepService {

  private final SelectionStepRepository repository;

  public CompanySelectionStepService(
      SelectionStepRepository repository
  ) {
    this.repository = repository;
  }

  // 選考ステップを部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer selectionStepId,
      UpdateSelectionStepRequest request
  ) {
    SelectionStep selectionStep = repository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    if (request.getPosition() != null) {
      repository.save(selectionStep);
      return;
    }

    if (request.getName() != null) {
      selectionStep.setName(request.getName());
    }

    if (request.getNote() != null) {
      selectionStep.setNote(request.getNote());
    }

    repository.save(selectionStep);
  }

  // 選考ステップを削除
  @Transactional
  public void delete(
      Integer userId,
      Integer selectionStepId
  ) {
    SelectionStep selectionStep = repository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    repository.delete(selectionStep);
  }

  // 選考ステップの状態を更新
  @Transactional
  public void updateStatus(
      Integer userId,
      Integer selectionStepId,
      PutSelectionStepStatusRequest request
  ) {
    SelectionStep selectionStep = repository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    if (!(selectionStep.getStatus() == SelectionStatus.PASSED) &&
        !(selectionStep.getStatus() == SelectionStatus.NOT_STARTED)) {

      Integer selectionId = selectionStep.getSelection().getId();
      Integer position = selectionStep.getPosition();

      repository.updateStatusBefore(
          selectionId,
          position,
          SelectionStatus.PASSED
      );

      repository.updateStatusAfter(
          selectionId,
          position,
          SelectionStatus.NOT_STARTED
      );
    }

    selectionStep.setStatus(request.getStatus());
  }
}
