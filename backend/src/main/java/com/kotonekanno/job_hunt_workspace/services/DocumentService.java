package com.kotonekanno.job_hunt_workspace.services;

import com.example.api.model.*;
import com.kotonekanno.job_hunt_workspace.entities.Document;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.repositories.DocumentRepository;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    document.setTitle(request.getTitle());

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
}
