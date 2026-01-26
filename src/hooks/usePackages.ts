import { useQuery } from "@tanstack/react-query";
import { getAllPackages } from "@/controllers";

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: getAllPackages,
    staleTime: 1000 * 60 * 60, // 1 hour stale time as packages don't change often
  });
}
