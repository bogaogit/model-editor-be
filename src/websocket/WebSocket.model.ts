
export interface RoomInfo {
  id?: string
  roomName: string
  modelId?: string
  clients: any[]
}

export type WebSocketActionType =
  "updateEntity" |
  "syncUpdates" |
  "clearActionList" |
  "populateModel" |
  "fetchModel" |
  "createRoom" |
  "getRoomList" |
  "joinRoom" |
  "syncLatestAction" |
  "updateEntityAndSync"

export type UpdateEntityActionType = "add" | "update" | "delete" | "deleteAll"

export interface WebSocketRequest {
  currentActionId?: string
  roomInfo?: RoomInfo
  joinRoomId?: string
  roomId?: string
  webSocketAction?: WebSocketAction
  userInfo?: WebSocketUserInfo
}

export interface WebSocketAction {
  actionType: WebSocketActionType
  updateEntityActionType?: UpdateEntityActionType
  data?: any
}

export interface WebSocketActionStoreItem {
  id: string,
  roomId: string,
  webSocketAction: WebSocketAction
  userInfo: WebSocketUserInfo
}

export interface WebSocketResponse {
  type: WebSocketActionType
  room?: RoomInfo
  actionList?: WebSocketActionStoreItem[]
  roomList?: RoomInfo[]
  userInfo?: WebSocketUserInfo
}

export interface WebSocketUserInfo {
  userId: string
  userName: string
}
