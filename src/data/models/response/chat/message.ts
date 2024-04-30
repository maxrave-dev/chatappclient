interface Message {
    id: number,
    content: string,
    timestamp: Date,
    fromFullName: string,
    fromUserName: string,
    roomId: number,
    toRoom: Room
}