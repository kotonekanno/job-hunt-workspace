package com.kotonekanno.job_hunt_workspace.controllers;

import com.example.api.model.AccessTokenResponse;
import com.example.api.model.AuthRequest;
import com.example.api.model.Register201Response;
import com.kotonekanno.job_hunt_workspace.config.properties.CookieProperties;
import com.kotonekanno.job_hunt_workspace.config.properties.JwtProperties;
import com.kotonekanno.job_hunt_workspace.dtos.auth.LoginResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.kotonekanno.job_hunt_workspace.services.application.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final boolean secure;
  private final String sameSite;
  private final long refreshTokenExpiration;

  public AuthController(
      AuthService authService,
      CookieProperties cookieProperties,
      JwtProperties jwtProperties
  ) {
    this.authService = authService;
    this.secure = cookieProperties.getSecure();
    this.sameSite = cookieProperties.getSameSite();
    this.refreshTokenExpiration = jwtProperties.getRefreshTokenExpiration();
  }

  // Register
  @PostMapping("/register")
  public ResponseEntity<Register201Response> register(@RequestBody AuthRequest request) {
    return ResponseEntity.status(201)
        .body(authService.register(request));
  }

  // Log In
  @PostMapping("/login")
  public ResponseEntity<AccessTokenResponse> login(
      @RequestBody AuthRequest request,
      HttpServletResponse response
  ) {
    LoginResponse tokens = authService.login(request);

    ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens.refreshToken())
        .httpOnly(true)
        .secure(secure)
        .path("/auth/refresh")
        .maxAge(refreshTokenExpiration)
        .sameSite(sameSite)
        .build();

    response.addHeader("Set-Cookie", cookie.toString());

    return ResponseEntity.ok(new AccessTokenResponse(tokens.accessToken()));
  }

  // Log out
  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletResponse response) {

    ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
        .httpOnly(true)
        .secure(secure)
        .path("/auth/refresh")
        .maxAge(0)
        .sameSite(sameSite)
        .build();

    response.addHeader("Set-Cookie", cookie.toString());

    return ResponseEntity.noContent().build();
  }

  // me
  @GetMapping("/me")
  public ResponseEntity<Void> getCurrentUser(
      @AuthenticationPrincipal Integer userId
  ) {
    if (userId == null) {
      return ResponseEntity.status(401).build();
    }
    return ResponseEntity.ok().build();
  }

  // Refresh token
  @PostMapping("/refresh")
  public ResponseEntity<AccessTokenResponse> refresh(
      @CookieValue(value = "refreshToken", required = false) String refreshToken
  ) {
    return ResponseEntity.ok(authService.refresh(refreshToken));
  }
}
