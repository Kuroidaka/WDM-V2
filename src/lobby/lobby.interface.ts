export interface LobType {
  id: string;
  max_table_count: number;
  min_table_price: number;
  deposit_percent: number;
  created_at: Date;
  updated_at: Date;
  type_name: string;
  deleted_at: Date | null;
}


export interface LobbyIncludedLobType {
  id: string;
  name: string;
  lob_type_id: string;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
  LobType?: LobType;
}

