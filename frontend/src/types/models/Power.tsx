export interface Reading {
    timestamp: Date
    unix: number
    battery_voltage: number
    solar_voltage: number
    battery_amperage: number
    load_amperage: number
    battery_percent: number
    avg_battery_power: number
    avg_load_power: number
    outside_temp: number
    cabin_temp: number
    battery_temp: number
}

export interface HistoricalData {
    raw: Reading[] | null,
    voltAmpData: any,
    powerData: any,
}