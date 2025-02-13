import { Event, EventForm, RepeatType } from '../types.ts';

const MAX_DATE = new Date('2025-06-25');

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getWeekOfMonth = (date: Date): number => {
  const dayOfMonth = date.getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
};

/**
 * 주어진 날짜를 반복 유형, 간격, 옵션에 따라 다음 반복 날짜로 계산한다.
 * - daily: interval 일 후
 * - weekly: interval 주(7일×interval) 후
 * - monthly:
 *    - option이 'date'인 경우 단순 월 증분
 *    - option이 'week'인 경우 "몇째주 / 요일"을 기준으로 계산
 * - yearly:
 *    - option이 'leap'인 경우 윤년만 고려 (윤년이 아닐 경우 interval 만큼 건너뜀)
 *    - option이 'lastDay'인 경우 해당년도의 2월 마지막 날로 설정
 */
export const incrementDate = (
  date: Date,
  type: RepeatType,
  interval: number,
  option?: string
): Date => {
  const newDate = new Date(date);
  switch (type) {
    case 'daily':
      newDate.setDate(newDate.getDate() + interval);
      break;
    case 'weekly':
      newDate.setDate(newDate.getDate() + interval * 7);
      break;
    case 'monthly':
      if (option === 'week') {
        // "몇째주 / 요일" 방식: 현재 날짜의 주차와 요일을 계산한 후, 다음 달 동일 주차, 동일 요일의 날짜를 구함.
        const weekIndex = getWeekOfMonth(date);
        const dayOfWeek = date.getDay();
        newDate.setMonth(newDate.getMonth() + interval);
        const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        let diff = dayOfWeek - firstDayOfMonth.getDay();
        if (diff < 0) diff += 7;
        const targetDate = 1 + diff + (weekIndex - 1) * 7;
        newDate.setDate(targetDate);
      } else {
        // 기본: 같은 일자로 단순 월 증분 (단, 예: 31일인 경우 자동으로 해당월의 마지막 날로 처리됨)
        newDate.setMonth(newDate.getMonth() + interval);
      }
      break;
    case 'yearly':
      if (option === 'leap') {
        let newYear = date.getFullYear() + interval;
        while (!isLeapYear(newYear)) {
          newYear += interval;
        }
        newDate.setFullYear(newYear);
        newDate.setMonth(1); // 2월 (0부터 시작하므로 1)
        newDate.setDate(29);
      } else if (option === 'lastDay') {
        newDate.setFullYear(newDate.getFullYear() + interval);
        // 3월 0일은 해당년도의 2월 마지막 날
        newDate.setMonth(2, 0);
      } else {
        newDate.setFullYear(newDate.getFullYear() + interval);
      }
      break;
    default:
      break;
  }
  return newDate;
};

/**
 * 주어진 이벤트 데이터를 기준으로 반복 일정들을 생성한다.
 * 생성된 이벤트들은 반복 일정 종료일(사용자가 지정한 repeat.endDate가 있을 경우) 또는 2025-06-25를 초과하지 않는다.
 */
export const generateRepeatedEvents = (eventData: Event | EventForm): EventForm[] => {
  const events: EventForm[] = [];
  const baseDate = new Date(eventData.date);
  // 사용자가 지정한 종료일(repeat.endDate)이 있다면 최대 종료일로 사용
  let cutoff = MAX_DATE;
  if (eventData.repeat.endDate) {
    cutoff = new Date(eventData.repeat.endDate);
  }
  let currentDate = baseDate;
  while (currentDate <= cutoff) {
    // 매 반복마다 date만 업데이트한 새 이벤트 생성
    const newEvent: EventForm = {
      ...eventData,
      date: formatDate(currentDate),
    };
    events.push(newEvent);
    const nextDate = incrementDate(
      currentDate,
      eventData.repeat.type,
      eventData.repeat.interval,
      eventData.repeat.repeatOption
    );
    // 무한루프를 방지
    if (nextDate.getTime() === currentDate.getTime()) break;
    currentDate = nextDate;
  }
  return events;
};
