import React, { useState, type ReactNode } from "react";
import { ModalContext } from "../../context/modal/ModalContext";
import { Modal } from "@/presentation/renderutils/modalWindow/ModalWindow";
import type { ModalInstance, ModalKey } from "../../type/modal/ModalType";

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modals, setModals] = useState<Record<ModalKey, ModalInstance & { open: boolean }>>({});

    const openModal = (key: ModalKey, modal: ModalInstance) => {
        setModals(prev => ({ ...prev, [key]: { ...modal, open: true } }));
    };

    const closeModal = (key: ModalKey) => {
        setModals(prev => ({ ...prev, [key]: { ...prev[key], open: false } }));
    };

    const isOpen = (key: ModalKey) => !!modals[key]?.open;

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
            {children}
            {Object.entries(modals).map(([key, { content, title, open, size }]) => (
                <Modal key={key} isOpen={open} onClose={() => closeModal(key)} title={title} size={size}>
                    {content}
                </Modal>
            ))}
        </ModalContext.Provider>
    );
};
