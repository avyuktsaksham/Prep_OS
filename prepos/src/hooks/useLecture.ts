import { useEffect, useState } from "react";
import { getLecturesByTopic } from "../db/lectureService";
import type { Resource } from "../types";

export function useLecture(topicId: string) {
  const [lectures, setLectures] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);

    const data = await getLecturesByTopic(topicId);

    setLectures(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [topicId]);

  return {
    lectures,
    loading,
    refresh,
  };
}
