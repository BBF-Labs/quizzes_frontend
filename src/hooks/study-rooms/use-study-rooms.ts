"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface StudyRoomParticipant {
  userId?: string;
  guestId?: string;
  displayName: string;
  role: "host" | "moderator" | "member" | "guest";
  points: number;
  level?: number;
  xp?: number;
  completedCycles?: number;
  avatarConfig?: Record<string, unknown>;
  mediaMode?: "follow_host" | "personal";
  personalMediaUrl?: string;
  leftAt?: string;
}

export interface StudyRoom {
  _id: string;
  roomCode: string;
  hostId: string;
  title: string;
  topic?: string;
  visibility: "open" | "closed";
  status: "active" | "ended";
  isLocked: boolean;
  maxParticipants: number;
  participants: StudyRoomParticipant[];
  timer: {
    isRunning: boolean;
    durationSeconds: number;
    remainingSeconds: number;
    cycle: number;
    checkInOpen?: boolean;
    startedAt?: string;
  };
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    points: number;
    completedBy: Array<{ userId?: string; guestId?: string; completedAt: string }>;
  }>;
  cycleCheckIns?: Array<{
    cycle: number;
    displayName: string;
    status: "completed" | "partial" | "not_done";
    submittedAt: string;
  }>;
  mediaPosts?: Array<{ id: string; kind: "youtube" | "spotify" | "link"; url: string; title?: string }>;
  milestones?: Array<{ id: string; type: string; displayName: string; value: number; createdAt: string }>;
  readyState?: {
    isOpen: boolean;
    minReadyCount: number;
    readyParticipants: Array<{ userId?: string; guestId?: string; displayName: string; readyAt: string }>;
    expiresAt?: string;
  };
  sharedMedia?: {
    currentUrl?: string;
    kind?: "youtube" | "spotify" | "link";
    status?: "playing" | "paused";
    currentTime?: number;
    updatedByName?: string;
    updatedAt?: string;
  };
  activeGame?: {
    type: "word_guess" | "qa";
    prompt: string;
    isActive: boolean;
    source?: "manual" | "ai";
    status?: "generating" | "ready" | "waiting" | "running" | "reveal" | "ended";
    maskedWord?: string;
    wrongLetters?: string[];
    options?: string[];
    correctOption?: number;
    revealEndsAt?: string;
    nextRoundStartsAt?: string;
  };
}

export interface StudyRoomMessage {
  _id: string;
  senderName: string;
  content: string;
  createdAt: string;
}

const baseKey = ["study-rooms"] as const;

export const useStudyRooms = () =>
  useQuery({
    queryKey: baseKey,
    queryFn: async () => {
      const res = await api.get<{ data: StudyRoom[] }>("/study-rooms");
      return res.data?.data ?? [];
    },
  });

export const useStudyRoom = (code: string) =>
  useQuery({
    queryKey: [...baseKey, code],
    enabled: Boolean(code),
    queryFn: async () => {
      const res = await api.get<{
        data: { room: StudyRoom; messages: StudyRoomMessage[]; leaderboard: StudyRoomParticipant[] };
      }>(`/study-rooms/${code}`);
      return res.data.data;
    },
  });

export const useCreateStudyRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      topic?: string;
      visibility: "open" | "closed";
      maxParticipants: number;
      timerMinutes: number;
    }) => {
      const res = await api.post<{ data: StudyRoom }>("/study-rooms", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
    },
  });
};

export const useJoinStudyRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      roomCode?: string;
      inviteToken?: string;
      guestName?: string;
      guestId?: string;
    }) => {
      const res = await api.post<{ data: StudyRoom }>(
        `/study-rooms/${payload.code}/join`,
        {
          roomCode: payload.roomCode || payload.code,
          inviteToken: payload.inviteToken,
          guestName: payload.guestName,
        },
        {
          headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined,
        },
      );
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useSendStudyRoomMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      content: string;
      guestName?: string;
      guestId?: string;
    }) => {
      const res = await api.post<{ data: StudyRoomMessage }>(
        `/study-rooms/${payload.code}/messages`,
        { content: payload.content, guestName: payload.guestName },
        {
          headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined,
        },
      );
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useInviteByUsername = () =>
  useMutation({
    mutationFn: async (payload: { code: string; username: string }) => {
      await api.post(`/study-rooms/${payload.code}/invites/username`, {
        username: payload.username,
      });
    },
  });

export const useInviteByEmail = () =>
  useMutation({
    mutationFn: async (payload: { code: string; email: string }) => {
      await api.post(`/study-rooms/${payload.code}/invites/email`, {
        email: payload.email,
      });
    },
  });

export const useUpdateStudyRoomTimer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      action: "start" | "pause" | "reset" | "tickComplete";
      durationSeconds?: number;
    }) => {
      const res = await api.patch(`/study-rooms/${payload.code}/timer`, payload);
      return res.data?.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; memberUserId: string; role: "moderator" | "member" }) => {
      await api.patch(`/study-rooms/${payload.code}/members/role`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useSubmitCycleCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; status: "completed" | "partial" | "not_done"; note?: string; guestId?: string }) => {
      await api.post(
        `/study-rooms/${payload.code}/checkins`,
        { status: payload.status, note: payload.note },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useUpdateStudyRoomAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; avatarConfig: Record<string, unknown>; guestId?: string }) => {
      await api.patch(
        `/study-rooms/${payload.code}/avatar`,
        { avatarConfig: payload.avatarConfig },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useCreateStudyRoomTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; title: string; description?: string; points: number }) => {
      await api.post(`/study-rooms/${payload.code}/tasks`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useCompleteStudyRoomTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; taskId: string; guestId?: string }) => {
      await api.post(
        `/study-rooms/${payload.code}/tasks/complete`,
        { taskId: payload.taskId },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const usePostStudyRoomMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; url: string; title?: string }) => {
      await api.post(`/study-rooms/${payload.code}/media`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useStartStudyRoomGame = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      type?: "word_guess" | "qa";
      prompt?: string;
      answer?: string;
      source?: "manual" | "ai";
      topic?: string;
    }) => {
      await api.post(`/study-rooms/${payload.code}/games/start`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useSubmitStudyRoomGameAnswer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; answer: string; guestId?: string }) => {
      await api.post(
        `/study-rooms/${payload.code}/games/answer`,
        { answer: payload.answer },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useOpenGameReadyCheck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; minReadyCount?: number }) => {
      await api.post(`/study-rooms/${payload.code}/games/ready/open`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useToggleGameReady = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; ready: boolean; guestId?: string }) => {
      await api.post(
        `/study-rooms/${payload.code}/games/ready/toggle`,
        { ready: payload.ready },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useGenerateAiGame = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; type: "word_guess" | "qa"; topic?: string }) => {
      await api.post(`/study-rooms/${payload.code}/games/generate`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useUpdateMediaPreference = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      mode: "follow_host" | "personal";
      personalMediaUrl?: string;
      guestId?: string;
    }) => {
      await api.patch(
        `/study-rooms/${payload.code}/media/preference`,
        { mode: payload.mode, personalMediaUrl: payload.personalMediaUrl },
        { headers: payload.guestId ? { "x-guest-id": payload.guestId } : undefined },
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

export const useModerateStudyRoomMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      action: "mute" | "kick";
      memberUserId?: string;
      memberGuestId?: string;
    }) => {
      await api.post(`/study-rooms/${payload.code}/moderate`, payload);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...baseKey, vars.code] });
    },
  });
};

