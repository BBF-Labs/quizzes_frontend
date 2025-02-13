"use client";

import type React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { useAppDispatch } from "@/hooks";
import { updateUser } from "@/controllers";
import { useState, useEffect } from "react";
import { Save, Lock, Coins } from "lucide-react";
import {
  Dialog,
  Input,
  Label,
  Button,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Avatar,
  AvatarFallback,
  showToast,
} from "@/components";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { user, credentials } = useSelector((state: RootState) => state.auth);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    credits: "",
  });

  useEffect(() => {
    setProfileData({
      name: user.name,
      email: user.email,
      username: user.username,
      credits: user.credits,
    });
  }, [user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(updateUser(profileData, credentials.accessToken));
      showToast("Profile updated", "success");
    } catch (error: any) {
      showToast(`${error.message}`, "error");
    }
    setTimeout(() => setIsLoading(false), 1000);
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Passwords don't match", "error");
      return;
    }

    if (passwordData.currentPassword !== user.password) {
      showToast("Current password is incorrect", "error");
    }

    if (
      passwordData.newPassword.length != passwordData.confirmPassword.length ||
      passwordData.newPassword.length < 8
    ) {
      showToast("Password must be at least 8 characters long", "error");
    }
    try {
      const payload = {
        password: passwordData.newPassword,
      };
      await dispatch(updateUser(payload, credentials.accessToken));
      showToast("Password updated successfully", "success");
      setIsOpen(false);
    } catch (error: any) {
      showToast(`${error.message}`, "error");
    }
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-zinc-400">Manage your account information</p>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 bg-gradient-to-r from-teal-500 to-blue-500">
              <AvatarFallback className="text-2xl">
                {profileData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500">
              <Coins className="h-5 w-5" />
              <span className="font-medium">{profileData.credits || 0}</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="bg-zinc-800/50 border-zinc-700/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="bg-zinc-800/50 border-zinc-700/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profileData.username}
                  disabled={true}
                  className="bg-zinc-800/50 border-zinc-700/50 text-white"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 text-white">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password to update.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={onPasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                    >
                      Update Password
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
