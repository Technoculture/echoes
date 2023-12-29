import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const labels2 = [
  // for internal and external
  {
    value: "external",
    label: "External",
  },
  {
    value: "internal",
    label: "Internal",
  },
];

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "todo",
    label: "Todo",
    icon: CircleIcon,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: StopwatchIcon,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircledIcon,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CrossCircledIcon,
  },
];

export const accesses = [
  {
    value: "confidential",
    label: "Confidential",
    icon: LockClosedIcon,
  },
  {
    value: "non-confidential",
    label: "Non-Confidential",
    icon: LockOpen1Icon,
  },
];

// Patent / Paper / Documentation / Internal Report
export const doctypes = [
  {
    value: "patent",
    label: "Patent",
  },
  {
    value: "paper",
    label: "Paper",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
  {
    value: "internal-report",
    label: "Internal Report",
  },
];
export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];
