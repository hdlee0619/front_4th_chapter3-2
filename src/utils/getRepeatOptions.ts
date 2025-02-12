import { RepeatType } from '../types.ts';

export interface RepeatOption {
  value: string;
  label: string;
}

/**
 * 주어진 반복 유형과 선택된 날짜에 따라 주기 설정 옵션을 반환한다.
 *
 * - 월간(repeatType === 'monthly'):
 *   - 일반 날짜인 경우: "매월 {선택일}일" 과 "매월 {몇째주}째주 {요일}" 옵션을 제공
 *   - 선택일이 31일인 경우: "매월 31일" 과 "해당월의 마지막 날" 옵션을 제공
 *
 * - 연간(repeatType === 'yearly'):
 *   - 선택일이 2월 29일인 경우: "매년 2월 29일" 과 "매년 2월의 마지막 날" 옵션을 제공
 *   - 그 외에는 단순히 "매년 {월}월 {일}일" 옵션을 제공
 *
 * - 기타(daily, weekly)는 별도의 옵션을 제공하지 않으므로 빈 배열을 반환한다.
 *
 * @param repeatType 반복 유형 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param selectedDate 이벤트 시작 날짜
 * @returns RepeatOption 배열
 */
export function getRepeatOptions(repeatType: RepeatType, selectedDate: string): RepeatOption[] {
  const date = new Date(selectedDate);

  switch (repeatType) {
    case 'monthly':
      return getMonthlyRepeatOptions(date);
    case 'yearly':
      return getYearlyRepeatOptions(date);
    default:
      return [];
  }
}

/**
 * 월간 반복 옵션을 반환한다.
 * @param selectedDate 선택된 날짜
 * @returns RepeatOption 배열
 */
function getMonthlyRepeatOptions(selectedDate: Date): RepeatOption[] {
  const day = selectedDate.getDate();

  // 선택일이 31일인 경우: 31일 고정 vs 해당월의 마지막 날 선택
  if (day === 31) {
    return [
      { value: 'date', label: '매월 31일' },
      { value: 'lastDay', label: '해당월의 마지막 날' },
    ];
  } else {
    // 일반적인 경우: 선택된 날짜 vs 몇째주 요일
    const weekOfMonth = getWeekOfMonth(selectedDate);
    const dayName = getKoreanDayName(selectedDate.getDay());
    return [
      { value: 'date', label: `매월 ${day}일` },
      { value: 'week', label: `매월 ${weekOfMonth}째주 ${dayName}` },
    ];
  }
}

/**
 * 연간 반복 옵션을 반환한다.
 * @param selectedDate 선택된 날짜
 * @returns RepeatOption 배열
 */
function getYearlyRepeatOptions(selectedDate: Date): RepeatOption[] {
  const month = selectedDate.getMonth(); // 0: 1월, 1: 2월, ...
  const day = selectedDate.getDate();

  // 2월 29일인 경우: 윤년 2월 29일 vs 2월의 마지막 날
  if (month === 1 && day === 29) {
    return [
      { value: 'leap', label: '매년 2월 29일' },
      { value: 'lastDay', label: '매년 2월의 마지막 날' },
    ];
  } else {
    return [{ value: 'date', label: `매년 ${month + 1}월 ${day}일` }];
  }
}

/**
 * 주어진 날짜가 해당 월의 몇째 주인지 계산한다.
 *
 * @param date 기준 날짜
 * @returns 1 이상의 정수 (예: 1, 2, 3, …)
 */
function getWeekOfMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
}

/**
 * 요일 인덱스(0~6)를 한글 요일명으로 반환한다.
 * 0: 일요일, 1: 월요일, …, 6: 토요일
 *
 * @param dayIndex 요일 인덱스 (0: 일요일, …, 6: 토요일)
 * @returns 한글 요일명 (예: "수요일")
 */
function getKoreanDayName(dayIndex: number): string {
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return dayNames[dayIndex] || '';
}
