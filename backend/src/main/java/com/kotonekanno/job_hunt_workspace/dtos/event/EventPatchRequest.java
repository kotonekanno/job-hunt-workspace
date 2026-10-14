package com.kotonekanno.job_hunt_workspace.dtos.event;

import com.example.api.model.UpdateEventRequest;
import com.fasterxml.jackson.annotation.JsonSetter;

// 生成DTOでは区別できない、companyIdの省略と明示的なnullを記録する。
public class EventPatchRequest extends UpdateEventRequest {

  private boolean companyIdPresent;

  @Override
  @JsonSetter("companyId")
  public void setCompanyId(Integer companyId) {
    companyIdPresent = true;
    super.setCompanyId(companyId);
  }

  @Override
  public EventPatchRequest companyId(Integer companyId) {
    setCompanyId(companyId);
    return this;
  }

  public boolean hasCompanyId() {
    return companyIdPresent;
  }
}
