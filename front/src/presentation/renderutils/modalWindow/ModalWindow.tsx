import React from "react";
import styles from "./Modal.module.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles[size]}`} onClick={e => e.stopPropagation()}>
                {title && <h2>{title}</h2>}
                <div>{children}</div>
                <button onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
};
