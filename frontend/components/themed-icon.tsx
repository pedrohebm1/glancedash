import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';

interface ThemedIconProps {
  as: React.ComponentType<any>;
  name: string;
  size?: number;
  lightColor?: string;
  darkColor?: string;
}

export const ThemedIcon = ({ as: IconComponent, name, size = 24, lightColor, darkColor  }: ThemedIconProps) => {
  const color = useThemeColor({ light: (lightColor?lightColor:'#000000'), dark: (darkColor?darkColor:'#ffffff') }, 'text');
  
  return <IconComponent name={name} size={size} color={color} />;
};