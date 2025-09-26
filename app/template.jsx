export default function Router (){
  const PrivateRoute = () => {
    return /* Logged in user */ ? <Outlet /> : <Navigate to="/login" replace />;
  };

  const AnonymousRoute = () => {
    return /* Guest user condition */ ? <Navigate to="/" replace /> : <Outlet />;
  };
  
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/system" element={<System />} />
        <Route path="/taskslist" element={<Tasks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/taskslist/edit" element={<EditTask />} />
        <Route path="/taskslist/add" element={<AddTasks />} />
        <Route path="/taskslist/:id" element={<TaskItem />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route element={<AnonymousRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
)}
