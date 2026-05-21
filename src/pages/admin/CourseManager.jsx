import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

export default function CourseManager() {
  const { authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /api/admin/courses
    // For now, it's a stub waiting for the backend endpoints to be fully developed.
    setLoading(false);
  }, []);

  if (loading) return <div className="text-white/50">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Course Management</h1>
          <p className="text-white/40 text-sm">Add, edit, or remove courses from the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-cosmic-900 font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-sm text-white/50">
              <th className="p-4 font-medium">Course Title</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-white/40">No courses found. Add one to get started.</td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-medium">{course.title}</td>
                  <td className="p-4 text-white/70">${course.price}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                    <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">{course.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    <button className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
