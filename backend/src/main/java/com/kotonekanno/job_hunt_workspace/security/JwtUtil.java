package com.kotonekanno.job_hunt_workspace.security;

import com.kotonekanno.job_hunt_workspace.config.properties.JwtProperties;
import org.springframework.stereotype.Component;

import java.util.Date;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;

@Component
public class JwtUtil {

  private final String secret;
  private final long accessTokenExpiration;
  private final long refreshTokenExpiration;

  public JwtUtil(JwtProperties jwtProperties) {
    this.secret = jwtProperties.getSecret();
    this.accessTokenExpiration = jwtProperties.getAccessTokenExpiration();
    this.refreshTokenExpiration = jwtProperties.getRefreshTokenExpiration();
  }

  private Key getKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generateAccessToken(Integer userId) {
    return Jwts.builder()
        .setSubject(String.valueOf(userId))
        .claim("type", "access")
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
        .signWith(getKey())
        .compact();
  }

  public String generateRefreshToken(Integer userId) {
    return Jwts.builder()
        .setSubject(userId.toString())
        .claim("type", "refresh")
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
        .signWith(getKey())
        .compact();
  }

  public Integer extractUserId(String token) {
    return Integer.parseInt(Jwts.parserBuilder()
        .setSigningKey(getKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject());
  }

  public boolean validate(String token) {
    try {
      extractUserId(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public Claims parseToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }
}