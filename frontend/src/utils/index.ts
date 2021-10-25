export * from './users';
export * from './historical';
export * from './logbook';

export function createLineData(date: string, reading: { [key: string]: any }, ...keys: string[]): any {
  const line: any = { date };
  keys.forEach(key => {
    line[key] = reading[key];
  });

  return line;
}