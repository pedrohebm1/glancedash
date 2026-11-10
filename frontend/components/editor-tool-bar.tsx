import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { KeyboardToolbar } from 'react-native-keyboard-controller';

type StyleType = 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'list' | 'code';

interface EditorToolbarProps {
  onApplyStyle: (type: StyleType) => void;
  activeStyles?: StyleType[];
}

const TOOLBAR_ITEMS: { id: StyleType; label: string; icon: keyof typeof Feather.glyphMap; isCustomText?: boolean }[] = [
  { id: 'bold', label: 'B', icon: 'bold' },
  { id: 'italic', label: 'I', icon: 'italic' },
  { id: 'h1', label: 'H1', icon: 'type', isCustomText: true },
  { id: 'h2', label: 'H2', icon: 'type', isCustomText: true },
  { id: 'h3', label: 'H3', icon: 'type', isCustomText: true },
  { id: 'list', label: 'List', icon: 'list' },
  { id: 'code', label: 'Code', icon: 'code' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onApplyStyle, activeStyles = [] }) => {
  return (
    <KeyboardToolbar
      showArrows={false}
      content={
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.toolbarContainer}
        >
          {TOOLBAR_ITEMS.map((item) => {
            const isActive = activeStyles.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[styles.toolButton, isActive && styles.activeToolButton]}
                onPress={() => onApplyStyle(item.id)}
              >
                {item.isCustomText ? (
                  <Text style={[styles.textIcon, isActive && styles.activeTextIcon]}>
                    {item.label}
                  </Text>
                ) : (
                  <Feather
                    name={item.icon}
                    size={16}
                    color={isActive ? '#007AFF' : '#4A5568'}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      }
    />
  );
};

const styles = StyleSheet.create({
  keyboardToolbar: {
    backgroundColor: '#F8F9FA',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeToolButton: {
    backgroundColor: '#EBF5FF',
    borderColor: '#007AFF',
  },
  textIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  activeTextIcon: {
    color: '#007AFF',
  },
});