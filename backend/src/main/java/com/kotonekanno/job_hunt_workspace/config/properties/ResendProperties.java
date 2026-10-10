package com.kotonekanno.job_hunt_workspace.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "resend")
@Getter
@Setter
public class ResendProperties {
  private String apiKey;
}
