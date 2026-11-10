import { Stack } from 'expo-router';
import React from 'react';


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="[workspaceId]/index"
        options={{
          title: "Workspace",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="[workspaceId]/[noteId]/index"
        options={{
          title: "Note",
          headerShown: false
        }}
      />
    </Stack>
  )
}