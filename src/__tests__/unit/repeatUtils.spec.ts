import { expect, it } from 'vitest';

import { RepeatType, EventForm } from '../../types.ts';
import {
  formatDate,
  isLeapYear,
  getWeekOfMonth,
  incrementDate,
  generateRepeatedEvents,
} from '../../utils/repeatUtils';

describe('날짜 설정', () => {
  it('윤년을 올바르게 판별해야 합니다', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2023)).toBe(false);
  });

  it('월의 주차를 올바르게 계산해야 합니다', () => {
    expect(getWeekOfMonth(new Date('2024-03-01'))).toBe(1);
    expect(getWeekOfMonth(new Date('2024-03-15'))).toBe(3);
    expect(getWeekOfMonth(new Date('2024-03-31'))).toBe(6);
  });
});

describe('반복 주기 설정', () => {
  it('daily 반복: 지정된 일수만큼 증가해야 합니다', () => {
    const date = new Date('2024-03-15');
    const result = incrementDate(date, 'daily', 3);
    expect(formatDate(result)).toBe('2024-03-18');
  });

  it('weekly 반복: 지정된 주 수만큼 증가해야 합니다', () => {
    const date = new Date('2024-03-15');
    const result = incrementDate(date, 'weekly', 2);
    expect(formatDate(result)).toBe('2024-03-29');
  });

  it('monthly 반복 (date 옵션): 지정된 월수만큼 증가해야 합니다', () => {
    const date = new Date('2024-03-15');
    const result = incrementDate(date, 'monthly', 1, 'date');
    expect(formatDate(result)).toBe('2024-04-15');
  });

  it('monthly 반복 (week 옵션): 같은 주차와 요일을 유지해야 합니다', () => {
    const date = new Date('2024-03-15');
    const result = incrementDate(date, 'monthly', 1, 'week');
    expect(result.getDay()).toBe(date.getDay());
  });

  it('yearly 반복 (기본): 지정된 연도만큼 증가해야 합니다', () => {
    const date = new Date('2024-03-15');
    const result = incrementDate(date, 'yearly', 1);
    expect(formatDate(result)).toBe('2025-03-15');
  });

  it('yearly 반복 (leap 옵션): 다음 윤년으로 이동해야 합니다', () => {
    const date = new Date('2024-02-29');
    const result = incrementDate(date, 'yearly', 1, 'leap');
    expect(formatDate(result)).toBe('2028-02-29');
  });

  it('yearly 반복 (lastDay 옵션): 2월의 마지막 날로 설정되어야 합니다', () => {
    const date = new Date('2024-02-29');
    const result = incrementDate(date, 'yearly', 1, 'lastDay');
    expect(formatDate(result)).toBe('2025-02-28');
  });
});

describe('반복 일정 생성', () => {
  const baseEvent = {
    date: '2024-03-15',
    repeat: {
      type: 'daily' as RepeatType,
      interval: 1,
    },
  } as EventForm;

  it('반복 일정을 생성해야 합니다', () => {
    const events = generateRepeatedEvents(baseEvent);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].date).toBe('2024-03-15');
  });

  it('종료일이 지정된 경우 해당 일자까지만 생성해야 합니다', () => {
    const eventWithEndDate: EventForm = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: '2024-03-20',
      },
    };
    const events = generateRepeatedEvents(eventWithEndDate);
    expect(events.length).toBe(6); // 15일부터 20일까지 6일
    expect(events[events.length - 1].date).toBe('2024-03-20');
  });
});
