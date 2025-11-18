/**
 * User-related type definitions
 * Shared between frontend and backend (when using TypeScript schemas)
 */
interface User {
    id: number;
    email: string;
    name?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
interface UserCreate {
    email: string;
    password: string;
    name?: string;
    is_active?: boolean;
}
interface UserUpdate {
    name?: string;
    is_active?: boolean;
    password?: string;
}
interface UserLogin {
    email: string;
    password: string;
}
interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

/**
 * Project-related type definitions
 */

interface Project {
    id: number;
    name: string;
    description?: string | null;
    owner_id: number;
    archived?: boolean;
    created_at?: string;
    updated_at?: string;
    owner?: User;
    members?: User[];
}
interface ProjectCreate {
    name: string;
    description?: string;
}
interface ProjectUpdate {
    name?: string;
    description?: string;
    archived?: boolean;
}
interface ProjectWithDetails extends Project {
    task_count?: number;
    member_count?: number;
}

/**
 * Task-related type definitions
 */

type TaskStatus = 'todo' | 'doing' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
interface Task {
    id: number;
    project_id: number;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
    assignee_id?: number | null;
    created_at?: string;
    updated_at?: string;
    assignee?: User;
}
interface TaskCreate {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    assignee_id?: number;
}
interface TaskUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    assignee_id?: number;
}
interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    overdue?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
}

/**
 * Comment-related type definitions
 */

interface Comment {
    id: number;
    task_id: number;
    author_id: number;
    body: string;
    created_at?: string;
    author?: User;
}
interface CommentCreate {
    body: string;
}
interface CommentUpdate {
    body: string;
}

/**
 * Pagination-related type definitions
 */
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}
interface PaginationParams {
    page?: number;
    page_size?: number;
    q?: string;
    search?: string;
}

/**
 * Task status constants
 */
declare const TASK_STATUS: {
    readonly TODO: "todo";
    readonly DOING: "doing";
    readonly DONE: "done";
};
declare const TASK_STATUS_LABELS: Record<string, string>;
/**
 * Task priority constants
 */
declare const TASK_PRIORITY: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
};
declare const TASK_PRIORITY_LABELS: Record<string, string>;
/**
 * Pagination defaults
 */
declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 100;
};
/**
 * API Routes (base paths)
 */
declare const API_ROUTES: {
    readonly AUTH: {
        readonly LOGIN: "/users/login";
        readonly REGISTER: "/users";
    };
    readonly USERS: "/users";
    readonly PROJECTS: "/projects";
    readonly TASKS: "/tasks";
    readonly COMMENTS: "/comments";
};
/**
 * HTTP Status Codes
 */
declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
/**
 * Token storage keys
 */
declare const STORAGE_KEYS: {
    readonly ACCESS_TOKEN: "access_token";
    readonly USER: "user";
};

/**
 * Date formatting utilities
 */
/**
 * Format date string to readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Nov 18, 2025")
 */
declare function formatDate(dateString: string | null | undefined): string;
/**
 * Format date to datetime string
 * @param dateString - ISO date string
 * @returns Formatted datetime string (e.g., "Nov 18, 2025 10:30 AM")
 */
declare function formatDateTime(dateString: string | null | undefined): string;
/**
 * Check if a date is overdue
 * @param dateString - ISO date string
 * @returns true if date is in the past
 */
declare function isOverdue(dateString: string | null | undefined): boolean;
/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
declare function formatRelativeTime(dateString: string | null | undefined): string;

/**
 * String formatting utilities
 */
/**
 * Truncate string to specified length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string with ellipsis
 */
declare function truncate(str: string | null | undefined, maxLength: number): string;
/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
declare function capitalize(str: string | null | undefined): string;
/**
 * Convert snake_case to Title Case
 * @param str - Snake case string
 * @returns Title case string
 */
declare function snakeToTitle(str: string | null | undefined): string;
/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
declare function getInitials(name: string | null | undefined): string;

/**
 * Form validation utilities
 */
/**
 * Validate email format
 * @param email - Email string
 * @returns true if valid email format
 */
declare function isValidEmail(email: string): boolean;
/**
 * Validate password strength
 * @param password - Password string
 * @returns Object with isValid flag and message
 */
declare function validatePassword(password: string): {
    isValid: boolean;
    message: string;
};
/**
 * Validate required field
 * @param value - Field value
 * @param fieldName - Field name for error message
 * @returns Error message or empty string
 */
declare function validateRequired(value: unknown, fieldName: string): string;
/**
 * Validate minimum length
 * @param value - String value
 * @param minLength - Minimum length
 * @param fieldName - Field name for error message
 * @returns Error message or empty string
 */
declare function validateMinLength(value: string, minLength: number, fieldName: string): string;

export { API_ROUTES, type AuthResponse, type Comment, type CommentCreate, type CommentUpdate, HTTP_STATUS, PAGINATION, type PaginatedResponse, type PaginationParams, type Project, type ProjectCreate, type ProjectUpdate, type ProjectWithDetails, STORAGE_KEYS, TASK_PRIORITY, TASK_PRIORITY_LABELS, TASK_STATUS, TASK_STATUS_LABELS, type Task, type TaskCreate, type TaskFilters, type TaskPriority, type TaskStatus, type TaskUpdate, type User, type UserCreate, type UserLogin, type UserUpdate, capitalize, formatDate, formatDateTime, formatRelativeTime, getInitials, isOverdue, isValidEmail, snakeToTitle, truncate, validateMinLength, validatePassword, validateRequired };
