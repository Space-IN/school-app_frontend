// mockUsers.js

export const users = {
  // 🧑‍🎓 Students
  student123: { role: 'Student', name: 'Shashank', className: '9th', section: 'A' },
  student001: { role: 'Student', name: 'Sharanbasava', className: '8th', section: 'B' },
  student002: { role: 'Student', name: 'Gagan', className: '10th', section: 'C' },
  student003: { role: 'Student', name: 'Riya', className: '9th', section: 'A' },
  student004: { role: 'Student', name: 'Aditya', className: '9th', section: 'A' },
  student005: { role: 'Student', name: 'Ananya', className: '5th', section: 'A' },

  // 👨‍👩‍👧 Parents
  parent123: {
    role: 'Parent', name: 'Parent of Shashank',
    student: { name: 'Shashank', className: '9th', section: 'A' }
  },
  parent001: {
    role: 'Parent', name: 'Parent of Sharanbasava',
    student: { name: 'Sharanbasava', className: '8th', section: 'B' }
  },
  parent002: {
    role: 'Parent', name: 'Parent of Gagan',
    student: { name: 'Gagan', className: '10th', section: 'C' }
  },

  // 🧑‍🏫 Faculty/Admin
  faculty001: {
    role: 'Faculty', name: 'Mr. Rao',
    subjects: ['Math', 'Science'], grades: ['9A', '10B', '11C', '5A']
  },
  faculty002: {
    role: 'Faculty', name: 'Mr. Shetty',
    subjects: ['Kannada', 'Hindi'], grades: ['9B', '10A', '11B', '3A', '6B']
  },
  admin001: { role: 'Admin', name: 'Admin 001' },
  admin002: { role: 'Admin', name: 'Admin 002' },
};
