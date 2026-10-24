package com.example.appplatform.modules.auth.service;

import com.example.appplatform.common.exception.ValidationException;
import com.example.appplatform.common.util.ChecksumUtils;
import com.example.appplatform.config.AppProperties;
import com.example.appplatform.modules.auth.dto.LoginRequest;
import com.example.appplatform.modules.auth.dto.LoginResponse;
import com.example.appplatform.modules.users.model.User;
import com.example.appplatform.modules.users.model.UserStatus;
import com.example.appplatform.modules.users.repository.UserRepository;
import com.example.appplatform.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final String ACCESS_COOKIE = "access_token";
    private static final String REFRESH_COOKIE = "refresh_token";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;

    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ValidationException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ValidationException("Account is disabled");
        }

        // Check account lockout
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new ValidationException(
                "Account temporarily locked. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            recordFailedAttempt(user);
            throw new ValidationException("Invalid email or password");
        }

        // Successful login — reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());

        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        // Store hash of refresh token for revocation checks
        String tokenHash = ChecksumUtils.sha256Hex(refreshToken);
        user.getRefreshTokenHashes().add(tokenHash);
        // Keep at most 5 refresh tokens per user (e.g., 5 devices)
        if (user.getRefreshTokenHashes().size() > 5) {
            user.getRefreshTokenHashes().remove(0);
        }

        userRepository.save(user);

        // Set HttpOnly cookies — tokens never exposed to JavaScript
        setAccessTokenCookie(response, accessToken);
        setRefreshTokenCookie(response, refreshToken);

        log.info("User logged in: {}", user.getEmail());

        return LoginResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .role(user.getRole().name())
            .build();
    }

    public LoginResponse refreshTokens(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractCookieValue(request, REFRESH_COOKIE);
        if (refreshToken == null) {
            throw new ValidationException("Refresh token is missing");
        }

        var claims = jwtTokenProvider.validateToken(refreshToken);
        if (claims == null || !jwtTokenProvider.isRefreshToken(claims)) {
            throw new ValidationException("Invalid refresh token");
        }

        String userId = jwtTokenProvider.extractUserId(claims);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ValidationException("User not found"));

        // Validate that this refresh token hash is stored (not revoked)
        String tokenHash = ChecksumUtils.sha256Hex(refreshToken);
        if (!user.getRefreshTokenHashes().contains(tokenHash)) {
            log.warn("Refresh token reuse detected for user: {}", user.getEmail());
            // Revoke all tokens as a security measure
            user.getRefreshTokenHashes().clear();
            userRepository.save(user);
            throw new ValidationException("Refresh token has been revoked");
        }

        // Rotate refresh token
        user.getRefreshTokenHashes().remove(tokenHash);

        String newAccessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        String newTokenHash = ChecksumUtils.sha256Hex(newRefreshToken);
        user.getRefreshTokenHashes().add(newTokenHash);
        userRepository.save(user);

        setAccessTokenCookie(response, newAccessToken);
        setRefreshTokenCookie(response, newRefreshToken);

        return LoginResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .role(user.getRole().name())
            .build();
    }

    public void logout(HttpServletRequest request, HttpServletResponse response, String userId) {
        String refreshToken = extractCookieValue(request, REFRESH_COOKIE);
        if (refreshToken != null) {
            userRepository.findById(userId).ifPresent(user -> {
                String tokenHash = ChecksumUtils.sha256Hex(refreshToken);
                user.getRefreshTokenHashes().remove(tokenHash);
                userRepository.save(user);
            });
        }

        clearCookie(response, ACCESS_COOKIE);
        clearCookie(response, REFRESH_COOKIE);
    }

    private void recordFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= appProperties.getSecurity().getLoginMaxAttempts()) {
            user.setLockedUntil(Instant.now().plusSeconds(
                appProperties.getSecurity().getLoginLockoutMinutes() * 60L));
            log.warn("Account locked due to too many failed attempts: {}", user.getEmail());
        }
        userRepository.save(user);
    }

    private void setAccessTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(ACCESS_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (appProperties.getJwt().getAccessTokenExpiryMs() / 1000));
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/auth/refresh");  // Scoped to refresh endpoint only
        cookie.setMaxAge((int) (appProperties.getJwt().getRefreshTokenExpiryMs() / 1000));
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}
