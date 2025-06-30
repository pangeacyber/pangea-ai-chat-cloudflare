import type { BaseMessage } from "@langchain/core/messages";
import { BaseTracer, type Run } from "langchain/callbacks";

import { auditLogBulk } from "./requests";

/** Tracer that creates events in Pangea's Secure Audit Log. */
export class PangeaAuditCallbackHandler extends BaseTracer {
  name = "pangea_audit_callback_handler";
  awaitHandlers = true;

  protected override persistRun(_run: Run): Promise<void> {
    return Promise.resolve();
  }

  override async onLLMStart(run: Run): Promise<void> {
    if (!run.inputs?.messages) {
      return;
    }

    await auditLogBulk([
      {
        trace_id: run.trace_id!,
        type: "llm/start",
        start_time: new Date(run.start_time!),
        model: run.extra?.invocation_params?.model,
        input: JSON.stringify(
          (run.inputs.messages as BaseMessage[][]).flat().map((msg) => ({
            content: msg.content,
            type: msg.getType(),
          })),
        ),
        actor: run.extra?.metadata?.authn_info,
        authn_info: run.extra?.metadata?.authn_info,
        source: run.extra?.metadata?.source,
      },
    ]);
  }

  override async onLLMEnd(run: Run): Promise<void> {
    if (!run.outputs?.generations) {
      return;
    }

    const generations: { text: string }[] = run.outputs.generations.flat();
    if (!generations.length) {
      return;
    }

    await auditLogBulk(
      generations.map(({ text }) => ({
        trace_id: run.trace_id!,
        type: "llm/end",
        start_time: new Date(run.start_time!),
        end_time: new Date(run.end_time!),
        model: run.extra?.invocation_params?.model,
        output: text,
        actor: run.extra?.metadata?.authn_info,
        authn_info: run.extra?.metadata?.authn_info,
        source: run.extra?.metadata?.source,
      })),
    );
  }
}
