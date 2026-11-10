import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface UseTimedGestureProps {
  onEnterEdit: () => void;
  onExitEditAndStartDrag: () => void;
  onDragUpdate?: (absoluteY: number, absoluteX: number) => void;
  onDragEnd?: (absoluteY: number, absoluteX: number) => void;
}

export function useTimedDragAndEditGesture({
  onEnterEdit,
  onExitEditAndStartDrag,
  onDragUpdate,
  onDragEnd,
}: UseTimedGestureProps) {
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const editGesture = Gesture.LongPress()
    .minDuration(400)
    .maxDistance(10)
    .onStart(() => {
      'worklet';
      runOnJS(onEnterEdit)();
    });

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(1000)
    .maxPointers(1)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      runOnJS(onExitEditAndStartDrag)();
    })
    .onUpdate((event) => {
      'worklet';
      translateY.value = event.translationY;
      if (onDragUpdate) {
        runOnJS(onDragUpdate)(event.absoluteY, event.absoluteX);
      }
    })
    .onEnd((event) => {
      'worklet';
      translateY.value = withSpring(0);
      isDragging.value = false;
      if (onDragEnd) {
        runOnJS(onDragEnd)(event.absoluteY, event.absoluteX);
      }
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  const gesture = Gesture.Simultaneous(editGesture, dragGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 999 : 1,
    opacity: isDragging.value ? 0.85 : 1,
  }));

  return { gesture, animatedStyle, isDragging };
}