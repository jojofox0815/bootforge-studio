export type DurableJobState = "queued" | "running" | "paused" | "failed" | "cancelled" | "succeeded";
export interface DurableJob { id: string; state: DurableJobState; completedSteps: string[]; resumableFrom?: string }

const transitions: Record<DurableJobState, DurableJobState[]> = {
  queued: ["running", "cancelled"], running: ["paused", "failed", "cancelled", "succeeded"],
  paused: ["running", "cancelled"], failed: ["running", "cancelled"], cancelled: [], succeeded: [],
};

export function transitionJob(job: DurableJob, next: DurableJobState): DurableJob {
  if (!transitions[job.state].includes(next)) throw new Error(`Invalid transition ${job.state} -> ${next}`);
  return { ...job, state: next };
}

export function resumeJob(job: DurableJob): DurableJob {
  if (job.state !== "failed" && job.state !== "paused") throw new Error("Only paused or failed jobs can resume");
  if (!job.resumableFrom) throw new Error("Job has no safe resume boundary");
  return transitionJob(job, "running");
}
