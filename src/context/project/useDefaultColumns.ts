
import { useEffect } from "react";
import { useProjectMutations } from "./hooks";

export const useDefaultColumns = (user: any, isLoading: boolean, columns: any[]) => {
  const { createColumnMutation } = useProjectMutations(user);

  useEffect(() => {
    const createDefaultColumns = async () => {
      if (!user || isLoading) return;
      
      const defaultColumns = ["TO DO", "IN PROGRESS", "DONE"];
      const existingColumnTitles = columns.map((col: any) => col.title);
      
      for (const title of defaultColumns) {
        if (!existingColumnTitles.includes(title)) {
          await createColumnMutation.mutateAsync(title);
        }
      }
    };
    
    createDefaultColumns();
  }, [user, isLoading, columns, createColumnMutation]);
};
