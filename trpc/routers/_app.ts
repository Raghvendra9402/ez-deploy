import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/lib/sqs";

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
      const { repoUrl, envVariables } = input;

      const qUrl =
        "https://sqs.ap-south-1.amazonaws.com/864899840088/ez-deploy-queue";

      const command = {
        QueueUrl: qUrl,
        MessageBody: JSON.stringify({
          jobId: crypto.randomUUID(),
          repoUrl: repoUrl,
          envVariables: envVariables,
        }),
      };

      await getSQSClient().send(new SendMessageCommand(command));

      return {
        success: true,
      };
    }),
});
export type AppRouter = typeof appRouter;
