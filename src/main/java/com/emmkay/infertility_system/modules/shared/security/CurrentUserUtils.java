package com.emmkay.infertility_system.modules.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class CurrentUserUtils {

    private CurrentUserUtils() {}

    public static CurrentUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return new CurrentUser(
                    jwt.getSubject(),
                    jwt.getClaimAsString("username"),
                    jwt.getClaimAsString("scope")
            );
        }
        return null;
    }

    public static String getCurrentUserId() {
        CurrentUser currentUser = getCurrentUser();
        return currentUser == null ? null : currentUser.id();
    }

    public static String getCurrentUsername() {
        CurrentUser user = getCurrentUser();
        return user != null ? user.username() : null;
    }

    public static String getCurrentScope() {
        CurrentUser user = getCurrentUser();
        return user != null ? user.scope() : null;
    }

    public record CurrentUser(String id, String username, String scope) {}
}
