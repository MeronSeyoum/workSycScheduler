import { Employee } from "@/types/employee";


export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Maria Rodriguez', email: 'maria@cleanpro.com', roles: 'Team Lead', status: 'Active', team: 'Commercial', cleaningSpecialty: 'Office Cleaning', joinDate: '2022-01-15' },
  { id: '2', name: 'James Wilson', email: 'james@cleanpro.com', roles: 'Cleaner', status: 'Active', team: 'Residential', cleaningSpecialty: 'Deep Cleaning', joinDate: '2022-03-22' },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@cleanpro.com', roles: 'Cleaner', status: 'Active', team: 'Commercial', cleaningSpecialty: 'Window Cleaning', joinDate: '2022-05-10' },
  { id: '4', name: 'David Kim', email: 'david@cleanpro.com', roles: 'Supervisor', status: 'Active', team: 'Industrial', cleaningSpecialty: 'Floor Care', joinDate: '2022-02-18' },
  { id: '5', name: 'Emma Davis', email: 'emma@cleanpro.com', roles: 'Cleaner', status: 'Inactive', team: 'Residential', cleaningSpecialty: 'Eco Cleaning', joinDate: '2022-04-05' },
  { id: '6', name: 'Michael Brown', email: 'michael@cleanpro.com', roles: 'Cleaner', status: 'Active', team: 'Industrial', cleaningSpecialty: 'Pressure Washing', joinDate: '2022-06-30' },
  { id: '7', name: 'Lisa Chen', email: 'lisa@cleanpro.com', roles: 'Team Lead', status: 'Active', team: 'Residential', cleaningSpecialty: 'Move-In/Move-Out', joinDate: '2022-01-10' },
  { id: '8', name: 'Robert Taylor', email: 'robert@cleanpro.com', roles: 'Cleaner', status: 'Active', team: 'Commercial', cleaningSpecialty: 'Carpet Cleaning', joinDate: '2022-03-15' },
  { id: '9', name: 'Jessica Martinez', email: 'jessica@cleanpro.com', roles: 'Cleaner', status: 'Inactive', team: 'Residential', cleaningSpecialty: 'Disinfection', joinDate: '2022-07-22' },
  { id: '10', name: 'Thomas Lee', email: 'thomas@cleanpro.com', roles: 'Cleaner', status: 'Active', team: 'Industrial', cleaningSpecialty: 'Equipment Maintenance', joinDate: '2022-08-14' },
];

// Mock activity data for cleaning company
export const MOCK_ACTIVITIES = [
  {
    id: 1,
    user: 'Maria Rodriguez',
    action: 'checked in for morning shift at TechPark',
    time: '5 minutes ago',
  },
  {
    id: 2,
    user: 'System',
    action: 'generated monthly attendance report',
    time: '30 minutes ago',
  },
  {
    id: 3,
    user: 'David Kim',
    action: 'logged absence request for next Monday',
    time: '1 hour ago',
  },
  {
    id: 4,
    user: 'Admin',
    action: 'updated Emma Davis status to inactive',
    time: '2 hours ago',
  },
  {
    id: 5,
    user: 'Lisa Chen',
    action: 'completed team shift allocation for Residential group',
    time: '3 hours ago',
  },
];




const fakeApiDelay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const api = {
  getEmployees: async () => {
    await fakeApiDelay();
    return [...MOCK_EMPLOYEES];
  },
  addEmployee: async (emp: Employee) => {
    await fakeApiDelay();
    const newEmp = { ...emp, id: Math.floor(Math.random() * 10000), joinDate: new Date().toISOString().split('T')[0] };
    MOCK_EMPLOYEES.push(newEmp);
    return newEmp;
  },
  updateEmployee: async (id: number, emp: Partial<Employee>) => {
    await fakeApiDelay();
    const idx = MOCK_EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    MOCK_EMPLOYEES[idx] = { ...MOCK_EMPLOYEES[idx], ...emp };
    return MOCK_EMPLOYEES[idx];
  },
  deleteEmployee: async (id: number) => {
    await fakeApiDelay();
    const idx = MOCK_EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    MOCK_EMPLOYEES.splice(idx, 1);
  },
  getStats: async () => {
    await fakeApiDelay();
    return {
      totalEmployees: MOCK_EMPLOYEES.length,
      activeEmployees: MOCK_EMPLOYEES.filter(e => e.status === 'Active').length,
      teamLeads: MOCK_EMPLOYEES.filter(e => e.role === 'Team Lead').length,
      recentActivity: [...MOCK_ACTIVITIES],
      teamDistribution: [
        { name: 'Residential', value: MOCK_EMPLOYEES.filter(e => e.team === 'Residential').length },
        { name: 'Commercial', value: MOCK_EMPLOYEES.filter(e => e.team === 'Commercial').length },
        { name: 'Industrial', value: MOCK_EMPLOYEES.filter(e => e.team === 'Industrial').length },
      ],
      monthlyHires: [
        { month: 'Jan', hires: 2 },
        { month: 'Feb', hires: 1 },
        { month: 'Mar', hires: 2 },
        { month: 'Apr', hires: 1 },
        { month: 'May', hires: 1 },
        { month: 'Jun', hires: 1 },
        { month: 'Jul', hires: 1 },
        { month: 'Aug', hires: 1 },
      ],
      specialtyDistribution: [
        { name: 'Deep Cleaning', value: MOCK_EMPLOYEES.filter(e => e.cleaningSpecialty === 'Deep Cleaning').length },
        { name: 'Office Cleaning', value: MOCK_EMPLOYEES.filter(e => e.cleaningSpecialty === 'Office Cleaning').length },
        { name: 'Window Cleaning', value: MOCK_EMPLOYEES.filter(e => e.cleaningSpecialty === 'Window Cleaning').length },
        { name: 'Floor Care', value: MOCK_EMPLOYEES.filter(e => e.cleaningSpecialty === 'Floor Care').length },
        { name: 'Disinfection', value: MOCK_EMPLOYEES.filter(e => e.cleaningSpecialty === 'Disinfection').length },
      ]
    };
  }
};
