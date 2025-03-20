import type { DocumentInterface } from "@langchain/core/documents";
import { Store, useStore } from "@tanstack/react-store";

import type { PangeaResponse } from "@src/types";

interface Detectors {
  code_detection: boolean;
  language_detection: boolean;
  malicious_entity: boolean;
  pii_entity: boolean;
  prompt_injection: boolean;
  secrets_detection: boolean;
  [x: string]: boolean;
}

export interface State {
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
  detectors: Readonly<Detectors>;
}

const STORAGE_KEY = "app-state";

let storedState: State | null = null;
try {
  storedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
} catch (_) {
  // No-op.
}

export const store = new Store<State>(
  storedState ?? {
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
  },
);

store.subscribe(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
});

export function useAppState() {
  const aiGuardResponses = useStore(
    store,
    ({ aiGuardResponses }) => aiGuardResponses,
  );
  const auditPanelOpen = useStore(
    store,
    ({ auditPanelOpen }) => auditPanelOpen,
  );
  const authzEnabled = useStore(store, ({ authzEnabled }) => authzEnabled);
  const authzResponses = useStore(
    store,
    ({ authzResponses }) => authzResponses,
  );
  const detectors = useStore(store, ({ detectors }) => detectors);
  const documents = useStore(store, ({ documents }) => documents);
  const loading = useStore(store, ({ loading }) => loading);
  const loginOpen = useStore(store, ({ loginOpen }) => loginOpen);
  const rightPanelOpen = useStore(
    store,
    ({ rightPanelOpen }) => rightPanelOpen,
  );
  const sidePanelOpen = useStore(store, ({ sidePanelOpen }) => sidePanelOpen);
  const systemPrompt = useStore(store, ({ systemPrompt }) => systemPrompt);
  const userPrompt = useStore(store, ({ userPrompt }) => userPrompt);

  return {
    aiGuardResponses,
    auditPanelOpen,
    authzEnabled,
    authzResponses,
    detectors,
    documents,
    loading,
    loginOpen,
    rightPanelOpen,
    sidePanelOpen,
    systemPrompt,
    userPrompt,

    // Actions.
    setAiGuardResponses: (
      aiGuardResponses: readonly [
        Partial<PangeaResponse<unknown>>,
        Partial<PangeaResponse<unknown>>,
      ],
    ) => store.setState((state) => ({ ...state, aiGuardResponses })),
    setAuthzEnabled: (authzEnabled: boolean) =>
      store.setState((state) => ({ ...state, authzEnabled })),
    setAuthzResponses: (authzResponses: readonly PangeaResponse<unknown>[]) =>
      store.setState((state) => ({ ...state, authzResponses })),
    setAuditPanelOpen: (auditPanelOpen: boolean) =>
      store.setState((state) => ({ ...state, auditPanelOpen })),
    setDetectors: (detectors: Readonly<Detectors>) =>
      store.setState((state) => ({ ...state, detectors })),
    setDocuments: (documents: readonly DocumentInterface[]) =>
      store.setState((state) => ({ ...state, documents })),
    setLoading: (loading: boolean) =>
      store.setState((state) => ({ ...state, loading })),
    setLoginOpen: (loginOpen: boolean) =>
      store.setState((state) => ({ ...state, loginOpen })),
    setRightPanelOpen: (rightPanelOpen: boolean) =>
      store.setState((state) => ({ ...state, rightPanelOpen })),
    setSidePanelOpen: (sidePanelOpen: boolean) =>
      store.setState((state) => ({ ...state, sidePanelOpen })),
    setSystemPrompt: (systemPrompt: string) =>
      store.setState((state) => ({ ...state, systemPrompt })),
    setUserPrompt: (userPrompt: string) =>
      store.setState((state) => ({ ...state, userPrompt })),
  };
}
