import { MyEvent } from "../../events/interfaces/my-event";
import { User } from "../../shared/interfaces/user";

export interface EventsResponse {
    events: MyEvent[];
    more: boolean;
    page: number;
    count: number
}

export interface SingleEventResponse {
    event: MyEvent;
}

export interface TokenResponse {
    accessToken: string;
}

export interface SingleUserResponse {
    user: User;
}

export interface AvatarResponse {
    avatar: string;
}

export interface UsersResponse {
    users: User[];
}

