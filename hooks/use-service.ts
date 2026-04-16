import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export const useSendUrl = () => {
  const trpc = useTRPC();
  return useMutation(trpc.send.mutationOptions());
};
