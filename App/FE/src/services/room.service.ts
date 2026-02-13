import { apiClient } from "../lib/apiClient";

export interface TableInterface {
  id: number;
  table_number: string;
  status: "available" | "occupied";
  qr_code: string | null;
}

export interface RoomInterface {
  id: number;
  name: string;
  tables: TableInterface[];
  capacity:string|number;
}

interface RoomPayload {
  name: string;
  capacity: number;
  table_ids: number[];
}

export class RoomService {
  static async getRooms(): Promise<RoomInterface[]> {
    const res = await apiClient.get("/rooms");
    return res.data.data;
  }

  static async createRoom(payload: RoomPayload): Promise<RoomInterface> {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("capacity", payload.capacity);
    payload.table_ids.forEach((id) => form.append("table_ids[]", id.toString()));
    const res = await apiClient.post("/rooms", form);
    return res.data.data;
  }

  static async updateRoom(id: number, payload: RoomPayload): Promise<RoomInterface> {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("capacity", payload.capacity);
    payload.table_ids.forEach((id) => form.append("table_ids[]", id.toString()));
    const res = await apiClient.post(`/rooms/${id}?_method=PUT`, form);
    return res.data.data;
  }

  static async deleteRoom(id: number): Promise<void> {
    await apiClient.delete(`/rooms/${id}`);
  }
}
