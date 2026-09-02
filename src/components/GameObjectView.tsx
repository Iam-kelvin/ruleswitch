import { useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Pattern, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { OBJECT_COLORS } from '@/constants/theme';
import type { ActionType, GameObject, ShapeName } from '@/engine/types';
import { usePalette, useReducedMotion } from '@/hooks/usePalette';

interface GameObjectViewProps {
  object: GameObject;
  onAction(action: ActionType): void;
  disabled?: boolean;
  compact?: boolean;
}

function shapeElement(shape: ShapeName, fill: string, stroke: string, strokeWidth: number) {
  const common = { fill, stroke, strokeWidth };
  switch (shape) {
    case 'circle':
      return <Circle cx="50" cy="50" r="36" {...common} />;
    case 'square':
      return <Rect x="16" y="16" width="68" height="68" rx="8" {...common} />;
    case 'triangle':
      return <Polygon points="50,10 91,84 9,84" {...common} />;
    case 'pentagon':
      return <Polygon points="50,8 91,38 75,87 25,87 9,38" {...common} />;
    case 'hexagon':
      return <Polygon points="26,10 74,10 94,50 74,90 26,90 6,50" {...common} />;
  }
}

function accessibleDescription(object: GameObject): string {
  const content = object.kind === 'number' ? `number ${object.number}` : object.kind === 'symbol' ? `symbol ${object.symbol}` : object.shape;
  const container = object.containerShape === 'none' ? '' : `, inside a ${object.containerShape}`;
  const vertical = object.position.y < 0.5 ? 'above center' : 'below center';
  const size = object.size < 1 ? 'small' : object.size > 1 ? 'large' : 'medium';
  return `${size} ${object.color} ${content}, ${object.fill} ${object.shape} carrier${container}, ${vertical}`;
}

export function GameObjectView({ object, onAction, disabled = false, compact = false }: GameObjectViewProps) {
  const palette = usePalette();
  const reducedMotion = useReducedMotion();
  const color = OBJECT_COLORS[object.color];
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 12 || Math.abs(gesture.dy) > 12,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_event, gesture) => {
          if (disabled) return;
          const horizontal = Math.abs(gesture.dx) >= Math.abs(gesture.dy);
          if (horizontal) onAction(gesture.dx < 0 ? 'swipeLeft' : 'swipeRight');
          else onAction(gesture.dy < 0 ? 'swipeUp' : 'swipeDown');
        }
      }),
    [disabled, onAction]
  );

  const patternId = `stripes-${object.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const shapeFill = object.fill === 'outline' ? 'transparent' : object.fill === 'striped' ? `url(#${patternId})` : color.fill;
  const content = object.kind === 'number' ? String(object.number) : object.kind === 'symbol' ? object.symbol : '';
  return (
    <Pressable
      {...panResponder.panHandlers}
      accessibilityRole="button"
      accessibilityLabel={accessibleDescription(object)}
      accessibilityHint="Tap or swipe this object according to the current rule."
      accessibilityActions={[
        { name: 'activate', label: 'Tap object' },
        { name: 'swipeLeft', label: 'Swipe object left' },
        { name: 'swipeRight', label: 'Swipe object right' },
        { name: 'swipeUp', label: 'Swipe object up' },
        { name: 'swipeDown', label: 'Swipe object down' }
      ]}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onAction('tap')}
      onAccessibilityAction={(event) => {
        if (disabled) return;
        const action = event.nativeEvent.actionName;
        if (action === 'activate') onAction('tap');
        else if (action === 'swipeLeft' || action === 'swipeRight' || action === 'swipeUp' || action === 'swipeDown') onAction(action);
      }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        { backgroundColor: palette.panelStrong, borderColor: object.containerShape === 'none' ? palette.border : color.fill },
        pressed && !disabled && (reducedMotion ? styles.pressedReduced : styles.pressed),
        disabled && styles.disabled
      ]}
    >
      <View style={styles.cues}>
        <View style={[styles.colorCue, { backgroundColor: color.fill }]}>
          <Text style={[styles.cueText, { color: color.contrast }]}>{color.cue}</Text>
        </View>
        <Text style={[styles.positionCue, { color: palette.textMuted }]}>{object.position.y < 0.5 ? 'TOP' : 'LOW'}</Text>
      </View>
      <View style={{ transform: [{ scale: object.size }, { rotate: `${object.orientation}deg` }] }}>
        <Svg width={compact ? 64 : 76} height={compact ? 64 : 76} viewBox="0 0 100 100" accessibilityElementsHidden>
          <Defs>
            <Pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Rect width="12" height="12" fill={color.fill} />
              <Line x1="0" y1="0" x2="0" y2="12" stroke={color.contrast} strokeWidth="5" opacity={0.48} />
            </Pattern>
          </Defs>
          {shapeElement(object.shape, shapeFill, color.fill, object.fill === 'outline' ? 7 : 3)}
          {content ? (
            <SvgText
              x="50"
              y="60"
              textAnchor="middle"
              fontSize={object.kind === 'number' ? 34 : 30}
              fontWeight="900"
              fill={object.fill === 'outline' ? color.fill : color.contrast}
              transform={`rotate(${-object.orientation} 50 50)`}
            >
              {content}
            </SvgText>
          ) : null}
        </Svg>
      </View>
      {object.containerShape !== 'none' ? (
        <Text style={[styles.containerCue, { color: palette.text }]}>IN {object.containerShape === 'triangle' ? '△' : '○'}</Text>
      ) : (
        <Text style={[styles.containerCue, { color: palette.textMuted }]}>{object.shape.toUpperCase()}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 106,
    height: 130,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 9,
    overflow: 'hidden'
  },
  compactCard: { width: 88, height: 104 },
  cues: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorCue: { width: 25, height: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cueText: { fontSize: 12, fontWeight: '900' },
  positionCue: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  containerCue: { position: 'absolute', bottom: 7, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  pressedReduced: { opacity: 0.75 },
  disabled: { opacity: 0.72 }
});
