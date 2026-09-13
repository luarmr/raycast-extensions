import React from "react";
import {
  Detail,
  ActionPanel,
  Action,
  Icon,
  Keyboard,
  environment,
  showToast,
  Toast,
} from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useGraphData } from "../hooks/useGraphData";
import { useGraphNavigation } from "../hooks/useGraphNavigation";
import { useTheme } from "../hooks/useTheme";
import { CARD_WIDTH, renderGraphToSVG } from "../utils/renderUtils";
import { THEME_INFO, themeFor } from "../lib/themes";
import {
  SHARE_SCALE,
  ShareMode,
  canShareImage,
  shareGraphImage,
} from "../lib/share";
import { GraphProps } from "../types";

const Graph: React.FC<GraphProps> = ({ expression }) => {
  const {
    dataSegments,
    result,
    svgRendered,
    error,
    xMin,
    xMax,
    yMin,
    yMax,
    setXMin,
    setXMax,
    setYMin,
    setYMax,
  } = useGraphData(expression);

  const { zoomIn, zoomOut, moveLeft, moveRight, moveUp, moveDown, resetView } =
    useGraphNavigation(
      xMin,
      xMax,
      yMin,
      yMax,
      setXMin,
      setXMax,
      setYMin,
      setYMax,
    );

  const { theme, setTheme, nextTheme } = useTheme();
  const graphTheme = themeFor(theme, environment.appearance);

  const cycleTheme = () => {
    const next = nextTheme();
    showToast({
      style: Toast.Style.Success,
      title: "Theme Changed",
      message: `Graph theme set to ${THEME_INFO.find((t) => t.id === next)?.title ?? next}.`,
    });
  };

  /** The on-screen card, at export resolution. */
  const shareSvg = () =>
    renderGraphToSVG(
      expression,
      dataSegments,
      [xMin, xMax],
      [yMin, yMax],
      graphTheme,
      { displayWidth: CARD_WIDTH * SHARE_SCALE, title: expression },
    );

  const shareImage = async (mode: ShareMode) => {
    try {
      await shareGraphImage(shareSvg(), mode, expression);
    } catch (error) {
      await showFailureToast(error, { title: "Could not render the image" });
    }
  };

  return (
    <Detail
      markdown={
        error
          ? `## Error\n\n${error}`
          : result !== null
            ? `\\[${expression} = ${result}\\]`
            : svgRendered
              ? `<img src="data:image/svg+xml;base64,${Buffer.from(
                  renderGraphToSVG(
                    expression,
                    dataSegments,
                    [xMin, xMax],
                    [yMin, yMax],
                    graphTheme,
                    { title: expression },
                  ),
                ).toString("base64")}" alt="Graph" />`
              : `$$${expression}$$\n\n`
      }
      actions={
        !error &&
        result === null && (
          <ActionPanel>
            <ActionPanel.Section>
              <Action title="Zoom in" onAction={zoomIn} />
              <Action title="Zoom out" onAction={zoomOut} />
              <Action
                title="Move up"
                onAction={moveUp}
                shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
              />
              <Action
                title="Move Down"
                onAction={moveDown}
                shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
              />
              <Action
                title="Move Left"
                onAction={moveLeft}
                shortcut={{ modifiers: ["cmd", "shift"], key: "arrowLeft" }}
              />
              <Action
                title="Move Right"
                onAction={moveRight}
                shortcut={{ modifiers: ["cmd", "shift"], key: "arrowRight" }}
              />
              <Action
                title="Reset View"
                onAction={resetView}
                shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Share">
              {canShareImage && (
                <>
                  <Action
                    title="Copy Image"
                    icon={Icon.Image}
                    shortcut={Keyboard.Shortcut.Common.Copy}
                    onAction={() => shareImage("copy")}
                  />
                  <Action
                    title="Paste Image"
                    icon={Icon.Clipboard}
                    shortcut={{
                      macOS: { modifiers: ["cmd", "shift"], key: "v" },
                      Windows: { modifiers: ["ctrl", "shift"], key: "v" },
                    }}
                    onAction={() => shareImage("paste")}
                  />
                  <Action
                    title="Save Image to Downloads"
                    icon={Icon.Download}
                    shortcut={{
                      macOS: { modifiers: ["cmd", "shift"], key: "s" },
                      Windows: { modifiers: ["ctrl", "shift"], key: "s" },
                    }}
                    onAction={() => shareImage("save")}
                  />
                </>
              )}
              <Action.CopyToClipboard
                title="Copy SVG"
                icon={Icon.Code}
                content={shareSvg()}
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Theme">
              <Action
                title="Next Theme"
                icon={Icon.Brush}
                onAction={cycleTheme}
                shortcut={{ modifiers: ["cmd", "shift"], key: ";" }}
              />
              <ActionPanel.Submenu
                title="Switch Theme"
                icon={Icon.Brush}
                shortcut={{
                  macOS: { modifiers: ["cmd"], key: "t" },
                  Windows: { modifiers: ["ctrl"], key: "t" },
                }}
              >
                {THEME_INFO.map((t) => (
                  <Action
                    key={t.id}
                    title={t.title}
                    icon={theme === t.id ? Icon.CheckCircle : Icon.Circle}
                    onAction={() => setTheme(t.id)}
                  />
                ))}
              </ActionPanel.Submenu>
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
    />
  );
};

export default Graph;
