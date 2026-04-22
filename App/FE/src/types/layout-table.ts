export type TableShape = 'square' | 'round' | 'rectangle';
export type TableStatus = 'available' | 'occupied';

export interface TableInterface {
  id: number;
  table_number: string;
  status: TableStatus;
  qr_code: string | null;
  room_id: number | null;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  rotation: number;
  shape: TableShape;
  capacity?:number;
}

export interface RoomInterface {
  id: number;
  name: string;
  color: string;
  capacity: string | number;
  width: number;
  height: number;
  tables?: TableInterface[];
}