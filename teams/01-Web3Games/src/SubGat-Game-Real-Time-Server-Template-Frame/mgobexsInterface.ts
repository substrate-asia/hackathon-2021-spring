
export namespace mgobexsInterface {
	//PROTO-STRUCT-BEGIN
	export enum NetworkState {
		COMMON_OFFLINE = 0,
		COMMON_ONLINE = 1,
		RELAY_OFFLINE = 2,
		RELAY_ONLINE = 3
	};

	export enum CreateRoomType {
		COMMON_CREATE = 0,
		MATCH_CREATE = 1,
		THIRD_PARTY_CREATE = 2
	};

	export enum FrameSyncState {
		STOP = 0,
		START = 1
	};

	export enum GroupType {
		GROUP_LIMITED = 0,
		GROUP_MANY = 1
	};



	export interface ICreateRoomBst {
		roomInfo?: IRoomInfo;
	};

	export interface IJoinRoomBst {
		roomInfo?: IRoomInfo;
		joinPlayerId?: string;
	};

	export interface ILeaveRoomBst {
		roomInfo?: IRoomInfo;
		leavePlayerId?: string;
	};

	export interface IRemovePlayerBst {
		roomInfo?: IRoomInfo;
		removePlayerId?: string;
	};

	export interface IChangeRoomBst {
		roomInfo?: IRoomInfo;
	};

	export interface IChangeCustomPlayerStatusBst {
		changePlayerId?: string;
		customPlayerStatus?: number;
		roomInfo?: IRoomInfo;
	};

	export interface IChangeRoomPlayerProfileBst {
		changePlayerId?: string;
		customProfile?: string;
		roomInfo?: IRoomInfo;
	};

	export interface IChangeGroupPlayerProfileBst {
		changePlayerId?: string;
		customProfile?: string;
		groupInfo?: IGroupInfo;
	};

	export interface IChangePlayerNetworkStateBst {
		changePlayerId?: string;
		networkState?: NetworkState;
		roomInfo?: IRoomInfo;
		groupIdList?: string[];
	};

	export interface IStartFrameSyncBst {
		roomInfo?: IRoomInfo;
	};

	export interface IStopFrameSyncBst {
		roomInfo?: IRoomInfo;
	};

	export interface IDestroyRoomBst {
		roomInfo?: IRoomInfo;
	};

	export interface IRoomInfo {
		id?: string;
		name?: string;
		type?: string;
		createType?: CreateRoomType;
		maxPlayers?: number;
		owner?: string;
		isPrivate?: boolean;
		customProperties?: string;
		playerList?: IPlayerInfo[];
		teamList?: ITeamInfo[];
		frameSyncState?: FrameSyncState;
		frameRate?: number;
		routeId?: string;
		createTime?: number;
		startGameTime?: number;
		isForbidJoin?: boolean;
	};

	export interface IGroupInfo {
		id?: string;
		name?: string;
		type?: GroupType;
		maxPlayers?: number;
		owner?: string;
		customProperties?: string;
		createTime?: number;
		isForbidJoin?: boolean;
		isPersistent?: boolean;
		groupPlayerList?: IGroupPlayerInfo[];
	};

	export interface IPlayerInfo {
		id?: string;
		name?: string;
		teamId?: string;
		customPlayerStatus?: number;
		customProfile?: string;
		commonNetworkState?: NetworkState;
		relayNetworkState?: NetworkState;
		isRobot?: boolean;
		matchAttributes?: IMatchAttribute[];
	};

	export interface ITeamInfo {
		id?: string;
		name?: string;
		minPlayers?: number;
		maxPlayers?: number;
	};

	export interface IGroupPlayerInfo {
		id?: string;
		name?: string;
		customGroupPlayerStatus?: number;
		customGroupPlayerProfile?: string;
		commonGroupNetworkState?: NetworkState;
	};

	export interface IMatchAttribute {
		name?: string;
		value?: number;
	};
	//PROTO-STRUCT-END

	export interface IGameInfo {
		gameId: string;
		serverKey: string;
	}

	export interface ResponseEvent<T> {
		code: number;
		msg: string;
		seq: string;
		data?: T;
	}

	export type ReqCallback<T> = (event: ResponseEvent<T>) => any;

	export interface IGetRoomByRoomIdPara {
		roomId: string;
	}

	export interface IGetRoomByRoomIdRsp {
		roomInfo?: mgobexsInterface.IRoomInfo;
	}

	export interface IChangeRoomPara {
		roomId: string;
		roomName?: string;
		owner?: string;
		isPrivate?: boolean;
		isForbidJoin?: boolean;
		customProperties?: string;
	}

	export interface IChangeRoomRsp {
		roomInfo?: mgobexsInterface.IRoomInfo;
	}

	export interface IChangeCustomPlayerStatusPara {
		roomId: string;
		playerId: string;
		customPlayerStatus: number;
	}

	export interface IChangeCustomPlayerStatusRsp {
		roomInfo?: mgobexsInterface.IRoomInfo;
	}

	export interface IRemovePlayerPara {
		roomId: string;
		removePlayerId: string;
	}

	export interface IRemovePlayerRsp {
		roomInfo?: mgobexsInterface.IRoomInfo;
	}

	export interface GameData {
		[key: string]: any;
	}

	export interface UserDefinedData {
		[key: string]: any;
	}

	export interface ActionArgs<T> {
		sender: string;
		actionData: T;
		gameData: GameData;
		room: IRoomInfo;
		exports: { data: GameData; };
		SDK: {
			sendData: (data: { playerIdList: string[]; data: UserDefinedData; }, resendConf?: { timeout: number; maxTry: number; }) => void;
			dispatchAction: (actionData: UserDefinedData) => void;
			clearAction: () => void;
			exitAction: () => void;

			getRoomByRoomId: (getRoomByRoomIdPara: IGetRoomByRoomIdPara, callback?: ReqCallback<IGetRoomByRoomIdRsp>) => void;
			changeRoom: (changeRoomPara: IChangeRoomPara, callback?: ReqCallback<IChangeRoomRsp>) => void;
			changeCustomPlayerStatus: (changeCustomPlayerStatusPara: IChangeCustomPlayerStatusPara, callback?: ReqCallback<IChangeCustomPlayerStatusRsp>) => void;
			removePlayer: (removePlayerPara: IRemovePlayerPara, callback?: ReqCallback<IRemovePlayerRsp>) => void;

			logger: {
				debug: (...args: any[]) => void;
				info: (...args: any[]) => void;
				error: (...args: any[]) => void;
			};
		};
	}

	export namespace GameServer {
		export type Receiver<T> = (data: ActionArgs<T>) => void;

		export type onRecvFromClient = Receiver<UserDefinedData>;

		export type onCreateRoom = Receiver<ICreateRoomBst>;
		export type onJoinRoom = Receiver<IJoinRoomBst>;
		export type onLeaveRoom = Receiver<ILeaveRoomBst>;
		export type onRemovePlayer = Receiver<IRemovePlayerBst>;
		export type onChangeRoom = Receiver<IChangeRoomBst>;
		export type onChangeCustomPlayerStatus = Receiver<IChangeCustomPlayerStatusBst>;
		export type onChangeRoomPlayerProfile = Receiver<IChangeRoomPlayerProfileBst>;
		export type onChangePlayerNetworkState = Receiver<IChangePlayerNetworkStateBst>;
		export type onStartFrameSync = Receiver<IStartFrameSyncBst>;
		export type onStopFrameSync = Receiver<IStopFrameSyncBst>;
		export type onDestroyRoom = Receiver<IDestroyRoomBst>;

		export interface IGameServer {
			mode?: 'async' | 'sync';
			onInitGameData: (args: { room: IRoomInfo; }) => GameData;
			onRecvFromClient: onRecvFromClient;
			onCreateRoom?: onCreateRoom;
			onJoinRoom?: onJoinRoom;
			onLeaveRoom?: onLeaveRoom;
			onRemovePlayer?: onRemovePlayer;
			onChangeRoom?: onChangeRoom;
			onChangeCustomPlayerStatus?: onChangeCustomPlayerStatus;
			onChangeRoomPlayerProfile?: onChangeRoomPlayerProfile;
			onChangePlayerNetworkState?: onChangePlayerNetworkState;
			onStartFrameSync?: onStartFrameSync;
			onStopFrameSync?: onStopFrameSync;
			onDestroyRoom?: onDestroyRoom;
		}
	}

	export interface mgobexsCode {
		logLevelSDK?: 'debug+' | 'info+' | 'error+';
		logLevel?: 'debug+' | 'info+' | 'error+';
		onInitGameServer?: (tcb: any) => any;
		gameInfo: IGameInfo;
		gameServer: GameServer.IGameServer;
	}
}