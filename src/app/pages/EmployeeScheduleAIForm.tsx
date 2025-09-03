"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/common/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/attendance/AttendanceCard";
import Button from "@/components/ui/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/common/dialog";
import Input from "@/components/ui/common/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/common/Select";

interface Availability {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Skill {
  id: number;
  name: string;
  category?: string;
}

interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  proficiency: number;
}

export default function EmployeeScheduleAIForm() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);

  // Fetch data (mocked with local state for now)
  useEffect(() => {
    setAvailabilities([
      { id: 1, day_of_week: "Monday", start_time: "09:00", end_time: "17:00" },
    ]);
    setSkills([{ id: 1, name: "Forklift Operation", category: "Technical" }]);
    setEmployeeSkills([{ id: 1, employee_id: 1, skill_id: 1, proficiency: 4 }]);
  }, []);

  // Handler functions for adding new items
  const handleAddAvailability = (newAvailability: Omit<Availability, 'id'>) => {
    const newId = Math.max(0, ...availabilities.map(a => a.id)) + 1;
    setAvailabilities([...availabilities, { id: newId, ...newAvailability }]);
  };

  const handleAddSkill = (newSkill: Omit<Skill, 'id'>) => {
    const newId = Math.max(0, ...skills.map(s => s.id)) + 1;
    setSkills([...skills, { id: newId, ...newSkill }]);
  };

  const handleAddEmployeeSkill = (newEmployeeSkill: Omit<EmployeeSkill, 'id'>) => {
    const newId = Math.max(0, ...employeeSkills.map(es => es.id)) + 1;
    setEmployeeSkills([...employeeSkills, { id: newId, ...newEmployeeSkill }]);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="availability" className="w-full">
        <TabsList>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="employeeSkills">Employee Skills</TabsTrigger>
        </TabsList>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Employee Availability</CardTitle>
              <AddAvailabilityDialog onAdd={handleAddAvailability} />
            </CardHeader>
            <CardContent>
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Day</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilities.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2">{a.day_of_week}</td>
                      <td className="p-2">{a.start_time}</td>
                      <td className="p-2">{a.end_time}</td>
                      <td className="p-2">
                        <Button variant="secondary" size="sm" onClick={() => {
                          setAvailabilities(availabilities.filter(item => item.id !== a.id));
                        }}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Skills</CardTitle>
              <AddSkillDialog onAdd={handleAddSkill} />
            </CardHeader>
            <CardContent>
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.category}</td>
                      <td className="p-2">
                        <Button variant="secondary" size="sm" onClick={() => {
                          setSkills(skills.filter(item => item.id !== s.id));
                        }}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Skills Tab */}
        <TabsContent value="employeeSkills">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Employee Skills</CardTitle>
              <AddEmployeeSkillDialog 
                onAdd={handleAddEmployeeSkill} 
                skills={skills} 
              />
            </CardHeader>
            <CardContent>
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Employee ID</th>
                    <th className="p-2">Skill</th>
                    <th className="p-2">Proficiency</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeSkills.map((es) => {
                    const skill = skills.find(s => s.id === es.skill_id);
                    return (
                      <tr key={es.id} className="border-t">
                        <td className="p-2">{es.employee_id}</td>
                        <td className="p-2">{skill ? skill.name : `Skill #${es.skill_id}`}</td>
                        <td className="p-2">{es.proficiency}/5</td>
                        <td className="p-2">
                          <Button variant="secondary" size="sm" onClick={() => {
                            setEmployeeSkills(employeeSkills.filter(item => item.id !== es.id));
                          }}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -----------------------------
   Dialog Components
------------------------------ */
interface AddAvailabilityDialogProps {
  onAdd: (availability: Omit<Availability, 'id'>) => void;
}

function AddAvailabilityDialog({ onAdd }: AddAvailabilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (day && startTime && endTime) {
      onAdd({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime
      });
      setDay("");
      setStartTime("");
      setEndTime("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Availability</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Availability</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select value={day} onValueChange={setDay} required>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            type="time" 
            placeholder="Start time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            required 
          />
          <Input 
            type="time" 
            placeholder="End time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            required 
          />
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddSkillDialogProps {
  onAdd: (skill: Omit<Skill, 'id'>) => void;
}

function AddSkillDialog({ onAdd }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onAdd({
        name,
        category: category || undefined
      });
      setName("");
      setCategory("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Skill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Skill</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            placeholder="Skill name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <Input 
            placeholder="Category (optional)" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddEmployeeSkillDialogProps {
  onAdd: (employeeSkill: Omit<EmployeeSkill, 'id'>) => void;
  skills: Skill[];
}

function AddEmployeeSkillDialog({ onAdd, skills }: AddEmployeeSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [proficiency, setProficiency] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId && skillId && proficiency) {
      onAdd({
        employee_id: parseInt(employeeId),
        skill_id: parseInt(skillId),
        proficiency: parseInt(proficiency)
      });
      setEmployeeId("");
      setSkillId("");
      setProficiency("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Employee Skill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Skill</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            type="number" 
            placeholder="Employee ID" 
            value={employeeId} 
            onChange={(e) => setEmployeeId(e.target.value)} 
            required 
            min="1"
          />
          <Select value={skillId} onValueChange={setSkillId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select skill" />
            </SelectTrigger>
            <SelectContent>
              {skills.map((skill) => (
                <SelectItem key={skill.id} value={skill.id.toString()}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={proficiency} onValueChange={setProficiency} required>
            <SelectTrigger>
              <SelectValue placeholder="Proficiency (1–5)" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}