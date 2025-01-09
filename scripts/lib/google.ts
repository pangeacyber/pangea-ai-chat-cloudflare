import { docs, type docs_v1 } from "@googleapis/docs";
import { drive, type drive_v3, auth as gauth } from "@googleapis/drive";
import { sheets, type sheets_v4 } from "@googleapis/sheets";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import type { DocumentInterface } from "@langchain/core/documents";
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import type {
  ExternalAccountClientOptions,
  JWTInput,
} from "google-auth-library";
import { markdownTable } from "markdown-table";

export interface GoogleDriveRetrieverArgs extends BaseRetrieverInput {
  credentials: JWTInput | ExternalAccountClientOptions;
  folderId: string;
  scopes: string[];
}

export class GoogleDriveRetriever extends BaseRetriever {
  static lc_name() {
    return "GoogleDriveRetriever";
  }

  lc_namespace = ["pangeacyber", "retrievers", "google_drive_retriever"];

  private folderId: string;

  private documents: docs_v1.Resource$Documents;
  private files: drive_v3.Resource$Files;
  private spreadsheets: sheets_v4.Resource$Spreadsheets;

  constructor(args: GoogleDriveRetrieverArgs) {
    super(args);
    this.folderId = args.folderId;

    const auth = new gauth.GoogleAuth({
      credentials: args.credentials,
      scopes: args.scopes,
    });
    this.documents = docs({ version: "v1", auth }).documents;
    this.files = drive({ version: "v3", auth }).files;
    this.spreadsheets = sheets({ version: "v4", auth }).spreadsheets;
  }

  async _getRelevantDocuments(
    _query: string,
    _runManager?: CallbackManagerForRetrieverRun,
  ): Promise<DocumentInterface<Record<string, unknown>>[]> {
    const results = await this.files.list({
      q:
        // biome-ignore lint/style/useTemplate: <explanation>
        `'${this.folderId}' in parents ` +
        `and (mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.document') ` +
        "and trashed = false",
    });

    if (!results.data.files) {
      return [];
    }

    const docs = await Promise.all(
      results.data.files.map((file) =>
        file.id ? this._loadFile(file) : Promise.resolve(null),
      ),
    );

    return docs.filter((doc) => doc !== null);
  }

  async _loadDocumentFromFile(
    fileId: string,
  ): Promise<DocumentInterface<Record<string, unknown>>> {
    const document = await this.documents.get({ documentId: fileId });
    let content = "";
    for (const element of document.data.body?.content ?? []) {
      if (!element.paragraph) {
        continue;
      }
      content +=
        element.paragraph.elements?.map((e) => e.textRun?.content).join("") ??
        "";
    }
    return {
      id: fileId,
      pageContent: content,
      metadata: {},
    };
  }

  async _loadSheetFromFile(
    fileId: string,
  ): Promise<DocumentInterface<Record<string, unknown>>> {
    const spreadsheet = await this.spreadsheets.get({ spreadsheetId: fileId });
    const sheets_ = spreadsheet.data.sheets ?? [];

    for (const sheet of sheets_) {
      // Needs to be `string | undefined` specifically. `null` must not be
      // present.
      const sheetName = sheet.properties?.title ?? undefined;
      const result = await this.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: sheetName,
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      const values = result.data.values ?? [];
      return {
        id: fileId,
        pageContent: markdownTable(values),
        metadata: {
          // This duplicates the higher-level document ID but it's ultimately
          // how the document ID will be propagated to Vectorize and used later
          // for the AuthZ check.
          documentId: fileId,
        },
      };
    }

    throw new Error(`No sheets found in spreadsheet '${fileId}'.`);
  }

  _loadFile(file: drive_v3.Schema$File) {
    if (file.mimeType === "application/vnd.google-apps.document") {
      return this._loadDocumentFromFile(file.id!);
    }
    if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
      return this._loadSheetFromFile(file.id!);
    }
    throw new TypeError(`Unsupported file type: ${file.mimeType}`);
  }
}
