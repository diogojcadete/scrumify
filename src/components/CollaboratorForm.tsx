
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { CollaboratorFormData } from "@/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["editor", "viewer"], {
    required_error: "Please select a role",
  }),
});

interface CollaboratorFormProps {
  onClose: () => void;
  collaboratorToEdit?: {
    id: string;
    email: string;
    role: "editor" | "viewer";
  };
}

const CollaboratorForm = ({ onClose, collaboratorToEdit }: CollaboratorFormProps) => {
  const { addCollaborator, updateCollaborator } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: collaboratorToEdit?.email || "",
      role: collaboratorToEdit?.role || "viewer",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const collaboratorData: CollaboratorFormData = {
        email: values.email,
        role: values.role,
      };

      if (collaboratorToEdit) {
        await updateCollaborator(collaboratorToEdit.id, collaboratorData);
      } else {
        await addCollaborator(collaboratorData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving collaborator:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {collaboratorToEdit ? "Edit Collaborator" : "Invite Collaborator"}
          </DialogTitle>
          <DialogDescription>
            {collaboratorToEdit
              ? "Update collaborator information"
              : "Invite someone to collaborate on this project"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="collaborator@example.com" 
                      {...field} 
                      disabled={!!collaboratorToEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="editor">Editor (can modify)</SelectItem>
                      <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : collaboratorToEdit
                  ? "Update"
                  : "Invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorForm;
