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
  authzEnabled: boolean;
  sidePanelOpen: boolean;
  rightPanelOpen: boolean;
  auditPanelOpen: boolean;
  loginOpen: boolean;
  aiGuardResponses: readonly [
    Partial<PangeaResponse<unknown>>,
    Partial<PangeaResponse<unknown>>,
  ];
  authzResponses: readonly PangeaResponse<unknown>[];
  documents: readonly DocumentInterface[];
  detectors: Readonly<{
    code_detection: boolean;
    language_detection: boolean;
    malicious_entity: boolean;
    pii_entity: boolean;
    prompt_injection: boolean;
    secrets_detection: boolean;
    [x: string]: boolean;
  }>;
  setLoading: (value: boolean) => void;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  setAuthzEnabled: (value: boolean) => void;
  setSidePanelOpen: (value: boolean) => void;
  setRightPanelOpen: (value: boolean) => void;
  setAuditPanelOpen: (value: boolean) => void;
  setLoginOpen: (value: boolean) => void;
  setAiGuardResponses: (
    value: readonly [PangeaResponse<unknown>, PangeaResponse<unknown>],
  ) => void;
  setAuthzResponses: (value: readonly PangeaResponse<unknown>[]) => void;
  setDocuments: (value: readonly DocumentInterface[]) => void;
  setDetectors: (
    value: Readonly<{
      code_detection: boolean;
      language_detection: boolean;
      malicious_entity: boolean;
      pii_entity: boolean;
      prompt_injection: boolean;
      secrets_detection: boolean;
    }>,
  ) => void;
}

const ChatContext = createContext<ChatContextProps>({
  loading: false,
  systemPrompt: "",
  userPrompt: "",
  authzEnabled: false,
  sidePanelOpen: true,
  rightPanelOpen: false,
  auditPanelOpen: false,
  loginOpen: false,
  aiGuardResponses: [{}, {}],
  authzResponses: [],
  documents: [],
  detectors: {
    code_detection: true,
    language_detection: true,
    malicious_entity: true,
    pii_entity: true,
    prompt_injection: true,
    secrets_detection: true,
  },
  setLoading: () => {},
  setSystemPrompt: () => {},
  setUserPrompt: () => {},
  setAuthzEnabled: () => {},
  setSidePanelOpen: () => {},
  setRightPanelOpen: () => {},
  setAuditPanelOpen: () => {},
  setLoginOpen: () => {},
  setAiGuardResponses: () => {},
  setAuthzResponses: () => {},
  setDocuments: () => {},
  setDetectors: () => {},
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
  const [authzEnabled, setAuthzEnabled] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
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
  const [detectors, setDetectors] = useState<
    Readonly<{
      code_detection: boolean;
      language_detection: boolean;
      malicious_entity: boolean;
      pii_entity: boolean;
      prompt_injection: boolean;
      secrets_detection: boolean;
    }>
  >({
    code_detection: true,
    language_detection: true,
    malicious_entity: true,
    pii_entity: true,
    prompt_injection: true,
    secrets_detection: true,
  });

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
      authzEnabled,
      sidePanelOpen,
      rightPanelOpen,
      auditPanelOpen,
      loginOpen,
      aiGuardResponses,
      authzResponses,
      documents,
      detectors,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setAuthzEnabled,
      setSidePanelOpen,
      setRightPanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
      setAiGuardResponses,
      setAuthzResponses,
      setDocuments,
      setDetectors,
    }),
    [
      loading,
      systemPrompt,
      userPrompt,
      authzEnabled,
      sidePanelOpen,
      rightPanelOpen,
      auditPanelOpen,
      loginOpen,
      aiGuardResponses,
      authzResponses,
      documents,
      detectors,
      setLoading,
      setSystemPrompt,
      setUserPrompt,
      setAuthzEnabled,
      setSidePanelOpen,
      setRightPanelOpen,
      setAuditPanelOpen,
      setLoginOpen,
      setDetectors,
    ],
  );

  return (
    <ChatContext.Provider value={memoData}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
