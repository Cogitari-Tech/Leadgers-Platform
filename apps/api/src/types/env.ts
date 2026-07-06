export type AppEnv = {
  Variables: {
    user: import("../middleware/auth").User;
    accessToken: string;
    tenantId: string;
    userRole: "owner" | "admin" | "manager" | "member" | "viewer";
    validatedBody: any;
    validatedFiles: Array<{ name: string; file: File }>;
  };
};
