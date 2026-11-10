import { type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ThemedSafeAreaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSafeAreaView({ style, lightColor, darkColor, ...otherProps }: ThemedSafeAreaViewProps) {
  const backgroundColor = useThemeColor({ light: (lightColor?lightColor:'#ffffff'), dark: (darkColor?darkColor:'#000000') }, 'background');

  return <SafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />;
}
