import { useEffect, useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/mockApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().min(2, 'Role is required'),
  status: z.enum(['Active', 'Inactive']),
});

type EmployeeFormData = z.infer<typeof schema>;

interface Employee extends EmployeeFormData {
  id: number;
  joinDate: string;
  team: string;
  cleaningSpecialty: string;
}

export function useDashboardLogic() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await api.getEmployees();
    const stats = await api.getStats();
    setEmployees(res);
    setStats(stats);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: EmployeeFormData) => {
    if (editingEmployee) {
      await api.updateEmployee(editingEmployee.id, data);
    } else {
      await api.addEmployee(data);
    }
    setModalOpen(false);
    reset();
    loadData();
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    reset(emp);
    setModalOpen(true);
  };

  const confirmDelete = (emp: Employee) => {
    setConfirmMessage(`Are you sure you want to delete ${emp.name}?`);
    setConfirmAction(() => async () => {
      await api.deleteEmployee(emp.id);
      loadData();
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const toggleStatus = async (emp: Employee) => {
    const updated = {
      ...emp,
      status: emp.status === 'Active' ? 'Inactive' : 'Active',
    };
    await api.updateEmployee(emp.id, updated);
    loadData();
  };

  return {
    stats,
    page,
    pageSize,
    searchTerm,
    statusFilter,
    filteredEmployees,
    paginatedEmployees,
    modalOpen,
    confirmOpen,
    confirmMessage,
    isSubmitting,
    editingEmployee,
    errors,
    register,
    handleSubmit,
    setPage,
    setPageSize,
    setSearchTerm,
    setStatusFilter,
    setModalOpen,
    openAddModal,
    openEditModal,
    confirmDelete,
    confirmAction,
    onSubmit,
    toggleStatus,
  };
}
