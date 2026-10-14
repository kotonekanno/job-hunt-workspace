package com.kotonekanno.job_hunt_workspace.security;

import com.kotonekanno.job_hunt_workspace.config.properties.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class JwtFilterTests {

  private static final String SECRET = "test-only-secret-012345678901234567890123456789";
  private final JwtUtil jwtUtil = jwtUtil(SECRET);
  private final JwtFilter filter = new JwtFilter(jwtUtil);

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void authenticatesAccessToken() throws Exception {
    filter(jwtUtil.generateAccessToken(7));

    var authentication = SecurityContextHolder.getContext().getAuthentication();
    assertNotNull(authentication);
    assertEquals(7, authentication.getPrincipal());
    assertTrue(authentication.isAuthenticated());
  }

  @Test
  void rejectsRefreshTokenWithoutBreakingRefreshTokenParsing() throws Exception {
    String token = jwtUtil.generateRefreshToken(7);

    filter(token);

    assertNull(SecurityContextHolder.getContext().getAuthentication());
    assertEquals("refresh", jwtUtil.parseToken(token).get("type"));
  }

  @Test
  void rejectsTokenWithoutType() throws Exception {
    filter(signedToken(null, "7", System.currentTimeMillis() + 60000));

    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  void rejectsExpiredAccessToken() throws Exception {
    filter(signedToken("access", "7", System.currentTimeMillis() - 60000));

    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  void rejectsInvalidSignature() throws Exception {
    filter(jwtUtil("another-test-secret-012345678901234567890123456789")
        .generateAccessToken(7));

    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  void rejectsMalformedToken() throws Exception {
    filter("not-a-jwt");

    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  @Test
  void rejectsNonNumericSubject() throws Exception {
    filter(signedToken("access", "not-an-id", System.currentTimeMillis() + 60000));

    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }

  private void filter(String token) throws Exception {
    var request = new MockHttpServletRequest("GET", "/auth/me");
    request.addHeader("Authorization", "Bearer " + token);
    var chainCalled = new AtomicBoolean();

    filter.doFilter(request, new MockHttpServletResponse(),
        (req, res) -> chainCalled.set(true));

    assertTrue(chainCalled.get());
  }

  private String signedToken(String type, String subject, long expiresAt) {
    return Jwts.builder()
        .setSubject(subject)
        .claim("type", type)
        .setExpiration(new Date(expiresAt))
        .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
        .compact();
  }

  private static JwtUtil jwtUtil(String secret) {
    var properties = new JwtProperties();
    properties.setSecret(secret);
    properties.setAccessTokenExpiration(60000);
    properties.setRefreshTokenExpiration(600000);
    return new JwtUtil(properties);
  }
}
