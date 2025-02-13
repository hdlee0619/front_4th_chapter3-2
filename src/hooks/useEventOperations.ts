import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatedEvents } from '../utils/repeatUtils.ts';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * 이벤트 저장
   * - 반복 일정이 설정되어 있다면(즉, repeat.type !== 'none') 반복 이벤트들을 배열로 생성하여
   *   /api/events-list 로 요청한다.
   * - 그렇지 않으면 기존 단일 이벤트 엔드포인트(/api/events)로 요청한다.
   * - 편집 시(editing === true)는 PUT 요청을 사용한다.
   */
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (!editing && eventData.repeat.type !== 'none') {
        // 새로운 반복 일정: 반복 이벤트 배열 생성 후 /api/events-list로 POST
        const repeatedEvents = generateRepeatedEvents(eventData);
        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: repeatedEvents }),
        });
      } else if (editing) {
        if (eventData.repeat.type !== 'none') {
          // 편집인 경우에도 반복 이벤트이면 /api/events-list로 PUT 요청
          response = await fetch('/api/events-list', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              events: [
                {
                  ...eventData,
                  repeat: { ...eventData.repeat, type: 'none', id: undefined },
                },
              ],
            }),
          });
        } else {
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...eventData,
              repeat: { ...eventData.repeat, type: 'none', id: undefined },
            }),
          });
        }
      } else {
        // 반복 설정이 없는 단일 이벤트일 경우
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id: string, mode: 'all' | 'single') => {
    try {
      const event = events.find((e) => e.id === id);

      if (event?.repeat?.id) {
        if (mode === 'all') {
          const relatedEventIds = events
            .filter((e) => e.repeat?.id === event.repeat.id)
            .map((e) => e.id);

          await fetch('/api/events-list', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventIds: relatedEventIds }),
          });
        } else {
          await fetch(`/api/events/${id}`, {
            method: 'DELETE',
          });
        }
      } else {
        await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });
      }

      await fetchEvents();
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '일정 삭제 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  async function init() {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
