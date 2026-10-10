package com.kotonekanno.job_hunt_workspace.services.application;

import com.example.api.model.AccessTokenResponse;
import com.example.api.model.AuthRequest;
import com.example.api.model.Register201Response;
import com.kotonekanno.job_hunt_workspace.dtos.auth.LoginResponse;
import com.kotonekanno.job_hunt_workspace.entities.User;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.AlreadyExistsException;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.InvalidCredentialsException;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotFoundException;
import com.kotonekanno.job_hunt_workspace.exceptions.custom.NotVerifiedException;
import com.kotonekanno.job_hunt_workspace.repositories.UserRepository;
import com.kotonekanno.job_hunt_workspace.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  public AuthService(
      JwtUtil jwtUtil,
      PasswordEncoder passwordEncoder,
      UserRepository userRepository
  ) {
    this.jwtUtil = jwtUtil;
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  // Register
  @Transactional
  public Register201Response register(AuthRequest request) {
    String email = request.getEmail();
    if (userRepository.findByEmail(email).isPresent()) {
      throw new AlreadyExistsException("Email already exists: " + email);
    }

    String encoded = passwordEncoder.encode(request.getPassword());

    User user = new User();
    user.setEmail(email);
    user.setPasswordHash(encoded);

    userRepository.save(user);

    return new Register201Response(user.getId());
  }

  // Log in
  public LoginResponse login(AuthRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new NotFoundException("User not found"));

    if (!user.getIsVerified()) {
      throw new NotVerifiedException("This account is not verified");
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new InvalidCredentialsException("Invalid email or password");
    }

    String accessToken = jwtUtil.generateAccessToken(user.getId());
    String refreshToken = jwtUtil.generateRefreshToken(user.getId());

    return new LoginResponse(accessToken, refreshToken);
  }

  // Refresh token
  public AccessTokenResponse refresh(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new InvalidCredentialsException("Refresh token is missing");
    }

    try {
      Claims claims = jwtUtil.parseToken(refreshToken);

      if (!"refresh".equals(claims.get("type"))) {
        throw new InvalidCredentialsException("Invalid token type");
      }

      Integer userId = Integer.valueOf(claims.getSubject());

      User user = userRepository.findById(userId)
          .orElseThrow(() -> new NotFoundException("User not found"));

      if (!user.getIsVerified()) {
        throw new NotFoundException("This account is not verified");
      }

      return new AccessTokenResponse(jwtUtil.generateAccessToken(userId));

    } catch (ExpiredJwtException e) {
      throw new InvalidCredentialsException("Refresh token expired");
    } catch (JwtException e) {
      throw new InvalidCredentialsException("Invalid refresh token");
    }
  }
}
