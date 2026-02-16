import { apiClient } from "../lib/apiClient";
import { TableInterface } from "./table.service";

export interface RoomInterface {
  id: number;
  name: string;
  color: string;
  capacity: number;
  tables: TableInterface[];
}

interface RoomPayload {
  name: string;
  capacity: number;
  color?: string;
  table_ids?: number[];
}

export class RoomService {
  static async getRooms() {
    try {
      const res = await apiClient.get("/rooms");

      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.response?.data?.message || "Failed to fetch rooms",
      };
    }
  }

  static async createRoom(payload: RoomPayload) {
    try {
      const res = await apiClient.post("/rooms", payload);

      return {
        data: res.data.data,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error:
          err?.response?.data?.errors ||
          err?.response?.data?.message ||
          "Failed to create room",
      };
    }
  }

  static async updateLayout(roomId: number, tables: any[]) {
    try {
      const res = await apiClient.put(`/rooms/${roomId}/update-layout`, {
        tables: tables.map((t) => ({
          id: t.id,
          x_position: Math.round(t.x_position),
          y_position: Math.round(t.y_position),
          width: t.width,
          height: t.height,
          rotation: t.rotation,
          shape: t.shape,
        })),
      });
      return { data: res.data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.response?.data?.message || "Error" };
    }
  }

  static async deleteRoom(id: number) {
    try {
      await apiClient.delete(`/rooms/${id}`);

      return {
        error: null,
      };
    } catch (err: any) {
      return {
        error: err?.response?.data?.message || "Failed to delete room",
      };
    }
  }
}
