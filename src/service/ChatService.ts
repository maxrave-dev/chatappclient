import {HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';
import {APIService} from "@/service/APIService";

let connections = {} as { [key: string]: { type: string; connection: HubConnection; started: boolean } };

function createConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (!connectionObj) {
        console.log('SOCKET: Registering on server events ', messageType);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5001/chatHub", {
                accessTokenFactory: () => {
                    return APIService.getInstance().getToken() ?? "";
                },
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connections[messageType] = {
            type: messageType,
            connection: connection,
            started: false,
        };
        return connection;
    } else {
        return connections[messageType].connection;
    }
}

function startConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (!connectionObj.started) {
        connectionObj.connection.start().catch(err => console.error('SOCKET: ', err.toString()));
        connectionObj.started = true;
    }
}

function stopConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (connectionObj) {
        console.log('SOCKET: Stoping connection ', messageType);
        connectionObj.connection.stop();
        connectionObj.started = false;
    }
}

function registerOnServerEvents(
    messageType: string,
    callback: (payload: Message) => void,
) {
    try {
        const connection = createConnection(messageType);
        connection.on('newMessage', (payload: Message) => {
            callback(payload);
        });
        connection.onclose(() => stopConnection(messageType));
        startConnection(messageType);
    } catch (error) {
        console.error('SOCKET: ', error);
    }
}

function sendEvents(
    messageType: string,
    payload: string,
) {
    try {
        const connection = createConnection(messageType);
        connection.send(messageType, payload).catch(err => console.error('SOCKET: ', err.toString()));
        connection.onclose(() => stopConnection(messageType));
        startConnection(messageType);
    } catch (error) {
        console.error('SOCKET: ', error);
    }
}

export const socketService = {
    registerOnServerEvents,
    sendEvents,
    stopConnection,
};