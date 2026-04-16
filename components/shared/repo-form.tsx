"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon, MinusIcon } from "lucide-react";
import { useSendUrl } from "@/hooks/use-service";

const formSchema = z.object({
  repoUrl: z.url("Repo URL needed.").min(1),
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
});

export function RepoForm() {
  const handleUrl = useSendUrl();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      envVariables: [{ key: "", value: "" }],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    handleUrl.mutate({
      repoUrl: values.repoUrl,
      envVariables: values.envVariables,
    });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
    field: ControllerRenderProps<z.infer<typeof formSchema>, "envVariables">,
  ) => {
    const pasted = e.clipboardData.getData("text");

    // Split by newlines to handle multiple variables
    const lines = pasted
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // If any line contains "=", treat it as env variable format
    if (lines.some((l) => l.includes("="))) {
      e.preventDefault();

      const parsed = lines.map((line) => {
        const eqIndex = line.indexOf("="); // use indexOf not split, so VALUE can contain "="
        if (eqIndex === -1) return { key: line, value: "" };
        return {
          key: line.slice(0, eqIndex).trim(),
          value: line.slice(eqIndex + 1).trim(),
        };
      });

      // Replace from current index onward with parsed results
      const existing = [...(field.value || [])];
      existing.splice(index, 1, ...parsed);
      field.onChange(existing);
    }
  };
  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle>Deploy your Repository</CardTitle>
        <CardDescription>
          it will deploy your Repository content to the internet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="repo-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="repoUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="repo-form-title">
                    Repository URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id="repo-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your repo url that you want to deploy."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Collapsible className="rounded-md data-[state=open]:bg-muted">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group w-full" type="button">
                  Environment Variables
                  <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="flex flex-col gap-3 p-3">
                <Controller
                  name="envVariables"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {field.value?.map((env, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={env.key}
                            onChange={(e) => {
                              const updated = [...(field.value || [])];
                              updated[index] = {
                                ...updated[index],
                                key: e.target.value,
                              };
                              field.onChange(updated);
                            }}
                            placeholder="KEY"
                            autoComplete="off"
                            onPaste={(e) => handlePaste(e, index, field)}
                          />
                          <Input
                            value={env.value}
                            onChange={(e) => {
                              const updated = [...(field.value || [])];
                              updated[index] = {
                                ...updated[index],
                                value: e.target.value,
                              };
                              field.onChange(updated);
                            }}
                            placeholder="Value"
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = (field.value || []).filter(
                                (_, i) => i !== index,
                              );
                              field.onChange(updated);
                            }}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          field.onChange([
                            ...(field.value || []),
                            { key: "", value: "" },
                          ]);
                        }}
                      >
                        + Add Variable
                      </Button>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="repo-form">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
