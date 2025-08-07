import { Employee } from '@/types/employee';

export const employees = {
  getEmployees: async (): Promise<Employee[]> => {
    return [
      {
        id: 'emp-1',
        employeeId: 'CLN1001',
        username: 'alice.johnson',
        email: 'alice.johnson@cleanpro.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        position: 'Cleaning Supervisor',
        department: 'Operations',
        hireDate: '2020-05-15',
        locations: ['loc-1', 'loc-2'],
        contact: {
          phone: '(403) 555-2001',
          emergencyContact: '(403) 555-2111',
          address: '123 Main St, Calgary, AB'
        },
        qualifications: ['Biohazard Cleaning', 'Team Leadership'],
        status: 'active',
        roles: ['supervisor'],
        avatar: ''
      },
      {
        id: 'emp-2',
        employeeId: 'CLN1002',
        username: 'bob.smith',
        email: 'bob.smith@cleanpro.com',
        firstName: 'Bob',
        lastName: 'Smith',
        position: 'Commercial Cleaner',
        department: 'Commercial',
        hireDate: '2021-02-10',
        locations: ['loc-1', 'loc-3'],
        contact: {
          phone: '(403) 555-2002',
          emergencyContact: '(403) 555-2112',
          address: '456 Oak Ave, Calgary, AB'
        },
        qualifications: ['Floor Care', 'Window Cleaning'],
        status: 'active',
        roles: ['commercial_cleaner'],
        avatar: ''
      },
      {
        id: 'emp-3',
        employeeId: 'CLN1003',
        username: 'carlos.garcia',
        email: 'carlos.garcia@cleanpro.com',
        firstName: 'Carlos',
        lastName: 'Garcia',
        position: 'Residential Cleaner',
        department: 'Residential',
        hireDate: '2019-11-22',
        locations: ['loc-1'],
        contact: {
          phone: '(403) 555-2003',
          emergencyContact: '(403) 555-2113',
          address: '789 Pine Rd, Calgary, AB'
        },
        qualifications: ['Eco-Friendly Cleaning', 'Organization'],
        status: 'active',
        roles: ['residential_cleaner'],
        avatar: ''
      },
      {
        id: 'emp-4',
        employeeId: 'CLN1004',
        username: 'diana.wong',
        email: 'diana.wong@cleanpro.com',
        firstName: 'Diana',
        lastName: 'Wong',
        position: 'Deep Clean Specialist',
        department: 'Special Services',
        hireDate: '2022-03-15',
        locations: ['loc-2', 'loc-3'],
        contact: {
          phone: '(403) 555-2004',
          emergencyContact: '(403) 555-2114',
          address: '321 Elm St, Calgary, AB'
        },
        qualifications: ['Carpet Cleaning', 'Upholstery Care'],
        status: 'active',
        roles: ['specialist'],
        avatar: ''
      },
      {
        id: 'emp-5',
        employeeId: 'CLN1005',
        username: 'ethan.miller',
        email: 'ethan.miller@cleanpro.com',
        firstName: 'Ethan',
        lastName: 'Miller',
        position: 'Janitorial Staff',
        department: 'Janitorial',
        hireDate: '2022-06-30',
        locations: ['loc-1'],
        contact: {
          phone: '(403) 555-2005',
          emergencyContact: '(403) 555-2115',
          address: '654 Birch Blvd, Calgary, AB'
        },
        qualifications: ['Sanitation', 'Waste Management'],
        status: 'active',
        roles: ['janitor'],
        avatar: ''
      },
      {
        id: 'emp-6',
        employeeId: 'CLN1006',
        username: 'fatima.ali',
        email: 'fatima.ali@cleanpro.com',
        firstName: 'Fatima',
        lastName: 'Ali',
        position: 'Hospital Cleaner',
        department: 'Healthcare',
        hireDate: '2021-09-18',
        locations: ['loc-2'],
        contact: {
          phone: '(403) 555-2006',
          emergencyContact: '(403) 555-2116',
          address: '987 Cedar Ln, Calgary, AB'
        },
        qualifications: ['Infection Control', 'Medical Waste'],
        status: 'on_leave',
        roles: ['healthcare_cleaner'],
        avatar: ''
      },
      {
        id: 'emp-7',
        employeeId: 'CLN1007',
        username: 'greg.patel',
        email: 'greg.patel@cleanpro.com',
        firstName: 'Greg',
        lastName: 'Patel',
        position: 'Operations Manager',
        department: 'Management',
        hireDate: '2020-07-12',
        locations: ['loc-3'],
        contact: {
          phone: '(403) 555-2007',
          emergencyContact: '(403) 555-2117',
          address: '147 Maple Dr, Calgary, AB'
        },
        qualifications: ['Project Management', 'Quality Control'],
        status: 'active',
        roles: ['operations_manager'],
        avatar: ''
      },
      {
        id: 'emp-8',
        employeeId: 'CLN1008',
        username: 'hannah.choi',
        email: 'hannah.choi@cleanpro.com',
        firstName: 'Hannah',
        lastName: 'Choi',
        position: 'Client Relations',
        department: 'Customer Service',
        hireDate: '2023-01-05',
        locations: ['loc-1', 'loc-2'],
        contact: {
          phone: '(403) 555-2008',
          emergencyContact: '(403) 555-2118',
          address: '258 Spruce Ave, Calgary, AB'
        },
        qualifications: ['Customer Service', 'Scheduling'],
        status: 'active',
        roles: ['client_relations'],
        avatar: ''
      },
      {
        id: 'emp-9',
        employeeId: 'CLN1009',
        username: 'ivan.petrov',
        email: 'ivan.petrov@cleanpro.com',
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'Night Shift Lead',
        department: 'Operations',
        hireDate: '2018-04-22',
        locations: ['loc-1'],
        contact: {
          phone: '(403) 555-2009',
          emergencyContact: '(403) 555-2119',
          address: '369 Willow Way, Calgary, AB'
        },
        qualifications: ['Night Operations', 'Security Protocols'],
        status: 'active',
        roles: ['night_lead'],
        avatar: ''
      },
      {
        id: 'emp-10',
        employeeId: 'CLN1010',
        username: 'jasmine.kim',
        email: 'jasmine.kim@cleanpro.com',
        firstName: 'Jasmine',
        lastName: 'Kim',
        position: 'HR Coordinator',
        department: 'Human Resources',
        hireDate: '2019-08-14',
        locations: ['loc-1', 'loc-2', 'loc-3'],
        contact: {
          phone: '(403) 555-2010',
          emergencyContact: '(403) 555-2120',
          address: '753 Aspen Cres, Calgary, AB'
        },
        qualifications: ['HR Certification', 'Safety Training'],
        status: 'active',
        roles: ['hr_staff', 'admin'],
        avatar: ''
      },
      {
        id: 'emp-11',
        employeeId: 'CLN1011',
        username: 'kevin.singh',
        email: 'kevin.singh@cleanpro.com',
        firstName: 'Kevin',
        lastName: 'Singh',
        position: 'Carpet Cleaner',
        department: 'Special Services',
        hireDate: '2022-11-03',
        locations: ['loc-3'],
        contact: {
          phone: '(403) 555-2011',
          emergencyContact: '(403) 555-2121',
          address: '159 Pineapple St, Calgary, AB'
        },
        qualifications: ['Steam Cleaning', 'Stain Removal'],
        status: 'active',
        roles: ['carpet_specialist'],
        avatar: ''
      },
      {
        id: 'emp-12',
        employeeId: 'CLN1012',
        username: 'linda.chen',
        email: 'linda.chen@cleanpro.com',
        firstName: 'Linda',
        lastName: 'Chen',
        position: 'Quality Control',
        department: 'Management',
        hireDate: '2020-12-07',
        locations: ['loc-2'],
        contact: {
          phone: '(403) 555-2012',
          emergencyContact: '(403) 555-2122',
          address: '486 Banana Blvd, Calgary, AB'
        },
        qualifications: ['Inspection Techniques', 'Auditing'],
        status: 'active',
        roles: ['quality_control'],
        avatar: ''
      }
    ];
  },
};