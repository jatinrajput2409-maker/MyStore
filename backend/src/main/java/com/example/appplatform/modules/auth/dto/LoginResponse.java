package com.example.appplatform.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Returned by the login endpoint. Does NOT include the token string itself —
 * the tokens are set as HttpOnly cookies. This response gives the client
 * the user metadata it needs to display the admin UI.
 */
@Data
@Builder
public class LoginResponse {
    private String userId;
    private String email;
    private String displayName;
    private String role;
}
