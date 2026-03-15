import { useState } from "react";

export type DisclosureState<Input = unknown, Output = unknown> = {
  isOpen: boolean;
  input?: Input;
  onOpen: (input?: Input) => void;
  onClose: () => void;
  onToggle: () => void;
  onOk: (output?: Output) => void;
  updateInput: (input?: Input) => void;
};

export function useDisclosure<Input = unknown, Output = unknown>(): DisclosureState<Input, Output> {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<Input | undefined>();

  const onOpen = (data?: Input) => {
    setInput(data);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setInput(undefined);
  };

  const onToggle = () => {
    setIsOpen(prev => !prev);
  };

  const onOk = (_?: Output) => {
    setIsOpen(false);
  };

  const updateInput = (data?: Input) => {
    setInput(data);
  };

  return {
    isOpen,
    input,
    onOpen,
    onClose,
    onToggle,
    onOk,
    updateInput,
  };
}