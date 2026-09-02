import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ActionType, GameObject } from '@/engine/types';
import { GameObjectView } from './GameObjectView';

interface GameBoardProps {
  objects: GameObject[];
  onAction(objectId: string, action: ActionType): void;
  disabled?: boolean;
  boardMaxWidth?: number;
  boardMaxHeight?: number;
}

export function GameBoard({ objects, onAction, disabled = false, boardMaxWidth = 620, boardMaxHeight = 350 }: GameBoardProps) {
  const { width, height } = useWindowDimensions();
  const boardWidth = Math.max(240, Math.min(boardMaxWidth, width - 40));
  const compactLandscape = width >= 560 && height < 650;
  const availableHeight = compactLandscape ? height - 150 : height - 380;
  const boardHeight = Math.max(244, Math.min(boardMaxHeight, availableHeight));
  const compact = width < 380 || height < 700;
  const objectWidth = compact ? 88 : 106;
  const objectHeight = compact ? 104 : 130;
  const horizontalRange = boardWidth - objectWidth;
  const verticalRange = boardHeight - objectHeight;
  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]} accessibilityLabel={`Challenge board with ${objects.length} objects`}>
      <View style={[styles.centerLine, { top: boardHeight / 2 }]} pointerEvents="none" />
      {objects.map((object) => (
        <View
          key={object.id}
          style={[
            styles.object,
            {
              left: normalizedPosition(object.position.x, 0.06, 0.77) * horizontalRange,
              top: normalizedPosition(object.position.y, 0.04, 0.68) * verticalRange
            }
          ]}
        >
          <GameObjectView object={object} compact={compact} disabled={disabled} onAction={(action) => onAction(object.id, action)} />
        </View>
      ))}
    </View>
  );
}

function normalizedPosition(value: number, minimum: number, maximum: number): number {
  return Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
}

const styles = StyleSheet.create({
  board: { alignSelf: 'center', position: 'relative' },
  centerLine: { position: 'absolute', left: 8, right: 8, height: 1, backgroundColor: 'rgba(160,170,210,0.18)' },
  object: { position: 'absolute' }
});
