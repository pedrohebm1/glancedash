package com.pedrohenrique.backend.model.workspace;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.pedrohenrique.backend.model.folder.Folder;
import com.pedrohenrique.backend.model.note.Note;
import com.pedrohenrique.backend.model.user.User;
import com.pedrohenrique.backend.model.workspace.workspacelog.WorkspaceLog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table
@Builder
@NoArgsConstructor 
@AllArgsConstructor 
@Getter
@Setter
public class Workspace {
    @Id
    @Builder.Default()
    private UUID id = UUID.randomUUID();
    private String name;
    private Integer workspaceVersion;
    @OneToMany(mappedBy = "workspace", fetch = FetchType.EAGER)
    private List<Note> notes;
    @OneToMany(mappedBy = "workspace", fetch = FetchType.EAGER)
    private List<Folder> folders;
    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;
    @ManyToMany
    @JoinTable(name = "user_workspace",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "workspace_id")
    )
    private List<User> users;
    @OneToMany(mappedBy = "workspace")
    private List<WorkspaceLog> logs;
}