import type { Memory } from "../types";
import { contextUpdateTool } from "./context-update-tool";
import { classifyEmailTool } from "./email-classify-tool";
import { generateReplyDraftTool } from "./email-draft-tool";
import { sendEmailTool } from "./email-send-tool";

export const getEmailTools = (env: Env, state: Memory) => {
  return {
    classifyEmail: classifyEmailTool(env),
    generateReplyDraft: generateReplyDraftTool(env),
    sendEmail: sendEmailTool(env, state),
  };
};

export const getContextTools = (env: Env, state: Memory) => {
  return {
    updateContext: contextUpdateTool(env, state),
  };
};
