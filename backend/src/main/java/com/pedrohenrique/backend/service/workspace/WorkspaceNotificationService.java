package com.pedrohenrique.backend.service.workspace;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.pedrohenrique.backend.service.workspace.dto.NotificationPayload;

@Service
public class WorkspaceNotificationService {
    private final Map<UUID, List<SseEmitter>> workspaceEmitters = new HashMap<>();

    public SseEmitter initiateConnection(UUID workspaceId) {
        SseEmitter emitter = new SseEmitter(1800_00L);
        workspaceEmitters.computeIfAbsent(workspaceId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        emitter.onCompletion(() -> removeEmitter(workspaceId, emitter));
        emitter.onTimeout(() -> removeEmitter(workspaceId, emitter));
        emitter.onError((e) -> removeEmitter(workspaceId, emitter));
        return emitter;
    }

    public void broadcastNotification(UUID workspaceId, NotificationPayload message) {
        List<SseEmitter> emitters = workspaceEmitters.get(workspaceId);
        if (emitters == null) return;

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emmiter : emitters) {
            try {
                emmiter.send(SseEmitter.event()
                    .name("workspace-message")
                    .data(message)
            );
            } catch (IOException e) {
                deadEmitters.add(emmiter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    private void removeEmitter(UUID workspaceId, SseEmitter emitter) {
        List<SseEmitter> emitters = workspaceEmitters.get(workspaceId);
        if (emitter != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                workspaceEmitters.remove(workspaceId);
            }
        }
    }
}