"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface StudyRoomParticipant {
  userId?: string;
  guestId?: string;
  displayName: string;
  role: "host" | "member" | "guest";
  points: number;
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

export const useSendStudyRoomMessage = () =>
  useMutation({
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
  });

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

export const useUpdateStudyRoomTimer = () =>
  useMutation({
    mutationFn: async (payload: {
      code: string;
      action: "start" | "pause" | "reset" | "tickComplete";
      durationSeconds?: number;
    }) => {
      const res = await api.patch(`/study-rooms/${payload.code}/timer`, payload);
      return res.data?.data;
    },
  });

