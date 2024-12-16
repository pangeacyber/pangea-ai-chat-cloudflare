import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

import { Colors } from "@app/theme";

export async function highlight(code: string) {
  const out = await codeToHast(code, {
    lang: "ts",
    theme: "github-dark",
    colorReplacements: {
      "#24292e": Colors.shiki.background,
    },
  });

  return toJsxRuntime(out, { Fragment, jsx, jsxs });
}
