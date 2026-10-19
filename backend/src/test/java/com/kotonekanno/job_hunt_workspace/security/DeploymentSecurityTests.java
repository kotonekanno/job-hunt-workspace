package com.kotonekanno.job_hunt_workspace.security;

import com.kotonekanno.job_hunt_workspace.config.WebConfig;
import com.kotonekanno.job_hunt_workspace.config.properties.FrontendProperties;
import com.kotonekanno.job_hunt_workspace.config.properties.JwtProperties;
import com.kotonekanno.job_hunt_workspace.controllers.HealthController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringJUnitConfig(DeploymentSecurityTests.Config.class)
@WebAppConfiguration
class DeploymentSecurityTests {
  private static final String ORIGIN = "https://frontend.pages.dev";
  @Autowired WebApplicationContext context;
  private MockMvc mvc;

  @BeforeEach
  void setup() {
    mvc = webAppContextSetup(context).apply(springSecurity()).build();
  }

  @Test
  void allowsCredentialedPreflightFromFrontend() throws Exception {
    mvc.perform(options("/companies")
        .header("Origin", ORIGIN)
        .header("Access-Control-Request-Method", "POST")
        .header("Access-Control-Request-Headers", "authorization,content-type"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN))
        .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
  }

  @Test
  void rejectsUnconfiguredOrigin() throws Exception {
    mvc.perform(options("/companies")
        .header("Origin", "https://untrusted.example")
        .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
  }

  @Test
  void authenticationErrorsRemainReadableByFrontend() throws Exception {
    mvc.perform(get("/companies").header("Origin", ORIGIN))
        .andExpect(status().isUnauthorized())
        .andExpect(header().string("Access-Control-Allow-Origin", ORIGIN));
  }

  @Test
  void healthCheckDoesNotRequireLogin() throws Exception {
    mvc.perform(get("/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"));
  }

  @Configuration
  @EnableWebMvc
  @Import({SecurityConfig.class, WebConfig.class, HealthController.class})
  static class Config {
    @Bean FrontendProperties frontendProperties() {
      var properties = new FrontendProperties();
      properties.setFrontendUrl(ORIGIN);
      return properties;
    }

    @Bean JwtFilter jwtFilter() {
      var properties = new JwtProperties();
      properties.setSecret("deployment-test-only-secret-0123456789");
      return new JwtFilter(new JwtUtil(properties));
    }
  }
}
