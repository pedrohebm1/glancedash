package com.pedrohenrique.backend.workspace;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.http.MediaType;

import com.pedrohenrique.backend.dto.auth.AuthenticationResponse;
import com.pedrohenrique.backend.dto.auth.RegisterUserDto;
import com.pedrohenrique.backend.dto.common.EntitySyncRequest;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.CreateWorkspaceResponse;
import com.pedrohenrique.backend.dto.workspace.UpdateWorkspaceRequest;
import com.pedrohenrique.backend.dto.workspace.sync.FolderRequest;
import com.pedrohenrique.backend.dto.workspace.sync.NoteRequest;
import com.pedrohenrique.backend.dto.workspace.sync.WorkspaceSyncRequest;
import com.pedrohenrique.backend.dto.workspace.sync.device.WorkspaceDeviceSyncRequest;

import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class WorkspaceControllerTestIT {
        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;

        private CreateWorkspaceResponse createWorkspace(String token) throws Exception {
                CreateWorkspaceRequest request = new CreateWorkspaceRequest(
                                UUID.randomUUID(),
                                "integration-workspace");

                MvcResult result = mockMvc.perform(post("/workspace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andReturn();

                return objectMapper.readValue(
                                result.getResponse().getContentAsString(),
                                CreateWorkspaceResponse.class);
        }

        private WorkspaceSyncRequest buildWorkspaceSyncRequest(UUID workspaceId, int version) {
                FolderRequest parentFolder = new FolderRequest(UUID.randomUUID(), "testFolder", null);
                FolderRequest nestedFolder = new FolderRequest(UUID.randomUUID(), "nestedTestFolder",
                                parentFolder.id());

                NoteRequest rootNote = new NoteRequest(UUID.randomUUID(), "testNote", "content", null, false);
                NoteRequest nestedNote = new NoteRequest(UUID.randomUUID(), "nestedNote", "content", nestedFolder.id(),
                                false);

                EntitySyncRequest<FolderRequest> folderSync = new EntitySyncRequest<>(
                                List.of(parentFolder, nestedFolder),
                                Collections.emptyList(),
                                Collections.emptyList());

                EntitySyncRequest<NoteRequest> noteSync = new EntitySyncRequest<>(
                                List.of(rootNote, nestedNote),
                                Collections.emptyList(),
                                Collections.emptyList());

                return new WorkspaceSyncRequest(workspaceId, version, noteSync, folderSync);
        }

        private String createTestUserReturnToken() throws Exception {
                RegisterUserDto userData = RegisterUserDto.builder()
                                .email("userteste@gmail.com")
                                .username("userteste")
                                .password("passwordteste123")
                                .build();

                MvcResult result = mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userData)))
                                .andExpect(status().isOk())
                                .andReturn();

                String responseBody = result.getResponse().getContentAsString();
                AuthenticationResponse response = objectMapper.readValue(responseBody, AuthenticationResponse.class);

                return response.token();
        }

        @Test
        public void createWorkspaceReturnOk() throws Exception {
                UUID id = UUID.randomUUID();
                String token = createTestUserReturnToken();
                CreateWorkspaceRequest request = new CreateWorkspaceRequest(id, "integration-workspace");

                mockMvc.perform(post("/workspace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.name").value("integration-workspace"));
        }

        @Test
        void createWorkspaceWithoutTokenShouldReturn401() throws Exception {

                CreateWorkspaceRequest request = new CreateWorkspaceRequest(UUID.randomUUID(), "workspace");

                mockMvc.perform(post("/workspace/")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void createWorkspaceWithInvalidTokenShouldReturn401() throws Exception {

                CreateWorkspaceRequest request = new CreateWorkspaceRequest(UUID.randomUUID(), "workspace");

                mockMvc.perform(post("/workspace/create")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer invalid-token")
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        public void updateWorkspace() throws Exception {
                UUID id = UUID.randomUUID();
                String token = createTestUserReturnToken();
                CreateWorkspaceRequest request = new CreateWorkspaceRequest(id, "integration-workspace");

                MvcResult creationResult = mockMvc.perform(post("/workspace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(request)))
                                .andReturn();

                String responseBody = creationResult.getResponse().getContentAsString();
                CreateWorkspaceResponse response = objectMapper.readValue(responseBody, CreateWorkspaceResponse.class);
                UpdateWorkspaceRequest updateRequest = new UpdateWorkspaceRequest("integration-workspace-v2");
                mockMvc.perform(put("/workspace/" + response.id())
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().is2xxSuccessful());
        }

        @Test
        void updateWorkspaceNotFoundShouldReturn404() throws Exception {

                String token = createTestUserReturnToken();

                UpdateWorkspaceRequest request = new UpdateWorkspaceRequest("novo");

                mockMvc.perform(put("/workspace/" + UUID.randomUUID())
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound());
        }

        @Test
        void updateWorkspaceWithoutTokenShouldReturn401() throws Exception {

                UpdateWorkspaceRequest request = new UpdateWorkspaceRequest("novo");

                mockMvc.perform(put("/workspace/" + UUID.randomUUID())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void updateWorkspaceWithInvalidTokenShouldReturn401() throws Exception {

                UpdateWorkspaceRequest request = new UpdateWorkspaceRequest("novo");

                mockMvc.perform(put("/workspace/" + UUID.randomUUID())
                                .header("Authorization", "Bearer invalid")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        public void deleteWorkspaceReturnSuccess() throws Exception {
                UUID id = UUID.randomUUID();
                String token = createTestUserReturnToken();
                CreateWorkspaceRequest request = new CreateWorkspaceRequest(id, "integration-workspace");

                MvcResult creationResult = mockMvc.perform(post("/workspace")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(request)))
                                .andReturn();

                String responseBody = creationResult.getResponse().getContentAsString();
                CreateWorkspaceResponse response = objectMapper.readValue(responseBody, CreateWorkspaceResponse.class);

                mockMvc.perform(delete("/workspace/" + response.id())
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().is2xxSuccessful());
        }

        @Test
        void deleteWorkspaceNotFoundShouldReturn404() throws Exception {

                String token = createTestUserReturnToken();

                mockMvc.perform(delete("/workspace/" + UUID.randomUUID())
                                .header("Authorization", "Bearer " + token))
                                .andExpect(status().isNotFound());
        }

        @Test
        void deleteWorkspaceWithoutTokenShouldReturn401() throws Exception {

                mockMvc.perform(delete("/workspace/" + UUID.randomUUID()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void deleteWorkspaceInvalidTokenShouldReturn401() throws Exception {

                mockMvc.perform(delete("/workspace/" + UUID.randomUUID())
                                .header("Authorization", "Bearer invalid"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getWorkspaceFullStructureShouldReturn200() throws Exception {

                String token = createTestUserReturnToken();

                CreateWorkspaceResponse workspace = createWorkspace(token);

                mockMvc.perform(get("/workspace/" + workspace.id() + "/structure")
                                .header("Authorization", "Bearer " + token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.workspaceId").exists())
                                .andExpect(jsonPath("$.version").exists())
                                .andExpect(jsonPath("$.notes").isArray())
                                .andExpect(jsonPath("$.folders").isArray());
        }

        @Test
        void syncDeviceShouldReturn200() throws Exception {

                String token = createTestUserReturnToken();

                CreateWorkspaceResponse workspace = createWorkspace(token);

                WorkspaceDeviceSyncRequest request = new WorkspaceDeviceSyncRequest(workspace.id(), 1);

                mockMvc.perform(get("/workspace/syncdevice")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.workspaceId").exists());
        }

        @Test
        @DisplayName("Deve sincronizar o workspace com sucesso e retornar status 204 No Content")
        void syncWorkspace_WithValidData_ShouldReturn204() throws Exception {
                String token = createTestUserReturnToken();
                CreateWorkspaceResponse workspace = createWorkspace(token);

                int version = 1;

                WorkspaceSyncRequest request = buildWorkspaceSyncRequest(workspace.id(), version);

                mockMvc.perform(post("/workspace/sync")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.id").value(workspace.id().toString()))
                                .andExpect(jsonPath("$.version").exists())
                                .andExpect(jsonPath("$.version").value(++version));
        }

        @Test
        @DisplayName("Deve sincronizar o workspace duas vezes com sucesso e retornar status 204")
        void syncWorkspaceTwice_WithValidData_ShouldReturn204() throws Exception {
                String token = createTestUserReturnToken();
                CreateWorkspaceResponse workspace = createWorkspace(token);

                for (int i = 1; i < 3; i++) {
                        WorkspaceSyncRequest syncRequest = buildWorkspaceSyncRequest(workspace.id(), i);

                        mockMvc.perform(post("/workspace/sync")
                                        .header("Authorization", "Bearer " + token)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(syncRequest)))
                                        .andExpect(jsonPath("$.id").exists())
                                        .andExpect(jsonPath("$.id").value(workspace.id().toString()))
                                        .andExpect(jsonPath("$.version").exists())
                                        .andExpect(jsonPath("$.version").value(++i))
                                        .andReturn();
                }
        }

        @Test
        void syncWorkspace_WithEmptySyncData_ShouldReturn400() throws Exception {
                String token = createTestUserReturnToken();
                CreateWorkspaceResponse workspace = createWorkspace(token);

                EntitySyncRequest<NoteRequest> emptyNotes = new EntitySyncRequest<>(List.of(), List.of(), List.of());
                EntitySyncRequest<FolderRequest> emptyFolders = new EntitySyncRequest<>(List.of(), List.of(),
                                List.of());
                WorkspaceSyncRequest request = new WorkspaceSyncRequest(
                                workspace.id(),
                                1,
                                emptyNotes,
                                emptyFolders);

                mockMvc.perform(post("/workspace/sync")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Deve retornar status 401 Unauthorized quando o token não for informado")
        void syncWorkspace_WithoutToken_ShouldReturn401() throws Exception {

                WorkspaceSyncRequest request = buildWorkspaceSyncRequest(UUID.randomUUID(), 2);

                mockMvc.perform(post("/workspace/sync")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Deve retornar status 400 Bad Request quando o payload for inválido ou nulo")
        void syncWorkspace_WithInvalidPayload_ShouldReturn400() throws Exception {
                String token = createTestUserReturnToken();

                mockMvc.perform(post("/workspace/sync")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest());
        }
}
