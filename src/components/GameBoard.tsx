import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ActionType, GameObject } from '@/engine/types';
import { GameObjectView } from './GameObjectView';

interface GameBoardProps {
  objects: GameObject[];
  onAction(objectId: string, action: ActionType): void;
  disabled?: boolean;
}

export function GameBoard({ objects, onAction, disabled = false }: GameBoardProps) {
  const { width, height } = useWindowDimensions();
  const boardWidth = Math.max(280, Math.min(620, width - 40));
  const boardHeight = Math.max(285, Math.min(350, height - 330));
  const objectWidth = width < 380 ? 96 : 106;
  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]} accessibilityLabel="Challenge board">
      <View style={[styles.centerLine, { top: boardHeight / 2 }]} pointerEvents="none" />
      {objects.map((object) => (
        <View
          key={object.id}
          style={[
            styles.object,
            {
              left: object.position.x * (boardWidth - objectWidth),
              top: object.position.y * (boardHeight - 130)
            }
          ]}
        >
          <GameObjectView object={object} compact={width < 380} disabled={disabled} onAction={(action) => onAction(object.id, action)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { alignSelf: 'center', position: 'relative' },
  centerLine: { position: 'absolute', left: 8, right: 8, height: 1, backgroundColor: 'rgba(160,170,210,0.18)' },
  object: { position: 'absolute' }
});
