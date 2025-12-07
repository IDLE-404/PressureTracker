export interface ModalInstance {
  content: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
}

export type ModalKey = string;

export interface ModalContextProps {
  openModal: (key: ModalKey, modal: ModalInstance) => void;
  closeModal: (key: ModalKey) => void;
  isOpen: (key: ModalKey) => boolean;
}
