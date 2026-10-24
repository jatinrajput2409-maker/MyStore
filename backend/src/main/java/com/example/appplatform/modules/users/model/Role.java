package com.example.appplatform.modules.users.model;

/**
 * Role hierarchy: SUPER_ADMIN > ADMIN > EDITOR > VIEWER
 * Method-level security in controllers uses @PreAuthorize("hasRole('ADMIN')")
 * which will match ADMIN and any role that extends it in the hierarchy.
 * However, since we use flat role checks in JWT claims, we compare strings explicitly.
 */
public enum Role {
    SUPER_ADMIN,
    ADMIN,
    EDITOR,
    VIEWER
}
