interface ApplicationUser {
    fullName: string,
    userName: string,
    avatar: string,
    rooms: Room[]
    messages: Message[]
}