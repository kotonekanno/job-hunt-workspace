package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.Selection;
import com.kotonekanno.job_hunt_workspace.entities.SelectionStep;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.SelectionRepository;
import com.kotonekanno.job_hunt_workspace.repositories.SelectionStepRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SelectionService {

  private final SelectionRepository selectionRepository;
  private final SelectionStepRepository selectionStepRepository;
  private final CompanyService companyService;

  public SelectionService(
      SelectionRepository selectionRepository,
      SelectionStepRepository selectionStepRepository,
      CompanyService companyService
  ) {
    this.selectionRepository = selectionRepository;
    this.selectionStepRepository = selectionStepRepository;
    this.companyService = companyService;
  }

  // 選考を追加
  @Transactional
  public CreateSelectionResponse createSelection(
      Integer userId,
      Integer companyId,
      CreateSelectionRequest request
  ) {
    Company company = companyService.getOwnedCompany(companyId, userId);

    boolean isActive = true;
    if (selectionRepository.existsByCompany_IdAndIsActiveTrue(companyId)) {
      isActive = false;
    }

    // Selectionを作成
    Selection selection = new Selection();
    selection.setCompany(company);
    selection.setTitle(request.getTitle());
    selection.setActive(isActive);

    selectionRepository.save(selection);

    // SelectionStepを作成
    List<SelectionStep> steps = new ArrayList<>();

    int position = 1000;

    for (var stepRequest : request.getSteps()) {
      SelectionStep step = new SelectionStep();
      step.setSelection(selection);
      step.setPosition(position);
      step.setName(stepRequest.getName());
      if (stepRequest.getNote() != null) {
        step.setNote(stepRequest.getNote());
      }
      step.setStatus(SelectionStatus.NOT_STARTED);

      steps.add(step);
      position += 1000;
    }

    List<SelectionStep> savedSteps = selectionStepRepository.saveAll(steps);

    return new CreateSelectionResponse()
        .selectionId(selection.getId())
        .selectionStepIds(
            savedSteps.stream()
                .map(SelectionStep::getId)
                .toList()
        );
  }

  // 選考タイトルを更新
  @Transactional
  public void updateSelection(
      Integer userId,
      Integer selectionId,
      PatchSelectionRequest request
  ) {
    Selection selection = selectionRepository
        .findById_Company_User_Id(selectionId, userId)
        .orElseThrow(() -> new NotFoundException("Selection not found"));

    selection.setTitle(request.getTitle());
    selectionRepository.save(selection);
  }

  // 選考を削除
  public void deleteSelection(
      Integer userId,
      Integer selectionId
  ) {
    Selection selection = selectionRepository
        .findById_Company_User_Id(selectionId, userId)
        .orElseThrow(() -> new NotFoundException("Selection not found"));

    selectionRepository.delete(selection);
  }

  // 進行中の選考を更新
  public void updateActiveSelection(
      Integer userId,
      Integer selectionId,
      PutSelectionIsActiveRequest request
  ) {
    Selection selection = selectionRepository
        .findById_Company_User_Id(selectionId, userId)
        .orElseThrow(() -> new NotFoundException("Selection not found"));

    boolean isActive = request.getIsActive();

    selection.setActive(isActive);
    selectionRepository.save(selection);

    if (isActive) {
      Selection currentActiveSelection = selectionRepository
          .findByCompany_IdAndIsActiveTrue(selection.getCompany().getId())
          .orElse(null);

      if (currentActiveSelection != null) {
        currentActiveSelection.setActive(false);
        selectionRepository.save(currentActiveSelection);
      }
    }
  }

  // 選考ステップを追加
  public CreateSelectionStep201Response createSelectionStep(
      Integer userId,
      Integer selectionId,
      CreateSelectionStepRequest request
  ) {
    Selection selection = selectionRepository
        .findById_Company_User_Id(selectionId, userId)
        .orElseThrow(() -> new NotFoundException("Selection not found"));

    SelectionStep previousSelectionStep = selectionStepRepository
        .findById(request.getPreviousSelectionStepId())
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    int position = calcSelectionStepPosition(
        selection.getCompany().getId(),
        null,
        previousSelectionStep
    );

    SelectionStep selectionStep = new SelectionStep();
    selectionStep.setSelection(selection);
    selectionStep.setPosition(position);
    selectionStep.setStatus(SelectionStatus.NOT_STARTED);
    selectionStep.setName(request.getName());
    if (request.getNote() != null) {
      selectionStep.setNote(request.getNote());
    }

    return new CreateSelectionStep201Response()
        .selectionStepId(selectionStepRepository.save(selectionStep).getId());
  }

  // 選考ステップを部分更新
  @Transactional
  public void updateSelectionStep(
      Integer userId,
      Integer selectionStepId,
      UpdateSelectionStepRequest request
  ) {
    SelectionStep selectionStep = selectionStepRepository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    if (request.getName() != null) {
      selectionStep.setName(request.getName());
    }

    if (request.getNote() != null) {
      selectionStep.setNote(request.getNote());
    }

    selectionStepRepository.save(selectionStep);
  }

  // 選考ステップを削除
  @Transactional
  public void deleteSelectionStep(
      Integer userId,
      Integer selectionStepId
  ) {
    SelectionStep selectionStep = selectionStepRepository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    selectionStepRepository.delete(selectionStep);
  }

  // 選考ステップの並び順を更新
  @Transactional
  public void reorderSelectionSteps(
      Integer userId,
      Integer selectionStepId,
      ReorderSelectionStepRequest request
  ) {
    SelectionStep selectionStep = selectionStepRepository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    SelectionStep previousSelectionStep = null;

    if (request.getPreviousSelectionStepId() != null) {
      previousSelectionStep = selectionStepRepository
          .findById(request.getPreviousSelectionStepId())
          .orElseThrow(() -> new NotFoundException("SelectionStep not found"));
    }

    int newPosition = calcSelectionStepPosition(
        selectionStep.getSelection().getId(),
        selectionStepId,
        previousSelectionStep
    );

    selectionStep.setPosition(newPosition);
    selectionStepRepository.save(selectionStep);
  }

  // 選考ステップの状態を更新
  @Transactional
  public void updateSelectionStepStatus(
      Integer userId,
      Integer selectionStepId,
      PutSelectionStepStatusRequest request
  ) {
    SelectionStep selectionStep = selectionStepRepository
        .findById_AndSelection_Company_User_Id(selectionStepId, userId)
        .orElseThrow(() -> new NotFoundException("SelectionStep not found"));

    if (!(selectionStep.getStatus() == SelectionStatus.PASSED) &&
        !(selectionStep.getStatus() == SelectionStatus.NOT_STARTED)) {

      Integer selectionId = selectionStep.getSelection().getId();
      Integer position = selectionStep.getPosition();

      selectionStepRepository.updateStatusBefore(
          selectionId,
          position,
          SelectionStatus.PASSED
      );

      selectionStepRepository.updateStatusAfter(
          selectionId,
          position,
          SelectionStatus.NOT_STARTED
      );
    }

    selectionStep.setStatus(request.getStatus());
  }

  // 選考ステップの並び順を計算する
  @Transactional
  private int calcSelectionStepPosition(
      Integer selectionId,
      Integer selectionStepId,
      SelectionStep previousSelectionStep
  ) {
    // 先頭に移動・追加した場合
    if (previousSelectionStep == null) {
      Integer nextPosition = selectionStepRepository
          .findMinPositionBySelectionId(selectionId)
          .orElse(null);

      // 選考ステップがまだ存在しない場合
      if (nextPosition == null) {
        return 1000;
      }

      return nextPosition - 1000;
    }

    Integer previousPosition = previousSelectionStep.getPosition();

    Integer nextPosition = selectionStepRepository.findNextPosition(
        selectionId,
        previousPosition,
        selectionStepId
    ).orElse(null);

    // 末尾に追加・移動した場合
    if (nextPosition == null) {
      return previousPosition + 1000;
    }

    // 2つの要素の間に追加・移動した場合
    if (nextPosition - previousPosition > 1) {
      return previousPosition + (nextPosition - previousPosition) / 2;
    }

    // 再採番を行う場合
    reorderAllSteps(selectionId);

    SelectionStep refreshedPrevious = selectionStepRepository
        .findById(previousSelectionStep.getId())
        .orElseThrow();

    return calcSelectionStepPosition(
        selectionId,
        selectionStepId,
        refreshedPrevious
    );
  }

  // 選考ステップの並び順を再採番する
  private void reorderAllSteps(
      Integer selectionId
  ) {
    List<SelectionStep> steps = selectionStepRepository
        .findBySelection_IdOrderByPositionAscIdAsc(selectionId);

    int position = 1000;

    for (SelectionStep step : steps) {
      step.setPosition(position);
      position += 1000;
    }
  }
}
