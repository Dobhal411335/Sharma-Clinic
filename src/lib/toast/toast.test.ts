const successMock = jest.fn(
  (_title: string, _options?: unknown) => "toast-success",
);
const errorMock = jest.fn(
  (_title: string, _options?: unknown) => "toast-error",
);
const infoMock = jest.fn((_title: string, _options?: unknown) => "toast-info");
const warningMock = jest.fn(
  (_title: string, _options?: unknown) => "toast-warning",
);
const dismissMock = jest.fn((_id?: unknown) => undefined);

jest.mock("goey-toast", () => ({
  gooeyToast: Object.assign(jest.fn(), {
    success: successMock,
    error: errorMock,
    info: infoMock,
    warning: warningMock,
    dismiss: dismissMock,
  }),
  GooeyToaster: () => null,
}));

import {
  dismissToast,
  showError,
  showInfo,
  showSuccess,
  showWarning,
  TOAST_DURATION_MS,
  TOAST_HOST_PROPS,
} from "./index";
import { sanitizeUserMessage } from "./toast.messages";

describe("toast helpers", () => {
  beforeEach(() => {
    successMock.mockClear();
    errorMock.mockClear();
    infoMock.mockClear();
    warningMock.mockClear();
    dismissMock.mockClear();
  });

  it("configures the host at top-center", () => {
    expect(TOAST_HOST_PROPS.position).toBe("top-center");
    expect(TOAST_HOST_PROPS.closeOnEscape).toBe(true);
  });

  it("routes success/error/info/warning to gooeyToast with defaults", () => {
    showSuccess("Saved.");
    showError("Failed.");
    showInfo("Heads up.");
    showWarning("Careful.");

    expect(successMock).toHaveBeenCalledWith(
      "Saved.",
      expect.objectContaining({
        duration: TOAST_DURATION_MS.success,
        showTimestamp: false,
        preset: "subtle",
      }),
    );
    expect(errorMock).toHaveBeenCalledWith(
      "Failed.",
      expect.objectContaining({ duration: TOAST_DURATION_MS.error }),
    );
    expect(infoMock).toHaveBeenCalledWith(
      "Heads up.",
      expect.objectContaining({ duration: TOAST_DURATION_MS.info }),
    );
    expect(warningMock).toHaveBeenCalledWith(
      "Careful.",
      expect.objectContaining({ duration: TOAST_DURATION_MS.warning }),
    );
  });

  it("passes a stable id for duplicate prevention", () => {
    showError("Invalid email or password.", { id: "auth.login.error" });
    expect(errorMock).toHaveBeenCalledWith(
      "Invalid email or password.",
      expect.objectContaining({ id: "auth.login.error" }),
    );
  });

  it("sanitizes unsafe messages before showing", () => {
    showError("Error at Foo.bar (/app/src/server.ts:12)");
    expect(errorMock).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
      expect.any(Object),
    );
  });

  it("dismisses via gooeyToast.dismiss", () => {
    dismissToast("auth.login.error");
    expect(dismissMock).toHaveBeenCalledWith("auth.login.error");
  });
});

describe("sanitizeUserMessage", () => {
  it("keeps concise user-facing copy including password wording", () => {
    expect(sanitizeUserMessage("Invalid email or password.")).toBe(
      "Invalid email or password.",
    );
  });

  it("rejects stack traces, HTML, and secret-like values", () => {
    expect(sanitizeUserMessage("at Handler (/app/src/x.ts:10:2)")).toMatch(
      /something went wrong/i,
    );
    expect(sanitizeUserMessage("<html>Internal Server Error</html>")).toMatch(
      /something went wrong/i,
    );
    expect(sanitizeUserMessage("access_token: abc.def.ghi")).toMatch(
      /something went wrong/i,
    );
    expect(sanitizeUserMessage("Bearer eyJhbGciOiJIUzI1NiJ9.xx")).toMatch(
      /something went wrong/i,
    );
  });

  it("rejects empty or oversized messages", () => {
    expect(sanitizeUserMessage("   ")).toMatch(/something went wrong/i);
    expect(sanitizeUserMessage("x".repeat(200))).toMatch(/something went wrong/i);
  });
});
