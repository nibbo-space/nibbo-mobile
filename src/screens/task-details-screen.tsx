import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { fetchTasks } from "../api/tasks";
import { Screen } from "../components/screen";

export function TaskDetailsScreen() {
  const { taskId } = useParams({ strict: false });
  const tasksQuery = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => fetchTasks("all"),
  });

  const task = tasksQuery.data?.find((item) => item.id === taskId);

  return (
    <Screen>
      {!task ? (
        <p className="text-sm text-muted">Task not found</p>
      ) : (
        <article className="rounded-2xl bg-surface p-4 shadow-card">
          <h1 className="text-2xl font-semibold">{task.title}</h1>
          <p className="mt-2 text-sm text-muted">{task.description || "No description"}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted">Priority</dt>
            <dd>{task.priority}</dd>
            <dt className="text-muted">Due date</dt>
            <dd>{task.dueDate || "Not set"}</dd>
            <dt className="text-muted">Board</dt>
            <dd>{task.boardName}</dd>
            <dt className="text-muted">Column</dt>
            <dd>{task.columnName}</dd>
          </dl>
        </article>
      )}
    </Screen>
  );
}
