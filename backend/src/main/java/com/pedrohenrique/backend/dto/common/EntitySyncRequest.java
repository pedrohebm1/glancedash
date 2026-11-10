package com.pedrohenrique.backend.dto.common;

import java.util.List;
import java.util.UUID;

public record EntitySyncRequest<T>(
    List<T> created,
    List<T> updated,
    List<UUID> deleted
) {
    public boolean isEmpty() {
        boolean isCreatedEmpty = created == null || created.isEmpty();
        boolean isUpdatedEmpty = updated == null || updated.isEmpty();
        boolean isDeletedEmpty = deleted == null || deleted.isEmpty();

        return isCreatedEmpty && isUpdatedEmpty && isDeletedEmpty;
    }
}
