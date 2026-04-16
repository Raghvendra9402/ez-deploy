import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  send: baseProcedure
    .input(
      z.object({
        repoUrl: z.url(),
        envVariables: z
          .array(
            z.object({
              key: z
                .string()
                .min(1, "Key is required")
                .regex(/^[A-Z_]+$/, "Use uppercase env keys like API_KEY"),
              value: z.string().min(1, "Value cannot be empty."),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        url: input.repoUrl,
        variables: input.envVariables,
      };
    }),
});
export type AppRouter = typeof appRouter;
