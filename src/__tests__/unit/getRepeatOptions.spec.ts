import { getRepeatOptions } from '../../utils/getRepeatOptions';

describe('repeatEventUtils 테스트 >', () => {
  it('반복유형이 매월일 경우 주기 설정이 선택된 날짜로 반복할지 몇주째 요일로 반복할지 선택할 수 있다.', () => {
    // 예시: 2025년 5월 15일 (월간 반복, 15일이 선택된 경우)
    // 2025년 5월 1일은 목요일(요일 인덱스 4)이므로,
    // 15일의 주는 (15 + 4) / 7 = 19/7 → 올림하면 3번째 주,
    // 15일의 요일은 목요일이므로 '매월 3째주 목요일' 옵션이 생성되어야 한다.
    const selectedDate = new Date(2025, 4, 15).toString(); // month: 4 → 5월
    const options = getRepeatOptions('monthly', selectedDate);

    expect(options).toEqual([
      { value: 'date', label: '매월 15일' },
      { value: 'week', label: '매월 3째주 목요일' },
    ]);
  });

  it('반복 유형이 매월인데 31일이 선택되었을 경우 31일로 설정할지 해당월의 마지막날로 설정할지 선택할 수 있다.', () => {
    // 예시: 2025년 1월 31일 (월간 반복, 31일인 경우)
    const selectedDate = new Date(2025, 0, 31).toString(); // month: 0 → 1월
    const options = getRepeatOptions('monthly', selectedDate);

    expect(options).toEqual([
      { value: 'date', label: '매월 31일' },
      { value: 'lastDay', label: '해당월의 마지막 날' },
    ]);
  });

  it('반복 유형이 매년인데 윤년의 2월 29일이 선택되었을 경우 윤년의 2월 29일로 설정할지 2월의 마지막날로 설정할지 선택할 수 있다.', () => {
    // 예시: 2024년 2월 29일 (연간 반복, 윤년의 2월 29일인 경우)
    const selectedDate = new Date(2024, 1, 29).toString(); // month: 1 → 2월
    const options = getRepeatOptions('yearly', selectedDate);

    expect(options).toEqual([
      { value: 'leap', label: '매년 2월 29일' },
      { value: 'lastDay', label: '매년 2월의 마지막 날' },
    ]);
  });

  // 추가 테스트: 반복유형이 daily 또는 weekly인 경우 빈 배열을 반환해야 한다.
  it('반복 유형이 매일이나 매주인 경우 빈 배열을 반환한다.', () => {
    const selectedDate = new Date(2025, 4, 15).toString();
    expect(getRepeatOptions('daily', selectedDate)).toEqual([]);
    expect(getRepeatOptions('weekly', selectedDate)).toEqual([]);
  });
});
