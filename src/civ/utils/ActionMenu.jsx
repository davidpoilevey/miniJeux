import { Group, Rect, Text } from "react-konva";
import { useCivContext } from "../CivContext";

const ActionMenu = ({ x, y, actions, onActionClick }) => {
  const itemHeight = 28;
  const itemWidth = 150;
  const padding = 6;


  return (
    <Group>
      {actions.map((action, i) => (
        <Group key={action.label}>
          <Rect
            x={x}
            y={y + i * (itemHeight + padding)}
            width={itemWidth}
            height={itemHeight}
            fill="black"
            cornerRadius={4}
            onClick={()=>{onActionClick(action)}}
            onTap={()=>{onActionClick(action)}}
          />
          <Text
            x={x + 8}
            y={y + i * (itemHeight + padding) + 6}
            text={action.label}
            fontSize={14}
            fill="white"
            onClick={()=>{onActionClick(action)}}
            onTap={()=>{onActionClick(action)}}
            style={{ cursor: 'pointer' }}
          />
        </Group>
      ))}
    </Group>
  );
};

export default ActionMenu;