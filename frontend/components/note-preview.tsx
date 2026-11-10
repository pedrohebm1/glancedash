import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface NotePreviewProps {
    content: string;
    onPress: () => void;
}

export const NotePreview: React.FC<NotePreviewProps> = ({ content, onPress }) => {
    const color = useTheme()

    const markdownStyles = {
        heading1: { fontSize: 26, color: color.text, marginBottom: 10 },
        heading2: { fontSize: 22, color: color.text, marginBottom: 8 },
        body: { fontSize: 16, color: color.text, lineHeight: 24 },
        strong: { fontWeight: 'bold' as const },
    };
    
    return (
        <ScrollView
            style={styles.previewContainer}
            contentContainerStyle={styles.previewContentContainer}
            onTouchEnd={onPress}
        >
            <Markdown style={markdownStyles}>
                {content || '_Toque em qualquer lugar para editar..._'}
            </Markdown>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
    },
    previewContentContainer: {
        flexGrow: 1,
        padding: 16,
    },
});