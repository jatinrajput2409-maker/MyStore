package com.example.appplatform.modules.users.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    /** BCrypt-hashed password. Never stored in plain text. */
    private String passwordHash;

    private String displayName;

    private Role role;

    private UserStatus status = UserStatus.ACTIVE;

    private Instant lastLoginAt;

    private int failedLoginAttempts = 0;

    private Instant lockedUntil;

    /**
     * Hashed refresh tokens stored server-side for revocation.
     * We only store hashes — never raw refresh token values.
     * A refresh token is valid only if its hash exists in this list.
     */
    private List<String> refreshTokenHashes = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
