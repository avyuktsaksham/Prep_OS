import { useEffect, useState } from "react";
import { getLecture } from "../db/lectureService";
import type { Resource } from "../types";

export function useLecture(topicId: string) {
  const [lecture, setLecture] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);

    const data = await getLecture(topicId);

    setLecture(data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [topicId]);

  return {
    lecture,
    loading,
    refresh,
  };
}