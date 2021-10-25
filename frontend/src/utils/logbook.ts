import axios, { AxiosResponse } from "axios";
import { LogEntry } from "types/models/LogEntry";

const logbookApi = axios.create({ baseURL: 'http://thanksgiving.cabin/api/logbook', timeout: 5000 });

export async function getEntries(): Promise<AxiosResponse> {
    try {
        return logbookApi({
            method: "get",
        });
    } catch (err) {
        throw err;
    }
}

export async function addEntry(entry: LogEntry): Promise<AxiosResponse> {
    try {
        return logbookApi({
            method: "post",
            headers: {
                'Content-Type': "application/json"
            },
            data: entry
        });
    } catch (err) {
        throw err;
    }
}