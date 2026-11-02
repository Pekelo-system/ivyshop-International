import "@testing-library/jest-dom";
import { vi } from "vitest";
// Mock Amplify server configuration (no real AWS calls in tests)
vi.mock("@/lib/amplify/server", () => ({
  runWithAmplifyServerContext: vi.fn(({ operation }) =>
    operation({ token: "mock-context" })
  ),
}));

// Mock aws-amplify auth
vi.mock("aws-amplify/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
}));

vi.mock("aws-amplify/auth/server", () => ({
  fetchAuthSession: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Mock DynamoDB client
vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  TransactWriteItemsCommand: vi.fn(),
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({
      send: vi.fn(),
    }),
  },
  GetCommand: vi.fn(),
  PutCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  QueryCommand: vi.fn(),
  ScanCommand: vi.fn(),
  TransactWriteCommand: vi.fn(),
  UpdateCommand: vi.fn(),
}));

// Mock Bedrock client
vi.mock("@aws-sdk/client-bedrock-runtime", () => ({
  BedrockRuntimeClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  InvokeModelCommand: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(() => new Headers()),
}));
