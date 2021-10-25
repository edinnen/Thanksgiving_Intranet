import axios, {AxiosResponse} from 'axios';
// import {Reading} from '../types/models/Power';

const historicalApi = axios.create({ baseURL: 'http://thanksgiving.cabin:8080/api/historical', timeout: 5000 });

export async function getHistorical(from: number, to: number): Promise<AxiosResponse> {
    try {
        const response = await historicalApi({
            method: "get",
            params: { from, to }
        });
        return response;
    } catch (err) {
        throw err;
    }
}

export function averageNumber(arr: number[]): number {
    const sum: number = arr.reduce((acc, val) => acc + val);
    const avg: number = sum / arr.length;
    if (avg > 0) {
      return Math.floor(avg * 100) / 100;
    } else {
      return Math.ceil(avg * 100) / 100;
    }
}