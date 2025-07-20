export type ToolType = "pencil" | "rectangle" | "circle" | "line" | "eraser";

export type Point = {
  x: number;
  y: number;
};

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
  id?: string;
  points?: Point[];  
  roomId?: string;
};
