@@ .. @@
 export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
   children, 
   title,
   description 
 }) => {
   const [activeTab, setActiveTab] = useState<string>('dashboard');
   const { logout, currentUser } = useAuth();
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
+  
+  // Log component mount for debugging
+  useEffect(() => {
+    console.log('🏗️ AdminLayout component mounted, currentUser:', currentUser);
+  }, [currentUser]);
 
   /**
    * Handle logout
@@ .. @@
   return (
     <div className="min-h-screen bg-gray-50 flex">
       {/* Sidebar */}
+      <div className="fixed top-0 left-0 right-0 bg-green-100 text-green-800 p-2 text-center text-sm z-50">
+        Admin olarak giriş yapıldı: {currentUser?.email || 'admin@akilli.com'}
+      </div>
       <div className="w-64 bg-white shadow-md z-10 flex-shrink-0 hidden md:block">
         <div className="h-full flex flex-col">
           {/* Logo */}