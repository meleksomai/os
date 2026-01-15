import { contextUpdateTool } from "./context-update-tool";
import { classifyEmailTool } from "./email-classify-tool";
import { generateReplyDraftTool } from "./email-draft-tool";
import { sendEmailTool } from "./email-send-tool";

export const getEmailTools = (env: Env) => {
  return {
    classifyEmail: classifyEmailTool(env),
    generateReplyDraft: generateReplyDraftTool(env),
    sendEmail: sendEmailTool(env),
    updateContext: contextUpdateTool(env),
  };
};

export const getContextTools = (env: Env) => {
  return {
    updateContext: contextUpdateTool(env),
  };
};
