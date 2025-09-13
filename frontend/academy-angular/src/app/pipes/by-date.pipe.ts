import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'byDate', pure: true })
export class ByDatePipe implements PipeTransform {
  transform<T extends { startDate?: string | null; date?: Date | null }>(items: T[] | null | undefined, day: Date, startKey: keyof T & 'startDate' = 'startDate'): T[] {
    if (!Array.isArray(items) || !day) return [];
    const key = startKey || 'startDate';
    const y = day.getFullYear();
    const m = day.getMonth();
    const d = day.getDate();
    return items.filter((it) => {
      let dt: Date | null = null;
      const val: any = (it as any)[key];
      if (val) dt = new Date(val);
      else if ((it as any).date) dt = (it as any).date as Date;
      if (!dt || isNaN(dt as unknown as number)) return false;
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
  }
}



