package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.entities.Company;
import com.kotonekanno.job_hunt_workspace.entities.Essay;
import com.kotonekanno.job_hunt_workspace.entities.EssayGroup;
import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.CompanyRepository;
import com.kotonekanno.job_hunt_workspace.repositories.EssayGroupRepository;
import com.kotonekanno.job_hunt_workspace.repositories.EssayRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class EssayService {

  private final EssayRepository essayRepository;
  private final EssayGroupRepository essayGroupRepository;
  private final UserRepository userRepository;
  private final CompanyRepository companyRepository;

  public EssayService(
      EssayRepository essayRepository,
      EssayGroupRepository essayGroupRepository,
      UserRepository userRepository,
      CompanyRepository companyRepository
  ) {
    this.essayRepository = essayRepository;
    this.essayGroupRepository = essayGroupRepository;
    this.userRepository = userRepository;
    this.companyRepository = companyRepository;
  }

  // ESグループ一覧を取得
  @Transactional(readOnly = true)
  public GetEssayGroupsResponse getEssayGroups(
      Integer userId
  ) {
    List<EssayGroup> essayGroups =
        essayGroupRepository.findByUser_IdOrderByPositionAsc(userId);

    Map<Integer, Long> countMap = essayRepository
        .countByEssayGroup(userId)
        .stream()
        .collect(Collectors.toMap(
            row -> (Integer) row[0],
            row -> (Long) row[1]
        ));

    return new GetEssayGroupsResponse()
        .essayGroups(
            Stream.concat(
                essayGroups.stream()
                    .map(essayGroup -> new EssayGroupListItem()
                        .id(essayGroup.getId())
                        .name(essayGroup.getName())
                        .quantity(
                            countMap.getOrDefault(essayGroup.getId(), 0L).intValue()
                        )
                    ),
                Stream.of(new EssayGroupListItem()
                    .name("未分類")
                    .quantity(
                        Math.toIntExact(
                            essayRepository.countByUser_IdAndEssayGroupIdNull(userId)
                        )
                    )
                )
            ).toList()
        );
  }

  // ESグループを追加
  @Transactional
  public CreateEssayGroup201Response createEssayGroup(
      Integer userId,
      CreateEssayGroupRequest request
  ) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found"));

    int position = calcEssayGroupPosition(
        userId,
        null,
        null
    );

    EssayGroup essayGroup = new EssayGroup();
    essayGroup.setUser(user);
    essayGroup.setPosition(position);
    essayGroup.setName(request.getName());

    return new CreateEssayGroup201Response(
        essayGroupRepository.save(essayGroup).getId()
    );
  }

  // ESグループを部分更新
  @Transactional
  public void updateEssayGroup(
      Integer userId,
      Integer essayGroupId,
      UpdateEssayGroupRequest request
  ) {
    EssayGroup essayGroup = essayGroupRepository
        .findByIdAndUser_Id(essayGroupId, userId)
        .orElseThrow(() -> new NotFoundException("Essay group not found"));

    essayGroup.setName(request.getName());

    essayGroupRepository.save(essayGroup);
  }

  // ESグループを削除
  @Transactional
  public void deleteEssayGroup(
      Integer userId,
      Integer essayGroupId
  ) {
    EssayGroup essayGroup = essayGroupRepository
        .findByIdAndUser_Id(essayGroupId, userId)
        .orElseThrow(() -> new NotFoundException("Essay group not found"));

    essayGroupRepository.delete(essayGroup);
  }

  // ES一覧を取得
  @Transactional(readOnly = true)
  public GetEssaysResponse getEssays(
      Integer userId,
      Integer essayGroupId
  ) {
    if (essayGroupId == null) {
      return new GetEssaysResponse(
          essayRepository.findByUser_IdAndEssayGroupIsNull(userId).stream()
              .map(essay -> new com.example.api.model.Essay()
                  .id(essay.getId())
                  .companyName(essay.getCompany() == null ? null : essay.getCompany().getName())
                  .question(essay.getQuestion())
                  .answer(essay.getAnswer())
              )
              .toList()
      );
    }

    return new GetEssaysResponse(
        essayRepository.findByEssayGroup_IdAndUser_Id(essayGroupId, userId).stream()
            .map(essay -> new com.example.api.model.Essay()
                .id(essay.getId())
                .companyName(essay.getCompany() == null ? null : essay.getCompany().getName())
                .question(essay.getQuestion())
                .answer(essay.getAnswer())
            )
            .toList()
    );
  }

  // ESグループの並び順を更新
  @Transactional
  public void reorderEssayGroups(
      Integer userId,
      Integer essayGroupId,
      ReorderEssayGroupRequest request
  ) {
    EssayGroup essayGroup = essayGroupRepository
        .findByIdAndUser_Id(essayGroupId, userId)
        .orElseThrow(() -> new NotFoundException("Essay group not found"));

    EssayGroup nextEssayGroup = null;
    if (request.getNextEssayGroupId() != null) {
      nextEssayGroup = essayGroupRepository
          .findById(request.getNextEssayGroupId())
          .orElseThrow(() -> new NotFoundException("Essay group not found"));
    }

    int newPosition = calcEssayGroupPosition(
        userId,
        essayGroupId,
        nextEssayGroup
    );

    essayGroup.setPosition(newPosition);
    essayGroupRepository.save(essayGroup);
  }

  // ESを追加
  @Transactional
  public void createEssay(
      Integer userId,
      Integer essayGroupId,
      CreateEssayRequest request
  ) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found"));

    EssayGroup essayGroup = null;
    if (essayGroupId != null) {
      essayGroup = essayGroupRepository
          .findById(essayGroupId)
          .orElseThrow(() -> new NotFoundException("EssayGroup not found"));
    }

    Company company = null;
    if (request.getCompanyId() != null) {
      company = companyRepository.findById(request.getCompanyId())
          .orElseThrow(() -> new NotFoundException("Company not found"));
    }

    Essay essay = new Essay();
    essay.setUser(user);
    essay.setCompany(company);
    essay.setEssayGroup(essayGroup);
    essay.setQuestion(request.getQuestion());
    essay.setAnswer(request.getAnswer());

    essayRepository.save(essay);
  }

  // ESを部分更新
  @Transactional
  public void updateEssay(
      Integer userId,
      Integer essayId,
      UpdateEssayRequest request
  ) {
    Essay essay = essayRepository
        .findById_User_Id(essayId, userId)
        .orElseThrow(() -> new NotFoundException("Essay not found"));

    if(request.getQuestion() != null) {
      essay.setQuestion(request.getQuestion());
      return;
    }

    if(request.getAnswer() != null) {
      essay.setAnswer(request.getAnswer());
      return;
    }

    Company company = null;
    if (request.getCompanyId() != null) {
      company =  companyRepository.findById(request.getCompanyId())
          .orElseThrow(() -> new NotFoundException("Company not found"));
    }

    essay.setCompany(company);
  }

  // ESを削除
  @Transactional
  public void deleteEssay(
      Integer userId,
      Integer essayId
  ) {
    Essay essay = essayRepository
        .findById_User_Id(essayId, userId)
        .orElseThrow(() -> new NotFoundException("Essay not found"));

    essayRepository.delete(essay);
  }

  // ESグループの並び順を計算する
  private int calcEssayGroupPosition(
      Integer userId,
      Integer essayGroupId,
      EssayGroup nextEssayGroup
  ) {
    // 新規作成した場合／末尾に移動した場合
    if (nextEssayGroup == null) {
      Integer previousPosition = essayGroupRepository
          .findMaxPositionByUser_Id(userId)
          .orElse(null);

      // ESグループがまだ存在しない場合
      if (previousPosition == null) {
        return 1000;
      }

      return previousPosition + 1000;
    }

    Integer nextPosition = nextEssayGroup.getPosition();

    Integer previousPosition = essayGroupRepository.findPreviousPosition(
        userId,
        nextPosition,
        essayGroupId
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
    reorderAllEssayGroups(userId);

    EssayGroup refreshedNext = essayGroupRepository
        .findById(nextEssayGroup.getId())
        .orElseThrow();

    return calcEssayGroupPosition(
        userId,
        essayGroupId,
        refreshedNext
    );
  }

  // ESグループの並び順を再採番する
  private void reorderAllEssayGroups(
      Integer userId
  ) {
    List<EssayGroup> essayGroups = essayGroupRepository
        .findByUser_IdOrderByPositionAsc(userId);

    int position = 1000;

    for (EssayGroup group : essayGroups) {
      group.setPosition(position);
      position += 1000;
    }
  }
}
