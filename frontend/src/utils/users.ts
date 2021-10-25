import axios from 'axios';
import {AuthUser} from '../types/models/AuthUser';

const userApi = axios.create({ baseURL: 'http://thanksgiving.cabin:8080/api/users', timeout: 1000 });

interface Credentials {
    email: string
    password: string
}

export async function create(data: AuthUser): Promise<AuthUser> {
    try {
        const { data: user } = await userApi({
            method: "post",
            data
        });
        return user;
    } catch (err) {
        throw err;
    }
}

export async function login(data: Credentials): Promise<AuthUser> {
    try {
        const { data: { id: uid, name, email, token, type } } = await userApi({
            url: 'login',
            method: "post",
            data
        });
        return {
            uid,
            name,
            email,
            token,
            photoURL: '',
            type
        };
    } catch (err) {
        throw err;
    }
}

export async function validate(jwt: string): Promise<boolean> {
    const { status } = await axios.post("validate", { jwt });
    if (status === 204) return true;
    return false;
}