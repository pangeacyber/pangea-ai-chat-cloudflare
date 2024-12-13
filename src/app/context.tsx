import {
  type FC,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface ChatContextProps {
  loading: boolean;
  systemPrompt: string;
  userPrompt: string;
  promptGuardEnabled: boolean;
  dataGuardEnabled: boolean;
  sidePanelOpen: boolean;
  auditPanelOpen: boolean;
  loginOpen: boolean;
  setLoading: (value: boolean) => void;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  setPromptGuardEnabled: (value: boolean) => void;
  setDataGuardEnabled: (value: boolean) => void;
  setSidePanelOpen: (value: boolean) => void;
  setAuditPanelOpen: (value: boolean) => void;
  setLoginOpen: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextProps>({
  loading: false,
  systemPrompt: "",
  userPrompt: "",
  promptGuardEnabled: true,
  dataGuardEnabled: true,
  sidePanelOpen: true,
  auditPanelOpen: false,
  loginOpen: false,
  setLoading: () => {},
  setSystemPrompt: () => {},
  setUserPrompt: () => {},
  setPromptGuardEnabled: () => {},
  setDataGuardEnabled: () => {},
  setSidePanelOpen: () => {},
  setAuditPanelOpen: () => {},
  setLoginOpen: () => {},
});

export interface ChatProviderProps {
  children?: ReactNode;
}

export interface ChatMessage {
  hash: string;
  type: string;
  context?: unknown;
  input?: string;
  output?: string;
  findings?: string;
  malicious_count?: number;
}

const SYSTEM_PROMPT_KEY = "system_prompt";
const USER_PROMPT_KEY = "user_prompt";

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const mounted = useRef(false);

  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You're a helpful assistant.",
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [promptGuardEnabled, setPromptGuardEnabled] = useState(true);
  const [dataGuardEnabled, setDataGuardEnabled] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      const storedSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
      const storedUserPrompt = localStorage.getItem(USER_PROMPT_KEY);

      if (storedSystemPrompt) {
        setSystemPrompt(storedSystemPrompt);
      }
      if (storedUserPrompt) {
        setUserPrompt(storedUserPrompt);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem(USER_PROMPT_KEY, userPrompt);
  }, [userPrompt]);

  const memoData = useMemo(
    () => ({
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      auditPanelOpen,
      loginOpen,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setSidePanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
    }),
    [
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      auditPanelOpen,
      loginOpen,
    ],
  );

  return (
    <ChatContext.Provider value={memoData}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
