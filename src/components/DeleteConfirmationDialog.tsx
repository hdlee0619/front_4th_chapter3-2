import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Radio,
  VStack,
  Text,
  AlertDialogFooter,
  Button,
  RadioGroup,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { Event } from '../types.ts';

interface Props {
  event?: Event;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (mode: 'single' | 'all') => void;
}

export const DeleteConfirmDialog = ({ event, isOpen, onClose, onDelete }: Props) => {
  const deleteRef = useRef<HTMLButtonElement>(null);
  const [deleteMode, setDeleteMode] = useState<'single' | 'all'>('single');
  const isRepeating = Boolean(event?.repeat?.id);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={deleteRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>일정 삭제</AlertDialogHeader>
          <AlertDialogBody>
            {isRepeating && (
              <RadioGroup value={deleteMode}>
                <VStack align="start" mb={4}>
                  <Radio
                    aria-label="single-delete"
                    value="single"
                    onChange={() => setDeleteMode('single')}
                  >
                    이 일정만 삭제
                  </Radio>
                  <Radio aria-label="all-delete" value="all" onChange={() => setDeleteMode('all')}>
                    모든 반복 일정 삭제
                  </Radio>
                </VStack>
              </RadioGroup>
            )}
            <Text>정말 삭제하시겠습니까?</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose}>취소</Button>
            <Button colorScheme="red" ml={3} onClick={() => onDelete(deleteMode)}>
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
