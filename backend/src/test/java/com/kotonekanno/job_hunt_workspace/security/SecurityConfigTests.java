package com.kotonekanno.job_hunt_workspace.security;

import com.kotonekanno.job_hunt_workspace.config.properties.JwtProperties;
import jakarta.servlet.DispatcherType;
import com.kotonekanno.job_hunt_workspace.controllers.CompanyController;
import com.kotonekanno.job_hunt_workspace.services.CompanyService;
import com.example.api.model.GetCompaniesResponse;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringJUnitConfig(SecurityConfigTests.TestConfig.class)
@WebAppConfiguration
class SecurityConfigTests {
  @Autowired WebApplicationContext context;
  @Autowired JwtUtil jwtUtil;
  @Autowired CompanyService companyService;
  MockMvc mvc;

  @BeforeEach
  void setUp() { mvc = webAppContextSetup(context).apply(springSecurity()).build(); }

  @Test
  void validAccessTokenCanAccessMeAndProtectedResource() throws Exception {
    String token = jwtUtil.generateAccessToken(7);
    mvc.perform(get("/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
    mvc.perform(get("/test-resource").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
  }

  @Test
  void sameTokenReachesCompanyControllerWithUserId() throws Exception {
    when(companyService.getList(7)).thenReturn(new GetCompaniesResponse());
    String bearer = "Bearer " + jwtUtil.generateAccessToken(7);
    mvc.perform(get("/auth/me").header("Authorization", bearer)).andExpect(status().isOk());
    mvc.perform(get("/companies").header("authorization", bearer)).andExpect(status().isOk());
    verify(companyService).getList(7);
  }

  @Test
  void protectedResourceWithoutTokenStillRequiresLogin() throws Exception {
    mvc.perform(get("/test-resource")).andExpect(status().isUnauthorized());
    mvc.perform(get("/auth/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void errorDispatchPreservesServerErrorWithoutAuthenticationContext() throws Exception {
    mvc.perform(get("/error").with(request -> {
      request.setDispatcherType(DispatcherType.ERROR);
      return request;
    })).andExpect(status().isInternalServerError());
  }

  @Test
  void errorDispatchPreservesNotFoundStatus() throws Exception {
    mvc.perform(get("/error").param("status", "404").with(request -> {
      request.setDispatcherType(DispatcherType.ERROR);
      return request;
    })).andExpect(status().isNotFound());
  }

  @Test
  void directRequestToErrorEndpointIsNotPublic() throws Exception {
    mvc.perform(get("/error")).andExpect(status().isUnauthorized());
  }

  @Configuration
  @EnableWebMvc
  @Import({SecurityConfig.class, CompanyController.class})
  static class TestConfig {
    @Bean JwtUtil jwtUtil() {
      var properties = new JwtProperties();
      properties.setSecret("test-only-secret-012345678901234567890123456789");
      properties.setAccessTokenExpiration(60000);
      properties.setRefreshTokenExpiration(600000);
      return new JwtUtil(properties);
    }
    @Bean JwtFilter jwtFilter(JwtUtil util) { return new JwtFilter(util); }
    @Bean CompanyService companyService() { return mock(CompanyService.class); }
    @Bean TestController testController() { return new TestController(); }
  }

  @RestController
  static class TestController {
    @GetMapping({"/auth/me", "/test-resource"})
    ResponseEntity<Void> resource() { return ResponseEntity.ok().build(); }

    @GetMapping("/error")
    ResponseEntity<Void> error(jakarta.servlet.http.HttpServletRequest request) {
      return ResponseEntity.status("404".equals(request.getParameter("status")) ? 404 : 500).build();
    }
  }
}
