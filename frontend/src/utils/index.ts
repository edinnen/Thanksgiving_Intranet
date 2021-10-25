export * from './users';
export * from './historical';

export function createLineData(date: string, reading: { [key: string]: any }, primaryKey: string, secondaryKey?: string, tertiaryKey?: string): any {
    const line: any = { date, };
    line[primaryKey] = reading[primaryKey];
    if (secondaryKey) {
      line[secondaryKey] = reading[secondaryKey];
    }
    if (tertiaryKey) {
      line[tertiaryKey] = reading[tertiaryKey];
    }
  
    return line;
  }