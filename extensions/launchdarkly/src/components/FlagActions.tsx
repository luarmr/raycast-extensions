import { Action, ActionPanel, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { LDFlag, StoredFlagRef } from "../types";
import { getSnippets } from "../utils/snippets";
import { toFlagRef } from "../hooks/useStoredFlags";
import AuditLogList from "./AuditLogList";
import { FLAG_HISTORY_SHORTCUT } from "../utils/shortcuts";

export interface FlagActionContext {
  projectKey: string;
  isFavorite: (flag: { key: string }) => boolean;
  toggleFavorite: (ref: StoredFlagRef) => Promise<boolean>;
  recordVisit: (ref: StoredFlagRef) => Promise<void>;
}

interface FlagActionsProps extends FlagActionContext {
  flag: LDFlag;
  /** Deep link to the flag's targeting page. */
  url: string;
}

/** Actions shared by the flag list and the details view. Wrap in an ActionPanel. */
export function FlagOpenActions({ flag, url, projectKey, recordVisit }: FlagActionsProps) {
  return (
    <>
      <Action.OpenInBrowser
        icon={Icon.Globe}
        title="Open in LaunchDarkly"
        url={url}
        onOpen={() => recordVisit(toFlagRef(projectKey, flag))}
      />
      <Action.CopyToClipboard
        title="Copy Feature Flag Key"
        content={flag.key}
        shortcut={Keyboard.Shortcut.Common.Copy}
      />
    </>
  );
}

export function FlagSecondaryActions({ flag, url, projectKey, isFavorite, toggleFavorite }: FlagActionsProps) {
  const favorite = isFavorite(flag);

  return (
    <>
      <ActionPanel.Section title="Copy">
        <Action.CopyToClipboard title="Copy LaunchDarkly URL" content={url} />
        <ActionPanel.Submenu icon={Icon.Code} title="Copy Code Snippet">
          {getSnippets(flag).map((snippet) => (
            <Action.CopyToClipboard key={snippet.id} title={snippet.title} content={snippet.code} />
          ))}
        </ActionPanel.Submenu>
        <Action.CreateQuicklink
          title="Create Quicklink"
          quicklink={{ link: url, name: `LaunchDarkly: ${flag.name || flag.key}` }}
        />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action
          icon={favorite ? Icon.StarDisabled : Icon.Star}
          title={favorite ? "Remove from Favorites" : "Add to Favorites"}
          shortcut={Keyboard.Shortcut.Common.Pin}
          onAction={async () => {
            const added = await toggleFavorite(toFlagRef(projectKey, flag));
            await showToast({
              style: Toast.Style.Success,
              title: added ? "Added to favorites" : "Removed from favorites",
            });
          }}
        />
        <Action.Push
          icon={Icon.Clock}
          title="Show Change History"
          shortcut={FLAG_HISTORY_SHORTCUT}
          target={<AuditLogList projectKey={projectKey} flagKey={flag.key} flagName={flag.name} />}
        />
      </ActionPanel.Section>
    </>
  );
}
