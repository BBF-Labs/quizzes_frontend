"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthMutations } from "@/hooks";
import { useAuth } from "@/context";
import { waitlistService, EmailUpdate } from "@/lib/services/waitlistService";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Textarea,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  showToast,
  Pagination,
  Badge,
  ScrollArea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UniversityMultiSelect,
  UserMultiSelect,
} from "@/components";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  History,
  Link2,
  Loader2,
  Mail,
  Moon,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  Undo2,
  Users,
  LogOut,
  Edit3,
  Eye,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Tab = "users" | "updates" | "generate";

export default function AdminWaitlistPage() {
  const { isAuthenticated, user, credentials, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [userPage, setUserPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [context, setContext] = useState("");
  const [emailType, setEmailType] = useState<'update' | 'promotional' | 'security' | 'general'>('update');
  const [links, setLinks] = useState<{ label: string, url: string }[]>([]);
  const [editingUpdate, setEditingUpdate] = useState<EmailUpdate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<EmailUpdate | null>(null);
  const [activeUrlIndex, setActiveUrlIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set()); // Store emails
  const [sendDialog, setSendDialog] = useState<{ isOpen: boolean, updateId: string | null }>({ isOpen: false, updateId: null });
  const [sendConfig, setSendConfig] = useState<{ audience: 'all' | 'university' | 'specific' | 'selected', value: string | string[] }>({ audience: 'all', value: '' });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch Waitlist Users
  const { data: waitlistData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["waitlist", userPage, searchTerm, universityFilter, showDeleted],
    queryFn: () => waitlistService.getWaitlist(credentials.accessToken, userPage, 50, searchTerm, universityFilter, showDeleted),
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch Update History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["waitlist-history", historyPage],
    queryFn: () => waitlistService.getAllUpdates(credentials.accessToken, historyPage),
    enabled: isAuthenticated && isAdmin && activeTab === "updates",
  });

  // Fetch Pending Update
  const { data: pendingUpdate } = useQuery({
    queryKey: ["pendingUpdate"],
    queryFn: () => waitlistService.getPendingUpdate(credentials.accessToken),
    enabled: isAuthenticated && isAdmin,
    retry: false,
  });

  // Fetch Universities
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: () => waitlistService.getUniversities(credentials.accessToken),
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch All Users for Select
  const { data: allUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => waitlistService.getAllUsers(credentials.accessToken),
    enabled: isAuthenticated && isAdmin,
  });

  // Mutations
  const restoreMutation = useMutation({
    mutationFn: (id: string) => waitlistService.restoreUser(credentials.accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      showToast("User restored successfully", "success");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => waitlistService.deleteUser(credentials.accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      showToast("User removed from waitlist", "success");
    }
  });

  const generateMutation = useMutation({
    mutationFn: () => waitlistService.generateDailyUpdate(credentials.accessToken, context, emailType, links),
    onSuccess: () => {
      showToast("Draft generated successfully!", "success");
      setContext("");
      setLinks([]);
      setActiveTab("updates");
      queryClient.invalidateQueries({ queryKey: ["waitlist-history"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUpdate"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => waitlistService.updateUpdate(credentials.accessToken, id, data),
    onSuccess: () => {
      showToast("Update saved", "success");
      setEditingUpdate(null);
      queryClient.invalidateQueries({ queryKey: ["waitlist-history"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUpdate"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => waitlistService.approveUpdate(credentials.accessToken, id),
    onSuccess: () => {
      showToast("Update approved!", "success");
      queryClient.invalidateQueries({ queryKey: ["waitlist-history"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUpdate"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: ({id, filters}: {id: string, filters?: any}) => waitlistService.sendDailyUpdate(credentials.accessToken, id, filters),
    onSuccess: (data) => {
      showToast(data.message || "Bulk email job queued!", "success");
      setSendDialog({ isOpen: false, updateId: null });
      queryClient.invalidateQueries({ queryKey: ["waitlist-history"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUpdate"] });
    },
  });

  // Selection Logic
  const toggleSelectUser = (email: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(email)) newSelected.delete(email);
    else newSelected.add(email);
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (!waitlistData?.data) return;
    if (selectedUsers.size === waitlistData.data.length) {
      setSelectedUsers(new Set());
    } else {
      const newSelected = new Set<string>();
      waitlistData.data.forEach((user: any) => newSelected.add(user.email));
      setSelectedUsers(newSelected);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
        {!isLoginModalOpen && (
          <Card className="w-full max-w-md border-teal-500/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-teal-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="text-teal-600 h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>Authentication required to manage waitlist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsLoginModalOpen(true)} className="w-full h-12 bg-teal-600 hover:bg-teal-700">
                Sign In to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground py-8 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-[0.03] dark:opacity-[0.07]" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto space-y-10 max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
             Waitlist Pulse
             <Badge variant="outline" className="text-teal-600 border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-950/30 ml-2">Admin</Badge>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Real-time management for early adopters and community updates.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button
             variant="outline"
             size="sm"
             onClick={toggleTheme}
             className="h-10 w-10 p-0 rounded-xl border-teal-100 dark:border-zinc-800 bg-teal-50/30 dark:bg-zinc-900 shadow-sm"
           >
             {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
           </Button>
           <Button variant="ghost" size="sm" onClick={() => logout()} className="h-10 px-4 group rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30">
             <LogOut className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
             <span className="hidden sm:inline font-medium">Sign Out</span>
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Waitlist Size", value: waitlistData?.pagination?.total || 0, icon: <Users className="h-5 w-5" />, description: "Total potential users", color: "teal" },
          { title: "Pending Update", value: pendingUpdate ? 1 : 0, icon: <Clock className="h-5 w-5" />, description: pendingUpdate ? "Requires attention" : "All caught up", color: "amber", badge: pendingUpdate?.status },
          { title: "Growth", value: "+12%", icon: <TrendingUp className="h-5 w-5" />, description: "Increase this week", color: "blue" },
          { title: "Delivery Rate", value: "99.8%", icon: <Check className="h-5 w-5" />, description: "Email health score", color: "green" }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Custom Tabs */}
        <div className="flex border-b border-border/50 gap-8 overflow-x-auto no-scrollbar">
          <TabButton 
            active={activeTab === "users"} 
            onClick={() => setActiveTab("users")} 
            icon={<Users className="h-4 w-4" />}
            label="Waitlist Users" 
          />
          <TabButton 
            active={activeTab === "updates"} 
            onClick={() => setActiveTab("updates")} 
            icon={<History className="h-4 w-4" />}
            label="Email Updates" 
          />
          <TabButton 
            active={activeTab === "generate"} 
            onClick={() => setActiveTab("generate")} 
            icon={<Plus className="h-4 w-4" />}
            label="New Draft" 
          />
        </div>

        {/* Tab Content: Users */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-1 min-w-[300px] gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-9 h-11 border-border/60 focus-visible:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setUserPage(1);
                    }}
                  />
                </div>
                  <div className="relative">
                    <UniversityMultiSelect 
                       options={universities?.data || []}
                       selected={universityFilter}
                       onChange={(val) => { setUniversityFilter(val); setUserPage(1); }}
                       className="w-[250px]"
                       placeholder="Filter Universities"
                    />
                  </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl border border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Deleted</span>
                  <Checkbox 
                    checked={showDeleted} 
                    onCheckedChange={(checked) => {
                       setShowDeleted(!!checked);
                       setUserPage(1);
                    }}
                    className="h-5 w-5 border-border/60 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["waitlist"] })}
                  className="h-11 w-11 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/40 transition-all"
                >
                  <RefreshCcw className={`h-4 w-4 ${isUsersLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <Card className="border-border/40 shadow-lg overflow-hidden bg-background/60 backdrop-blur-md rounded-2xl">
              <Table>
                <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[50px] pl-6">
                          <Checkbox 
                             checked={waitlistData?.data?.length > 0 && selectedUsers.size === waitlistData.data.length}
                             onCheckedChange={toggleSelectAll}
                             className="border-muted-foreground/50 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                        </TableHead>
                        <TableHead className="w-[200px]">Full Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>University / Institution</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={6}><div className="h-8 bg-muted rounded w-full"></div></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {waitlistData?.data?.length > 0 ? (
                        waitlistData.data.map((user: any, idx: number) => (
                          <motion.tr 
                            key={user._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`${user.isDeleted ? 'bg-red-50/30 dark:bg-red-950/10' : 'hover:bg-muted/30'} group transition-colors`}
                          >
                            <TableCell className="pl-6">
                              <Checkbox 
                                checked={selectedUsers.has(user.email)}
                                onCheckedChange={() => toggleSelectUser(user.email)}
                                className="border-muted-foreground/30 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-800 italic rounded-full">
                                {user.university}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {user.isDeleted ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => restoreMutation.mutate(user._id)}
                                    disabled={restoreMutation.isPending}
                                    className="h-8 w-8 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/40 rounded-lg transition-colors"
                                    title="Restore User"
                                  >
                                    <Undo2 className={`h-4 w-4 ${restoreMutation.isPending ? 'animate-spin' : ''}`} />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => deleteUserMutation.mutate(user._id)}
                                    disabled={deleteUserMutation.isPending}
                                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    {deleteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <TableCell colSpan={6} className="h-40 text-center">
                             <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                                <Users className="h-8 w-8" />
                                <p>No matching users found.</p>
                             </div>
                          </TableCell>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
              {waitlistData?.pagination?.pages > 1 && (
                <div className="p-4 border-t border-border/50 bg-muted/10">
                  <Pagination
                    currentPage={userPage}
                    totalPages={waitlistData.pagination.pages}
                    onPageChange={setUserPage}
                  />
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab Content: Updates History */}
         {activeTab === "updates" && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
            <div className="grid grid-cols-1 gap-4">
              {isHistoryLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-32 animate-pulse bg-muted/20 border-border/40" />
                ))
              ) : historyData?.data?.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {historyData.data.map((update: EmailUpdate, idx: number) => (
                    <motion.div
                      key={update._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className={`group relative border-border/40 hover:border-teal-500/30 hover:shadow-xl transition-all overflow-hidden ${update.status === 'sent' ? 'bg-muted/5' : 'bg-background/60 backdrop-blur-md'}`}>
                        {/* Status bar */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                          update.status === 'sent' ? 'bg-green-500' : 
                          update.status === 'approved' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                              update.status === 'sent' ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 
                              update.status === 'approved' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 
                              'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                            }`}>
                              {update.status === 'sent' ? <Mail className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </div>
                            <div>
                               <CardTitle className="text-base font-bold">{update.subject}</CardTitle>
                               <p className="text-xs text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {new Date(update.createdAt).toLocaleString()}
                                  {update.sentAt && ` • Sent ${new Date(update.sentAt).toLocaleString()}`}
                               </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              update.status === 'sent' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                              update.status === 'approved' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                              'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            } uppercase text-[10px] font-bold tracking-tighter rounded-full`}>
                              {update.status}
                            </Badge>
                            <div className="flex items-center border-l border-border/50 ml-2 pl-2 gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs font-medium"
                                onClick={() => {
                                  setSelectedUpdate(update);
                                  setIsPreviewOpen(true);
                                }}
                              >
                                 Preview
                              </Button>
                              {update.status !== 'sent' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs font-medium"
                                  onClick={() => setEditingUpdate(update)}
                                >
                                   Edit
                                </Button>
                              )}
                              {update.status === 'draft' && (
                                 <Button 
                                  variant="ghost" 
                                  size="sm" 
                                   className="h-10 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                                  onClick={() => approveMutation.mutate(update._id)}
                                  disabled={approveMutation.isPending}
                                 >
                                   Approve
                                 </Button>
                              )}
                              {update.status === 'approved' && (
                                 <Button 
                                  variant="ghost" 
                                  size="sm" 
                                   className="h-8 px-2 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                                  onClick={() => {
                                    setSendDialog({ isOpen: true, updateId: update._id });
                                    if (selectedUsers.size > 0) {
                                       setSendConfig({ 
                                         audience: 'specific', 
                                         value: '' 
                                       });
                                    }
                                  }}
                                 >
                                   Send...
                                 </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-20 text-center">
                  <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No historical updates found.</p>
                </div>
              )}
            </div>
            {historyData?.pagination?.pages > 1 && (
              <Pagination
                currentPage={historyPage}
                totalPages={historyData.pagination.pages}
                onPageChange={setHistoryPage}
              />
            )}
           </motion.div>
         )}

        {/* Tab Content: Generate Draft */}
        {activeTab === "generate" && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-3xl mx-auto space-y-8 relative"
           >
             {/* Decorative background glow */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

             <Card className="border-teal-500/20 shadow-xl border bg-background/40 backdrop-blur-xl rounded-3xl overflow-hidden relative z-10">
                <CardHeader className="bg-gradient-to-br from-teal-500/10 to-transparent pb-8 pt-10 px-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-teal-500/20 shadow-md group transition-transform hover:scale-110">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/40 backdrop-blur-sm">
                      {(['update', 'promotional', 'security', 'general'] as const).map((t) => (
                        <Button 
                          key={t}
                          variant={emailType === t ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setEmailType(t)}
                          className={`rounded-xl px-4 py-2 transition-all ${
                            emailType === t 
                              ? "bg-teal-600 shadow-lg shadow-teal-500/30 text-white" 
                              : "hover:bg-teal-500/10 hover:text-teal-600"
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 space-y-2">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Compose {emailType.charAt(0).toUpperCase() + emailType.slice(1)} Draft</CardTitle>
                    <CardDescription className="text-base text-muted-foreground/80 font-medium">
                      {emailType === 'update' && "Focus on product updates, technical progress, and what the team has been building."}
                      {emailType === 'promotional' && "Create excitement and urgency. Focus on new features and growth with an emotional hook."}
                      {emailType === 'security' && "Communicate safety and privacy updates with a clear, authoritative, and reassuring tone."}
                      {emailType === 'general' && "Share community stories, general announcements, or high-level laboratory updates."}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="context-input" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Context & Updates
                    </Label>
                    <Textarea
                      placeholder={
                        emailType === 'update' ? "Example: We fixed 200 bugs and launched the mobile app beta..." :
                        emailType === 'promotional' ? "Example: Early bird access for waitlist members starts tomorrow. 20% off..." :
                        emailType === 'security' ? "Example: We've upgraded our database encryption to AES-256 for all user data..." :
                        "Example: Welcome to our new community forum where researchers share tips..."
                      }
                      className="min-h-[200px] text-lg bg-teal-50/10 border-teal-100 focus:border-teal-500 transition-all duration-300 rounded-xl resize-none"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Call-to-Action Links (Optional)
                      </Label>
                      <span className="text-[10px] text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded">
                        Use :id, :email, :name for dynamic values
                      </span>
                    </div>
                    <div className="space-y-2">
                      {links.map((link, idx) => (
                        <div key={idx} className="space-y-2 p-4 bg-teal-50/20 dark:bg-zinc-900/40 rounded-xl border border-teal-100/30 dark:border-zinc-800 animate-in slide-in-from-right-2">
                           <div className="flex gap-2 items-center">
                              <Input 
                                placeholder="Label (e.g., View Demo)" 
                                value={link.label} 
                                onChange={(e) => {
                                  const newLinks = [...links];
                                  newLinks[idx].label = e.target.value;
                                  setLinks(newLinks);
                                }}
                                className="flex-1 bg-background"
                              />
                              <Input 
                                placeholder="URL (e.g., https://...)" 
                                value={link.url} 
                                onFocus={() => setActiveUrlIndex(idx)}
                                onChange={(e) => {
                                  const newLinks = [...links];
                                  newLinks[idx].url = e.target.value;
                                  setLinks(newLinks);
                                }}
                                className="flex-[2] bg-background"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>

                           {/* Link Builder Helper */}
                           <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Link Builder:</span>
                              
                              {/* Placeholder Buttons */}
                              <div className="flex gap-1">
                                {[':id', ':email', ':name'].map((placeholder) => (
                                  <Button
                                    key={placeholder}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] font-bold border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-900 dark:text-teal-400 dark:hover:bg-teal-950/30 rounded-md"
                                    onClick={() => {
                                      const newLinks = [...links];
                                      newLinks[idx].url += (newLinks[idx].url.endsWith('/') || newLinks[idx].url === '' ? '' : '/') + placeholder;
                                      setLinks(newLinks);
                                    }}
                                  >
                                    + {placeholder.replace(':', '').toUpperCase()}
                                  </Button>
                                ))}
                              </div>

                              <div className="w-[1px] h-3 bg-border mx-1 hidden sm:block" />

                              {/* Presets */}
                              <div className="flex gap-1">
                                {[
                                  { label: 'Unsubscribe', url: 'https://quizzes.bflabs.tech/waitlist/unsubscribe?email=:email' },
                                  { label: 'Pricing', url: 'https://quizzes.bflabs.tech/packages' },
                                  { label: 'Quizzes', url: 'https://quizzes.bflabs.tech/quizzes' },
                                  { label: 'Profile', url: 'https://quizzes.bflabs.tech/user/profile' }
                                ].map((preset) => (
                                  <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-teal-600 transition-colors"
                                    onClick={() => {
                                      const newLinks = [...links];
                                      newLinks[idx].url = preset.url;
                                      if (newLinks[idx].label === '') newLinks[idx].label = preset.label;
                                      setLinks(newLinks);
                                    }}
                                  >
                                    {preset.label}
                                  </Button>
                                ))}
                              </div>
                           </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLinks([...links, { label: '', url: '' }])}
                        className="w-full border-dashed border-teal-200 dark:border-zinc-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-xl h-12"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Call-to-Action Link
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => generateMutation.mutate()} 
                    disabled={generateMutation.isPending || !context}
                    className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white text-lg font-extrabold transition-all hover:scale-[1.02] active:scale-95 rounded-2xl group border border-teal-500/20 shadow-lg"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                        Generate Intelligence-Powered Draft
                      </>
                    )}
                  </Button>
                </CardContent>
             </Card>
           </motion.div>
        )}
      </div>

      {/* Edit Update Dialog */}
      <Dialog open={!!editingUpdate} onOpenChange={(open) => !open && setEditingUpdate(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-muted/20 border-b border-border/50">
            <DialogTitle>Refine Email Draft</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input 
                    value={editingUpdate?.subject} 
                    onChange={(e) => setEditingUpdate(prev => prev ? {...prev, subject: e.target.value} : null)}
                    className="focus-visible:ring-teal-500 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Body (Markdown)</Label>
                  <Textarea 
                    value={editingUpdate?.content} 
                    onChange={(e) => setEditingUpdate(prev => prev ? {...prev, content: e.target.value} : null)}
                    className="min-h-[400px] font-mono text-sm focus-visible:ring-teal-500"
                  />
                </div>
             </div>
          </ScrollArea>
          <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
             <Button variant="ghost" onClick={() => setEditingUpdate(null)}>Cancel</Button>
             <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => editingUpdate && updateMutation.mutate({ id: editingUpdate._id, data: { subject: editingUpdate.subject, content: editingUpdate.content } })}
                disabled={updateMutation.isPending}
             >
                Save Changes
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-teal-100 shadow-xl rounded-2xl">
          <DialogHeader className="p-6 border-b border-teal-50 dark:border-zinc-800 bg-background dark:bg-zinc-950 flex flex-row items-center justify-between space-y-0 text-left">
            <div>
              <DialogTitle className="text-2xl font-bold italic text-teal-600">
                Email Preview
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Review and approve the generated draft before sending.
              </DialogDescription>
            </div>
            {selectedUpdate && (
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border-teal-100 rounded-full h-fit self-start">
                {selectedUpdate.type}
              </Badge>
            )}
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-zinc-900/40">
            <div className="p-8">
              {selectedUpdate && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  {/* Subject Line */}
                  <div className="p-4 rounded-xl bg-background dark:bg-zinc-950 border border-teal-100/50 dark:border-zinc-800 shadow-sm">
                    <Label className="text-[10px] font-bold uppercase tracking-extra-wide text-teal-600 block mb-2">
                      Subject Line
                    </Label>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedUpdate.subject}
                    </h2>
                  </div>

                  {/* Links Preview */}
                  {selectedUpdate.links && selectedUpdate.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-extra-wide text-teal-600 w-full mb-1">
                        Call-to-Action Links
                      </Label>
                      {selectedUpdate.links.map((link: any, i: number) => (
                        <div key={i} className="px-3 py-1.5 bg-teal-500/10 text-teal-600 rounded-lg text-sm font-medium border border-teal-500/20 flex items-center">
                          <Plus className="h-3 w-3 mr-1.5 opacity-60" />
                          {link.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="p-8 bg-background dark:bg-zinc-950 rounded-2xl border border-teal-100/50 dark:border-zinc-800 shadow-lg prose prose-neutral dark:prose-invert max-w-none">
                    <MarkdownRenderer content={selectedUpdate.content} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm dark:bg-zinc-950/50 flex justify-end gap-3">
              {selectedUpdate?.status === 'sent' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSendDialog({ isOpen: true, updateId: selectedUpdate._id });
                    setIsPreviewOpen(false);
                  }}
                  className="rounded-xl border-teal-200 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2`} />
                  Resend Communication
                </Button>
              )}
              
              <Button 
                onClick={() => setIsPreviewOpen(false)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8"
              >
                Close Preview
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sendDialog.isOpen} onOpenChange={(open) => !open && setSendDialog({ ...sendDialog, isOpen: false })}>
        <DialogContent className="sm:max-w-[500px] border-teal-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-teal-600">Send Update</DialogTitle>
            <DialogDescription>
              Choose your target audience for this communication.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <RadioGroup 
                value={sendConfig.audience} 
                onValueChange={(val: any) => setSendConfig({ audience: val, value: '' })}
                className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="all" id="r-all" className="text-teal-600 border-teal-200" />
                <div className="flex-1">
                  <Label htmlFor="r-all" className="font-bold cursor-pointer">All Users</Label>
                  <p className="text-xs text-muted-foreground">Send to everyone on the waitlist ({waitlistData?.pagination?.total || 0} users)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="university" id="r-uni" className="text-teal-600 border-teal-200" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="r-uni" className="font-bold cursor-pointer">Filter by University</Label>
                  {sendConfig.audience === 'university' && (
                    <UniversityMultiSelect 
                       options={universities?.data || []}
                       selected={Array.isArray(sendConfig.value) ? sendConfig.value : []}
                       onChange={(val) => setSendConfig({...sendConfig, value: val})}
                       className="w-full mt-1"
                       placeholder="Select Target Universities"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="specific" id="r-spec" className="text-teal-600 border-teal-200" />
                <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-center">
                     <Label htmlFor="r-spec" className="font-bold cursor-pointer">Specific Users</Label>
                     {selectedUsers.size > 0 && (
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-600 border-teal-200">
                                {selectedUsers.size} Selected
                            </Badge>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 text-[10px] px-1 text-teal-600 hover:text-teal-700"
                                onClick={() => setSendConfig({...sendConfig, audience: 'specific', value: Array.from(selectedUsers)})}
                             >
                                Use Selected
                             </Button>
                        </div>
                     )}
                   </div>
                  {sendConfig.audience === 'specific' && (
                    <UserMultiSelect 
                       options={allUsers?.data || []}
                       selected={Array.isArray(sendConfig.value) ? sendConfig.value : (sendConfig.value ? (sendConfig.value as string).split(',').map(s => s.trim()) : [])}
                       onChange={(val) => setSendConfig({...sendConfig, value: val})}
                       className="w-full mt-1"
                       placeholder="Search and Select Users"
                    />
                  )}
                </div>
              </div>
            </RadioGroup>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-400">
               <strong>Note:</strong> This action cannot be undone. Emails will be queued immediately.
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendDialog({ ...sendDialog, isOpen: false })}>Cancel</Button>
            <Button 
                className="bg-teal-600 hover:bg-teal-700"
                disabled={sendMutation.isPending || (sendConfig.audience !== 'all' && (!sendConfig.value || (Array.isArray(sendConfig.value) && sendConfig.value.length === 0)))}
                onClick={() => sendMutation.mutate({ 
                    id: sendDialog.updateId!, 
                    filters: sendConfig.audience === 'all' ? undefined : { type: sendConfig.audience, value: sendConfig.value }
                })}
            >
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     </div>
    </div>
  );
}

// Components
function StatCard({ title, value, icon, description, color, badge }: { 
  title: string, value: string | number, icon: React.ReactNode, description: string, color: string, badge?: string 
}) {
  const colorMap: Record<string, string> = {
    teal: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/40",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40",
  };

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
           {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-extrabold">{value}</div>
          {badge && (
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-600 border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 rounded-full">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all duration-300 relative ${
        active 
          ? 'border-teal-500 text-teal-600 font-bold translate-y-[1px] z-10' 
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-sm whitespace-nowrap">{label}</span>
    </button>
  );
}

function LoginModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({ username: "", password: "", rememberMe: true });
  const { login } = useAuthMutations();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      onOpenChange(false);
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 shadow-xl p-0 overflow-hidden bg-background dark:bg-zinc-950">
        <div className="h-2 bg-teal-500 w-full" />
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <DialogTitle className="text-3xl font-extrabold tracking-tight">Admin Portal</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Secure authentication for BBF Labs management.
            </DialogDescription>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Admin Identifier</Label>
                <Input
                  id="admin-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username or ID"
                  required
                  className="h-12 bg-muted/20 dark:bg-zinc-900/50 border-border/60 focus-visible:ring-teal-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Credentials</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="h-12 bg-muted/30 border-border/60 focus-visible:ring-teal-500"
                />
              </div>
              <div className="flex items-center space-x-2 py-1">
                <Checkbox 
                  id="remember" 
                  checked={formData.rememberMe} 
                  onCheckedChange={(checked) => setFormData({...formData, rememberMe: !!checked})}
                  className="border-muted-foreground/30 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <Label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
                  Maintain session (Persistent login)
                </Label>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold transition-all hover:scale-[1.01] rounded-xl shadow-md border border-teal-500/10" 
              disabled={login.isPending}
            >
              {login.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Authorize Access"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
