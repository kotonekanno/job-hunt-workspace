package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.dtos.LatestActivityProjection;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.dtos.CurrentSelectionProjection;
import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompanyService {

  private final CompanyRepository companyRepository;
  private final SelectionRepository selectionRepository;
  CompanyBasicInfoRepository companyBasicInfoRepository;
  private final CompanyActivityRepository companyActivityRepository;
  private final UserRepository userRepository;
  private final EventRepository eventRepository;
  private final TaskRepository taskRepository;
  private final CompanyActivityService companyActivityService;

  public CompanyService(
      CompanyRepository companyRepository,
      SelectionRepository selectionRepository,
      CompanyBasicInfoRepository companyBasicInfoRepository,
      CompanyActivityRepository companyActivityRepository,
      UserRepository userRepository,
      EventRepository eventRepository,
      TaskRepository taskRepository,
      CompanyActivityService companyActivityService
  ) {
    this.companyRepository = companyRepository;
    this.selectionRepository = selectionRepository;
    this.companyBasicInfoRepository = companyBasicInfoRepository;
    this.companyActivityRepository = companyActivityRepository;
    this.userRepository = userRepository;
    this.eventRepository = eventRepository;
    this.taskRepository = taskRepository;
    this.companyActivityService = companyActivityService;
  }

  // 企業一覧を取得
  @Transactional(readOnly = true)
  public GetCompaniesResponse getList(
      Integer userId,
      Integer limit
  ) {
    Pageable pageable = limit == null
        ? Pageable.unpaged()
        : PageRequest.of(0, limit);

    List<Company> companies = companyRepository
        .findAllByUser_IdOrderByPriorityAscPositionAsc(userId, pageable);

    // 企業が0件の場合
    if (companies.isEmpty()) {
      return new GetCompaniesResponse()
          .companies(List.of());
    }

    // 取得した企業のIDを抽出
    List<Integer> companyIds = companies.stream()
        .map(Company::getId)
        .toList();

    // 進行中の選考ステップを取得
    Map<Integer, CurrentSelection> currentSelections =
        selectionRepository.findCurrentSelections(userId, companyIds)
            .stream()
            .collect(Collectors.toMap(
                CurrentSelectionProjection::getCompanyId,
                row -> new CurrentSelection()
                    .title(row.getTitle())
                    .step(
                        row.getStepId() == null
                            ? null
                            : new CurrentSelectionStep()
                                .id(row.getStepId())
                                .name(row.getStepName())
                                .status(row.getStepStatus())
                    )
            ));

    // 最新のやりとり履歴を取得
    Map<Integer, String> latestActivities =
        companyActivityRepository.findLatestActivities(userId, companyIds)
            .stream()
            .collect(Collectors.toMap(
                LatestActivityProjection::getCompanyId,
                row -> (row.getByUser() ? "ユーザーが" : "企業が")
                    + row.getText()
            ));

    // レスポンス作成
    List<CompanyListItem> companyListItems = new ArrayList<>();
    for (Company company : companies) {
      Integer companyId = company.getId();

      companyListItems.add(
          new CompanyListItem()
              .id(company.getId())
              .name(company.getName())
              .priority(company.getPriority())
              .currentSelection(currentSelections.get(companyId))
              .latestActivity(latestActivities.get(companyId))
      );
    }

    return new GetCompaniesResponse()
        .companies(companyListItems);
  }

  // 企業を追加
  @Transactional
  public CreateCompany201Response create(
      Integer userId,
      CreateCompanyRequest request
  ) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found"));

    Company company = new Company();
    company.setUser(user);
    company.setName(request.getName());

    int priority = request.getPriority();
    company.setPriority(priority);

    int position = calcCompanyPosition(
        userId,
        null,
        priority,
        null
    );
    company.setPosition(position);

    return new CreateCompany201Response(
        companyRepository.save(company).getId()
    );
  }

  // 企業の詳細情報を取得
  @Transactional(readOnly = true)
  public GetCompanyResponse get(
      Integer userId,
      Integer companyId
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    boolean showBasicInfoWidget = company.isShowBasicInfoWidget();
    boolean showSelectionWidget = company.isShowSelectionWidget();

    // 基本情報
    List<BasicInfo> basicInfos = List.of();
    if (showBasicInfoWidget) {
      basicInfos = companyBasicInfoRepository
          .findByCompany_IdOrderByPositionAsc(companyId)
          .stream()
          .map(info -> new BasicInfo()
              .id(info.getId())
              .title(info.getTitle())
              .text(info.getText())
          )
          .toList();
    }

    // 選考
    List<com.example.api.model.Selection> selections = List.of();
    Integer activeSelectionId = null;
    if (showSelectionWidget) {
      var rows = selectionRepository.findAllWithSteps(userId, companyId);

      Map<Integer, com.example.api.model.Selection> selectionMap =
          new LinkedHashMap<>();

      for (var row : rows) {
        var selection = selectionMap.computeIfAbsent(
            row.getSelectionId(),
            id -> new com.example.api.model.Selection()
                .id(id)
                .title(row.getSelectionTitle())
                .steps(new ArrayList<>())
        );

        if (Boolean.TRUE.equals(row.getIsActive())) {
          activeSelectionId = row.getSelectionId();
        }

        if (row.getStepId() != null) {
          selection.addStepsItem(
              new com.example.api.model.SelectionStepResponse()
                  .id(row.getStepId())
                  .name(row.getStepName())
                  .status(row.getStepStatus())
                  .note(row.getStepNote())
          );
        }
      }

      selections = new ArrayList<>(selectionMap.values());
    }

    // イベント
    LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
    OffsetDateTime startOfToday = today
        .atStartOfDay(ZoneId.of("Asia/Tokyo"))
        .toOffsetDateTime();

    List<com.example.api.model.Event> events =
        eventRepository.findUpcomingByCompanyId(
                companyId,
                today,
                startOfToday
            )
            .stream()
            .map(event -> new com.example.api.model.Event()
                .id(event.getId())
                .companyName(company.getName())
                .category(event.getEventCategory())
                .title(event.getTitle())
                .note(event.getNote())
                .isAllDay(event.isAllDay())
                .startDay(event.getStartDate())
                .endDay(event.getEndDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .isOnline(event.isOnline())
                .isAttending(event.getIsAttending())
            )
            .toList();

    // タスク
    List<com.example.api.model.Task> tasks =
        taskRepository.findAllByCompanyIdOrderByDeadlineAsc(companyId)
            .stream()
            .map(task -> new com.example.api.model.Task()
                .id(task.getId())
                .companyName(company.getName())
                .title(task.getTitle())
                .note(task.getNote())
                .deadline(task.getDeadline())
                .done(task.isDone())
            )
            .toList();

    return new GetCompanyResponse()
        .name(company.getName())
        .priority(company.getPriority())
        .showBasicInfoWidget(showBasicInfoWidget)
        .showSelectionWidget(showSelectionWidget)
        .basicInfos(basicInfos)
        .activities(companyActivityService.getPerPage(userId, companyId, 0))
        .selections(selections)
        .activeSelectionId(activeSelectionId)
        .document(company.getDocument())
        .events(events)
        .tasks(tasks);
  }

  // 企業情報を部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer companyId,
      UpdateCompanyRequest request
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    company.setName(request.getName());

    companyRepository.save(company);
  }

  // 企業を削除
  @Transactional
  public void delete(
      Integer userId,
      Integer companyId
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    companyRepository.delete(company);
  }

  // 企業の志望度・並び順を更新
  @Transactional
  public void updatePriority(
      Integer userId,
      Integer companyId,
      UpdateCompanyPriorityRequest request
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    Company nextCompany = null;
    if (request.getNextCompanyId() != null) {
      nextCompany = companyRepository
          .findById(request.getNextCompanyId())
          .orElseThrow(() -> new NotFoundException("Company not found"));
    }

    int newPriority = request.getPriority();
    int newPosition = calcCompanyPosition(
        userId,
        companyId,
        newPriority,
        nextCompany
    );

    company.setPriority(newPriority);
    company.setPosition(newPosition);

    companyRepository.save(company);
  }

  // 企業の文書を更新
  @Transactional
  public void updateDocument(
      Integer userId,
      Integer companyId,
      PutCompanyDocumentRequest request
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    company.setDocument(request.getDocument());
    companyRepository.save(company);
  }

  // 企業のウィジェット表示設定を更新
  @Transactional
  public void updateWidget(
      Integer userId,
      Integer companyId,
      UpdateCompanyWidgetRequest request
  ) {
    Company company = companyRepository.findByIdAndUserId(companyId, userId)
        .orElseThrow(() -> new NotFoundException("Company not found"));

    Boolean showBasicInfoWidget = request.getBasicInfo();
    Boolean showSelectionWidget = request.getSelection();

    if (showBasicInfoWidget != null) {
      if (!showBasicInfoWidget) {
        companyBasicInfoRepository.deleteAllByCompany_Id(companyId);
      }
      company.setShowBasicInfoWidget(showBasicInfoWidget);
    }

    if (showSelectionWidget != null) {
      if (!showSelectionWidget) {
        selectionRepository.deleteAllByCompany_Id(companyId);
      }
      company.setShowSelectionWidget(showSelectionWidget);
    }
  }

  // 企業の並び順を計算
  @Transactional
  private int calcCompanyPosition(
      Integer userId,
      Integer companyId,
      Integer priority,
      Company nextCompany
  ) {
    // 新規作成／並び順を指定せずに志望度を移動／志望度内で末尾に移動した場合
    if (nextCompany == null) {
      Integer previousPosition = companyRepository
          .findMaxPositionByUserIdAndPriority(userId, priority)
          .orElse(null);

      // 志望度内に企業がまだ存在しない場合
      if (previousPosition == null) {
        return 1000;
      }

      return previousPosition + 1000;
    }

    Integer nextPosition = nextCompany.getPosition();

    Integer previousPosition = companyRepository.findPreviousPosition(
        userId,
        priority,
        nextPosition,
        companyId
    ).orElse(null);

    // 先頭に移動した場合
    if (previousPosition == null) {
      return nextPosition - 1000;
    }

    // 2つの要素の間に移動した場合
    if (nextPosition - previousPosition > 1) {
      return previousPosition + (nextPosition - previousPosition) / 2;
    }

    // 再採番を行う場合
    reorderAll(userId, priority);

    Company refreshedNext = companyRepository
        .findById(nextCompany.getId())
        .orElseThrow();

    return calcCompanyPosition(
        userId,
        companyId,
        priority,
        refreshedNext
    );
  }

  // 志望度内の企業の並び順を再採番する
  private void reorderAll(
      Integer userId,
      Integer priority
  ) {
    List<Company> companies = companyRepository
        .findByUser_IdAndPriorityOrderByPositionAsc(userId, priority);

    int position = 1000;

    for (Company company : companies) {
      company.setPosition(position);
      position += 1000;
    }
  }
}
