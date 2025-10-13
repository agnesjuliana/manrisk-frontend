export type MainRole =
  | "ADMIN"
  | "RISK_MANAGER"
  | "RISK_OWNER"
  | "CONTROL_OWNER"
  | "TOP_MANAGEMENT"

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: MainRole
  division?: string
}

const STORAGE_KEY = "isms:users:v1"

const DEFAULT_USERS: User[] = [
  {
    id: "u-1",
    name: "Agnes Juliana",
    email: "agnes@example.com",
    password: "password",
    role: "ADMIN",
    division: "IT",
  },
  {
    id: "u-2",
    name: "Budi Santoso",
    email: "budi@example.com",
    password: "password",
    role: "RISK_MANAGER",
    division: "Finance",
  },
]

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_USERS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_USERS
    return parsed
  } catch (e) {
    return DEFAULT_USERS
  }
}

export function saveUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch (e) {
    // ignore
  }
}
