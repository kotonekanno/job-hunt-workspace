package com.kotonekanno.job_hunt_workspace.repositories;

import com.kotonekanno.job_hunt_workspace.entities.Document;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@NullMarked
@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

  List<Document> findByUser_IdOrderByPositionAsc(Integer userId);

  Optional<Document> findByIdAndUser_Id(Integer documentId, Integer userId);
}
