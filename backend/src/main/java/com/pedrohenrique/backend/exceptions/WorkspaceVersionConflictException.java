package com.pedrohenrique.backend.exceptions;

public class WorkspaceVersionConflictException extends RuntimeException {

    private final int clientVersion;
    private final int serverVersion;

    public WorkspaceVersionConflictException(int clientVersion, int serverVersion) {
        super("Workspace version mismatch.");
        this.clientVersion = clientVersion;
        this.serverVersion = serverVersion;
        System.out.println("Client version:"+clientVersion+",serverVersion:"+serverVersion);
    }

    public int getClientVersion() {
        return clientVersion;
    }

    public int getServerVersion() {
        return serverVersion;
    }
}