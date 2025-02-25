import { List, getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { partition } from "lodash";
import { useMemo, useState } from "react";

import { getGitHubClient } from "./api/githubClient";
import NotificationListItem from "./components/NotificationListItem";
import RepositoriesDropdown from "./components/RepositoryDropdown";
import { getNotificationIcon, Notification } from "./helpers/notifications";
import { withGitHubClient } from "./helpers/withGithubClient";
import { useViewer } from "./hooks/useViewer";

export type NotificationWithIcon = Notification & { icon: Awaited<ReturnType<typeof getNotificationIcon>> };

// Define preferences interface
interface NotificationsPreferences {
  notificationTypeFilter: boolean;
  notificationType: string;
  repositoryFilterEnabled: boolean;
  repositoryFilterMode: "include" | "exclude";
  repositoryList: string;
}

function Notifications() {
  const { octokit } = getGitHubClient();
  const preferences = getPreferenceValues<NotificationsPreferences>();
  
  const viewer = useViewer();

  const [selectedRepository, setSelectedRepository] = useState<string | null>(null);
  
  // Parse repository list
  const repositoryListArray = useMemo(() => {
    if (!preferences.repositoryList) return [];
    return preferences.repositoryList
      .split(",")
      .map(repo => repo.trim())
      .filter(repo => repo.length > 0);
  }, [preferences.repositoryList]);

  const {
    data,
    isLoading,
    mutate: mutateList,
  } = useCachedPromise(async () => {
    const response = await octokit.activity.listNotificationsForAuthenticatedUser({ all: true });
    return Promise.all(
      response.data.map(async (notification: Notification) => {
        const icon = await getNotificationIcon(notification);
        return { ...notification, icon };
      }),
    );
  });

  const notifications = useMemo(() => {
    if (!data) return undefined;
    
    let filteredNotifications = [...data];
    
    // Filter by dropdown selection (keeping this for backwards compatibility)
    if (selectedRepository) {
      filteredNotifications = filteredNotifications.filter(
        (notification) => notification.repository.full_name === selectedRepository
      );
    }
    
    // Filter by notification type
    if (preferences.notificationTypeFilter && preferences.notificationType !== "all") {
      filteredNotifications = filteredNotifications.filter(
        (notification) => notification.subject.type === preferences.notificationType
      );
    }
    
    // Filter by repository list
    if (preferences.repositoryFilterEnabled && repositoryListArray.length > 0) {
      if (preferences.repositoryFilterMode === "include") {
        // Include only repositories in the list (case insensitive)
        filteredNotifications = filteredNotifications.filter(
          (notification) => repositoryListArray.some(repo => 
            repo.toLowerCase() === notification.repository.full_name.toLowerCase()
          )
        );
      } else {
        // Exclude repositories in the list (case insensitive)
        filteredNotifications = filteredNotifications.filter(
          (notification) => !repositoryListArray.some(repo => 
            repo.toLowerCase() === notification.repository.full_name.toLowerCase()
          )
        );
      }
    }
    
    return filteredNotifications;
  }, [data, selectedRepository, preferences, repositoryListArray]);

  const [unreadNotifications, readNotifications] = partition(notifications, (notification) => notification.unread);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter by title"
      searchBarAccessory={<RepositoriesDropdown setSelectedRepository={setSelectedRepository} />}
    >
      {unreadNotifications.length > 0 ? (
        <List.Section title="Unread">
          {unreadNotifications.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              userId={viewer?.id}
              mutateList={mutateList}
            />
          ))}
        </List.Section>
      ) : null}

      {readNotifications.length > 0 ? (
        <List.Section title="Read">
          {readNotifications.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              userId={viewer?.id}
              mutateList={mutateList}
            />
          ))}
        </List.Section>
      ) : null}

      <List.EmptyView title="No recent notifications found" />
    </List>
  );
}

export default withGitHubClient(Notifications);
