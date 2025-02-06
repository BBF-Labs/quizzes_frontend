"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminCourses from "@/components/admin/Courses"
import AdminQuizzes from "@/components/admin/Quizzes"
import AdminPackages from "@/components/admin/Packages"
import AdminUsers from "@/components/admin/Users"
import { useNotifications } from "@/hooks/useNotifications"

export default function AdminDashboard() {
  const { showNotification } = useNotifications()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="courses">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <AdminCourses />
        </TabsContent>
        <TabsContent value="quizzes">
          <AdminQuizzes />
        </TabsContent>
        <TabsContent value="packages">
          <AdminPackages />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  )
}

