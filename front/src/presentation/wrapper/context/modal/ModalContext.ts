import { createContext } from "react";
import type { ModalContextProps } from "../../type/modal/ModalType";

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);
