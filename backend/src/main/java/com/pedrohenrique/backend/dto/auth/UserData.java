package com.pedrohenrique.backend.dto.auth;

import lombok.Builder;

@Builder
public record UserData(Long userId, String email, String username) {
}
