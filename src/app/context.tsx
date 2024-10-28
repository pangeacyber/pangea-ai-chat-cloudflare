import { cloneDeep } from "lodash";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface ChatContextProps {
  loading: boolean;
  processing: string;
  systemPrompt: string;
  userPrompt: string;
  messages: ChatMessage[];
  promptGuardEnabled: boolean;
  dataGuardEnabled: boolean;
  sidePanelOpen: boolean;
  auditPanelOpen: boolean;
  loginOpen: boolean;
  setLoading: (value: boolean) => void;
  setProcessing: (value: string) => void;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setPromptGuardEnabled: (value: boolean) => void;
  setDataGuardEnabled: (value: boolean) => void;
  setSidePanelOpen: (value: boolean) => void;
  setAuditPanelOpen: (value: boolean) => void;
  setLoginOpen: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextProps>({
  loading: false,
  processing: "",
  systemPrompt: "",
  userPrompt: "",
  messages: [],
  promptGuardEnabled: true,
  dataGuardEnabled: true,
  sidePanelOpen: true,
  auditPanelOpen: false,
  loginOpen: false,
  setLoading: () => {},
  setProcessing: () => {},
  setSystemPrompt: () => {},
  setUserPrompt: () => {},
  setMessages: () => {},
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
  context?: any;
  input?: string;
  output?: any;
  findings?: any;
  malicious_count?: number;
}

const SYSTEM_PROMPT_KEY = "system_prompt";
const USER_PROMPT_KEY = "user_prompt";

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const mounted = useRef(false);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [promptGuardEnabled, setPromptGuardEnabled] = useState(true);
  const [dataGuardEnabled, setDataGuardEnabled] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      const storedSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
      const storedUserPrompt = localStorage.getItem(USER_PROMPT_KEY);

      if (!!storedSystemPrompt) {
        setSystemPrompt(storedSystemPrompt);
      }
      if (!!storedUserPrompt) {
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
      processing,
      systemPrompt,
      userPrompt,
      messages,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      auditPanelOpen,
      loginOpen,
      setLoading,
      setProcessing,
      setSystemPrompt,
      setUserPrompt,
      setMessages,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setSidePanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
    }),
    [
      loading,
      processing,
      systemPrompt,
      userPrompt,
      messages,
      promptGuardEnabled,
      dataGuardEnabled,
      sidePanelOpen,
      auditPanelOpen,
      loginOpen,
      setLoading,
      setProcessing,
      setSystemPrompt,
      setUserPrompt,
      setMessages,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setSidePanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
    ],
  );

  return (
    <ChatContext.Provider value={memoData}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
