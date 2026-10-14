package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.entities.Document;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.DocumentRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentService {

  private final DocumentRepository repository;
  private final UserRepository userRepository;

  public DocumentService(
      DocumentRepository repository,
      UserRepository userRepository
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  // 文書一覧を取得
  @Transactional(readOnly = true)
  public GetDocumentsResponse getAll(
      Integer userId
  ) {
    repository.findByUser_IdOrderByPositionAsc(userId);

    return new GetDocumentsResponse()
        .documents(
            repository.findByUser_IdOrderByPositionAsc(userId).stream()
                .map(document -> new DocumentListItem()
                    .id(document.getId())
                    .title(document.getTitle())
                )
                .toList()
        );
  }

  // 文書を追加
  @Transactional
  public CreateDocument201Response create(
      Integer userId,
      CreateDocumentRequest request
  ) {
    Document document = new Document();
    document.setUser(userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found")));

    int position = calcDocumentPosition(userId, null, null);
    document.setPosition(position);

    document.setTitle(request.getTitle());
    document.setText("");

    return new CreateDocument201Response(repository.save(document).getId());
  }

  // 文書を取得
  @Transactional(readOnly = true)
  public com.example.api.model.Document get(
      Integer userId,
      Integer documentId
  ) {
    Document document = repository.findByIdAndUser_Id(documentId, userId)
        .orElseThrow(() -> new NotFoundException("Document not found"));

    return new com.example.api.model.Document()
        .title(document.getTitle())
        .text(document.getText());
  }

  // 文書を部分更新
  @Transactional
  public void update(
      Integer userId,
      Integer documentId,
      UpdateDocumentRequest request
  ) {
    Document document = repository.findByIdAndUser_Id(documentId, userId)
        .orElseThrow(() -> new NotFoundException("Document not found"));

    if (request.getTitle() != null) {
      document.setTitle(request.getTitle());
    }

    if (request.getText() != null) {
      document.setText(request.getText());
    }

    repository.save(document);
  }

  // 文書を削除
  @Transactional
  public void delete(
      Integer userId,
      Integer documentId
  ) {
    Document document = repository.findByIdAndUser_Id(documentId, userId)
        .orElseThrow(() -> new NotFoundException("Document not found"));

    repository.delete(document);
  }

  // 文書の並び順を更新
  @Transactional
  public void reorder(
      Integer userId,
      Integer documentId,
      ReorderDocumentRequest request
  ) {
    Document document = repository.findByIdAndUser_Id(documentId, userId)
        .orElseThrow(() -> new NotFoundException("Document not found"));

    Document nextDocument = null;
    if (request.getNextDocumentId() != null) {
      nextDocument = repository
          .findById(request.getNextDocumentId())
          .orElseThrow(() -> new NotFoundException("Document not found"));
    }

    int newPosition = calcDocumentPosition(
        userId,
        documentId,
        nextDocument
    );

    document.setPosition(newPosition);
    repository.save(document);
  }

  // ドキュメントの並び順を計算する
  private int calcDocumentPosition(
      Integer userId,
      Integer documentId,
      Document nextDocument
  ) {
    // 新規作成／末尾に移動した場合
    if (nextDocument == null) {
      Integer previousPosition = repository
          .findMaxPositionByUserId(userId)
          .orElse(null);

      // ドキュメントがまだ存在しない場合
      if (previousPosition == null) {
        return 1000;
      }

      return previousPosition + 1000;
    }

    Integer nextPosition = nextDocument.getPosition();

    Integer previousPosition = repository.findPreviousPosition(
        userId,
        nextPosition,
        documentId
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
    reorderAll(userId);

    Document refreshedNext = repository
        .findById(nextDocument.getId())
        .orElseThrow();

    return calcDocumentPosition(userId, documentId, refreshedNext);
  }

  // ドキュメントの並び順を再採番する
  private void reorderAll(
      Integer userId
  ) {
    List<Document> documents = repository
        .findByUser_IdOrderByPositionAsc(userId);

    int position = 1000;

    for (Document document : documents) {
      document.setPosition(position);
      position += 1000;
    }
  }
}
