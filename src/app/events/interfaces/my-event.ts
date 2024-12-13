import { User } from "../../shared/interfaces/user";

export interface MyEventInsert {
    title: string;
    description: string;
    price: number;
    lat: number;
    lng: number;
    address: string;
    image: string;
    date: string;
}

export interface MyEvent extends MyEventInsert {
    id: number;
    creator: User;
    distance: number;
    numAttend: number;
    attend: boolean;
    mine: boolean;
} 