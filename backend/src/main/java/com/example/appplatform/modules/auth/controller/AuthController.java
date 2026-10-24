package com.example.appplatform.modules.auth.controller;

import com.example.appplatform.common.exception.ValidationException;
import com.example.appplatform.common.response.ApiResponse;
import com.example.appplatform.config.AppProperties;
import com.example.appplatform.modules.auth.dto.LoginRequest;
import com.example.appplatform.modules.auth.dto.LoginResponse;
import com.example.appplatform.modules.auth.service.AuthService;
import com.example.appplatform.modules.users.model.Role;
import com.example.appplatform.modules.users.model.User;
import com.example.appplatform.modules.users.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, logout, token refresh")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @PostMapping("/login")
    @Operation(summary = "Log in and receive auth cookies")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.ok(loginResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out and clear auth cookies")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication auth) {
        String userId = auth != null ? (String) auth.getPrincipal() : null;
        authService.logout(request, response, userId);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh cookie")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        LoginResponse refreshed = authService.refreshTokens(request, response);
        return ResponseEntity.ok(ApiResponse.ok(refreshed));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<LoginResponse>> me(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ValidationException("User not found"));
        LoginResponse dto = LoginResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .role(user.getRole().name())
            .build();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    /**
     * One-time setup endpoint to create the initial Super Admin.
     * Protected by a setup secret — not authenticated via JWT.
     * Should be disabled or removed after first admin is created.
     */
    @PostMapping("/setup")
    @Operation(summary = "Create the first Super Admin (one-time setup)")
    public ResponseEntity<ApiResponse<String>> setup(@RequestBody Map<String, String> body) {
        String setupSecret = body.get("setupSecret");
        if (!appProperties.getAdmin().getSetupSecret().equals(setupSecret)) {
            throw new ValidationException("Invalid setup secret");
        }

        String email = body.get("email");
        String password = body.get("password");
        String displayName = body.getOrDefault("displayName", "Super Admin");

        if (userRepository.existsByEmail(email)) {
            throw new ValidationException("Email already registered");
        }

        User superAdmin = new User();
        superAdmin.setEmail(email);
        superAdmin.setPasswordHash(passwordEncoder.encode(password));
        superAdmin.setDisplayName(displayName);
        superAdmin.setRole(Role.SUPER_ADMIN);
        userRepository.save(superAdmin);

        return ResponseEntity.ok(ApiResponse.ok("Super Admin created successfully"));
    }
}
 