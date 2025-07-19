export type ToolType = "rectangle" | "circle" | "line" | "eraser";

export type Shape = {
  type: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  color?: string;
  id?: string; // Unique ID for syncing
  roomId?: string;
};
