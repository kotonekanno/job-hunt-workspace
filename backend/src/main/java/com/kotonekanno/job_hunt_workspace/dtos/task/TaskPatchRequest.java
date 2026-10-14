package com.kotonekanno.job_hunt_workspace.dtos.task;

import com.example.api.model.UpdateTaskRequest;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.time.LocalDate;

// 生成DTOでは区別できない、プロパティの省略と明示的なnullを記録する
public class TaskPatchRequest extends UpdateTaskRequest {

  private boolean companyIdPresent;
  private boolean notePresent;
  private boolean deadlinePresent;

  @Override
  @JsonSetter("companyId")
  public void setCompanyId(Integer companyId) {
    companyIdPresent = true;
    super.setCompanyId(companyId);
  }

  @Override
  public TaskPatchRequest companyId(Integer companyId) {
    setCompanyId(companyId);
    return this;
  }

  public boolean hasCompanyId() {
    return companyIdPresent;
  }

  @Override
  @JsonSetter("note")
  public void setNote(String note) {
    notePresent = true;
    super.setNote(note);
  }

  @Override
  public TaskPatchRequest note(String note) {
    setNote(note);
    return this;
  }

  public boolean hasNote() {
    return notePresent;
  }

  @Override
  @JsonSetter("deadline")
  public void setDeadline(LocalDate deadline) {
    deadlinePresent = true;
    super.setDeadline(deadline);
  }

  @Override
  public TaskPatchRequest deadline(LocalDate deadline) {
    setDeadline(deadline);
    return this;
  }

  public boolean hasDeadline() {
    return deadlinePresent;
  }
}
