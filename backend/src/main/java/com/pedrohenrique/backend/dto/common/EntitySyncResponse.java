package com.pedrohenrique.backend.dto.common;

import java.util.List;
import java.util.UUID;

import lombok.Builder;

@Builder
public record EntitySyncResponse<T>(
    List<T> created,
    List<T> updated,
    List<UUID> deleted
) {}
