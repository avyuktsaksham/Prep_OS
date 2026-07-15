// src/db/index.ts
import Dexie, { type Table } from "dexie";
import type {
  Subject,
  Topic,
  Resource,
  Revision,
  Setting,
} from "../types";

class PrepOSDatabase extends Dexie {
  subjects!: Table<Subject, string>;
  topics!: Table<Topic, string>;
  resources!: Table<Resource, string>;
  revisions!: Table<Revision, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("PrepOS");

    this.version(1).stores({
      subjects: "id,name",
      topics: "id,subjectId,status",
      resources: "id,topicId,type,completed",
      revisions: "id,topicId,nextReviewDate",
      settings: "key",
    });
  }
}

export const db = new PrepOSDatabase();
