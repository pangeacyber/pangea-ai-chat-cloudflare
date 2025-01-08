import type { DocumentInterface } from "@langchain/core/documents";
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

import type { PangeaResponse } from "@src/types";

export interface ChatContextProps {
  loading: boolean;
  systemPrompt: string;
  userPrompt: string;
  promptGuardEnabled: boolean;
  dataGuardEnabled: boolean;
  authzEnabled: boolean;
  sidePanelOpen: boolean;
  rightPanelOpen: boolean;
  auditPanelOpen: boolean;
  loginOpen: boolean;
  promptGuardResponse: Partial<PangeaResponse<unknown>>;
  aiGuardResponses: readonly [
    Partial<PangeaResponse<unknown>>,
    Partial<PangeaResponse<unknown>>,
  ];
  authzResponses: readonly PangeaResponse<unknown>[];
  documents: readonly DocumentInterface[];
  setLoading: (value: boolean) => void;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  setPromptGuardEnabled: (value: boolean) => void;
  setDataGuardEnabled: (value: boolean) => void;
  setAuthzEnabled: (value: boolean) => void;
  setSidePanelOpen: (value: boolean) => void;
  setRightPanelOpen: (value: boolean) => void;
  setAuditPanelOpen: (value: boolean) => void;
  setLoginOpen: (value: boolean) => void;
  setPromptGuardResponse: (value: PangeaResponse<unknown>) => void;
  setAiGuardResponses: (
    value: readonly [PangeaResponse<unknown>, PangeaResponse<unknown>],
  ) => void;
  setAuthzResponses: (value: readonly PangeaResponse<unknown>[]) => void;
  setDocuments: (value: readonly DocumentInterface[]) => void;
}

const ChatContext = createContext<ChatContextProps>({
  loading: false,
  systemPrompt: "",
  userPrompt: "",
  promptGuardEnabled: true,
  dataGuardEnabled: true,
  authzEnabled: false,
  sidePanelOpen: true,
  rightPanelOpen: false,
  auditPanelOpen: false,
  loginOpen: false,
  promptGuardResponse: {},
  aiGuardResponses: [{}, {}],
  authzResponses: [],
  documents: [],
  setLoading: () => {},
  setSystemPrompt: () => {},
  setUserPrompt: () => {},
  setPromptGuardEnabled: () => {},
  setDataGuardEnabled: () => {},
  setAuthzEnabled: () => {},
  setSidePanelOpen: () => {},
  setAuditPanelOpen: () => {},
  setRightPanelOpen: () => {},
  setLoginOpen: () => {},
  setPromptGuardResponse: () => {},
  setAiGuardResponses: () => {},
  setAuthzResponses: () => {},
  setDocuments: () => {},
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
  const [authzEnabled, setAuthzEnabled] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [promptGuardResponse, setPromptGuardResponse] = useState({});
  const [aiGuardResponses, setAiGuardResponses] = useState<
    readonly [
      Partial<PangeaResponse<unknown>>,
      Partial<PangeaResponse<unknown>>,
    ]
  >([{}, {}]);
  const [authzResponses, setAuthzResponses] = useState<
    readonly PangeaResponse<unknown>[]
  >([]);
  const [documents, setDocuments] = useState<readonly DocumentInterface[]>([]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: TODO
  const memoData = useMemo(
    () => ({
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      authzEnabled,
      sidePanelOpen,
      rightPanelOpen,
      auditPanelOpen,
      loginOpen,
      promptGuardResponse,
      aiGuardResponses,
      authzResponses,
      documents,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setAuthzEnabled,
      setSidePanelOpen,
      setRightPanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
      setPromptGuardResponse,
      setAiGuardResponses,
      setAuthzResponses,
      setDocuments,
    }),
    [
      loading,
      systemPrompt,
      userPrompt,
      promptGuardEnabled,
      dataGuardEnabled,
      authzEnabled,
      sidePanelOpen,
      rightPanelOpen,
      auditPanelOpen,
      loginOpen,
      promptGuardResponse,
      aiGuardResponses,
      authzResponses,
      documents,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setPromptGuardEnabled,
      setDataGuardEnabled,
      setAuthzEnabled,
      setSidePanelOpen,
      setRightPanelOpen,
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
