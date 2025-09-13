import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'monthDays' })
export class MonthDaysPipe implements PipeTransform {
  transform(monthDate: Date, weekStartsOn: number = 6): Date[] {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    // start of week containing start
    const startDay = (start.getDay() - weekStartsOn + 7) % 7;
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startDay);

    // end of week containing end
    const endDay = (weekStartsOn + 6 - end.getDay() + 7) % 7;
    const gridEnd = new Date(end);
    gridEnd.setDate(end.getDate() + endDay);

    const days: Date[] = [];
    const cur = new Date(gridStart);
    while (cur <= gridEnd) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }
}



