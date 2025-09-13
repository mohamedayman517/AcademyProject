import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'weekdayName' })
export class WeekdayNamePipe implements PipeTransform {
  private readonly arNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  transform(weekdayIndex: number): string {
    const idx = Math.max(0, Math.min(6, Number(weekdayIndex)));
    return this.arNames[idx];
  }
}



