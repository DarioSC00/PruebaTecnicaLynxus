// src/constants/index.ts
var TASK_STATUS = {
  TODO: "todo",
  DOING: "doing",
  DONE: "done"
};
var TASK_STATUS_LABELS = {
  todo: "To Do",
  doing: "In Progress",
  done: "Done"
};
var TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
};
var TASK_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High"
};
var PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};
var API_ROUTES = {
  AUTH: {
    LOGIN: "/users/login",
    REGISTER: "/users"
  },
  USERS: "/users",
  PROJECTS: "/projects",
  TASKS: "/tasks",
  COMMENTS: "/comments"
};
var HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};
var STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER: "user"
};

// src/utils/date.utils.ts
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  } catch {
    return "Invalid Date";
  }
}
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  } catch {
    return "Invalid Date";
  }
}
function isOverdue(dateString) {
  if (!dateString) return false;
  try {
    const dueDate = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    return dueDate < now;
  } catch {
    return false;
  }
}
function formatRelativeTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1e3);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return formatDate(dateString);
  } catch {
    return "Invalid Date";
  }
}

// src/utils/string.utils.ts
function truncate(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function snakeToTitle(str) {
  if (!str) return "";
  return str.split("_").map((word) => capitalize(word)).join(" ");
}
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// src/utils/validation.utils.ts
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  return { isValid: true, message: "Password is strong" };
}
function validateRequired(value, fieldName) {
  if (value === null || value === void 0 || value === "") {
    return `${fieldName} is required`;
  }
  return "";
}
function validateMinLength(value, minLength, fieldName) {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return "";
}
export {
  API_ROUTES,
  HTTP_STATUS,
  PAGINATION,
  STORAGE_KEYS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  capitalize,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getInitials,
  isOverdue,
  isValidEmail,
  snakeToTitle,
  truncate,
  validateMinLength,
  validatePassword,
  validateRequired
};
